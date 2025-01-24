const core = require('@actions/core');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get inputs
const action = core.getInput('action');
const googleApiKeyJsonRaw = core.getInput('google_api_key_json');
const spreadsheetId = core.getInput('spreadsheet_id');
const localizationRoot = core.getInput('localization_root');

if (!googleApiKeyJsonRaw) {
    core.setFailed('Google API Key JSON is required.');
    process.exit(1);
}

if (!spreadsheetId) {
    core.setFailed('Google Sheets Spreadsheet ID is required.');
    process.exit(1);
}

if (!localizationRoot) {
    core.setFailed('Localization root directory is required.');
    process.exit(1);
}

// Parse the Google API Key JSON
let googleApiKeyJson;
try {
    googleApiKeyJson = JSON.parse(googleApiKeyJsonRaw);
} catch (error) {
    core.setFailed('Invalid Google API Key JSON.');
    process.exit(1);
}

// Debug logging
core.info(`Action: ${action}`);
core.info(`Google API Key JSON: ${googleApiKeyJson ? 'Provided' : 'Not Provided'}`);
core.info(`Spreadsheet ID: ${spreadsheetId}`);
core.info(`Localization Root: ${localizationRoot}`);

// Write the Google API key to a file
fs.writeFileSync('google-api-key.json', JSON.stringify(googleApiKeyJson));

process.env.GOOGLE_APPLICATION_CREDENTIALS = 'google-api-key.json';
process.env.SPREADSHEET_ID = spreadsheetId;
process.env.LOCALIZATION_ROOT = localizationRoot;

try {
    let scriptPath;
    if (action === 'push') {
        scriptPath = path.join(__dirname, 'scripts', 'push-json-to-google-sheets.js');
    } else if (action === 'pull') {
        scriptPath = path.join(__dirname, 'scripts', 'pull-google-sheets-to-json.js');
    } else {
        core.setFailed(`Unknown action: ${action}`);
        process.exit(1);
    }

    // Execute the corresponding script
    execSync(`node ${scriptPath}`, { stdio: 'inherit' });
} catch (error) {
    core.setFailed(`Action failed with error: ${error.message}`);
    process.exit(1);
}

// Clean up the Google API key file
fs.unlinkSync('google-api-key.json');
