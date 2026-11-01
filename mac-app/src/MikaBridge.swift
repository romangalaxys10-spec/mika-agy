import Foundation

public struct DeviceInfo: Codable {
    public let serial: String
    public let state: String
    public let model: String?
}

public final class MikaBridge {
    public static let shared = MikaBridge()

    private var deskProcess: Process?
    private var agentProcess: Process?
    private var stdoutPipe: Pipe?
    private var stderrPipe: Pipe?

    public private(set) var deskURL: URL?
    public private(set) var isRunning: Bool = false
    public var onDeskReady: ((URL) -> Void)?
    public var onLogMessage: ((String) -> Void)?
    public var onProcessTerminated: ((Int32) -> Void)?
    private var isIntentionalShutdown = false

    private init() {}

    public func findPythonPath() -> String {
        let candidates = [
            "/opt/homebrew/bin/python3",
            "/usr/local/bin/python3",
            "/usr/bin/python3"
        ]
        for path in candidates {
            if FileManager.default.isExecutableFile(atPath: path) {
                return path
            }
        }
        return "python3"
    }

    public func findAdbPath() -> String {
        let candidates = [
            "/opt/homebrew/bin/adb",
            "/usr/local/bin/adb",
            NSHomeDirectory() + "/Library/Android/sdk/platform-tools/adb",
            "/usr/bin/adb"
        ]
        for path in candidates {
            if FileManager.default.isExecutableFile(atPath: path) {
                return path
            }
        }
        return "adb"
    }

    public func resolveScriptPath() -> String {
        if let resourcePath = Bundle.main.resourcePath {
            let bundledScript = (resourcePath as NSString).appendingPathComponent("mika-core/scripts/mika_cli.py")
            if FileManager.default.fileExists(atPath: bundledScript) {
                return bundledScript
            }
        }
        let devPath = "/Users/ekaterina.gwaladze/.gemini/antigravity/scratch/mika/tools/mika/scripts/mika_cli.py"
        if FileManager.default.fileExists(atPath: devPath) {
            return devPath
        }
        return "mika_cli.py"
    }

    public func resolveAgentServerPath() -> String {
        if let resourcePath = Bundle.main.resourcePath {
            let bundled = (resourcePath as NSString).appendingPathComponent("mika-core/mika_agent_server.py")
            if FileManager.default.fileExists(atPath: bundled) {
                return bundled
            }
        }
        let devPath = "/Users/ekaterina.gwaladze/.gemini/antigravity/scratch/mika/agent-server/mika_agent_server.py"
        if FileManager.default.fileExists(atPath: devPath) {
            return devPath
        }
        return "mika_agent_server.py"
    }

    public func tokenFilePath() -> String {
        let path = NSHomeDirectory() + "/.mika/token"
        if !FileManager.default.fileExists(atPath: path) {
            let dir = NSHomeDirectory() + "/.mika"
            try? FileManager.default.createDirectory(atPath: dir, withIntermediateDirectories: true)
            let defaultTok = UUID().uuidString.replacingOccurrences(of: "-", with: "")
            try? defaultTok.write(toFile: path, atomically: true, encoding: .utf8)
        }
        return path
    }

    public func startLocalAgentServer(port: Int = 8765, completion: @escaping () -> Void) {
        if agentProcess?.isRunning == true {
            completion()
            return
        }

        let python = findPythonPath()
        let serverScript = resolveAgentServerPath()
        let process = Process()
        process.executableURL = URL(fileURLWithPath: python)
        process.arguments = ["-u", serverScript, "--port", String(port)]

        var env = ProcessInfo.processInfo.environment
        let adbDir = (findAdbPath() as NSString).deletingLastPathComponent
        env["PATH"] = "/opt/homebrew/bin:/usr/local/bin:\(adbDir):\(env["PATH"] ?? "")"
        env["PYTHONUNBUFFERED"] = "1"
        process.environment = env

        let outPipe = Pipe()
        process.standardOutput = outPipe
        process.standardError = outPipe
        self.agentProcess = process

        do {
            try process.run()
            // Wait brief moment for socket to bind
            DispatchQueue.global().asyncAfter(deadline: .now() + 0.8) {
                completion()
            }
        } catch {
            print("Failed to start agent server: \(error)")
            completion()
        }
    }

    public func startDeskServer(device: String? = nil, url: String? = nil, tokenFile: String? = nil, completion: @escaping (Result<URL, Error>) -> Void) {
        stopDeskServer()
        isIntentionalShutdown = false

        let useLocalAgent = (device == nil || device == "local-agent" || device == "mac-agent") && (url == nil || url?.isEmpty == true)

        if useLocalAgent {
            startLocalAgentServer { [weak self] in
                guard let self = self else { return }
                self.launchDeskClient(device: nil, url: "http://127.0.0.1:8765", tokenFile: self.tokenFilePath(), completion: completion)
            }
        } else {
            launchDeskClient(device: device, url: url, tokenFile: tokenFile, completion: completion)
        }
    }

    private func launchDeskClient(device: String?, url: String?, tokenFile: String?, completion: @escaping (Result<URL, Error>) -> Void) {
        let python = findPythonPath()
        let script = resolveScriptPath()
        let scriptDir = (script as NSString).deletingLastPathComponent

        let process = Process()
        process.executableURL = URL(fileURLWithPath: python)

        var args = ["-u", script, "ui", "--no-open"]
        if let device = device, !device.isEmpty, device != "local-agent" {
            args.append(contentsOf: ["--device", device])
        }
        if let url = url, !url.isEmpty, let tf = tokenFile, !tf.isEmpty {
            args.append(contentsOf: ["--url", url, "--token-file", tf])
        }

        process.arguments = args
        process.currentDirectoryURL = URL(fileURLWithPath: scriptDir)

        var env = ProcessInfo.processInfo.environment
        let adbDir = (findAdbPath() as NSString).deletingLastPathComponent
        let currentPath = env["PATH"] ?? "/usr/bin:/bin:/usr/sbin:/sbin"
        env["PATH"] = "/opt/homebrew/bin:/usr/local/bin:\(adbDir):\(currentPath)"
        env["PYTHONUNBUFFERED"] = "1"
        process.environment = env

        let outPipe = Pipe()
        let errPipe = Pipe()
        process.standardOutput = outPipe
        process.standardError = errPipe

        self.stdoutPipe = outPipe
        self.stderrPipe = errPipe
        self.deskProcess = process

        var urlFound = false
        let lock = NSLock()

        outPipe.fileHandleForReading.readabilityHandler = { [weak self] handle in
            let data = handle.availableData
            guard !data.isEmpty, let text = String(data: data, encoding: .utf8) else { return }
            self?.onLogMessage?(text)

            lock.lock()
            defer { lock.unlock() }

            if !urlFound {
                for line in text.components(separatedBy: .newlines) {
                    let trimmed = line.trimmingCharacters(in: .whitespacesAndNewlines)
                    if trimmed.hasPrefix("http://127.0.0.1:") || trimmed.hasPrefix("http://localhost:") {
                        if let validURL = URL(string: trimmed) {
                            urlFound = true
                            self?.deskURL = validURL
                            self?.isRunning = true
                            DispatchQueue.main.async {
                                self?.onDeskReady?(validURL)
                                completion(.success(validURL))
                            }
                            break
                        }
                    }
                }
            }
        }

        errPipe.fileHandleForReading.readabilityHandler = { [weak self] handle in
            let data = handle.availableData
            guard !data.isEmpty, let text = String(data: data, encoding: .utf8) else { return }
            self?.onLogMessage?("[ERR] \(text)")
        }

        process.terminationHandler = { [weak self] proc in
            guard let self = self else { return }
            self.isRunning = false
            self.deskURL = nil
            DispatchQueue.main.async {
                self.onProcessTerminated?(proc.terminationStatus)
                if !self.isIntentionalShutdown {
                    self.onLogMessage?("[Mika Watchdog] Desk process exited unexpectedly (\(proc.terminationStatus)). Auto-restarting in 1s...")
                    DispatchQueue.global().asyncAfter(deadline: .now() + 1.0) {
                        self.startDeskServer { _ in }
                    }
                }
            }
        }

        do {
            try process.run()
        } catch {
            completion(.failure(error))
        }

        DispatchQueue.global().asyncAfter(deadline: .now() + 10.0) { [weak self] in
            lock.lock()
            defer { lock.unlock() }
            if !urlFound && self?.deskProcess?.isRunning == true {
                DispatchQueue.main.async {
                    completion(.failure(NSError(domain: "MikaBridge", code: -1, userInfo: [NSLocalizedDescriptionKey: "Timed out waiting for Mika Task Desk URL."])))
                }
            }
        }
    }

    public func stopDeskServer() {
        isIntentionalShutdown = true
        if let proc = deskProcess, proc.isRunning {
            proc.terminate()
            proc.waitUntilExit()
        }
        if let agent = agentProcess, agent.isRunning {
            agent.terminate()
            agent.waitUntilExit()
        }
        stdoutPipe?.fileHandleForReading.readabilityHandler = nil
        stderrPipe?.fileHandleForReading.readabilityHandler = nil
        deskProcess = nil
        agentProcess = nil
        stdoutPipe = nil
        stderrPipe = nil
        isRunning = false
        deskURL = nil
    }

    public func fetchDevices(completion: @escaping ([DeviceInfo]) -> Void) {
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let self = self else { return }
            let adb = self.findAdbPath()
            let process = Process()
            process.executableURL = URL(fileURLWithPath: adb)
            process.arguments = ["devices", "-l"]

            let pipe = Pipe()
            process.standardOutput = pipe

            do {
                try process.run()
                process.waitUntilExit()

                let data = pipe.fileHandleForReading.readDataToEndOfFile()
                guard let text = String(data: data, encoding: .utf8) else {
                    DispatchQueue.main.async { completion([]) }
                    return
                }

                var list: [DeviceInfo] = []
                let lines = text.components(separatedBy: .newlines)
                for line in lines {
                    let trimmed = line.trimmingCharacters(in: .whitespaces)
                    if trimmed.isEmpty || trimmed.hasPrefix("List of devices") { continue }
                    let parts = trimmed.components(separatedBy: .whitespaces).filter { !$0.isEmpty }
                    if parts.count >= 2 {
                        let serial = parts[0]
                        let state = parts[1]
                        var model: String? = nil
                        for p in parts {
                            if p.hasPrefix("model:") {
                                model = p.replacingOccurrences(of: "model:", with: "")
                            }
                        }
                        list.append(DeviceInfo(serial: serial, state: state, model: model))
                    }
                }
                DispatchQueue.main.async { completion(list) }
            } catch {
                DispatchQueue.main.async { completion([]) }
            }
        }
    }

    public func runDoctor(device: String? = nil, completion: @escaping (String) -> Void) {
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let self = self else { return }
            let python = self.findPythonPath()
            let script = self.resolveScriptPath()

            let process = Process()
            process.executableURL = URL(fileURLWithPath: python)

            var args = [script]
            if let dev = device, !dev.isEmpty, dev != "local-agent" {
                args.append(contentsOf: ["--device", dev])
            } else {
                args.append(contentsOf: ["--url", "http://127.0.0.1:8765", "--token-file", self.tokenFilePath()])
            }
            args.append("doctor")

            process.arguments = args

            var env = ProcessInfo.processInfo.environment
            let adbDir = (self.findAdbPath() as NSString).deletingLastPathComponent
            env["PATH"] = "/opt/homebrew/bin:/usr/local/bin:\(adbDir):\(env["PATH"] ?? "")"
            process.environment = env

            let pipe = Pipe()
            process.standardOutput = pipe
            process.standardError = pipe

            do {
                try process.run()
                process.waitUntilExit()
                let data = pipe.fileHandleForReading.readDataToEndOfFile()
                let output = String(data: data, encoding: .utf8) ?? "No output from doctor."
                DispatchQueue.main.async { completion(output) }
            } catch {
                DispatchQueue.main.async { completion("Error running doctor: \(error.localizedDescription)") }
            }
        }
    }

    public func submitTask(goal: String, device: String? = nil, completion: @escaping (Result<String, Error>) -> Void) {
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let self = self else { return }
            let python = self.findPythonPath()
            let script = self.resolveScriptPath()

            let process = Process()
            process.executableURL = URL(fileURLWithPath: python)

            var args = [script]
            if let dev = device, !dev.isEmpty, dev != "local-agent" {
                args.append(contentsOf: ["--device", dev])
            } else {
                args.append(contentsOf: ["--url", "http://127.0.0.1:8765", "--token-file", self.tokenFilePath()])
            }
            args.append(contentsOf: ["task", "run", "--goal", goal, "--json"])

            process.arguments = args

            var env = ProcessInfo.processInfo.environment
            let adbDir = (self.findAdbPath() as NSString).deletingLastPathComponent
            env["PATH"] = "/opt/homebrew/bin:/usr/local/bin:\(adbDir):\(env["PATH"] ?? "")"
            process.environment = env

            let pipe = Pipe()
            process.standardOutput = pipe
            process.standardError = pipe

            do {
                try process.run()
                process.waitUntilExit()
                let data = pipe.fileHandleForReading.readDataToEndOfFile()
                let output = String(data: data, encoding: .utf8) ?? ""
                DispatchQueue.main.async { completion(.success(output)) }
            } catch {
                DispatchQueue.main.async { completion(.failure(error)) }
            }
        }
    }
}
