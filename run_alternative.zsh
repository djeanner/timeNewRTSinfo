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

    echo "Waiting for $sleep_time seconds..."
    sleep $sleep_time
  done
  git checkout --ours leTemps.html input.html 
  git add leTemps.html input.html 
  
  # Stash only changes outside of 'data/'
  git stash push -m "non-data changes" -- . ':(exclude)data'
  git pull
  git commit data/ -m "update only main json file"
  git push
  git stash pop
    
done
