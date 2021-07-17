const https = require('https');
const parser = require('chess-pgn-parser');

const getAndConvert = (urlOptions) => {
    return new Promise((resolve, reject) => {
        const req = https.request(urlOptions, res => {
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
            } else {
                resolve([]);
            }
        });
        req.on('error', reject);
        req.end();
    });
};

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

    return getAndConvert(getOptions);
};

const extractorChessDotCom = (options) => {
    const userProfilePath = '/pub/player/' + options.username.toLowerCase();
    const userProfileOptions = {
        hostname: 'api.chess.com',
        port: 443,
        path: userProfilePath,
        method: 'GET'
    };

    return new Promise((resolve, reject) => {
        const req = https.request(userProfileOptions, res => {
            if (res.statusCode === 200) {
                var data = [];
                res.on('data', d => {
                    data.push(d);
                }).on('end', function() {
                    var buffer = Buffer.concat(data);
                    const startDate = new Date(JSON.parse(buffer.toString()).joined * 1000);
                    resolve(startDate);
                });
            } else {
                reject();
            }
        });
        req.on('error', reject);
        req.end();
    }).then((startDate) => {
        var newDate = new Date(startDate);
        var months = [startDate];
        while(newDate <= new Date()) {
            newDate.setMonth(newDate.getMonth() + 1);
            months.push(new Date(newDate));
        }

        const promises = [];
        for (var i = 0 ; i < months.length ; i++) {
            const path = '/pub/player/' + options.username.toLowerCase() + '/games/' + months[i].getFullYear() + '/' + ('0' + (months[i].getMonth()+1)).slice(-2) +'/pgn';
            const getOptions = {
                hostname: 'api.chess.com',
                port: 443,
                path: path,
                method: 'GET'
            };
            promises.push(getOptions);
        }

        return promises.reduce((p, x) => p.then(results => getAndConvert(x).then(r => r.concat(results))), Promise.resolve([])).then(results => {
            return results;
        });
    });  
};

const extract = (options) => {
    var extractors = [];
    if (options.website === 'lichess' || options.website === 'both' || options.website === undefined) {
        extractors.push(extractorLichess(options));
    }
    if (options.website === 'chessdotcom' || options.website === 'both' || options.website === undefined) {
        extractors.push(extractorChessDotCom(options));
    }

    return Promise.all(extractors).then((games) => {
        if (extractors.length > 1) {
            return games[0].concat(games[1]);
        }
        return games[0];
    }, () => {
        return [];
    });
};

exports.extract = extract;