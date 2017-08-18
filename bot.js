/**
 * 初期設定
 */
if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('./lib/Botkit.js');
var os = require('os');

var controller = Botkit.slackbot({
    debug: true,
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();

/**
 * ヘルプメッセージの表示
 */
controller.hears(['ping'],
    'direct_message,direct_mention,mention', function(bot, message) {
       bot.reply(message, 'PONG');
    });

