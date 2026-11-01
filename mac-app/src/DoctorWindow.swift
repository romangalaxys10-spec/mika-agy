import Cocoa

public final class DoctorWindowController: NSWindowController {
    private var textView: NSTextView!
    private var progressIndicator: NSProgressIndicator!
    private var refreshButton: NSButton!
    public var selectedDevice: String?

    public convenience init() {
        let window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 620, height: 460),
            styleMask: [.titled, .closable, .resizable],
            backing: .buffered,
            defer: false
        )
        window.title = "Mika Diagnostics & Health Check"
        window.center()
        self.init(window: window)
        setupUI()
    }

    private func setupUI() {
        guard let window = window else { return }
        let contentView = NSView(frame: window.contentView!.bounds)
        contentView.autoresizingMask = [.width, .height]
        window.contentView = contentView

        let headerLabel = NSTextField(labelWithString: "🩺 Mika Phone Diagnostics (Doctor)")
        headerLabel.font = NSFont.systemFont(ofSize: 16, weight: .bold)
        headerLabel.frame = NSRect(x: 20, y: 415, width: 400, height: 26)
        contentView.addSubview(headerLabel)

        refreshButton = NSButton(title: "Run Check", target: self, action: #selector(runDoctorCheck))
        refreshButton.bezelStyle = .rounded
        refreshButton.frame = NSRect(x: 500, y: 412, width: 100, height: 28)
        contentView.addSubview(refreshButton)

        progressIndicator = NSProgressIndicator(frame: NSRect(x: 465, y: 417, width: 20, height: 20))
        progressIndicator.style = .spinning
        progressIndicator.isDisplayedWhenStopped = false
        contentView.addSubview(progressIndicator)

        let scroll = NSScrollView(frame: NSRect(x: 20, y: 20, width: 580, height: 380))
        scroll.autoresizingMask = [.width, .height]
        scroll.hasVerticalScroller = true
        scroll.borderType = .bezelBorder

        textView = NSTextView(frame: scroll.contentView.bounds)
        textView.autoresizingMask = [.width, .height]
        textView.isEditable = false
        textView.font = NSFont.userFixedPitchFont(ofSize: 12) ?? NSFont.monospacedSystemFont(ofSize: 12, weight: .regular)
        textView.backgroundColor = NSColor.textBackgroundColor
        textView.textColor = NSColor.textColor

        scroll.documentView = textView
        contentView.addSubview(scroll)

        runDoctorCheck()
    }

    @objc public func runDoctorCheck() {
        progressIndicator.startAnimation(nil)
        refreshButton.isEnabled = false
        textView.string = "Running doctor diagnostics on device: \(selectedDevice ?? "auto-detect")...\n"

        MikaBridge.shared.runDoctor(device: selectedDevice) { [weak self] output in
            guard let self = self else { return }
            self.progressIndicator.stopAnimation(nil)
            self.refreshButton.isEnabled = true
            self.textView.string = output
        }
    }
}
