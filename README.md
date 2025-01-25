# ABP Localization Sync GitHub Action

This GitHub Action helps users of the ABP.IO framework to sync their localization data to and from Google Sheets.

## Inputs

- `action`: Specify `push` to push data to Google Sheets or `pull` to pull data from Google Sheets. Default is `push`.
- `google_api_key_json`: Google API Key JSON.
- `spreadsheet_id`: Google Sheets Spreadsheet ID.
- `localization_root`: Root directory for localization files.

## Usage

### Push JSON to Google Sheets

Create a workflow file (e.g., `.github/workflows/localization-push.yml`) with the following content:

```yaml
name: Localization Push

on:
  workflow_dispatch:

jobs:
  sync_localizations:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Push JSON to Google Sheets
        uses: magicjar/abp-localization-sync@v1
        with:
          action: push
          google_api_key_json: ${{ secrets.GOOGLE_API_KEY_JSON }}
          spreadsheet_id: ${{ vars.SPREADSHEET_ID }}
          localization_root: ./src/Acme.BookStore.Domain.Shared/Localization
```

### Pull Google Sheets to JSON

Create a workflow file (e.g., `.github/workflows/localization-pull.yml`) with the following content:

```yaml
name: Localization Pull

on:
  workflow_dispatch:

jobs:
  sync_localizations:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Pull Google Sheets to JSON
        uses: magicjar/abp-localization-sync@v1
        with:
          action: pull
          google_api_key_json: ${{ secrets.GOOGLE_API_KEY_JSON }}
          spreadsheet_id: ${{ vars.SPREADSHEET_ID }}
          localization_root: ./src/Acme.BookStore.Domain.Shared/Localization

      - name: Add localization files
        run: git add src/Acme.BookStore.Domain.Shared/Localization/**/*.json

      - name: Commit changes
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          if git diff-index --quiet HEAD; then
            echo "No changes to commit"
          else
            git commit -m "Updated localizations from Google Sheets"
            git push
          fi
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Secrets and Variables

Make sure to add the following secrets and variables in your GitHub repository settings:

- `GOOGLE_API_KEY_JSON`: The content of your Google API key JSON file.
- `SPREADSHEET_ID`: The ID of your Google Sheets spreadsheet.
- `GITHUB_TOKEN`: The GitHub token for committing changes (automatically provided by GitHub Actions).

To create a `google-api-key.json` file, follow these steps to generate a Google Cloud service account key for your project. This key will be used to authenticate API requests, such as those made to Google Sheets.


## Steps to Create `google-api-key.json`

### 1. Set Up a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. If you don’t have an existing project, create one:
   - Click the dropdown at the top-left corner of the console and select **"New Project"**.
   - Enter a name for your project and click **"Create"**.

### 2. Enable the Google Sheets API
1. In the Google Cloud Console, navigate to **APIs & Services** → **Library**.
2. Search for **Google Sheets API** and click on it.
3. Click **Enable** to activate the API for your project.

### 3. Create a Service Account
1. Go to **APIs & Services** → **Credentials** in the Google Cloud Console.
2. Click **Create Credentials** → **Service Account**.
3. Fill out the service account details:
   - **Name**: Choose a descriptive name (e.g., `SheetsServiceAccount`).
   - **Description**: Optional but recommended.
   - Click **Create and Continue**.

4. Assign a role to the service account:
   - For Google Sheets, the recommended role is **Editor**.
   - Click **Continue** → **Done**.

### 4. Generate a JSON Key File
1. After creating the service account, go back to **APIs & Services** → **Credentials**.
2. Find the service account you just created in the **Service Accounts** section.
3. Click on the service account name to open its details.
4. Go to the **Keys** tab and click **Add Key** → **Create New Key**.
5. Choose **JSON** as the key type and click **Create**.
6. A JSON file will be downloaded to your computer. This is your `google-api-key.json`.

### 5. Share Your Google Sheet with the Service Account **(Important)**
1. Open the Google Sheet you want to access.
2. Share it with the email address of the service account (found in the JSON file under the `client_email` field).
3. Grant the service account **Editor** or **Viewer** access, depending on your needs.

## Running Tests

To run the tests, follow these steps:

1. Install the dependencies:
   ```sh
   npm install
   ```

2. Run the tests:
   ```sh
   npm test
   ```

This will execute all the test files in the `__tests__` directory using Jest.
