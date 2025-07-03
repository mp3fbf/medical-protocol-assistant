// Simple script to capture page state
const fs = require('fs');
const path = require('path');

async function capturePageInfo() {
  console.log('Opening http://localhost:3000/protocols/7 in your browser...');
  console.log('\nPlease check the page and note:');
  console.log('1. Is there an "Editar" or "Visualizar" button in the header?');
  console.log('2. Click it to toggle between modes');
  console.log('3. Check if the formatting changes');
  console.log('4. Look at the browser console for debug logs');
  console.log('\nThe debug info box (red) shows:');
  console.log('- Current section number');
  console.log('- isEditing state (TRUE/FALSE)');
  console.log('- Content type');
  console.log('- Whether content has HTML');
  
  // Create a results file
  const timestamp = new Date().toISOString();
  const results = {
    timestamp,
    instructions: 'Please manually check the browser and fill in the observations below',
    observations: {
      hasEditButton: '?',
      isEditingMode: '?',
      contentFormatted: '?',
      debugBoxShowing: '?',
      consoleErrors: '?'
    }
  };
  
  const resultsPath = path.join(__dirname, 'screenshots', `test-results-${Date.now()}.json`);
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\nResults template saved to: ${resultsPath}`);
}

capturePageInfo();