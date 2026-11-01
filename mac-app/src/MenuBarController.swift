import Cocoa

public final class MenuBarController {
    private var statusItem: NSStatusItem!
    private weak var mainWindowController: MainWindowController?

    public init(mainWindowController: MainWindowController) {
        self.mainWindowController = mainWindowController
        setupStatusItem()
    }

    private func setupStatusItem() {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        if let button = statusItem.button {
            button.title = "🐾"
            button.toolTip = "Mika Mac Desktop"
        }

        let menu = NSMenu()

        let showItem = NSMenuItem(title: "Open Mika Desk", action: #selector(showMainWindow), keyEquivalent: "o")
        showItem.target = self
        menu.addItem(showItem)

        let quickTaskItem = NSMenuItem(title: "Quick Task...", action: #selector(openQuickTask), keyEquivalent: "n")
        quickTaskItem.target = self
        menu.addItem(quickTaskItem)

        let doctorItem = NSMenuItem(title: "Run Diagnostics (Doctor)...", action: #selector(openDoctor), keyEquivalent: "d")
        doctorItem.target = self
        menu.addItem(doctorItem)

        menu.addItem(NSMenuItem.separator())

        let restartItem = NSMenuItem(title: "Restart Bridge Server", action: #selector(restartBridge), keyEquivalent: "r")
        restartItem.target = self
        menu.addItem(restartItem)

        menu.addItem(NSMenuItem.separator())

        let quitItem = NSMenuItem(title: "Quit Mika", action: #selector(quitApp), keyEquivalent: "q")
        quitItem.target = self
        menu.addItem(quitItem)

        statusItem.menu = menu
    }

    @objc private func showMainWindow() {
        mainWindowController?.showWindow(nil)
        mainWindowController?.window?.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    @objc private func openQuickTask() {
        mainWindowController?.openQuickTask()
    }

    @objc private func openDoctor() {
        mainWindowController?.openDoctor()
    }

    @objc private func restartBridge() {
        mainWindowController?.startBridge()
    }

    @objc private func quitApp() {
        MikaBridge.shared.stopDeskServer()
        NSApp.terminate(nil)
    }
}
