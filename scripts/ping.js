/**
 * ping
 */
controller.hears(['ping'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
    bot.reply(message, 'PONG');
});

controller.hears(['はろー'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
    bot.replyWithTyping(message, 'うむ！');
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'thumbsup'
    });
});
