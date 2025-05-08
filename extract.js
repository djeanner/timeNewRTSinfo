const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const COMPUTER_ID = process.env.COMPUTER_ID || 'unknown-computer';
// === CONFIG ===

const configs = JSON.parse(fs.readFileSync('media.json', 'utf8'));

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


for (const config of configs) {
	const { dateFileSuf, medium } = config;
  if (true) {
    const outputJsonFileSuf = String(dateFileSuf);
    var inputHtmlFile = `scratch/input_${dateFileSuf}.html`;

    // until change the main scripts... overwrite the input names
    if (dateFileSuf == 1) { // rts
      inputHtmlFile = `scratch/input.html`;
    }
     if (dateFileSuf == 2) { // le temps
      inputHtmlFile = `scratch/leTemps.html`;
    }
     if (dateFileSuf == 3) { // nytimes
      inputHtmlFile = `scratch/inputNY.html`;
    }
    const outputJsonFile = path.join(__dirname, 'data', `card-titles${outputJsonFileSuf}${COMPUTER_ID}.json`);

// === LOAD HTML ===
const html = fs.readFileSync(inputHtmlFile, 'utf8');
const dom = cheerio.load(html);


function extractTitlesFromPageNY(dom) {
  const titles = new Set();

  dom('div.css-xdandi').each((_, element) => {
    const $titleElement = dom(element).find('p[class^="indicate-hover"]');
    const titleText = $titleElement.text().trim();

    if (titleText) {
      titles.add(titleText);
    }
  });

  return titles;
}

function extractTitlesFroRTS(dom) {
  const titles = new Set();

dom('p.card-title').each((_, elem) => {
  const title = dom(elem).text().trim();
  titles.add(title);
});

  return titles;
}


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

if (dateFileSuf == 1) { // RTS
  foundTitles = extractTitlesFroRTS(dom);
}

if (dateFileSuf == 2) { // Le Temps
  foundTitles = extractTitlesFroLeTemps(dom);
}

if (dateFileSuf == 3) { // NY Times
  foundTitles = extractTitlesFromPageNY(dom);
}

// foundTitles is accessible here



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

  }
}