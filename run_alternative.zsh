#!/bin/zsh

echo "⏳ Starting loop... (Ctrl+C to stop)"

# Define an array of sleep times
sleep_times=(113 107 111 113 107 111 113 107 111)

while true; do
  echo "🔁 Running extract-card-titles.js at $(date)"

  for sleep_time in $sleep_times; do
    echo "Fetching letemps.ch..."
    wget https://www.letemps.ch -O scratch/Le_Temps.html

    echo "Fetching rts.ch/info..."
    wget rts.ch/info -O scratch/RTS.html

    echo "Fetching nytimes.com ..."
    wget nytimes.com -O scratch/NY_Times.html

    echo "Fetching cnn.com ..."
    wget cnn.com -O scratch/CNN.html
    
    echo "Fetching lemonde.fr ..."
    wget lemonde.fr -O scratch/le_Monde.html

    node extract.js

    echo "Waiting for $sleep_time seconds..."
    sleep $sleep_time
  done
  
  # Stash only changes outside of 'data/'
  git stash push -m "non-data changes" -- . ':(exclude)data'
  git pull --ff-only
  git commit data/ -m "update only main json file"
  git push
  git stash pop
    
done
