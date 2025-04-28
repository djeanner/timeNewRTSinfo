const fs = require("fs");
const path = require("path");
const COMPUTER_ID = process.env.COMPUTER_ID || 'unknown-computer';
const DATA_DIR = path.join(__dirname, 'data');
const configs = [
	{
		dateFileSuf: 1,
		targetYear: 2025,
		medium: "RTS",
	},
	{
		dateFileSuf: 2,
		targetYear: 2025,
		medium: "Le Temps",
	},
];

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

function getAllDataFiles(pref) {
    return fs.readdirSync(DATA_DIR)
             .filter(f => f.endsWith('.json') && f.startsWith(pref) && !f.startsWith("index"))
             .map(f => path.join(DATA_DIR, f));
}

function formatDuration(minutes) {
const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const minutes2 = minutes % 60;
  let str = '';
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
        removed_at: item.removed_at
      });
    } else {
      const existing = map.get(item.title);

      // Find earliest added_at
      if (new Date(item.added_at) <= new Date(existing.added_at)) {
        existing.added_at = item.added_at;
      }

      // Find latest removed_at
      if (new Date(item.removed_at) >= new Date(existing.removed_at)) {
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
    duration_str: durationStr
  });
}

  return result;
}

const htmlEscape = (str) =>
	str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const generateHtmlTable = (entries, dateStr, medium, dateFileSustr) => {
	const rows = entries
		.sort((a, b) => new Date(a.added_at) - new Date(b.added_at))
		.map((entry) => {
			const time = formatTime(entry.added_at);
			let time2 =
				formatTime(entry.removed_at) + " " + formatDate(entry.removed_at);
			if (formatDate(entry.added_at) === formatDate(entry.removed_at)) {
				time2 = formatTime(entry.removed_at);
			}
			const duration = htmlEscape(entry.duration_str || "");
			const title = htmlEscape(entry.title || "");
			return `<tr><td>${time}</td><td>${time2}</td><td>${duration}</td><td>${title}</td></tr>`;
		})
		.join("\n");

	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Duration of ${medium} info cards - ${dateStr}</title>
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
  <p><a href="index${dateFileSustr}.html">← Back to index</a></p>
</body>
</html>`;
};

for (const config of configs) {
	const {
		dateFileSuf,
		targetYear,
		medium,
	} = config;
	const dateFileSustr = dateFileSuf == 1 ? "" : `_${dateFileSuf}`;
	const dateFileSustrForIndex = dateFileSuf == 1 ? "" : `${dateFileSuf}`;
	const outputHtmlFile = `index${dateFileSustr}.html`;
	const outputJsonDir = `removed-by-day${dateFileSustrForIndex}`;
	const outputHtmlDir = "html";
	if (!fs.existsSync(outputJsonDir)) fs.mkdirSync(outputJsonDir);
	if (!fs.existsSync(outputHtmlDir)) fs.mkdirSync(outputHtmlDir);
	//const inputFile = path.join(DATA_DIR, `card-titles${dateFileSuf}${COMPUTER_ID}.json`);
	const allInputFiles = getAllDataFiles(`card-titles${dateFileSuf}`);
    var data = [];
    for (const inputFile of allInputFiles) {
	console.log(`✅ allInput : ${allInputFiles} `);
	console.log(`✅ inputFile: ${inputFile} `);
    
	//const data = JSON.parse(fs.readFileSync(inputFile, "utf8"));
	const computerName = path.basename(inputFile, '.json');
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
				const htmlContent = generateHtmlTable(onDay, dateStr, medium, dateFileSustr);
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
  Last update ${nowStr} GMT
</body>
</html>`;

	fs.writeFileSync(path.join(outputHtmlDir, outputHtmlFile), indexHtml, "utf8");
	console.log(`📄 ${outputHtmlFile} written with ${htmlFiles.length} links.`);
}
