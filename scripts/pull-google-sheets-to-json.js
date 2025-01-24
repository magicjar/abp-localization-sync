const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const processSheet = async (sheetName, rows, localizationRoot) => {
    if (!rows || rows.length === 0) {
        console.log(`No data found in sheet: ${sheetName}`);
        return;
    }

    const headers = rows[0];
    const languages = headers.slice(1); // Exclude the 'Key' column
    const translations = rows.slice(1); // Exclude the header row

    // Write translations back into JSON files
    const localizationDir = sheetName === 'RootLocalization' ? localizationRoot : `${localizationRoot}/${sheetName}`;
    if (!fs.existsSync(localizationDir)) fs.mkdirSync(localizationDir);

    const jsonFiles = {};
    for (const lang of languages) {
        const filePath = `${localizationDir}/${lang}.json`;
        if (fs.existsSync(filePath)) {
            jsonFiles[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } else {
            jsonFiles[lang] = { Culture: lang, Texts: {} };
        }
    }

    for (const row of translations) {
        const key = row[0];
        if (!key) continue; // Skip empty keys
        for (let i = 1; i < row.length; i++) {
            const lang = languages[i - 1];
            const value = row[i];
            if (value) { // Only add non-empty values
                if (!jsonFiles[lang].Texts) jsonFiles[lang].Texts = {};
                jsonFiles[lang].Texts[key] = value;
            }
        }
    }

    // Save each language's JSON file
    for (const [lang, data] of Object.entries(jsonFiles)) {
        fs.writeFileSync(`${localizationDir}/${lang}.json`, JSON.stringify(data, null, 2));
    }
};

const fetchSheetData = async () => {
    // Load credentials dynamically from environment variable
    const keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const localizationRoot = process.env.LOCALIZATION_ROOT;

    if (!keyFilePath || !fs.existsSync(keyFilePath)) {
        throw new Error('Google API credentials file not found. Ensure GOOGLE_APPLICATION_CREDENTIALS is set.');
    }

    if (!localizationRoot || !fs.existsSync(localizationRoot)) {
        throw new Error('Localization root folder not found. Ensure LOCALIZATION_ROOT is set.');
    }

    const auth = new google.auth.GoogleAuth({
        keyFile: keyFilePath,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.SPREADSHEET_ID;

    // Get the list of sheet names
    const sheetInfo = await sheets.spreadsheets.get({
        spreadsheetId,
    });
    const sheetNames = sheetInfo.data.sheets.map(sheet => sheet.properties.title);

    for (const sheetName of sheetNames) {
        const range = `${sheetName}!A1:Z`; // Adjust range based on data size

        // Fetch data from Google Sheets
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        const rows = response.data.values;
        await processSheet(sheetName, rows, localizationRoot);
    }

    console.log('Data successfully pulled and JSON files updated');
};

if (require.main === module) {
    fetchSheetData();
}

module.exports = { processSheet, fetchSheetData };