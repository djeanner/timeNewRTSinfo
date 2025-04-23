const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio'); 


// === CONFIG ===
const inputHtmlFile = 'leTemps.html';
const outputJsonFile = 'card-titles2.json';

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

// === LOAD HTML ===
const html = fs.readFileSync(inputHtmlFile, 'utf8');
const $ = cheerio.load(html);


const htmlPath = path.join(__dirname, 'leTemps.html'); // Change to your actual filename
const allowedFirstTerms = new Set(['culture', 'monde', 'suisse', 'economie', 'sciences', 'sport', 'cyber']);


const foundTitles = new Set();

  $('a[href]').each((_, elem) => {
    const href = $(elem).attr('href');
    const title = $(elem).text().trim();

    const match = href.match(/^\/([^\/]+)\/([^\/]+)/);
    if (match) {
      const firstTerm = match[1];
      const secondTerm = match[2];

      if (allowedFirstTerms.has(firstTerm)) {
        //results.push({ firstTerm, secondTerm, title });
		foundTitles.add(`${firstTerm}:::${title}`);
      }
    }
  });

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




