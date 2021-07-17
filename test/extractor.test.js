const assert = require('assert');
const extractor = require('../src/extractor');
const nock = require('nock');

const mockedGame = '[Event "Rated Rapid game"]\n[Site "https://lichess.org/s7rrqn0e"]\n[Date "2011.06.09"]\n[White "mockedUserName"]\n[Black "OtherPlayer"]\n[Result "1-0"]\n[UTCDate "2011.06.09"]\n[UTCTime "21:26:29"]\n[WhiteElo "1742"]\n[BlackElo "1500"]\n[WhiteRatingDiff "+7"]\n[BlackRatingDiff "-87"]\n[Variant "Standard"]\n[TimeControl "600+5"]\n[ECO "B00"]\n[Opening "Nimzowitsch Defense: Pseudo-Spanish Variation"]\n[Termination "Normal"]\n\n1. e4 Nc6 2. Bb5 a6 3. Bc4 Nf6 4. Nc3 e6 5. d4 d5 6. exd5 exd5 7. Bb3 Bf5 8. Nf3 Bb4 9. O-O Bxc3 10. bxc3 O-O 11. Ba3 Re8 12. Re1 Rxe1+ 13. Qxe1 b5 14. Ne5 Nxe5 15. Qxe5 Be4 16. f3 Bg6 17. Re1 a5 18. Be7 Qe8 19. Bxf6 gxf6 20. Qxe8+ Rxe8 21. Rxe8+ Kg7 22. Bxd5 Bxc2 23. Re7 b4 24. cxb4 axb4 25. Rxf7+ Kg6 26. Rxc7 1-0\n\n\n';
const mockedProfile1 = {
    joined: 1623925961
};

describe('Lichess Data Extractor', () => {
    it('should GET Lichess and ChessDotCom API when no website is specified', (done) => {
        nock('https://lichess.org').get('/api/games/user/mockedUserName?opening=true&rated=true').reply(200, mockedGame);
        nock('https://api.chess.com').get('/pub/player/mockedusername').reply(200, JSON.stringify(mockedProfile1));
        nock('https://api.chess.com').get('/pub/player/mockedusername/games/2021/06/pgn').reply(200, '');
        nock('https://api.chess.com').get('/pub/player/mockedusername/games/2021/07/pgn').reply(200, mockedGame);
        nock('https://api.chess.com').get('/pub/player/mockedusername/games/2021/08/pgn').reply(200, '');
        

        extractor.extract({
            username: 'mockedUserName'
        }).then((games) => {
            assert.strictEqual(games.length, 2);
            assert.strictEqual(games[0].str.White, 'mockedUserName');
            assert.strictEqual(games[0].str.Black, 'OtherPlayer');
            assert.strictEqual(games[1].str.White, 'mockedUserName');
            assert.strictEqual(games[1].str.Black, 'OtherPlayer');

            nock.cleanAll();
            done();
        });
    });

    it('should GET Lichess and ChessDotCom API when both websites are specified', (done) => {
        nock('https://lichess.org').get('/api/games/user/mockedUserName?opening=true&rated=true').reply(200, mockedGame);
        nock('https://api.chess.com').get('/pub/player/mockedusername').reply(200, JSON.stringify(mockedProfile1));
        nock('https://api.chess.com').get('/pub/player/mockedusername/games/2021/06/pgn').reply(200, '');
        nock('https://api.chess.com').get('/pub/player/mockedusername/games/2021/07/pgn').reply(200, mockedGame);
        nock('https://api.chess.com').get('/pub/player/mockedusername/games/2021/08/pgn').reply(200, '');

        extractor.extract({
            username: 'mockedUserName',
            website: 'both'
        }).then((games) => {
            assert.strictEqual(games.length, 2);
            assert.strictEqual(games[0].str.White, 'mockedUserName');
            assert.strictEqual(games[0].str.Black, 'OtherPlayer');
            assert.strictEqual(games[1].str.White, 'mockedUserName');
            assert.strictEqual(games[1].str.Black, 'OtherPlayer');
            nock.cleanAll();
            done();
        });
    });

    it('should GET Lichess API when the website is specified', (done) => {
        nock('https://lichess.org').get('/api/games/user/mockedUserName?opening=true&rated=true').reply(200, mockedGame);

        extractor.extract({
            username: 'mockedUserName',
            website: 'lichess'
        }).then((games) => {
            assert.strictEqual(games.length, 1);
            assert.strictEqual(games[0].str.White, 'mockedUserName');
            assert.strictEqual(games[0].str.Black, 'OtherPlayer');
            
            nock.cleanAll();
            done();
        });
    });

    it('should GET ChessDotCom API when the website is specified', (done) => {
        nock('https://api.chess.com').get('/pub/player/mockedusername').reply(200, JSON.stringify(mockedProfile1));
        nock('https://api.chess.com').get('/pub/player/mockedusername/games/2021/06/pgn').reply(200, '');
        nock('https://api.chess.com').get('/pub/player/mockedusername/games/2021/07/pgn').reply(200, mockedGame);
        nock('https://api.chess.com').get('/pub/player/mockedusername/games/2021/08/pgn').reply(200, '');

        extractor.extract({
            username: 'mockedUserName',
            website: 'chessdotcom'
        }).then((games) => {
            assert.strictEqual(games.length, 1);
            assert.strictEqual(games[0].str.White, 'mockedUserName');
            assert.strictEqual(games[0].str.Black, 'OtherPlayer');
            nock.cleanAll();
            done();
        });
    });


    it('should GET casual games when the flag is set', (done) => {
        nock('https://lichess.org').get('/api/games/user/mockedUserName?opening=true').reply(200, mockedGame);

        extractor.extract({
            username: 'mockedUserName',
            website: 'lichess',
            casual: true
        }).then((games) => {
            assert.strictEqual(games.length, 1);
            assert.strictEqual(games[0].str.White, 'mockedUserName');
            assert.strictEqual(games[0].str.Black, 'OtherPlayer');

            nock.cleanAll();
            done();
        });
    });

    it('should do nothing when Lichess API returns an error', (done) => {
        nock('https://lichess.org').get('/api/games/user/mockedUserName?opening=true&rated=true').reply(401, 'not authorized');

        extractor.extract({
            username: 'mockedUserName',
            website: 'lichess'
        }).then((games) => {
            assert.strictEqual(games.length, 0);

            nock.cleanAll();
            done();
        });
    });

    it('should do nothing when ChessDotCom API returns an error', (done) => {
        nock('https://api.chess.com').persist().get('/pub/player/mockedusername').reply(403, "user not found");

        extractor.extract({
            username: 'mockedUserName',
            website: 'chessdotcom'
        }).then((games) => {
            assert.strictEqual(games.length, 0);

            nock.cleanAll();
            done();
        });
    });
});