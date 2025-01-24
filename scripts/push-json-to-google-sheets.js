import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const parseLocalizationFiles = (folderPath) => {
    const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.json'));

    if (files.length === 0) {
        console.log(`No localization files found in folder: ${folderPath}`);
        return { languages: [], translations: {} };
    }

    const languages = [];
    const translations = {};

    for (const file of files) {
        const lang = path.basename(file, '.json'); // Extract language code from file name
        languages.push(lang);

        const jsonData = JSON.parse(fs.readFileSync(`${folderPath}/${file}`, 'utf8'));
        const texts = jsonData.texts || jsonData.Texts || {}; // Use 'texts' or 'Texts' if they exist, otherwise default to {}
        for (const [key, value] of Object.entries(texts)) {
            if (!translations[key]) translations[key] = {};
            if (value) { // Only add non-empty values
                translations[key][lang] = value;
            }
        }
    }

    return { languages, translations };
};

const processFolder = async (folderPath, sheetName, sheets, existingSheetNames, spreadsheetId) => {
    const { languages, translations } = parseLocalizationFiles(folderPath);

    if (languages.length === 0) {
        return;
    }

    // Prepare rows for Google Sheets
    const rows = [['Key', ...languages]]; // Header row
    for (const [key, values] of Object.entries(translations)) {
        const row = [key];
        for (const lang of languages) {
            row.push(values[lang] || ''); // Add translation or empty if missing
        }
        rows.push(row);
    }

    // Create new sheet if it does not exist
    if (!existingSheetNames.includes(sheetName)) {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            resource: {
                requests: [
                    {
                        addSheet: {
                            properties: {
                                title: sheetName,
                            },
                        },
                    },
                ],
            },
        });
    }

    // Push data to Google Sheets
    const range = `${sheetName}!A1`;
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: { values: rows },
    });
};

const main = async () => {
    // Load credentials dynamically from environment variable
    const keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const localizationRoot = process.env.LOCALIZATION_ROOT;

    // Debug logging
    console.log('Google API Key File Path:', keyFilePath);
    console.log('Localization Root:', localizationRoot);

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

    // Get the list of existing sheet names
    const sheetInfo = await sheets.spreadsheets.get({
        spreadsheetId,
    });
    const existingSheetNames = sheetInfo.data.sheets.map(sheet => sheet.properties.title);

    // Process the root folder and push data to the RootLocalization sheet if localization files exist
    const rootFiles = fs.readdirSync(localizationRoot).filter(file => file.endsWith('.json'));
    if (rootFiles.length > 0) {
        await processFolder(localizationRoot, 'RootLocalization', sheets, existingSheetNames, spreadsheetId);
    }

    // Process subfolders
    const subfolders = fs.readdirSync(localizationRoot).filter(subfolder => fs.lstatSync(`${localizationRoot}/${subfolder}`).isDirectory());
    for (const subfolder of subfolders) {
        await processFolder(`${localizationRoot}/${subfolder}`, subfolder, sheets, existingSheetNames, spreadsheetId);
    }

    console.log('Data successfully uploaded to Google Sheets');
};

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { processFolder, parseLocalizationFiles };