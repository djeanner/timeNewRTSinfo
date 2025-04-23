#!/bin/zsh

echo "⏳ Starting loop... (Ctrl+C to stop)"

while true; do
  echo "🔁 Running extract-card-titles.js at $(date)"

  # Run your Node script
  echo "get rts.ch/info page"
  wget rts.ch/info
  mv info input.html
  echo "extract card titles from page"
  node extract.js
  echo "extractDayliRemoval into folder removed-by-day"
  node extractDayliRemoval.js
  echo "Waiting for a while ..."
  sleep 113  # 600 seconds = 10 minutes

 # Run your Node script
  echo "get rts.ch/info page"
  wget rts.ch/info
  mv info input.html
  echo "extract card titles from page"
  node extract.js
  echo "extractDayliRemoval into folder removed-by-day"
  node extractDayliRemoval.js
  echo "Waiting for a while ..."
  sleep 107  # 600 seconds = 10 minutes


 # Run your Node script
  echo "get rts.ch/info page"
  wget rts.ch/info
  mv info input.html
  echo "extract card titles from page"
  node extract.js
  echo "extractDayliRemoval into folder removed-by-day"
  node extractDayliRemoval.js
  echo "Waiting for a while ..."
  sleep 111  # 600 seconds = 10 minutes


  # Run your Node script
  echo "get rts.ch/info page"
  wget rts.ch/info
  mv info input.html
  echo "extract card titles from page"
  node extract.js
  echo "extractDayliRemoval into folder removed-by-day"
  node extractDayliRemoval.js
  echo "Waiting for a while ..."
  sleep 113  # 600 seconds = 10 minutes

 # Run your Node script
  echo "get rts.ch/info page"
  wget rts.ch/info
  mv info input.html
  echo "extract card titles from page"
  node extract.js
  echo "extractDayliRemoval into folder removed-by-day"
  node extractDayliRemoval.js
  echo "Waiting for a while ..."
  sleep 107  # 600 seconds = 10 minutes


 # Run your Node script
  echo "get rts.ch/info page"
  wget rts.ch/info
  mv info input.html
  echo "extract card titles from page"
  node extract.js
  echo "extractDayliRemoval into folder removed-by-day"
  node extractDayliRemoval.js
  echo "Waiting for a while ..."
  sleep 111  # 600 seconds = 10 minutes


  # Run your Node script
  echo "get rts.ch/info page"
  wget rts.ch/info
  mv info input.html
  echo "extract card titles from page"
  node extract.js
  echo "extractDayliRemoval into folder removed-by-day"
  node extractDayliRemoval.js
  echo "Waiting for a while ..."
  sleep 113  # 600 seconds = 10 minutes

 # Run your Node script
  echo "get rts.ch/info page"
  wget rts.ch/info
  mv info input.html
  echo "extract card titles from page"
  node extract.js
  echo "extractDayliRemoval into folder removed-by-day"
  node extractDayliRemoval.js
  echo "Waiting for a while ..."
  sleep 107  # 600 seconds = 10 minutes


 # Run your Node script
  echo "get rts.ch/info page"
  wget rts.ch/info
  mv info input.html
  echo "extract card titles from page"
  node extract.js
  echo "extractDayliRemoval into folder removed-by-day"
  node extractDayliRemoval.js
  echo "Waiting for a while ..."
  sleep 111  # 600 seconds = 10 minutes

  git commit html card-title.json -m "update html"
  git push
done

