import Cocoa

public final class QuickTaskWindowController: NSWindowController {
    private var goalTextView: NSTextView!
    private var submitButton: NSButton!
    private var cancelButton: NSButton!
    private var spinner: NSProgressIndicator!
    private var statusLabel: NSTextField!
    public var selectedDevice: String?
    public var onTaskSubmitted: (() -> Void)?

    public convenience init() {
        let window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 500, height: 280),
            styleMask: [.titled, .closable],
            backing: .buffered,
            defer: false
        )
        window.title = "Dispatch Task to Mika"
        window.center()
        self.init(window: window)
        setupUI()
    }

    private func setupUI() {
        guard let window = window else { return }
        let contentView = NSView(frame: window.contentView!.bounds)
        window.contentView = contentView

        let titleLabel = NSTextField(labelWithString: "🚀 What should Mika do on your phone?")
        titleLabel.font = NSFont.systemFont(ofSize: 15, weight: .semibold)
        titleLabel.frame = NSRect(x: 20, y: 235, width: 460, height: 24)
        contentView.addSubview(titleLabel)

        let subtitleLabel = NSTextField(labelWithString: "Mika will handle phone apps, browser, and navigation automatically.")
        subtitleLabel.font = NSFont.systemFont(ofSize: 12)
        subtitleLabel.textColor = NSColor.secondaryLabelColor
        subtitleLabel.frame = NSRect(x: 20, y: 215, width: 460, height: 18)
        contentView.addSubview(subtitleLabel)

        let scroll = NSScrollView(frame: NSRect(x: 20, y: 70, width: 460, height: 135))
        scroll.hasVerticalScroller = true
        scroll.borderType = .bezelBorder

        goalTextView = NSTextView(frame: scroll.contentView.bounds)
        goalTextView.autoresizingMask = [.width, .height]
        goalTextView.font = NSFont.systemFont(ofSize: 13)
        goalTextView.string = "Order iced americano under $5 on Starbucks"
        scroll.documentView = goalTextView
        contentView.addSubview(scroll)

        statusLabel = NSTextField(labelWithString: "")
        statusLabel.font = NSFont.systemFont(ofSize: 11)
        statusLabel.textColor = NSColor.systemGray
        statusLabel.frame = NSRect(x: 20, y: 25, width: 280, height: 20)
        contentView.addSubview(statusLabel)

        spinner = NSProgressIndicator(frame: NSRect(x: 305, y: 23, width: 20, height: 20))
        spinner.style = .spinning
        spinner.isDisplayedWhenStopped = false
        contentView.addSubview(spinner)

        cancelButton = NSButton(title: "Cancel", target: self, action: #selector(cancelClicked))
        cancelButton.bezelStyle = .rounded
        cancelButton.frame = NSRect(x: 330, y: 18, width: 75, height: 30)
        contentView.addSubview(cancelButton)

        submitButton = NSButton(title: "Send to Phone", target: self, action: #selector(submitClicked))
        submitButton.bezelStyle = .rounded
        submitButton.isHighlighted = true
        submitButton.keyEquivalent = "\r"
        submitButton.frame = NSRect(x: 405, y: 18, width: 80, height: 30)
        contentView.addSubview(submitButton)
    }

    @objc private func cancelClicked() {
        window?.close()
    }

    @objc private func submitClicked() {
        let goal = goalTextView.string.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !goal.isEmpty else { return }

        spinner.startAnimation(nil)
        submitButton.isEnabled = false
        cancelButton.isEnabled = false
        statusLabel.stringValue = "Submitting to phone..."
        statusLabel.textColor = NSColor.systemBlue

        MikaBridge.shared.submitTask(goal: goal, device: selectedDevice) { [weak self] result in
            guard let self = self else { return }
            self.spinner.stopAnimation(nil)
            self.submitButton.isEnabled = true
            self.cancelButton.isEnabled = true

            switch result {
            case .success(_):
                self.statusLabel.stringValue = "Task sent successfully!"
                self.statusLabel.textColor = NSColor.systemGreen
                NotificationHelper.shared.sendNotification(title: "Mika Task Started", body: goal)
                self.onTaskSubmitted?()
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
                    self.window?.close()
                }
            case .failure(let error):
                self.statusLabel.stringValue = "Failed: \(error.localizedDescription)"
                self.statusLabel.textColor = NSColor.systemRed
            }
        }
    }
}
