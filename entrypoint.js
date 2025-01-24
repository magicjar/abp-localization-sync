const core = require('@actions/core');
const fs = require('fs');
const path = require('path');
const { main: pushMain } = require('./scripts/push-json-to-google-sheets');
const { fetchSheetData: pullMain } = require('./scripts/pull-google-sheets-to-json');

// Function to list the contents of the root folder
const listRootFolderContents = () => {
    const rootFolder = __dirname;
    const files = fs.readdirSync(rootFolder);
    core.info(`Root folder contents: ${files.join(', ')}`);
};

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
    core.info('Parsed Google API Key JSON successfully.');
} catch (error) {
    core.setFailed('Invalid Google API Key JSON.');
    process.exit(1);
}

// Debug logging
core.info(`Action: ${action}`);
core.info(`Google API Key JSON: ${googleApiKeyJson ? 'Provided' : 'Not Provided'}`);
core.info(`Spreadsheet ID: ${spreadsheetId}`);
core.info(`Localization Root: ${localizationRoot}`);

// List the contents of the root folder
listRootFolderContents();

// Write the Google API key to a file
const googleApiKeyFilePath = path.join(__dirname, 'google-api-key.json');
try {
    fs.writeFileSync(googleApiKeyFilePath, JSON.stringify(googleApiKeyJson));
    core.info(`Google API key file created at: ${googleApiKeyFilePath}`);
} catch (error) {
    core.setFailed(`Failed to write Google API key file: ${error.message}`);
    process.exit(1);
}

process.env.GOOGLE_APPLICATION_CREDENTIALS = googleApiKeyFilePath;
process.env.SPREADSHEET_ID = spreadsheetId;
process.env.LOCALIZATION_ROOT = localizationRoot;

const cleanUp = () => {
    if (fs.existsSync(googleApiKeyFilePath)) {
        fs.unlinkSync(googleApiKeyFilePath);
        core.info(`Google API key file deleted: ${googleApiKeyFilePath}`);
    }
};

const runAction = async () => {
    try {
        if (action === 'push') {
            await pushMain();
        } else if (action === 'pull') {
            await pullMain();
        } else {
            core.setFailed(`Unknown action: ${action}`);
            process.exit(1);
        }
    } catch (error) {
        core.setFailed(`Action failed with error: ${error.message}`);
        process.exit(1);
    } finally {
        cleanUp();
    }
};

runAction();
