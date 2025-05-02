#!/bin/zsh

echo "⏳ Starting loop... (Ctrl+C to stop)"

# Define an array of sleep times
sleep_times=(113 107 111 113 107 111 113 107 111)

while true; do
  echo "🔁 Running extract-card-titles.js at $(date)"

  for sleep_time in $sleep_times; do
    echo "Fetching letemps.ch..."
    wget https://www.letemps.ch -O leTemps.html
    node extractLeTemps.js

    echo "Fetching rts.ch/info..."
    wget rts.ch/info -O input.html

    echo "Extracting card titles..."
    node extract.js

    echo "Extracting daily removals..."
    node extractDayliRemoval.js

    echo "Waiting for $sleep_time seconds..."
    sleep $sleep_time
  done

  # echo "📤 NOT Committing updates to Git..."
  git pull
  echo "📤 Committing updates to Git..."
  git add html/ 
  git commit html data/ -m "update html and all card-titles"
  git commit removed-by-day/ removed-by-day2/ -m "update removed by day"
  git push
done
