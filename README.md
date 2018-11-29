# Blackout Nexus hooks

![Blackout logo](https://www.blackout.ai/wp-content/uploads/2018/08/logo.png)

|||
|---|---|
|Author|Marc Fiedler|
|Email|dev@blackout.ai|
|Latest stable version|0.6.7|
|Required nexusUi versions| >= 2.0.71 |
|Required Brocas versions| >= 1.5.3|
|State|`Stable`|

## License

|Copyright|License
|---|---|
|(c)2018 Blackout Technologies, Bremen|GPLv3|

Hooks are custom scripts that can be integrated into any point within a dialog
to access external or living data. Any information and data that is not part of
the original A.I. training falls under the category `living data`.

# Introduction

The `nexus` by Blackout Technologies is a platform to create Digital Assistants and to connect them via the internet to multiple platforms. Those platforms can be websites, apps or even robots. The `nexus` consists of two major parts, first being the `btNexus` and second the nexusUi. The `btNexus` is the network that connects the A.I. with the nexusUi and the chosen interfaces. The nexusUi is the user interface, that allows the user to create their own A.I.-based Digital Assistant. Those Digital Assistants can be anything, support chatbots or even robot personalities.   
Every user has one or multiple nexusUi instances or short nexus instances, which means, it's their workspace. One nexusUi / nexus instance can host multiple personalities.

# Prerequisites

* Node.JS / NPM installed on your PC
* Owner of a btNexus instance or a btNexus account

# Example hooks

Movies Hook: https://github.com/Blackout-Technologies/movie-hook

# Before you start

Hooks are `Node.Js` packages and therefore need to fulfil the package requirements of the `NPM` standart.
https://docs.npmjs.com/files/package.json

## Hook Integration

In order to develop a hook you first need to subclass the `Hook` class from this library. You need to implement the function `process()` in order to be able to handle data from the dialog engine.

### Prepare Training Function

During the *training phase* of the artificial intelligence, you will be able to hook
yourself into the process of preparing training data.

During training preparations `prepareTraining` is called with the following parameters:

|Parameter|Type|Description|
|---|---|---|
|phrases|Object|This is the intent that triggered the hook. This object has a `name` and a `confidence` field.|
|complete|Callback|This is the completion function, complete has to be called with an array parameter. The array must be a list of objects that have the following layout: `{id: <phraseID>, text: <phraseText>}`|

```JavaScript
/**
 *  @param {String} intent Name of the intent that is currently in use
 *  @param {Array} phrases Array that contains all phrasing examples for the intent that triggers this Hook.
 *  @param {Callback} complete Completion callback to continue dialog
 */
prepareTraining(intent, phrases, complete){
    var samples [];

    // go through all phrasings and find the once that we want
    // to manipulate
    for( var i in phrases ){
        if( phrases[i].indexOf("$city") > -1 ){
            samples.push(phrases[i]);
        }
    }

    // return the samples back to the training service
    complete(samples);
}
```

### Process Function

The `process()` function is the heart of the hook, it has the following parameters:

|Parameter|Type|Description|
|---|---|---|
|intent|Object|This is the intent that triggered the hook. This object has a `name` and a `confidence` field.|
|text|String|This string contains the original phrasing of the user|
|complete|Callback|This is the completion function, it has to be called at the end of your script in order to continue the dialog.|

#### Engine Variables

|Parameter|Type|Description|
|---|---|---|
|this.json|Object|contains the POST request **body** that the user client sent to the chatbot.|
|this.session|Object|Contains `this.session.thread` that holds a record of past dialog with the user|
|this.slots|Object|Contains all slots that the system was able to extract|

```JavaScript
// load the Hook class from this library
const Hook = require('nexus-hook').Hook;

// create your own hook as subclass of Hook
module.exports = class WeatherHook extends Hook {
    /**
     *  @param {Object} intent Object with .name and .confidence
     *  @param {String} text Original phrasing of the user
     *  @param {Callback} complete Completion callback to continue dialog
     */
    process(text, intent, entities, complete){
        // since we already know the phrasing, we can ignore the
        // intent and text parameter
        this.request('GET', 'http://api.openweathermap.org/data/2.5/weather?q=Bremen&units=metric&appid=<ID>', {}, (resp) => {
            // after the response from the request-pronise came back
            // complete this hook with an answer string and optionally
            // with a platform object.
            complete({
                answer: 'The weather in Bremen is: '+resp.weather[0].main+" with "+resp.main.temp+" degrees.",
                platform: {}
            });
        });
    }
}
```

#### Intent naming convention

Since btNexus version 2.0.61, the classifier will not only return the name of the classified intent and the extracted entities but also the name of the knowledge source this intent belongs to.

For all nexusUi versions >= 2.0.70 the intent names returned by the classifier will look like this:

`knowledgeSourceName -> #intentName`

In order to make it easier to filter by intent, the hook class offers a function called `isIntent(intent, name)`. Use this function to check of you are filtering for the right intent.

```JavaScript
if( this.isIntent(intent, "myWeatherIntent") ){
    // do something if it is the weather hook
}else if( this.isIntent(intent, "someOtherIntent") ){
    // do something else here
}else{
    // fallback..
}
```

#### Build-in Request

Each hook comes with a build in `request` function that you can use to communicate with REST Api's around the globe.
The prototype of the request function looks like this:

|Parameter|Type|Description|
|---|---|---|
|METHOD|String|Request Method (GET, POST, PUT, DELETE, etc.)|
|Url|String|Url the hook is supposed to query|
|Body|Object|JSON object that can be used to transport a JSON body|
|Authentication|Object|(Optional)Auth Object, it must contain `username` and `password` in order to work. `{username: "myUsername", password: "myPassword"}`|
|Complate callback|Function|Callback function for completion. Will contain an object on success and undefined on error.|


```JavaScript
// since we already know the phrasing, we can ignore the
// intent and text parameter
this.request('GET', 'https://your-rest-api.com/', {}, (resp) => {
    // after the response from the request-pronise came back
    // complete this hook with an answer string and optionally
    // with a platform object.
    //..
});

// request with authentication
this.request('GET', 'https://your-rest-api.com/', {},
    {username: "secret", password: "swortfish"}, (resp) => {
    // response
});
```

### Completion Callback

The completion callback needs to be called at the end of what your
hook is doing. You have to transport at least an `answer` string through
the completion callback. Optionally you can also add a `platform` object
that can hold additional platform information like buttons, images or actions.
Example:

```JavaScript
complete({
    answer: "The cake is a lie!",
    platform: {}
})
```

# Nexus Tools
In the world of the Blackout Nexus, there are some specific standards you need to follow in order to leverage the maximum use of the nexus power. One of those are the so-called `hyperReferences`. What that means is that you can utilise the `hyperReference` objects to reference elements from outside of the scope of your hook. `Links`, `Buttons`, `Carousels`, `MailTos` and `Dialog Buttons` are part of the current array of possible object types for a `hyperReference`.

Another tool that you can utalize is the `platformReactions`, these objects are designed for the platform interface that you are using, to have your personality communicate with humans. The HMI (Human Machine Interface) if you will. `platformReactions` are much more complex as they transport not only context information for the HMI but can also contain telemetry, geometry or odometry data for more complex interfaces.

## Hyper References

There are three ways to use `hyperReferences` in your hook:

1. Use a pre-defined `hyperReference` from within the nexusUi. The only thing you need is the `name` of the `hyperReference` inside your nexus instance.
```JavaScript
    complete({
        answer: "The cake is a lie!",
        platform: {
            hyperReferences: [
                this.getHyperReferenceNamed('Website')
            ]
        }
    })
```

2. Create your own `hyperReference` when you need it. This allows for more flexibility since not every nexus instance will share the same `hyperReferences`
```JavaScript
    complete({
        answer: "The cake is a lie!",
        platform: {
            hyperReferences: [
                {type: "link", blank: true, target: 'http://www.vanschneider.com/wp-content/uploads/2017/01/cake_1200w.jpg', caption: "Get the cake"}
            ]
        }
    })
```

3. Generate a `hyperReference` from existing resources inside of the hook. Assume you have a file in your `templates/` folder called `home.hbs`
```JavaScript
    complete({
        answer: "The cake is a lie!",
        platform: {
            hyperReferences: [
                this.generateHyperReferenceFor('home')
            ]
        }
    })
```

## Platform Reactions

Platform reactions are very specific remote procedure calls from within the nexus. Therefore the only way to gain access to a `platformReaction` is to load one directly from the `Brocas service`.

```JavaScript
    complete({
        answer: "The cake is a lie!",
        platform: {
            platformReactions: [
                this.getPlatformReactionNamed('Wave')
            ]
        }
    })
```

## Handling Hook resources

Each hook can come with it's own resources. JS/CSS files for the browser, Images and even HTML content. Each file must be kept in their respective folder.

```
    [Hook]
        -> index.js (must always be present)
        -> package.json (must always be present)

        -> tests (optional, but encouraged)
            -> myFirstTest.js (optional)

        -> img (optional)
            -> <keep image resources here>

        -> js (optional)
            -> <keep JavaScript resources here>

        -> css (optional)
            -> <keep css resources here>

        -> templates (optional)
            -> <keep hbs resources here>
```

## Using HTML Templates

Any hook can also come with it's own templates. Important to note here is that a hook template can only be of type "hbs" that follows the handlebars file type standart.
 > https://handlebarsjs.com

All templates need to be placed in the `./templates/` folder and all template files need to end with the `.bhs` file extension.
If you want to pass on data to your template to replace the `{{}}` handlebars markers, you can do so in your response function. Simply fill the object called `this.templateVars` with data and the system will replace them for you.

```JavaScript
this.templateVars = {
    'movie-poster': resp.Poster,
    'movie-title': resp.Title
}
```

Inside your template, reference your variables like so

```HTML
<h3>{{movie-title}}</h3><br />
<img src="{{movie-poster}}" />
```

# Handling Languages
If you want to provide multilingual support to your hook you can do that with the `languageDict` implementation that comes with the `nexus-hook` library.

Each hook has a member variable called `captions` you can access it via `this.captions`. You can get a language specific phrasing with the `get()` function of the `captions` object.

In order to have a working language dictionary, you need to create a file called `languageDict.json` in the root folder of your hook.

## Example languageDict File

```json
{
    "de-DE": {
        "fallback": "Ich habe keine informationen zu deiner Suche gefunden",
        "weatherAnswer": "Das Wetter in $city ist $weather mit $temperature grad"
    },
    "en-US": {
        "fallback": "Sorry, I can't find anything.",
        "weatherAnswer": "The weather in $city is $weather with $temperature degrees"
    }
}
```

If the setup of the `languageDict.json` was done correctly, you will be able to access any caption with the `get()` function passing the name of the caption as a string.

## Example Usage
```JavaScript
this.captions.get('fallback'); // in the above example will return:  "Sorry, I can't find anything." if the language is english
```

# Testing
The integrations in the `nexusUi` as of version <= *2.0.0* will not support error feedback. In order to test your hook, you can utilize the `TestHook` class of the `nexus-hook` library.

The `TestHook` class has only one function called `chat` the prototype of the chat function looks like this:

```JavaScript
chat(text, intent, entities, complete);
```

You will have to pass an intent name and a text to the chat function of the `TestHook` class. The response will then be returned through the complete callback.

The rest of the hook will behave exacly the same as it would, when you integrate it into the `nexusUi`.

## Example

```JavaScript
// Test implementation
const Hook = require('nexus-hook').TestHook;
var myHook = new Hook("en-US");

myHook.addSlot("city", "Bremen");

// run the test hook with the test parameters
myHook.chat("whats the weather like in Bremen", "weahter_intent", [], (resp) => {
    console.log(resp.answer);
});
```

## Example Output
```
=== Testing Hook ===

Weather hook v0.1.0 loaded
Sorry, I can't find anything.
The weather in Köln is Clouds with $20.6 degrees
The weather in Bremen is Clouds with $18.43 degrees
The weather in Hamburg is Clouds with $18.6 degrees

Weather hook v0.1.0 loaded
Ich habe keine informationen zu deiner Suche gefunden
Das Wetter in Bremen ist Clouds mit $18.43 grad
Das Wetter in Hamburg ist Clouds mit $18.61 grad
Das Wetter in Köln ist Clouds mit $20.6 grad
```

> btNexus is a product of Blackout Technologies, all rights reserved (https://blackout.ai/)
