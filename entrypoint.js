const core = require('@actions/core');
const fs = require('fs');
const path = require('path');
const { main: pushMain } = require('./scripts/push-json-to-google-sheets');
const { fetchSheetData: pullMain } = require('./scripts/pull-google-sheets-to-json');

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
const googleApiKeyFilePath = path.join(__dirname, 'google-api-key.json');
fs.writeFileSync(googleApiKeyFilePath, JSON.stringify(googleApiKeyJson));

process.env.GOOGLE_APPLICATION_CREDENTIALS = googleApiKeyFilePath;
process.env.SPREADSHEET_ID = spreadsheetId;
process.env.LOCALIZATION_ROOT = localizationRoot;

const cleanUp = () => {
    if (fs.existsSync(googleApiKeyFilePath)) {
        fs.unlinkSync(googleApiKeyFilePath);
    }
};

try {
    if (action === 'push') {
        pushMain().then(() => {
            cleanUp();
        }).catch((error) => {
            core.setFailed(`Action failed with error: ${error.message}`);
            cleanUp();
            process.exit(1);
        });
    } else if (action === 'pull') {
        pullMain().then(() => {
            cleanUp();
        }).catch((error) => {
            core.setFailed(`Action failed with error: ${error.message}`);
            cleanUp();
            process.exit(1);
        });
    } else {
        core.setFailed(`Unknown action: ${action}`);
        cleanUp();
        process.exit(1);
    }
} catch (error) {
    core.setFailed(`Action failed with error: ${error.message}`);
    cleanUp();
    process.exit(1);
}
