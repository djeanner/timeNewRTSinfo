const fs = require("fs");
const path = require("path");
const COMPUTER_ID = process.env.COMPUTER_ID || "unknown-computer";
const DATA_DIR = path.join(__dirname, "data");
const outputHtmlDir = "html";
const targetYear = 2025;
const configs = JSON.parse(fs.readFileSync('media.json', 'utf8'));


const pad = (n) => n.toString().padStart(2, "0");

const formatTime = (iso) => {
	if (!iso) return "";
	const date = new Date(iso);
	if (isNaN(date)) return "";

	return date.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false, // Force 24h format
	});
};

const formatDate = (iso) => {
	if (!iso) return "";
	const date = new Date(iso);
	if (isNaN(date)) return "";
	const day = String(date.getDate()).padStart(2, "0");
	//const month = String(date.getMonth() + 1).padStart(2, "0");
	const month = date.toLocaleString('en', { month: 'short' }); // 3-letter month
	return `${month} ${day}`;
};

function getAllDataFiles(pref) {
	return fs
		.readdirSync(DATA_DIR)
		.filter(
			(f) => f.endsWith(".json") && f.startsWith(pref) && !f.startsWith("index")
		)
		.map((f) => path.join(DATA_DIR, f));
}

function formatDuration(minutes) {
	const days = Math.floor(minutes / 1440);
	const hours = Math.floor((minutes % 1440) / 60);
	const minutes2 = minutes % 60;
	let str = "";
	if (days) str += `${days}d `;
	if (hours) str += `${hours}h `;
	if (minutes2 || (!days && !hours)) str += `${minutes2}m`;
	return str.trim();
}

function deduplicateItems(items) {
	const map = new Map();

	for (const item of items) {
		if (!map.has(item.title)) {
			map.set(item.title, {
				title: item.title,
				added_at: item.added_at,
				removed_at: item.removed_at,
			});
		} else {
			const existing = map.get(item.title);

			// Find earliest added_at
			if (new Date(item.added_at) < new Date(existing.added_at)) {
				existing.added_at = item.added_at;
			}

			// Find earliest removed_at
			if (new Date(item.removed_at) < new Date(existing.removed_at)) {
				existing.removed_at = item.removed_at;
			}
		}
	}
	const result = [];
	for (const obj of map.values()) {
		const added = new Date(obj.added_at);

		let durationMinutes = 0;
		let durationStr = "";

		if (obj.removed_at) {
			const removed = new Date(obj.removed_at);
			const durationMs = removed - added;
			durationMinutes = Math.round(durationMs / 60000);
			durationStr = formatDuration(durationMinutes);
		}

		result.push({
			title: obj.title,
			added_at: obj.added_at,
			removed_at: obj.removed_at,
			duration_minutes: durationMinutes,
			duration_str: durationStr,
		});
	}

	return result;
}

const htmlEscape = (str) =>
	str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const generateMainHtmlTable = () => {
	const rows = configs
		.map((entry) => {
			return `<tr><td><a href="index_${entry.dateFileSuf}.html">${entry.medium}</a></td><td><a href="${entry.url}">${entry.url}</a></td></tr>`;
		})
		.join("\n");

	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Duration of info on selected information media</title>
  <style>
    body { font-family: sans-serif; margin: 2em; }
	table {
	  border-collapse: collapse;
	  width: auto;
	  max-width: 100%;
	}
    th, td { border: 1px solid #ccc; padding: 0.5em; text-align: left; }
    th { background: #eee; }
  </style>
</head>
<body>
  <h1>Duration of headlines on the main page of selected information media</h1>
  <table>
    <thead><tr><th>Medium</th><th>Origin of data</th></tr></thead>
    <tbody>
${rows}
    </tbody>
  </table>
  <p><a href="https://github.com/djeanner/timeNewRTSinfo">github repository</a></p>
</body>
</html>`;
};


const generateHtmlTable = (entries, dateStr, medium, dateFileSustr) => {
	const rows = entries
		.sort((a, b) => new Date(a.added_at) - new Date(b.added_at))
		.map((entry) => {
			const timeadd = formatTime(entry.added_at);
			let timeRem = "";
			if (entry.removed_at)
				timeRem = formatTime(entry.removed_at) + " (" + formatDate(entry.removed_at) + ")";
			if (formatDate(entry.added_at) === formatDate(entry.removed_at)) {
				timeRem = formatTime(entry.removed_at);
			}
			const duration = htmlEscape(entry.duration_str || "");
			const title = htmlEscape(entry.title || "");
			return `<tr><td>${timeadd}</td><td>${timeRem}</td><td>${duration}</td><td>${title}</td></tr>`;
		})
		.join("\n");

	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Duration of ${medium} info - ${dateStr}</title>
  <style>
    body { font-family: sans-serif; margin: 2em; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ccc; padding: 0.5em; text-align: left; }
    th { background: #eee; }
  </style>
</head>
<body>
  <h1>Duration of ${medium} info on ${formatDate(dateStr)}</h1>
  <table>
    <thead><tr><th>In</th><th>Out</th><th>Duration</th><th>Title</th></tr></thead>
    <tbody>
${rows}
    </tbody>
  </table>
  <p><a href="index${dateFileSustr}.html">← Back to index</a></p>
</body>
</html>`;
};

for (const config of configs) {
	const {dateFileSuf, medium} = config;
	const dateFileSustr = `_${dateFileSuf}`;
	const dateFileSustForIndex = dateFileSuf == 1 ? "" : `${dateFileSuf}`;
	const outputHtmlFile = `index${dateFileSustr}.html`;
	const mediumUnderscores = medium.replace(/ /g, '_');
	const outputJsonDir = path.join("removed-by-day", mediumUnderscores);
	if (!fs.existsSync(outputJsonDir)) fs.mkdirSync(outputJsonDir, {recursive: true});
	if (!fs.existsSync(outputHtmlDir)) fs.mkdirSync(outputHtmlDir);
	const allInputFiles = getAllDataFiles(`card-titles${dateFileSuf}`);
	var data = [];
	for (const inputFile of allInputFiles) {
		console.log(`✅ allInput : ${allInputFiles} `);
		console.log(`✅ inputFile: ${inputFile} `);

		const computerName = path.basename(inputFile, ".json");
		const dataOne = JSON.parse(fs.readFileSync(inputFile, "utf8"));
		if (dataOne.length > 0) {
			data.push(...dataOne);
			data.push(...dataOne);
			data = deduplicateItems(data);
			console.log(`✅ data: ${data.length} `);
		}
	}

	const htmlFiles = [];

	for (let month = 1; month <= 12; month++) {
		const daysInMonth = new Date(targetYear, month, 0).getDate();
		for (let day = 1; day <= daysInMonth; day++) {
			const dateStr = `${targetYear}-${pad(month)}-${pad(day)}`;

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
				const jsonPath = path.join(outputJsonDir, `${dateStr}.json`);
				fs.writeFileSync(jsonPath, JSON.stringify(onDay, null, 2), "utf8");

				const htmlPath = path.join(
					outputHtmlDir,
					`${dateStr}${dateFileSustr}.html`
				);
				const htmlContent = generateHtmlTable(
					onDay,
					dateStr,
					medium,
					dateFileSustr
				);
				fs.writeFileSync(htmlPath, htmlContent, "utf8");

				htmlFiles.push({
					date: dateStr,
					filename: `${dateStr}${dateFileSustr}.html`,
				});

				console.log(`✅ ${medium} ${dateStr}: ${onDay.length} entries written`);
			}
		}
	}

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
  <h1>Duration of ${medium} info cards - ${targetYear}</h1>
  Updates lists of cards every couple of minutes approximatively.
  See https://github.com/djeanner/timeNewRTSinfo
  <ul>
${htmlFiles
	.map((entry) => `<li><a href="${entry.filename}">${entry.date}</a></li>`)
	.join("\n")}
  </ul>
  <p><a href="index.html">← Back to index</a></p>

  Last update ${nowStr} GMT
</body>
</html>`;

	fs.writeFileSync(path.join(outputHtmlDir, outputHtmlFile), indexHtml, "utf8");
	console.log(`📄 ${outputHtmlFile} written with ${htmlFiles.length} links.`);
}

const mainHtmlPath = path.join(outputHtmlDir, `index.html`);
const mainHtmlContent = generateMainHtmlTable();
fs.writeFileSync(mainHtmlPath, mainHtmlContent, "utf8");