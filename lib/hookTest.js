/**
 *  Test class for Hooks
 *  @author Marc Fiedler
 *  @copyright 2017 Blackout Technologies
 */

// Use Strict mode ECMA Script 5+
"use_strict";

// 3rd party includes
const rp = require('request-promise');
const findRoot = require('find-root');

// System includes
const fs = require('fs');

module.exports = class TestHook {
    constructor(language){
        // local includes
        const rootDir = findRoot(process.cwd());
        //console.log("Loading Hook from: "+rootDir+"/index.js in "+language);

        var YourHook = require(rootDir+'/index.js');
        var path = process.cwd();
        this.hook = new YourHook(language);

        // mimic basic setup
        this.json = {personality: "testPersonality"};

        this.session = {
            thread: []
        }
    }

    chat(intent, text, complete){
        this.hook.handleMessage(intent, text, this.session, (resp) => {
            this.session.thread.push({
                text: text,
                answer: resp,
                time: new Date()
            })
            complete(resp);
        });
    }
}
