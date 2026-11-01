import Foundation
import CoreGraphics
import Cocoa

func getScreenResolution() -> (width: Int, height: Int) {
    if let mainScreen = NSScreen.main {
        let frame = mainScreen.frame
        return (Int(frame.width), Int(frame.height))
    }
    return (1280, 800)
}

func mouseClick(x: Double, y: Double, right: Bool = false) {
    let point = CGPoint(x: x, y: y)
    let move = CGEvent(mouseEventSource: nil, mouseType: .mouseMoved, mouseCursorPosition: point, mouseButton: right ? .right : .left)
    let down = CGEvent(mouseEventSource: nil, mouseType: right ? .rightMouseDown : .leftMouseDown, mouseCursorPosition: point, mouseButton: right ? .right : .left)
    let up = CGEvent(mouseEventSource: nil, mouseType: right ? .rightMouseUp : .leftMouseUp, mouseCursorPosition: point, mouseButton: right ? .right : .left)

    move?.post(tap: .cghidEventTap)
    Thread.sleep(forTimeInterval: 0.05)
    down?.post(tap: .cghidEventTap)
    Thread.sleep(forTimeInterval: 0.05)
    up?.post(tap: .cghidEventTap)
}

func mouseDoubleClick(x: Double, y: Double) {
    let point = CGPoint(x: x, y: y)
    let move = CGEvent(mouseEventSource: nil, mouseType: .mouseMoved, mouseCursorPosition: point, mouseButton: .left)
    move?.post(tap: .cghidEventTap)

    for i in 1...2 {
        let down = CGEvent(mouseEventSource: nil, mouseType: .leftMouseDown, mouseCursorPosition: point, mouseButton: .left)
        let up = CGEvent(mouseEventSource: nil, mouseType: .leftMouseUp, mouseCursorPosition: point, mouseButton: .left)
        down?.setIntegerValueField(.mouseEventClickState, value: Int64(i))
        up?.setIntegerValueField(.mouseEventClickState, value: Int64(i))
        down?.post(tap: .cghidEventTap)
        Thread.sleep(forTimeInterval: 0.04)
        up?.post(tap: .cghidEventTap)
        Thread.sleep(forTimeInterval: 0.04)
    }
}

func mouseDrag(x1: Double, y1: Double, x2: Double, y2: Double, steps: Int = 20) {
    let start = CGPoint(x: x1, y: y1)
    let end = CGPoint(x: x2, y: y2)

    let down = CGEvent(mouseEventSource: nil, mouseType: .leftMouseDown, mouseCursorPosition: start, mouseButton: .left)
    down?.post(tap: .cghidEventTap)
    Thread.sleep(forTimeInterval: 0.05)

    for i in 1...steps {
        let t = Double(i) / Double(steps)
        let cur = CGPoint(x: start.x + (end.x - start.x) * t, y: start.y + (end.y - start.y) * t)
        let drag = CGEvent(mouseEventSource: nil, mouseType: .leftMouseDragged, mouseCursorPosition: cur, mouseButton: .left)
        drag?.post(tap: .cghidEventTap)
        Thread.sleep(forTimeInterval: 0.01)
    }

    let up = CGEvent(mouseEventSource: nil, mouseType: .leftMouseUp, mouseCursorPosition: end, mouseButton: .left)
    up?.post(tap: .cghidEventTap)
}

func typeString(_ str: String) {
    let clean = str.replacingOccurrences(of: "\\", with: "\\\\").replacingOccurrences(of: "\"", with: "\\\"")
    let script = "tell application \"System Events\" to keystroke \"" + clean + "\""
    var error: NSDictionary?
    if let appleScript = NSAppleScript(source: script) {
        appleScript.executeAndReturnError(&error)
    }
}

func pressKeycode(_ code: CGKeyCode, flags: CGEventFlags = []) {
    let down = CGEvent(keyboardEventSource: nil, virtualKey: code, keyDown: true)
    let up = CGEvent(keyboardEventSource: nil, virtualKey: code, keyDown: false)
    if !flags.isEmpty {
        down?.flags = flags
        up?.flags = flags
    }
    down?.post(tap: .cghidEventTap)
    Thread.sleep(forTimeInterval: 0.05)
    up?.post(tap: .cghidEventTap)
}

func pressNamedKey(_ name: String) {
    let map: [String: CGKeyCode] = [
        "return": 36, "enter": 36,
        "tab": 48,
        "space": 49,
        "backspace": 51, "delete": 51,
        "escape": 53, "esc": 53,
        "left": 123, "right": 124, "down": 125, "up": 126
    ]
    if let code = map[name.lowercased()] {
        pressKeycode(code)
    } else {
        typeString(name)
    }
}

func pressHotkey(_ combo: String) {
    var flags: CGEventFlags = []
    let parts = combo.lowercased().split(separator: "+").map { String($0).trimmingCharacters(in: .whitespaces) }
    var keyChar = ""

    for p in parts {
        switch p {
        case "cmd", "command": flags.insert(.maskCommand)
        case "ctrl", "control": flags.insert(.maskControl)
        case "alt", "opt", "option": flags.insert(.maskAlternate)
        case "shift": flags.insert(.maskShift)
        default: keyChar = p
        }
    }

    if keyChar == "space" {
        pressKeycode(49, flags: flags)
    } else if keyChar == "return" || keyChar == "enter" {
        pressKeycode(36, flags: flags)
    } else if keyChar == "tab" {
        pressKeycode(48, flags: flags)
    } else if let char = keyChar.first {
        let letterMap: [Character: CGKeyCode] = [
            "a": 0, "s": 1, "d": 2, "f": 3, "h": 4, "g": 5, "z": 6, "x": 7, "c": 8, "v": 9,
            "b": 11, "q": 12, "w": 13, "e": 14, "r": 15, "y": 16, "t": 17, "1": 18, "2": 19,
            "3": 20, "4": 21, "6": 22, "5": 23, "=": 24, "9": 25, "7": 26, "-": 27, "8": 28,
            "0": 29, "]": 30, "o": 31, "u": 32, "[": 33, "i": 34, "p": 35, "l": 37, "j": 38,
            "'": 39, "k": 40, ";": 41, "\\": 42, ",": 43, "/": 44, "n": 45, "m": 46, ".": 47
        ]
        if let code = letterMap[char] {
            pressKeycode(code, flags: flags)
        }
    }
}

func activateApp(_ name: String) {
    let clean = name.replacingOccurrences(of: "\"", with: "")
    let script = "tell application \"" + clean + "\" to activate"
    var error: NSDictionary?
    if let appleScript = NSAppleScript(source: script) {
        appleScript.executeAndReturnError(&error)
    }
}

func getFrontmostApp() -> String {
    let script = "tell application \"System Events\" to get name of first application process whose frontmost is true"
    var error: NSDictionary?
    if let appleScript = NSAppleScript(source: script) {
        let result = appleScript.executeAndReturnError(&error)
        return result.stringValue ?? "Finder"
    }
    return "Finder"
}

func captureScreen(to path: String) {
    let process = Process()
    process.executableURL = URL(fileURLWithPath: "/usr/sbin/screencapture")
    process.arguments = ["-x", path]
    try? process.run()
    process.waitUntilExit()
}

func showNotification(title: String, message: String) {
    let cleanTitle = title.replacingOccurrences(of: "\"", with: "")
    let cleanMsg = message.replacingOccurrences(of: "\"", with: "")
    let script = "display notification \"" + cleanMsg + "\" with title \"" + cleanTitle + "\""
    var error: NSDictionary?
    if let appleScript = NSAppleScript(source: script) {
        appleScript.executeAndReturnError(&error)
    }
}

func speakText(_ text: String) {
    let process = Process()
    process.executableURL = URL(fileURLWithPath: "/usr/bin/say")
    process.arguments = [text]
    try? process.run()
}

let args = CommandLine.arguments
guard args.count >= 2 else {
    let res = getScreenResolution()
    print("{\"action\":\"help\",\"screen\":{\"width\":\(res.width),\"height\":\(res.height)}}")
    exit(0)
}

let action = args[1].lowercased()

switch action {
case "resolution":
    let res = getScreenResolution()
    print("{\"width\":\(res.width),\"height\":\(res.height)}")
case "frontmost":
    let name = getFrontmostApp()
    print("{\"frontmost\":\"\(name)\"}")
case "click":
    if args.count >= 4, let x = Double(args[2]), let y = Double(args[3]) {
        mouseClick(x: x, y: y)
        print("{\"status\":\"ok\",\"action\":\"click\",\"x\":\(x),\"y\":\(y)}")
    }
case "rclick":
    if args.count >= 4, let x = Double(args[2]), let y = Double(args[3]) {
        mouseClick(x: x, y: y, right: true)
        print("{\"status\":\"ok\",\"action\":\"rclick\",\"x\":\(x),\"y\":\(y)}")
    }
case "dblclick":
    if args.count >= 4, let x = Double(args[2]), let y = Double(args[3]) {
        mouseDoubleClick(x: x, y: y)
        print("{\"status\":\"ok\",\"action\":\"dblclick\",\"x\":\(x),\"y\":\(y)}")
    }
case "drag":
    if args.count >= 6, let x1 = Double(args[2]), let y1 = Double(args[3]), let x2 = Double(args[4]), let y2 = Double(args[5]) {
        mouseDrag(x1: x1, y1: y1, x2: x2, y2: y2)
        print("{\"status\":\"ok\",\"action\":\"drag\",\"from\":[\(x1),\(y1)],\"to\":[\(x2),\(y2)]}")
    }
case "type":
    if args.count >= 3 {
        let text = args[2...].joined(separator: " ")
        typeString(text)
        print("{\"status\":\"ok\",\"action\":\"type\",\"text\":\(text.debugDescription)}")
    }
case "key":
    if args.count >= 3 {
        pressNamedKey(args[2])
        print("{\"status\":\"ok\",\"action\":\"key\",\"key\":\"\(args[2])\"}")
    }
case "hotkey":
    if args.count >= 3 {
        pressHotkey(args[2])
        print("{\"status\":\"ok\",\"action\":\"hotkey\",\"combo\":\"\(args[2])\"}")
    }
case "app":
    if args.count >= 3 {
        let name = args[2...].joined(separator: " ")
        activateApp(name)
        print("{\"status\":\"ok\",\"action\":\"app\",\"name\":\"\(name)\"}")
    }
case "screencap":
    let path = args.count >= 3 ? args[2] : "/tmp/mika_mac_screen.png"
    captureScreen(to: path)
    print("{\"status\":\"ok\",\"action\":\"screencap\",\"path\":\"\(path)\"}")
case "notify":
    if args.count >= 4 {
        showNotification(title: args[2], message: args[3])
        print("{\"status\":\"ok\",\"action\":\"notify\"}")
    }
case "say":
    if args.count >= 3 {
        let text = args[2...].joined(separator: " ")
        speakText(text)
        print("{\"status\":\"ok\",\"action\":\"say\"}")
    }
default:
    print("{\"status\":\"error\",\"message\":\"unknown action \(action)\"}")
}
