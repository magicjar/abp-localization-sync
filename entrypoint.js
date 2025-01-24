const { execSync } = require('child_process');
const fs = require('fs');

const action = process.argv[2];
const googleApiKeyJson = process.argv[3];
const spreadsheetId = process.argv[4];
const localizationRoot = process.argv[5];

// Write the Google API key to a file
fs.writeFileSync('google-api-key.json', googleApiKeyJson);

process.env.GOOGLE_APPLICATION_CREDENTIALS = 'google-api-key.json';
process.env.SPREADSHEET_ID = spreadsheetId;
process.env.LOCALIZATION_ROOT = localizationRoot;

if (action === 'push') {
  execSync('node ./scripts/push-json-to-google-sheets.js', { stdio: 'inherit' });
} else if (action === 'pull') {
  execSync('node ./scripts/pull-google-sheets-to-json.js', { stdio: 'inherit' });
} else {
  throw new Error(`Unknown action: ${action}`);
}

// Clean up the Google API key file
fs.unlinkSync('google-api-key.json');
