/**
 * ping
 */
controller.hears(['ping'], ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
    bot.reply(message, 'PONG');
});
