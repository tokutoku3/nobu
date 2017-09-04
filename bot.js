var Botkit = require('botkit');
var Fs = require('fs');
var Path = require('path');

controller = Botkit.slackbot({
    debug: false
});

var bot = controller.spawn({
    token: process.env.NOBU_TOKEN
}).startRTM();

// init cron
require('./cron/wakeup')(bot);

var load = function(path, file) {
    var ext = Path.extname(file);
    var full = Path.join(path, Path.basename(file, ext));

    try {
        var script = require(full);
        if (typeof script === 'function') {
            script(this);
        }
    } catch (error) {
        process.exit(1);
    }
};

var path = Path.resolve('.', 'scripts');

// load ./scripts
Fs.readdirSync(path).sort().forEach(function(file) {
    load(path, file);
});
