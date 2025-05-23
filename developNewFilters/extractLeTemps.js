const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const COMPUTER_ID = process.env.COMPUTER_ID || 'unknown-computer';
// === CONFIG ===
const inputHtmlFile = 'scratch/leTemps.html';
const outputJsonFileSuf = '2';
const outputJsonFile = path.join(__dirname, 'data', `card-titles${outputJsonFileSuf}${COMPUTER_ID}.json`);

// === UTILS ===
function parseDate(iso) {
  return new Date(iso);
}

function calculateDurationString(start, end) {
  const ms = end - start;
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  let str = '';
  if (days) str += `${days}d `;
  if (hours) str += `${hours}h `;
  if (minutes || (!days && !hours)) str += `${minutes}m`;
  return {
    duration_minutes: totalMinutes,
    duration_str: str.trim()
  };
}

// START specific part

// === LOAD HTML ===
const html = fs.readFileSync(inputHtmlFile, 'utf8');
const dom = cheerio.load(html);

function extractTitlesFroLeTemps(dom) {
 // start specific part
const allowedFirstTerms = new Set(['culture', 'monde', 'suisse', 'economie', 'sciences', 'sport', 'cyber']);
  const titles = new Set();

  dom('a[href]').each((_, elem) => {
    const href = dom(elem).attr('href');
    const title = dom(elem).text().trim();

    const match = href.match(/^\/([^\/]+)\/([^\/]+)/);
    if (match) {
      const firstTerm = match[1];
      const secondTerm = match[2];

      if (allowedFirstTerms.has(firstTerm)) {
        //results.push({ firstTerm, secondTerm, title });
    titles.add(`${firstTerm}:::${title}`);
      }
    }
  });

  return titles;
}
// Get the found titles
//

let foundTitles;
foundTitles = extractTitlesFroLeTemps(dom);




// END Specific part

// === LOAD EXISTING DATA ===
let existingTitles = [];
try {
  if (fs.existsSync(outputJsonFile)) {
    const raw = fs.readFileSync(outputJsonFile, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      existingTitles = parsed;
    } else {
      console.warn(`⚠️ ${outputJsonFile} is not an array. Starting fresh.`);
    }
  }
} catch {
  console.warn(`⚠️ Could not read or parse ${outputJsonFile}. Starting fresh.`);
}

// === BUILD MAP FOR QUICK ACCESS ===
const now = new Date();
const existingMap = new Map();
for (const entry of existingTitles) {
  existingMap.set(entry.title, entry);
}

// === UPDATE OR ADD CURRENT TITLES ===
for (const title of foundTitles) {
  if (existingMap.has(title)) {
    const entry = existingMap.get(title);
    if (entry.removed_at) {
      delete entry.removed_at;
      delete entry.duration_minutes;
      delete entry.duration_str;
    }
  } else {
    const newEntry = {
      title,
      added_at: now.toISOString()
    };
    existingTitles.push(newEntry);
    existingMap.set(title, newEntry);
  }
}

// === MARK REMOVED AND SET DURATION ===
for (const entry of existingTitles) {
  if (!foundTitles.has(entry.title) && !entry.removed_at) {
    entry.removed_at = now.toISOString();
    const { duration_minutes, duration_str } = calculateDurationString(parseDate(entry.added_at), now);
    entry.duration_minutes = duration_minutes;
    entry.duration_str = duration_str;
  }
}

// === SAVE TO FILE ===
fs.writeFileSync(outputJsonFile, JSON.stringify(existingTitles, null, 2), 'utf8');
console.log(`✅ ${outputJsonFile} updated successfully.`);


