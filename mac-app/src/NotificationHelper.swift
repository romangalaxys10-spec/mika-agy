import Foundation
import UserNotifications

public final class NotificationHelper {
    public static let shared = NotificationHelper()

    private init() {
        requestAuthorization()
    }

    public func requestAuthorization() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            if let error = error {
                print("Notification authorization error: \(error.localizedDescription)")
            }
        }
    }

    public func sendNotification(title: String, subtitle: String? = nil, body: String) {
        let content = UNMutableNotificationContent()
        content.title = title
        if let sub = subtitle { content.subtitle = sub }
        content.body = body
        content.sound = .default

        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: nil)
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("Failed to schedule notification: \(error.localizedDescription)")
            }
        }
    }
}
