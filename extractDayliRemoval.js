const fs = require("fs");
const path = require("path");

// === CONFIG ===
const inputFile = "card-titles.json";
const outputJsonDir = "removed-by-day";
const outputHtmlDir = "html";
const targetYear = 2025;

// Ensure output directories exist
if (!fs.existsSync(outputJsonDir)) fs.mkdirSync(outputJsonDir);
if (!fs.existsSync(outputHtmlDir)) fs.mkdirSync(outputHtmlDir);

// Load data
const data = JSON.parse(fs.readFileSync(inputFile, "utf8"));

// Helpers
const pad = (n) => n.toString().padStart(2, "0");
const formatTime = (iso) => {
	if (!iso) return "";
	const date = new Date(iso);
	return isNaN(date) ? "" : date.toISOString().substring(11, 16);
};

const formatDate = (iso) => {
	if (!iso) return "";
	const date = new Date(iso);
	return isNaN(date) ? "" : date.toISOString().substring(0, 10);
};
const htmlEscape = (str) =>
	str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const generateHtmlTable = (entries, dateStr) => {
	const rows = entries
		.sort((a, b) => new Date(a.added_at) - new Date(b.added_at))
		.map((entry) => {
			const time = formatTime(entry.added_at);
			var time2 =
				formatTime(entry.removed_at) + " " + formatDate(entry.removed_at);
			if (formatDate(entry.added_at) == formatDate(entry.removed_at))
				time2 = formatTime(entry.removed_at);
			const duration = htmlEscape(entry.duration_str || "");
			const title = htmlEscape(entry.title || "");
			return `<tr><td>${time}</td><td>${time2}</td><td>${duration}</td><td>${title}</td></tr>`;
		})
		.join("\n");

	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Duration of info cards - ${dateStr}</title>
  <style>
    body { font-family: sans-serif; margin: 2em; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ccc; padding: 0.5em; text-align: left; }
    th { background: #eee; }
  </style>
</head>
<body>
  <h1>Duration of cards on ${dateStr}</h1>
  <table>
    <thead><tr><th>In (GMT)</th><th>Out (GMT)</th><th>Duration</th><th>Title</th></tr></thead>
    <tbody>
${rows}
    </tbody>
  </table>
  <p><a href="index.html">← Back to index</a></p>
</body>
</html>`;
};

// Track generated HTML files for index
const htmlFiles = [];

// Loop through each day
for (let month = 1; month <= 12; month++) {
	const daysInMonth = new Date(targetYear, month, 0).getDate();
	for (let day = 1; day <= daysInMonth; day++) {
		const dateStr = `${targetYear}-${pad(month)}-${pad(day)}`;

		// Filter entries removed and added on this day
		const onDay = data
			.filter((entry) => entry.added_at && entry.added_at.startsWith(dateStr))
			.map((entry) => ({
				title: entry.title,
				added_at: entry.added_at,
				removed_at: entry.removed_at,
				duration_minutes: entry.duration_minutes ?? 0,
				duration_str: entry.duration_str ?? "",
			}));

		if (onDay.length > 0) {
			// Write JSON
			const jsonPath = path.join(outputJsonDir, `${dateStr}.json`);
			fs.writeFileSync(jsonPath, JSON.stringify(onDay, null, 2), "utf8");

			// Write HTML
			const htmlPath = path.join(outputHtmlDir, `${dateStr}.html`);
			const htmlContent = generateHtmlTable(onDay, dateStr);
			fs.writeFileSync(htmlPath, htmlContent, "utf8");

			htmlFiles.push({ date: dateStr, filename: `${dateStr}.html` });

			console.log(`✅ ${dateStr}: ${onDay.length} entries written`);
		}
	}
}

// Generate index.html
const now = new Date();
const nowStr = now.toISOString();
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Removed Titles - Index</title>
  <style>
    body { font-family: sans-serif; margin: 2em; }
    ul { line-height: 1.6; }
  </style>
</head>
<body>
  <h1>Duration of RTS info cards - 2025</h1>
  Updates lists of cards every couple of minutes approximatively.
  See https://github.com/djeanner/timeNewRTSinfo
  <ul>
${htmlFiles
	.map((entry) => `<li><a href="${entry.filename}">${entry.date}</a></li>`)
	.join("\n")}
  </ul>
  Last update ${nowStr} GMT
</body>
</html>`;

fs.writeFileSync(path.join(outputHtmlDir, "index.html"), indexHtml, "utf8");
console.log(`📄 index.html written with ${htmlFiles.length} links.`);
