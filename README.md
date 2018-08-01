# blackout nexus hooks

Hooks are custom scripts that can be integrated into any point within a dialog
to access external or living data. Any information and data that is not part of
the original A.I. training falls under the category `living data`.

## Hook integration

In order to develop a hook you first need to subclass the `Hook` class from this
library. You need to implement the function `process()` in order to be able to
handle data from the dialog engine.

### Process

The `process()` function is the heart of the hook, it has the following parameters:

|Parameter|Type|Description|
|---|---|---|
|intent|Object|This is the intent that triggered the hook. this object has a `name` and a `confidence` field.|
|text|String|This string contains the original phrasing of the user|
|complete|Callback|This is the completion function, it has to be called at the end of your script in order to continue dialog.|

### Completion callback

The completion callback needs to be called at the end of what your
hook is doing. You have to transport at least a `answer` string through
the completion callback. Optionally you can also add a `platform` object
that can hold additional platform information like buttons, images, actions.
Example:
```JavaScript
complete({
    answer: "I love cookies!",
    platform: {
        buttons: [
            {caption: "Give more cookies", action: "give more cookies"},
            {caption: "Eat all cookies yourself", action: "i eat all cookies myself"}
        ]
    }
})
```

### Simple Eample implementation

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
    process(intent, text, complete){
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
