const https = require('https');
const parser = require('chess-pgn-parser');

const extractorLichess = (options) => {
    var path = '/api/games/user/' + options.username + '?opening=true';
    if (options.casual === undefined) {
        path += '&rated=true';
    }
    const getOptions = {
        hostname: 'lichess.org',
        port: 443,
        path: path,
        method: 'GET'
    };

    return new Promise((resolve, reject) => {
        const req = https.request(getOptions, res => {
            if (res.statusCode === 200) {
                var data = [];
                res.on('data', d => {
                    data.push(d);
                }).on('end', function() {
                    var buffer = Buffer.concat(data);
                    const PGNgames = buffer.toString().split("\n\n\n");
                    var games = [];
                    for (var i = 0 ; i < PGNgames.length - 1; i++) {
                        const g = JSON.parse(parser.pgn2json(PGNgames[i]));
                        games.push(g);
                    }
                    resolve(games);
                });
            }
        });
        req.on('error', reject);
        req.end();
    });
};

const extract = (options) => {
    var extractors = [];
    if (options.website === 'lichess' || options.website === 'both' || options.website === undefined) {
        extractors.push(extractorLichess(options));
    }
    if (options.website === 'chessdotcom' || options.website === 'both' || options.website === undefined) {
        //extractors.push(extractorChessDotCom(options));
    }

    return Promise.all(extractors).then((games) => {
        if (extractors.length > 1) {
            return games[0].concat(games[1]);
        }
        return games[0];
    });
};

exports.extract = extract;