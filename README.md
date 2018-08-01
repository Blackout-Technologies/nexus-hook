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

### Simple Eample implementation

```JavaScript
const Hook = require('nexus-hook').Hook;

module.exports = class WeatherHook extends Hook {
    process(intents, text, complete){
        this.request('GET', 'http://api.openweathermap.org/data/2.5/weather?q=Bremen&units=metric&appid=<ID>', {}, (resp) => {
            complete({
                answer: 'The weather in Bremen is: '+resp.weather[0].main+" with "+resp.main.temp+" degrees.",
                platform: {}
            });
        });
    }
}
```
