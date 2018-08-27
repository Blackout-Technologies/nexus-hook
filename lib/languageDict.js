/**
 *  Base class for all hooks
 *  @author Marc Fiedler
 *  @copyright 2017 Blackout Technologies
 */

// Use Strict mode ECMA Script 5+
"use_strict";

// 3td party includes
const findRoot = require('find-root');

// System includes
const fs = require('fs');

module.exports = class LanguageDict {
    constructor(path, language){
        var root = findRoot(path);

        // load the hook's language dict
        this.languageDict = JSON.parse(fs.readFileSync(root+'/languageDict.json', 'utf-8'));

        // setup local language
        this.language = language;
    }

    get(phrase, language){
        if( language == undefined ){
            language = this.language;
        }

        return this.languageDict[language][phrase];
    }
}
