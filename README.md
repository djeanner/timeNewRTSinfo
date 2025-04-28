# Duration of RTS information cards

See how long each info cards stays on the rts.ch/info home page.

[Main site](html/index.html).

It is testing the page every 10 minutes (see [run-loop.zsh](./run-loop.zsh))

The repository has a workflow running automatically in github.
Alternatively, it can be run locally with the following instructions:

# Installation
```zsh
npm install cheerio
```
# Run
The script 
```zsh
export COMPUTER_ID=$(scutil --get ComputerName)
./run-loop.zsh
```
calls [extract.js](extract.js) and [extractDayliRemoval.js](extractDayliRemoval.js) for ever.
If you are on macos, use 
```zsh
export COMPUTER_ID=$(scutil --get ComputerName)
caffeinate ./run-loop.zsh
```
to make sure the computer does not go to sleep while the script is running. 

```zsh
export COMPUTER_ID=$(scutil --get ComputerName)
caffeinate -dimsu ./run-loop.zsh &
kill % 
```
