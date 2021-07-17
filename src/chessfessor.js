#!/usr/bin/env node

const commandLineUsage = require('command-line-usage');
const commandLineArgs = require('command-line-args');
const fs = require('fs');

const pjson = require('../package.json');
const extractor = require('./extractor.js');

const optionDefinitions = [
    {
        name: 'username',
        description: 'The username of the player.',
        alias: 'u',
        type: String,
        defaultOption: true
    },
    {
        name: 'casual',
        description: 'Include casual games. By default only rated games are downloaded. This option is specific to Lichess.',
        alias: 'c',
        type: Boolean
    },
    {
        name: 'website',
        description: 'The website to extract the data from. Default value is {underline both}.',
        alias: 'w',
        type: String,
        typeLabel: 'lichess chessdotcom both'
    },
    {
        name: 'help',
        description: 'Display this usage guide.',
        alias: 'h',
        type: Boolean
    },
    {
        name: 'version',
        description: 'Display the current version.',
        alias: 'v',
        type: Boolean
    }
];

const sections = [
    {
      header: 'Chessfessor ♘',
      content: 'Extract your chess games data from {underline https://lichess.org} and {underline https://chess.com}.'
    },
    {
      header: 'Options',
      optionList: optionDefinitions
    },
    {
        header: 'Example usage',
        content: 'chessfessor -u Kasparov\nchessfessor Kasparov\nchessfessor Kasparov -w lichess'
    },
    {
        header: 'Support',
        content: 'Project home: {underline https://github.com/FrequentlyMissedDeadlines/Chessfessor}\nIssues: {underline https://github.com/FrequentlyMissedDeadlines/Chessfessor/issues}'
    }
];

const options = commandLineArgs(optionDefinitions);

if (options.version) {
    console.log('Current version: ', pjson.version);
} else if (options.help || options.username === undefined) {
    const usage = commandLineUsage(sections);
    console.log(usage);
} else {
    extractor.extract(options).then((v) => {
        const filename = options.username + '.json';
        fs.writeFile(filename, JSON.stringify(v), function (err) {
            if (err) {
                throw err;
            }
            if (v.length >= 1) {
                console.log('Saved ' + v.length + ' games to ' + filename);
            } else {
                console.log('Saved ' + v.length + ' game to ' + filename);
            }
        });
    });
}