const Botkit = require('botkit');
const Fs = require('fs');
const Path = require('path');

controller = Botkit.slackbot({
    debug: false
});

const bot = controller.spawn({
    token: process.env.NOBU_TOKEN
}).startRTM();

// init cron
require('./cron/wakeup')(bot);

const load = (path, file) => {
    let ext = Path.extname(file);
    let full = Path.join(path, Path.basename(file, ext));

    try {
        let script = require(full);
        if (typeof script === 'function') {
            script(this);
        }
    } catch (error) {
        process.exit(1);
    }
};

let path = Path.resolve('.', 'scripts');

// load ./scripts
Fs.readdirSync(path).sort().forEach((file) => {
    load(path, file);
});
