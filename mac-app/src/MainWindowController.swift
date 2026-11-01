import Cocoa
import WebKit

public final class MainWindowController: NSWindowController, WKNavigationDelegate, WKUIDelegate {
    private var webView: WKWebView!
    private var progressIndicator: NSProgressIndicator!
    private var statusPillButton: NSButton!
    private var devicePopUpButton: NSPopUpButton!
    private var quickTaskBtn: NSButton!
    private var doctorBtn: NSButton!
    private var reloadBtn: NSButton!

    private var doctorWindowController: DoctorWindowController?
    private var quickTaskWindowController: QuickTaskWindowController?

    public var selectedDeviceSerial: String?

    public convenience init() {
        let window = NSWindow(
            contentRect: NSRect(x: 100, y: 100, width: 1120, height: 760),
            styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
            backing: .buffered,
            defer: false
        )
        window.minSize = NSSize(width: 880, height: 600)
        window.title = "Mika Desktop"
        window.titleVisibility = .hidden
        window.titlebarAppearsTransparent = true
        window.center()

        self.init(window: window)
        setupToolbar()
        setupWebView()
        startBridge()
        refreshDevicesList()
    }

    private func setupToolbar() {
        guard let window = window else { return }
        let toolbar = NSToolbar(identifier: "MikaMainToolbar")
        toolbar.displayMode = .iconOnly
        toolbar.allowsUserCustomization = false
        window.toolbar = toolbar
    }

    private func setupWebView() {
        guard let window = window else { return }
        let contentView = NSView(frame: window.contentView!.bounds)
        contentView.autoresizingMask = [.width, .height]
        window.contentView = contentView

        // Top bar for controls
        let topBarHeight: CGFloat = 52
        let topBar = NSVisualEffectView(frame: NSRect(x: 0, y: contentView.bounds.height - topBarHeight, width: contentView.bounds.width, height: topBarHeight))
        topBar.autoresizingMask = [.width, .minYMargin]
        topBar.material = .headerView
        topBar.blendingMode = .withinWindow
        topBar.state = .active
        contentView.addSubview(topBar)

        // Title and Logo
        let titleLabel = NSTextField(labelWithString: "🐾 Mika Desk")
        titleLabel.font = NSFont.systemFont(ofSize: 15, weight: .bold)
        titleLabel.frame = NSRect(x: 80, y: 14, width: 120, height: 24)
        topBar.addSubview(titleLabel)

        // Device Dropdown
        devicePopUpButton = NSPopUpButton(frame: NSRect(x: 210, y: 12, width: 200, height: 26), pullsDown: false)
        devicePopUpButton.addItem(withTitle: "Detecting Devices...")
        devicePopUpButton.target = self
        devicePopUpButton.action = #selector(deviceSelected(_:))
        topBar.addSubview(devicePopUpButton)

        // Status Pill
        statusPillButton = NSButton(title: "🟡 Connecting...", target: self, action: #selector(refreshDevicesList))
        statusPillButton.bezelStyle = .recessed
        statusPillButton.font = NSFont.systemFont(ofSize: 12, weight: .medium)
        statusPillButton.frame = NSRect(x: 420, y: 12, width: 140, height: 26)
        topBar.addSubview(statusPillButton)

        // Quick Task Button
        quickTaskBtn = NSButton(title: "⚡ Quick Task", target: self, action: #selector(openQuickTask))
        quickTaskBtn.bezelStyle = .rounded
        quickTaskBtn.frame = NSRect(x: contentView.bounds.width - 330, y: 11, width: 110, height: 28)
        quickTaskBtn.autoresizingMask = [.minXMargin]
        topBar.addSubview(quickTaskBtn)

        // Doctor Button
        doctorBtn = NSButton(title: "🩺 Doctor", target: self, action: #selector(openDoctor))
        doctorBtn.bezelStyle = .rounded
        doctorBtn.frame = NSRect(x: contentView.bounds.width - 215, y: 11, width: 95, height: 28)
        doctorBtn.autoresizingMask = [.minXMargin]
        topBar.addSubview(doctorBtn)

        // Reload Button
        reloadBtn = NSButton(title: "🔄", target: self, action: #selector(reloadDesk))
        reloadBtn.bezelStyle = .rounded
        reloadBtn.frame = NSRect(x: contentView.bounds.width - 115, y: 11, width: 45, height: 28)
        reloadBtn.autoresizingMask = [.minXMargin]
        topBar.addSubview(reloadBtn)

        // WKWebView
        let config = WKWebViewConfiguration()
        config.preferences.javaScriptCanOpenWindowsAutomatically = true
        config.defaultWebpagePreferences.allowsContentJavaScript = true

        let webFrame = NSRect(x: 0, y: 0, width: contentView.bounds.width, height: contentView.bounds.height - topBarHeight)
        webView = WKWebView(frame: webFrame, configuration: config)
        webView.autoresizingMask = [.width, .height]
        webView.navigationDelegate = self
        webView.uiDelegate = self
        contentView.addSubview(webView)

        // Progress Indicator
        progressIndicator = NSProgressIndicator(frame: NSRect(x: (contentView.bounds.width - 40) / 2, y: (contentView.bounds.height - 40) / 2, width: 40, height: 40))
        progressIndicator.style = .spinning
        progressIndicator.isDisplayedWhenStopped = false
        progressIndicator.autoresizingMask = [.minXMargin, .maxXMargin, .minYMargin, .maxYMargin]
        contentView.addSubview(progressIndicator)
    }

    public func startBridge() {
        progressIndicator.startAnimation(nil)
        statusPillButton.title = "🟡 Connecting..."

        MikaBridge.shared.startDeskServer(device: selectedDeviceSerial) { [weak self] result in
            guard let self = self else { return }
            self.progressIndicator.stopAnimation(nil)
            switch result {
            case .success(let url):
                self.statusPillButton.title = "🟢 Desk Online"
                let request = URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 15)
                self.webView.load(request)
            case .failure(let error):
                self.statusPillButton.title = "🔴 Connection Failed"
                self.showFallbackError(message: error.localizedDescription)
            }
        }
    }

    @objc public func refreshDevicesList() {
        MikaBridge.shared.fetchDevices { [weak self] devices in
            guard let self = self else { return }
            self.devicePopUpButton.removeAllItems()
            self.devicePopUpButton.addItem(withTitle: "💻 Mac Agent (Local Brain)")
            self.devicePopUpButton.lastItem?.representedObject = "local-agent"

            for dev in devices {
                let title = "📱 \(dev.model ?? "Android") (\(dev.serial)) [\(dev.state)]"
                self.devicePopUpButton.addItem(withTitle: title)
                self.devicePopUpButton.lastItem?.representedObject = dev.serial
            }

            if self.selectedDeviceSerial == nil {
                self.selectedDeviceSerial = "local-agent"
            }
        }
    }

    @objc private func deviceSelected(_ sender: NSPopUpButton) {
        if let serial = sender.selectedItem?.representedObject as? String {
            self.selectedDeviceSerial = serial
            startBridge()
        }
    }

    @objc public func openQuickTask() {
        if quickTaskWindowController == nil {
            quickTaskWindowController = QuickTaskWindowController()
        }
        quickTaskWindowController?.selectedDevice = selectedDeviceSerial
        quickTaskWindowController?.onTaskSubmitted = { [weak self] in
            self?.reloadDesk()
        }
        quickTaskWindowController?.showWindow(nil)
        quickTaskWindowController?.window?.makeKeyAndOrderFront(nil)
    }

    @objc public func openDoctor() {
        if doctorWindowController == nil {
            doctorWindowController = DoctorWindowController()
        }
        doctorWindowController?.selectedDevice = selectedDeviceSerial
        doctorWindowController?.showWindow(nil)
        doctorWindowController?.window?.makeKeyAndOrderFront(nil)
        doctorWindowController?.runDoctorCheck()
    }

    @objc public func reloadDesk() {
        if let url = MikaBridge.shared.deskURL {
            webView.load(URLRequest(url: url))
        } else {
            startBridge()
        }
    }

    private func showFallbackError(message: String) {
        let html = """
        <html>
        <body style="font-family: -apple-system, sans-serif; background: #1e1e24; color: #f5f5f7; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 90vh; text-align: center; margin: 0; padding: 20px;">
            <div style="font-size: 54px; margin-bottom: 12px;">🐾</div>
            <h2 style="margin: 0 0 10px 0; font-weight: 600;">Mika Phone Bridge</h2>
            <p style="color: #a1a1aa; max-width: 440px; margin-bottom: 24px;">\(message)</p>
            <div style="background: rgba(255,255,255,0.06); padding: 16px 20px; border-radius: 10px; font-size: 13px; text-align: left; max-width: 480px; line-height: 1.6;">
                <b>Tips for connecting your phone:</b><br/>
                1. Connect your Android phone with USB cable.<br/>
                2. Ensure USB Debugging is turned ON in Developer Options.<br/>
                3. Run <code>adb devices</code> in Terminal or click <b>Doctor</b> above.<br/>
                4. For Wi-Fi: turn on "Network Access" in Mika Settings on phone.
            </div>
        </body>
        </html>
        """
        webView.loadHTMLString(html, baseURL: nil)
    }

    // MARK: - WKNavigationDelegate
    public func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        progressIndicator.startAnimation(nil)
    }

    public func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        progressIndicator.stopAnimation(nil)
    }

    public func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        progressIndicator.stopAnimation(nil)
    }
}
