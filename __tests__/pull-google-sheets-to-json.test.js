const fs = require('fs');
const { processSheet } = require('../scripts/pull-google-sheets-to-json');

jest.mock('fs');

describe('processSheet', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should pull data from Google Sheets and update JSON files', async () => {
    fs.existsSync.mockReturnValue(false);
    fs.mkdirSync.mockReturnValue(true);
    fs.writeFileSync.mockReturnValue(true);

    const rows = [
      ['Key', 'en'],
      ['AppName', 'Agregasi'],
      ['Menu:Home', 'Home'],
      ['Menu:Home:Movies', 'Movies'],
      ['Menu:Home:CTA', 'Call to Action'],
      ['Menu:Home:TV', 'TV Show'],
      ['Menu:Home:NewRecords', 'New'],
    ];

    await processSheet('RootLocalization', rows, 'localization');

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'localization/en.json',
      JSON.stringify({
        Culture: 'en',
        Texts: {
          'AppName': 'Agregasi',
          'Menu:Home': 'Home',
          'Menu:Home:Movies': 'Movies',
          'Menu:Home:CTA': 'Call to Action',
          'Menu:Home:TV': 'TV Show',
          'Menu:Home:NewRecords': 'New',
        },
      }, null, 2)
    );
  });
});
