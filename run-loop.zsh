#!/bin/zsh

echo "⏳ Starting loop... (Ctrl+C to stop)"

# Define an array of sleep times
sleep_times=(113 107 111 113 107 111 113 107 111 112 107 111 113 107 111 113 107 111 113 107 111 113 107 111 113 107 115)

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
    
    echo "Fetching aljazeera.com ..."
    wget aljazeera.com -O scratch/Al_Jazeera.html

    node extract.js

    echo "Extracting daily removals..."
    node extractDayliRemoval.js

    echo "Waiting for $sleep_time seconds..."
    sleep $sleep_time
  done

  # echo "📤 NOT Committing updates to Git..."
  
  git stash push -m "stash everything except data, html, removed-by-day " -- . ':(exclude)data' ':(exclude)html' ':(exclude)removed-by-day'
  git pull
  echo "📤 Committing updates to Git..."
  git add html/ data/ removed-by-day/ 
  git commit -m "update html/ data/ removed-by-day/"
  git push
  git stash pop

done
