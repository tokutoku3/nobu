/**
 * 初期設定
 */
if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('./lib/Botkit.js');
var os = require('os');
var Trello = require('node-trello');
var moment = require('moment');

var controller = Botkit.slackbot({
    debug: true,
});

var bot = controller.spawn({
    token: process.env.NOBU_TOKEN
}).startRTM();

/**
 * ping
 */
controller.hears(['ping'], ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
    bot.reply(message, 'PONG');
});

/**
 * 冷蔵庫内の在庫確認
 */
controller.hears(['冷蔵庫*'], ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
    var trello = new Trello(process.env.TRELLO_APPLICATION_KEY, process.env.TRELLO_USER_TOKEN);
    var foodsListId = process.env.TRELLO_FOODS_LIST_ID;
    var seasoningListId = process.env.TRELLO_SEASONING_LIST_ID;

    bot.reply(message, '食料の備蓄はこんなかんじじゃぞ！');

    // 食材一覧
    trello.get('1/lists/' + foodsListId + '/cards', function(err, data) {
        if (err) {
            throw err;
        }
        bot.reply(message, createStockList('*■食材*', data));
    });

    // 調味料一覧
    trello.get('1/lists/' + seasoningListId + '/cards', function(err, data) {
        if (err) {
            throw err;
        }
        bot.reply(message, createStockList('*■調味料*', data));
    });
});

/**
 * 渡された一覧から在庫名と期限の一覧を作成して返す
 *
 * @param {string} title 返却地にセットするタイトル
 * @param {array} list Trelloのリストから取得したカード一覧
 * @returns {string}
 */
function createStockList(title, list) {
    var stock = '```\n';
    list.forEach(function(data) {
        var due = !!data.badges.due ? moment(data.badges.due).format('YYYY-MM-DD') : '-';
        stock += data.name + ': ' + due + '\n';
    });
    stock += '```\n';

    return title + '\n' + stock;
}
