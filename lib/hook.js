/**
 *  Base class for all hooks
 *  @author Marc Fiedler
 *  @copyright 2017 Blackout Technologies
 */

// Use Strict mode ECMA Script 5+
"use_strict";

// 3rd party includes
const rp = require('request-promise');
const findRoot = require('find-root');

// system includes
const fs = require('fs');

// local includes
const LanguageDict = require('./languageDict.js');

module.exports = class Hook {
    constructor(path, language){
        this.json = undefined;
        this.path = path;
        var root = findRoot(path);

        // load the hook's cpnfig
        this.config = JSON.parse(fs.readFileSync(root+'/package.json', 'utf-8'));

        this.captions = new LanguageDict(path, language);

        console.log(this.config.title+" v"+this.config.version+" loaded");
    }

    loadTraining(intent, phrase, position, complete){
        if( this.prepareTraining != undefined ){
            this.prepareTraining(phrase, (intents) => {
                complete(position, intents);
            });
        }else{
            // return empty state since, anyway this hook doesn't
            // create any training data.
            complete(position, []);
        }
    }

    request(method, url, body, complete){
        rp({
            method: method,
            uri: url,
            body: body,
            json: true // Automatically stringifies the body to JSON
        }).then((resp) => {
            complete(resp);
        });
    }

    handleMessage(intent, text, session, complete){
        try {
            this.process(intent, text, session, complete);
        } catch (e) {
            console.dir(e);
            complete({
                answer: "Error in hook: "+JSON.stringify(e),
                platform: {}
            })
        }
    }
}
