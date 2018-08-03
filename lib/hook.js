/**
 *  Base class for all hooks
 *  @author Marc Fiedler
 *  @copyright 2017 Blackout Technologies
 */

// Use Strict mode ECMA Script 5+
"use_strict";

const rp = require('request-promise');
const findRoot = require('find-root');
const fs = require('fs');

module.exports = class Hook {
    constructor(path){
        this.json = undefined;
        this.path = path;
        var root = findRoot(path);

        // load the hook's cpnfig
        this.config = JSON.parse(fs.readFileSync(root+'/package.json', 'utf-8'));

        console.log(this.config.title+" v"+this.config.version+" loaded");
    }

    loadTraining(phrase, complete){
        if( this.prepareTraining != undefined ){
            prepareTraining(phrase, complete);
        }else{
            // return empty state since, anyway this hook doesn't
            // create any training data.
            complete([]);
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

    handleMessage(intents, text, session, complete){
        try {
            this.process(intents, text, session, complete);
        } catch (e) {
            console.dir(e);
            complete({
                answer: "Error in hook: "+JSON.stringify(e),
                platform: {}
            })
        }
    }
}
