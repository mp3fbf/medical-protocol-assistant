#!/bin/bash

# Create screenshots directory
mkdir -p screenshots

# Get current timestamp
timestamp=$(date +"%Y%m%d_%H%M%S")

# Capture screenshot of the browser window
# Using screencapture command (macOS)
echo "Capturing screenshot in 3 seconds..."
sleep 3

# Capture the entire screen
screencapture -x "screenshots/debug_${timestamp}.png"

echo "Screenshot saved to: screenshots/debug_${timestamp}.png"

# Also save console output if needed
osascript -e 'tell application "Google Chrome" to tell active tab of window 1 to execute javascript "console.save = function(data, filename){ if(!data) { console.error('"'Console.save: No data'"'); return; } if(!filename) filename = '"'console.json'"'; if(typeof data === '"'object'"'){ data = JSON.stringify(data, undefined, 4) } var blob = new Blob([data], {type: '"'text/json'"'}), e = document.createEvent('"'MouseEvents'"'), a = document.createElement('"'a'"'); a.download = filename; a.href = window.URL.createObjectURL(blob); a.dataset.downloadurl = ['"'text/json'"', a.download, a.href].join('"':'"'); e.initMouseEvent('"'click'"', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null); a.dispatchEvent(e) }; JSON.stringify(Array.from(console.logs || []))"' 2>/dev/null || true