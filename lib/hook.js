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
        // create the language object
        this.captions = new LanguageDict(path, language);

        // display for debugging. Might be removed at later point in time
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

    getHyperReferenceNamed(hrName){
        // this get's filled by the brocas service
        return this.hyperReferences.find(x => x.name == hrName);
    }

    getPlatformReactionNamed(prName){
        // this get's filled by the brocas service
        return this.platformReactions.find(x => x.name == prName);
    }

    generateHyperReferenceFor(templateName, caption){
        // return a functioning link to this hooks templates

        // give it a default caption
        if( caption == undefined ){
            caption = "Link"
        }

        return {
            "name" : "hrTemplate",
            "caption" : caption,
            "target" : this.uiHost+"/hook/"+this.id+"/"+templateName,
            "type" : "link",
            "time" : new Date()
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

    handleMessage(text, intent, entities, session, complete){
        try {
            this.process(text, intent, entities, session, complete);
        } catch (e) {
            console.dir(e);
            complete({
                answer: "Error in hook: "+JSON.stringify(e),
                platform: {}
            })
        }
    }
}
