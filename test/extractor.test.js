const assert = require('assert');
const extractor = require('../src/extractor');

describe('Lichess Data Extractor', () => {
    it('should GET Lichess API', () => {
        extractor.extract({
            username: 'undifined',
            website: 'lichess'
        });
    });
});