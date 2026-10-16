import Foundation

/// Mirrors the JSON the app writes into the App Group container (`widget-snapshot.json`).
/// All strings are already localized by the app: the widget never formats or translates anything.
struct WidgetSnapshot: Decodable {
    let locale: String
    let generatedAt: String
    let days: [WidgetDay]
}

struct WidgetDay: Decodable {
    let date: String
    let headline: String
    let items: [WidgetItem]
    let birthdayWidget: BirthdayWidgetModel?
}

struct BirthdayWidgetModel: Decodable {
    let state: String
    let hero: BirthdayWidgetHero?
    let upcoming: [BirthdayWidgetUpcoming]
    let monthRemainingCount: Int
    let monthLabel: String
    let monthFooter: String
    let sectionNext: String
    let sectionNextPlural: String
    let emptyTitle: String
    let emptyHint: String
    let emptyReadHint: String
}

struct BirthdayWidgetHero: Decodable {
    let daysLeft: Int
    let relativeLabel: String
    let dateLabel: String
    let ringProgress: Double
    let totalCount: Int
    let countLabel: String
    let othersLabel: String
    let ringUnit: String
    let people: [WidgetPerson]
    let hiddenCount: Int
}

struct BirthdayWidgetUpcoming: Decodable, Identifiable {
    let person: WidgetPerson
    let dateLabel: String
    let daysLeft: Int
    let daysUnit: String
    var id: String { person.id }
}

struct WidgetPerson: Decodable, Identifiable {
    let id: String
    let name: String
    let initial: String
    let avatarColor: String
    let turningAge: Int?
    let ageLabel: String?
}

struct WidgetItem: Decodable, Identifiable {
    let id: String
    let personId: String
    let kind: String   // birthday | nameday | celebration
    let name: String
    let short: String  // "Giulia · 3 giorni"
    let long: String   // "Tra 3 giorni · compie 29 anni"
    let deepLink: String

    var glyph: String {
        switch kind {
        case "nameday": return "flame.fill"
        case "celebration": return "party.popper.fill"
        default: return "birthday.cake.fill"
        }
    }
    var countdown: String {
        short.components(separatedBy: " · ").last ?? short
    }
}

enum SnapshotStore {
    static let appGroup = "group.app.cento"
    static let fileName = "widget-snapshot.json"

    static func load() -> WidgetSnapshot? {
        guard let dir = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroup) else { return nil }
        guard let data = try? Data(contentsOf: dir.appendingPathComponent(fileName)) else { return nil }
        return try? JSONDecoder().decode(WidgetSnapshot.self, from: data)
    }

    static func isoDay(_ date: Date) -> String {
        let f = DateFormatter()
        f.calendar = Calendar(identifier: .gregorian)
        f.locale = Locale(identifier: "en_US_POSIX")
        f.timeZone = .current
        f.dateFormat = "yyyy-MM-dd"
        return f.string(from: date)
    }

    /// The entry for a calendar day; falls back to the last pre-rendered day when the horizon is exceeded.
    static func entry(for date: Date, in snapshot: WidgetSnapshot) -> WidgetDay? {
        let key = isoDay(date)
        return snapshot.days.first { $0.date == key } ?? snapshot.days.last
    }
}
