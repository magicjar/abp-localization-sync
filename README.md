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