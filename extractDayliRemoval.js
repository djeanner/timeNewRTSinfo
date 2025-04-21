const fs = require("fs");
const path = require("path");

// === CONFIG ===
const inputFile = "card-titles.json";
const outputDir = "removed-by-day";
const targetYear = 2025;

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir);
}

// Load data
const data = JSON.parse(fs.readFileSync(inputFile, "utf8"));

// Helper to pad numbers
const pad = (n) => n.toString().padStart(2, "0");

// Loop through each day of the year 2025
for (let month = 1; month <= 12; month++) {
	const daysInMonth = new Date(targetYear, month, 0).getDate();
	for (let day = 1; day <= daysInMonth; day++) {
		const dateStr = `${targetYear}-${pad(month)}-${pad(day)}`;

		// Filter entries removed on that specific date
		const removedOnDay = data
			.filter((entry) => {
				if (!entry.removed_at) return false;
				return entry.removed_at.startsWith(dateStr);
			})
			.map((entry) => ({
				title: entry.title,
				added_at: entry.added_at,
				removed_at: entry.removed_at,
				duration_minutes: entry.duration_minutes,
				duration_str: entry.duration_str,
			}));

		// Write if there is at least one entry
		if (removedOnDay.length > 0) {
			const outputFilePath = path.join(outputDir, `${dateStr}.json`);
			fs.writeFileSync(
				outputFilePath,
				JSON.stringify(removedOnDay, null, 2),
				"utf8"
			);
			console.log(
				`✅ ${dateStr}.json written (${removedOnDay.length} entries)`
			);
		}
	}
}
