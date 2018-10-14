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
const shortid = require('shortid');

// System includes
const fs = require('fs');

module.exports = class TestHook {
    constructor(language){
        // local includes
        const rootDir = findRoot(process.cwd());

        var YourHook = require(rootDir+'/index.js');
        var path = process.cwd();
        this.hook = new YourHook(rootDir, language);
        this.hook.id = shortid.generate();

        this.hook.getPlatformReactionNamed = (prName) => {
            // override this function for Testing

            return {
                "id" : "testId",
                "name" : prName,
                "platform" : "yourPlatform",
                "action" : [
                    "yourAction"
                ],
                "function" : "yourFunction",
                "time" : "2018-09-11T15:37:56.616Z",
                "system" : true,
                "proxy" : "yourProxy",
                "owner" : "You"
            }
        }

        this.hook.getHyperReferenceNamed = (hrName) => {
            // override for Testing

            return {
                "id" : "testID",
                "name" : hrName,
                "caption" : "Test Hyper Reference",
                "target" : "https://google.com/",
                "blank" : true,
                "type" : "link",
                "time" : "2018-08-14T11:38:41.055Z",
                "creator" : "You"
            }
        }

        // mimic basic setup
        this.json = {personality: "testPersonality"};

        this.session = {
            thread: []
        }
    }

    chat(text, intent, entities, complete){
        this.hook.handleMessage(text, intent, entities, this.session, (resp) => {
            this.session.thread.push({
                text: text,
                answer: resp,
                time: new Date()
            })
            complete(resp);
        });
    }
}
