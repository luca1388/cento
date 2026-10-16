import WidgetKit
import SwiftUI
import AppIntents

// MARK: - Timeline

struct CentoEntry: TimelineEntry {
    let date: Date
    let day: WidgetDay?
    let birthdaysOnly: Bool

    var items: [WidgetItem] {
        guard let day else { return [] }
        return birthdaysOnly ? day.items.filter { $0.kind == "birthday" } : day.items
    }
}

/// One intent parameter, as in the design: show every event or birthdays only.
struct CentoConfiguration: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Cento"
    static var description = IntentDescription("Prossime date")

    @Parameter(title: "Solo compleanni", default: false)
    var birthdaysOnly: Bool
}

struct CentoProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> CentoEntry {
        CentoEntry(date: .now, day: WidgetDay(date: "", headline: "Prossimo compleanno", items: [
            WidgetItem(id: "p", personId: "p", kind: "birthday", name: "Giulia Bianchi", short: "Giulia · 3 giorni", long: "Tra 3 giorni · compie 29 anni", deepLink: "cento://"),
        ]), birthdaysOnly: false)
    }

    func snapshot(for configuration: CentoConfiguration, in context: Context) async -> CentoEntry {
        let snap = SnapshotStore.load()
        return CentoEntry(date: .now, day: snap.flatMap { SnapshotStore.entry(for: .now, in: $0) }, birthdaysOnly: configuration.birthdaysOnly)
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
            entries.append(CentoEntry(date: at, day: snap.flatMap { SnapshotStore.entry(for: date, in: $0) }, birthdaysOnly: configuration.birthdaysOnly))
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
        case .systemMedium: list(limit: 4)
        case .systemLarge, .systemExtraLarge: list(limit: 7)
        default: small
        }
        .widgetURL(URL(string: "cento://"))
    }

    private var first: WidgetItem? { entry.items.first }
    private var headline: String { entry.day?.headline ?? "" }

    private var small: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(headline).font(.caption2.weight(.bold)).foregroundStyle(Color("muted")).lineLimit(1)
            Spacer(minLength: 0)
            if let first {
                Image(systemName: first.glyph).foregroundStyle(Color("flame")).font(.title3)
                Text(first.name).font(.headline).foregroundStyle(Color("onPrimary")).lineLimit(1)
                Text(first.long).font(.caption).foregroundStyle(Color("onPrimary").opacity(0.85)).lineLimit(2)
            } else {
                Text("—").font(.title).foregroundStyle(Color("onPrimary"))
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }

    private func list(limit: Int) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(headline).font(.caption2.weight(.bold)).foregroundStyle(Color("muted")).lineLimit(1)
            ForEach(Array(entry.items.prefix(limit))) { item in
                HStack(spacing: 8) {
                    Image(systemName: item.glyph).foregroundStyle(Color("flame")).font(.caption)
                    Text(item.name).font(.subheadline.weight(.semibold)).foregroundStyle(Color("onPrimary")).lineLimit(1)
                    Spacer()
                    Text(item.countdown).font(.caption.monospacedDigit()).foregroundStyle(Color("onPrimary").opacity(0.85)).lineLimit(1)
                }
            }
            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }

    private var circular: some View {
        ZStack {
            AccessoryWidgetBackground()
            VStack(spacing: 0) {
                Image(systemName: first?.glyph ?? "birthday.cake.fill").font(.caption2)
                Text(first.map { $0.countdown.components(separatedBy: " ").first ?? "" } ?? "—").font(.title3.weight(.bold).monospacedDigit())
            }
        }
    }

    private var rectangular: some View {
        VStack(alignment: .leading, spacing: 2) {
            if let first {
                HStack(spacing: 4) {
                    Image(systemName: first.glyph).font(.caption2)
                    Text(first.name).font(.headline).lineLimit(1)
                }
                Text(first.long).font(.caption2).lineLimit(2)
            } else {
                Text(headline).font(.caption)
            }
        }
    }

    private var inline: some View { Text(first?.short ?? headline) }
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
        .description("Prossimi compleanni, onomastici e feste.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge, .accessoryCircular, .accessoryRectangular, .accessoryInline])
    }
}

@main
struct CentoWidgetBundle: WidgetBundle {
    var body: some Widget {
        CentoWidget()
    }
}
