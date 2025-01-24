const fs = require('fs');
const path = require('path');
const { processFolder, parseLocalizationFiles } = require('../scripts/push-json-to-google-sheets');

jest.mock('fs');

describe('parseLocalizationFiles', () => {
  it('should parse localization files and return languages and translations', () => {
    fs.readdirSync.mockReturnValue(['en.json']);
    fs.readFileSync.mockReturnValue(JSON.stringify({
      Culture: 'en',
      Texts: {
        'AppName': 'Agregasi',
        'Menu:Home': 'Home',
        'Menu:Home:Movies': 'Movies',
        'Menu:Home:CTA': 'Call to Action',
        'Menu:Home:TV': 'TV Show',
        'Menu:Home:NewRecords': 'New',
      },
    }));

    const { languages, translations } = parseLocalizationFiles('localization');

    expect(languages).toEqual(['en']);
    expect(translations).toEqual({
      'AppName': { 'en': 'Agregasi' },
      'Menu:Home': { 'en': 'Home' },
      'Menu:Home:Movies': { 'en': 'Movies' },
      'Menu:Home:CTA': { 'en': 'Call to Action' },
      'Menu:Home:TV': { 'en': 'TV Show' },
      'Menu:Home:NewRecords': { 'en': 'New' },
    });
  });

  it('should return empty languages and translations if no JSON files are found', () => {
    fs.readdirSync.mockReturnValue([]);

    const { languages, translations } = parseLocalizationFiles('localization');

    expect(languages).toEqual([]);
    expect(translations).toEqual({});
  });
});
