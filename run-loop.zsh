#!/bin/zsh

echo "⏳ Starting loop... (Ctrl+C to stop)"

while true; do
  echo "🔁 Running extract-card-titles.js at $(date)"

  # Run your Node script
  echo "get rts.ch/info page"
  wget rts.ch/info
  mv info input.html
  echo "extract car titles from page"
  node extract.js
  echo "extractDayliRemoval into folder removed-by-day"
  node extractDayliRemoval.js
  echo "✅ Done. Waiting 10 minutes..."
  sleep 600  # 600 seconds = 10 minutes
done

