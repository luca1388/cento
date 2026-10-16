import WidgetKit
import SwiftUI
import AppIntents

// MARK: - Timeline

struct CentoEntry: TimelineEntry {
    let date: Date
    let day: WidgetDay?

    var items: [WidgetItem] {
        guard let day else { return [] }
        return day.items.filter { $0.kind == "birthday" }
    }
}

struct CentoConfiguration: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Cento"
    static var description = IntentDescription("Prossimi compleanni")
}

struct CentoProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> CentoEntry {
        let person = WidgetPerson(id: "p", name: "Giulia Bianchi", initial: "G", avatarColor: "#F2A68C", turningAge: 29, ageLabel: "Compie 29 anni")
        let hero = BirthdayWidgetHero(daysLeft: 3, relativeLabel: "Tra 3 giorni", dateLabel: "19 ottobre", ringProgress: 0.9, totalCount: 1, countLabel: "1 compleanno", othersLabel: "", ringUnit: "giorni", people: [person], hiddenCount: 0)
        let model = BirthdayWidgetModel(state: "ready", hero: hero, upcoming: [], monthRemainingCount: 1, monthLabel: "Ottobre", monthFooter: "Ottobre · 1 compleanno ancora", sectionNext: "Prossimo compleanno", sectionNextPlural: "Prossimi compleanni", emptyTitle: "Nessun compleanno salvato", emptyHint: "Apri l'app per aggiungerne uno", emptyReadHint: "Tocca per aprire l'app")
        let day = WidgetDay(date: "", headline: "Prossimo compleanno", items: [], birthdayWidget: model)
        return CentoEntry(date: .now, day: day)
    }

    func snapshot(for configuration: CentoConfiguration, in context: Context) async -> CentoEntry {
        let snap = SnapshotStore.load()
        return CentoEntry(date: .now, day: snap.flatMap { SnapshotStore.entry(for: .now, in: $0) })
    }

    /// One entry per midnight for the pre-rendered horizon, so "in 3 days" becomes "in 2 days" overnight
    /// without the app running. The app's daily background task rewrites the file before it runs out.
    func timeline(for configuration: CentoConfiguration, in context: Context) async -> Timeline<CentoEntry> {
        let snap = SnapshotStore.load()
        let cal = Calendar.current
        let start = cal.startOfDay(for: .now)
        var entries: [CentoEntry] = []
        for offset in 0..<14 {
            guard let date = cal.date(byAdding: .day, value: offset, to: start) else { continue }
            let at = offset == 0 ? Date.now : date
            entries.append(CentoEntry(date: at, day: snap.flatMap { SnapshotStore.entry(for: date, in: $0) }))
        }
        return Timeline(entries: entries, policy: .atEnd)
    }
}

// MARK: - Views

struct CentoWidgetView: View {
    @Environment(\.widgetFamily) var family
    let entry: CentoEntry

    var body: some View {
        switch family {
        case .accessoryCircular: circular
        case .accessoryRectangular: rectangular
        case .accessoryInline: inline
        case .systemMedium: medium
        case .systemLarge, .systemExtraLarge: large
        default: small
        }
        .widgetURL(URL(string: "cento://"))
    }

    private var headline: String { model?.emptyTitle ?? "No birthdays saved" }
    private var model: BirthdayWidgetModel? { entry.day?.birthdayWidget }
    private var hero: BirthdayWidgetHero? { model?.hero }

    private var small: some View {
        Group {
            if let model, model.state == "empty" { empty(model) }
            else if let model, let hero {
                VStack(spacing: 7) {
                    Text(hero.totalCount > 1 ? model.sectionNextPlural : model.sectionNext)
                        .font(.system(size: 10, weight: .bold)).tracking(0.8).foregroundStyle(WidgetColors.muted)
                        .lineLimit(1)
                    ring(hero, size: 88, inCard: false)
                    Text(smallNames(hero)).font(.system(size: 16, weight: .bold)).foregroundStyle(WidgetColors.text).lineLimit(1).minimumScaleFactor(0.8)
                    Text(smallDetail(hero)).font(.system(size: 12)).foregroundStyle(WidgetColors.muted).lineLimit(1).minimumScaleFactor(0.75)
                }.frame(maxWidth: .infinity, maxHeight: .infinity)
            } else { emptyFallback }
        }
    }

    private var medium: some View {
        Group {
            if let model, model.state == "empty" { empty(model) }
            else if let model, let hero {
                GeometryReader { proxy in
                        let leftWidth = min(170, max(130, proxy.size.width * 0.38))
                        HStack(spacing: 12) {
                            VStack(alignment: .leading, spacing: 5) {
                                Text(hero.totalCount > 1 ? hero.countLabel : model.sectionNext).font(.system(size: 11, weight: .bold)).foregroundStyle(WidgetColors.muted).lineLimit(1)
                                ring(hero, size: 64, inCard: false)
                                ForEach(hero.people.prefix(2)) { person in
                                    Text(person.name).font(.system(size: hero.totalCount > 1 ? 15 : 18, weight: .bold)).foregroundStyle(WidgetColors.text).lineLimit(1)
                                }
                                if hero.hiddenCount > 0 { Text(hero.othersLabel).font(.system(size: 12)).foregroundStyle(WidgetColors.muted).lineLimit(1) }
                                Text("\(hero.relativeLabel) · \(hero.dateLabel)").font(.system(size: 12, weight: .bold)).foregroundStyle(WidgetColors.accent).lineLimit(1).minimumScaleFactor(0.8)
                                if hero.totalCount == 1, let age = hero.people.first?.ageLabel { Text(age).font(.system(size: 11)).foregroundStyle(WidgetColors.muted).lineLimit(1) }
                                Spacer(minLength: 0)
                            }.frame(width: leftWidth, alignment: .leading)
                            Rectangle().fill(WidgetColors.track).frame(width: 1)
                            VStack(alignment: .leading, spacing: 2) {
                                let rows = min(3, max(0, Int((proxy.size.height - 12) / 54)))
                                ForEach(Array(model.upcoming.prefix(rows))) { item in upcomingRow(item, large: false) }
                                Spacer(minLength: 0)
                            }
                        }
                }
            } else { emptyFallback }
        }
    }

    private var large: some View {
        Group {
            if let model, model.state == "empty" { empty(model) }
            else if let model, let hero {
                GeometryReader { proxy in
                        let maxRows = hero.totalCount > 1 ? 3 : 4
                        let rows = min(maxRows, max(2, Int((proxy.size.height - (hero.totalCount > 1 ? 220 : 180)) / 62)))
                        VStack(alignment: .leading, spacing: 0) {
                            HStack(spacing: 14) {
                                ring(hero, size: 88, inCard: true)
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(hero.totalCount > 1 ? "\(hero.relativeLabel.uppercased()) · \(hero.countLabel.uppercased())" : hero.relativeLabel.uppercased())
                                        .font(.system(size: 12, weight: .bold)).tracking(0.6).foregroundStyle(WidgetColors.accent).lineLimit(1)
                                    if hero.totalCount > 1 {
                                        ForEach(hero.people.prefix(2)) { person in heroPerson(person) }
                                        if hero.hiddenCount > 0 { Text(hero.othersLabel).font(.system(size: 12)).foregroundStyle(WidgetColors.muted).lineLimit(1) }
                                    } else if let person = hero.people.first {
                                        Text(person.name).font(.system(size: 22, weight: .bold)).foregroundStyle(WidgetColors.text).lineLimit(2)
                                        Text("\(hero.dateLabel)\(person.ageLabel.map { " · \($0)" } ?? "")").font(.system(size: 12)).foregroundStyle(WidgetColors.muted).lineLimit(1)
                                    }
                                }
                                Spacer(minLength: 0)
                            }
                            .padding(14).frame(maxWidth: .infinity, minHeight: hero.totalCount > 1 ? 164 : 126, alignment: .leading)
                            .background(WidgetColors.card, in: RoundedRectangle(cornerRadius: 20))
                            Spacer().frame(height: 12)
                            ForEach(Array(model.upcoming.prefix(rows).enumerated()), id: \.element.id) { index, item in
                                upcomingRow(item, large: true)
                                if index < min(model.upcoming.count, rows) - 1 { Rectangle().fill(WidgetColors.track).frame(height: 1) }
                            }
                            Spacer(minLength: 0)
                            if proxy.size.height >= 360 { Text(model.monthFooter).font(.system(size: 12)).foregroundStyle(WidgetColors.muted).lineLimit(1).padding(.top, 3) }
                        }
                }
            } else { emptyFallback }
        }
    }

    private func empty(_ model: BirthdayWidgetModel) -> some View {
        VStack(spacing: 5) {
            Text(model.emptyTitle).font(.system(size: 15, weight: .bold)).foregroundStyle(WidgetColors.text).multilineTextAlignment(.center)
            Text(model.emptyHint).font(.system(size: 11)).foregroundStyle(WidgetColors.muted).multilineTextAlignment(.center)
            if !model.emptyReadHint.isEmpty { Text(model.emptyReadHint).font(.system(size: 10)).foregroundStyle(WidgetColors.muted) }
        }.frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var emptyFallback: some View {
        VStack(spacing: 5) {
            Text("No birthdays saved").font(.system(size: 15, weight: .bold)).foregroundStyle(WidgetColors.text)
            Text("Open the app to add one").font(.system(size: 11)).foregroundStyle(WidgetColors.muted)
            Text("Tap to open the app").font(.system(size: 10)).foregroundStyle(WidgetColors.muted)
        }.frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private func ring(_ hero: BirthdayWidgetHero, size: CGFloat, inCard: Bool) -> some View {
        let first = hero.people.first
        return ZStack {
            Circle().stroke(inCard ? WidgetColors.trackCard : WidgetColors.track, lineWidth: size > 70 ? 5 : 4)
            Circle().trim(from: 0, to: hero.ringProgress).stroke(WidgetColors.accent, style: StrokeStyle(lineWidth: size > 70 ? 5 : 4, lineCap: .round))
                .rotationEffect(.degrees(-90))
            VStack(spacing: -2) {
                Text(hero.daysLeft == 0 ? "Oggi" : String(hero.daysLeft)).font(.system(size: hero.daysLeft == 0 ? 12 : size > 70 ? 34 : 24, weight: .bold)).foregroundStyle(WidgetColors.accent).minimumScaleFactor(0.7)
                if hero.daysLeft > 0 { Text(hero.ringUnit).font(.system(size: 11)).foregroundStyle(WidgetColors.muted) }
            }
            if hero.totalCount > 1 && size <= 70 {
                HStack(spacing: -4) {
                    ForEach(hero.people.prefix(2)) { person in avatar(person, size: 28, border: WidgetColors.background) }
                }
            }
            if size > 70 {
                avatarBadge(first: first, total: hero.totalCount, surface: inCard ? WidgetColors.card : WidgetColors.background)
                    .offset(x: size * 0.32, y: size * 0.32)
            }
        }
        .frame(width: size, height: size)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("\(hero.totalCount) birthdays, \(hero.relativeLabel), \(hero.dateLabel)")
    }

    private func avatarBadge(first: WidgetPerson?, total: Int, surface: Color) -> some View {
        ZStack {
            Circle().fill(total > 1 ? WidgetColors.coral : color(first?.avatarColor)).overlay(Circle().stroke(surface, lineWidth: 3))
            Text(total > 1 ? String(total) : (first?.initial ?? "?")).font(.system(size: 15, weight: .bold)).foregroundStyle(WidgetColors.background)
        }.frame(width: 30, height: 30)
    }

    private func avatar(_ person: WidgetPerson, size: CGFloat, border: Color? = nil) -> some View {
        Circle().fill(color(person.avatarColor)).overlay(Text(person.initial).font(.system(size: size * 0.5, weight: .bold)).foregroundStyle(WidgetColors.background))
            .overlay(Circle().stroke(border ?? .clear, lineWidth: border == nil ? 0 : 2)).frame(width: size, height: size)
    }

    private func heroPerson(_ person: WidgetPerson) -> some View {
        HStack(spacing: 8) {
            avatar(person, size: 30)
            VStack(alignment: .leading, spacing: 0) {
                Text(person.name).font(.system(size: 15, weight: .bold)).foregroundStyle(WidgetColors.text).lineLimit(1)
                if let age = person.ageLabel { Text(age).font(.system(size: 11)).foregroundStyle(WidgetColors.muted).lineLimit(1) }
            }
        }.frame(height: 34)
    }

    private func upcomingRow(_ item: BirthdayWidgetUpcoming, large: Bool) -> some View {
        HStack(spacing: 9) {
            avatar(item.person, size: large ? 34 : 28)
            VStack(alignment: .leading, spacing: 0) {
                Text(item.person.name).font(.system(size: large ? 14 : 13, weight: .bold)).foregroundStyle(WidgetColors.text).lineLimit(1)
                Text(item.dateLabel).font(.system(size: 11)).foregroundStyle(WidgetColors.muted).lineLimit(1)
            }
            Spacer(minLength: 16)
            HStack(alignment: .firstTextBaseline, spacing: 4) {
                Text(String(item.daysLeft)).font(.system(size: 18, weight: .bold, design: .rounded)).foregroundStyle(WidgetColors.accent)
                Text(item.daysUnit).font(.system(size: large ? 11 : 10)).foregroundStyle(WidgetColors.muted)
            }.frame(minWidth: large ? 92 : 78, alignment: .trailing)
        }.frame(height: large ? 58 : 54)
    }

    private func smallNames(_ hero: BirthdayWidgetHero) -> String {
        guard let first = hero.people.first else { return "" }
        if hero.totalCount == 1 { return first.name }
        let second = hero.people.dropFirst().first?.name.split(separator: " ").first.map(String.init) ?? ""
        let firstName = first.name.split(separator: " ").first.map(String.init) ?? first.name
        return hero.totalCount == 2 ? "\(firstName) e \(second)" : "\(firstName), \(second) +\(hero.totalCount - 2)"
    }

    private func smallDetail(_ hero: BirthdayWidgetHero) -> String {
        guard hero.totalCount == 1, let age = hero.people.first?.ageLabel else { return "\(hero.relativeLabel) · \(hero.countLabel)" }
        return "\(hero.relativeLabel) · \(age)"
    }

    private func color(_ hex: String?) -> Color {
        guard let hex else { return WidgetColors.coral }
        let value = UInt(hex.dropFirst(), radix: 16) ?? 0xF2A68C
        return Color(red: Double((value >> 16) & 0xff) / 255, green: Double((value >> 8) & 0xff) / 255, blue: Double(value & 0xff) / 255)
    }

    private var circular: some View {
        ZStack {
            AccessoryWidgetBackground()
            VStack(spacing: 0) {
                Image(systemName: "birthday.cake.fill").font(.caption2)
                Text(hero.map { $0.daysLeft == 0 ? "0" : String($0.daysLeft) } ?? "—").font(.title3.weight(.bold).monospacedDigit())
            }
        }
    }

    private var rectangular: some View {
        VStack(alignment: .leading, spacing: 2) {
            if let hero, let person = hero.people.first {
                HStack(spacing: 4) {
                    Text(person.name).font(.headline).lineLimit(1)
                }
                Text("\(hero.relativeLabel) · \(hero.dateLabel)").font(.caption2).lineLimit(2)
            } else {
                Text(headline).font(.caption)
            }
        }
    }

    private var inline: some View { Text(hero.map { "\($0.people.first?.name ?? "") · \($0.relativeLabel)" } ?? headline) }
}

private enum WidgetColors {
    static let background = Color(red: 20.0 / 255, green: 32.0 / 255, blue: 63.0 / 255)
    static let card = Color(red: 31.0 / 255, green: 46.0 / 255, blue: 87.0 / 255)
    static let track = Color(red: 42.0 / 255, green: 57.0 / 255, blue: 98.0 / 255)
    static let trackCard = Color(red: 47.0 / 255, green: 65.0 / 255, blue: 117.0 / 255)
    static let accent = Color(red: 245.0 / 255, green: 198.0 / 255, blue: 109.0 / 255)
    static let text = Color(red: 244.0 / 255, green: 231.0 / 255, blue: 194.0 / 255)
    static let muted = Color(red: 169.0 / 255, green: 179.0 / 255, blue: 207.0 / 255)
    static let coral = Color(red: 242.0 / 255, green: 166.0 / 255, blue: 140.0 / 255)
}

// MARK: - Widget

struct CentoWidget: Widget {
    let kind = "CentoWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: CentoConfiguration.self, provider: CentoProvider()) { entry in
            CentoWidgetView(entry: entry)
                .containerBackground(Color("primary"), for: .widget)
        }
        .configurationDisplayName("Cento")
        .description("Prossimi compleanni.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge, .accessoryCircular, .accessoryRectangular, .accessoryInline])
    }
}

@main
struct CentoWidgetBundle: WidgetBundle {
    var body: some Widget {
        CentoWidget()
    }
}
