/**
 *  Base class for all hooks
 *  @author Marc Fiedler
 *  @copyright 2017 Blackout Technologies
 */

// Use Strict mode ECMA Script 5+
"use_strict";

//const chalk = require('chalk');
const rp = require('request-promise');

module.exports = class Hook {
    constructor(){
        console.log("Hook initialized");
        this.json = undefined;

        // TODO load package.json
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
