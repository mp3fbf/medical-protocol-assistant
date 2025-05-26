module.exports = {
    // Format all staged files
    "*.{js,jsx,ts,tsx,json,css,scss,md,html}": "prettier --write",
  
    // Lint then format TypeScript and JavaScript files
    "*.{js,jsx,ts,tsx}": ["eslint --fix"],
  };
  