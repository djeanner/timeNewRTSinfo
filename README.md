# Duration of RTS information cards
See how long each rts info cards stays on the rts.ch/info home page
It is testing the page every 10 minutes (see [run-loop.zsh](./run-loop.zsh))

# Installation
```zsh
npm install cheerio
```
# Run
The script 
```zsh
./run-loop.zsh
```
calls [extract.js](extract.js) and [extractDayliRemoval.js](extractDayliRemoval.js) for ever.
If you are on macos, use 
```zsh
caffeinate ./run-loop.zsh
```
to make sure the computer does not go to sleep while the script is running. 

```zsh
caffeinate -dimsu ./run-loop.zsh &
kill % 
```
