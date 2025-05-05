#!/bin/zsh

echo "⏳ Starting loop... (Ctrl+C to stop)"

# Define an array of sleep times
sleep_times=(113 107 111 113 107 111 113 107 111)

while true; do
  echo "🔁 Running extract-card-titles.js at $(date)"

  for sleep_time in $sleep_times; do
    echo "Fetching letemps.ch..."
    wget https://www.letemps.ch -O scratch/leTemps.html
    node extractLeTemps.js

    echo "Fetching rts.ch/info..."
    wget rts.ch/info -O scratch/input.html
    node extract.js

    echo "Fetching nytimes.com ..."
    wget nytimes.com -O scratch/inputNY.html
    node extractNY.js

    echo "Extracting daily removals..."
    node extractDayliRemoval.js

    echo "Waiting for $sleep_time seconds..."
    sleep $sleep_time
  done

  # echo "📤 NOT Committing updates to Git..."
  git stash push -m "stash everything except data, html, removed-by-day, removed-by-day2, removed-by-day3" -- . ':(exclude)data' ':(exclude)html' ':(exclude)removed-by-day' ':(exclude)removed-by-day2' ':(exclude)removed-by-day3'
  git pull
  echo "📤 Committing updates to Git..."
  git add html/ data/ removed-by-day/ removed-by-day2/ removed-by-day3/
  git commit -m "update html/ data/ removed-by-day/ removed-by-day2/ removed-by-day3/"
  git push
  git stash pop

done
