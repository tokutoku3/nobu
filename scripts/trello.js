// @link https://developers.trello.com/v1.0/reference
var Trello = require('node-trello');
var moment = require('moment');

/**
 * 確認用
 * listのidを一覧で表示する
 */
controller.hears(['trello_list_id'], ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
    var trello = new Trello(process.env.TRELLO_APPLICATION_KEY, process.env.TRELLO_USER_TOKEN);
    var boardId = process.env.TRELLO_BOARD_ID;

    trello.get('1/boards/' + boardId + '/lists', function(err, data) {
        if (err) {
            throw err;
        }

        var list = '```\n';
        data.forEach(function(d) {
            list += d.name + ': ' + d.id + '\n';
        });
        list += '```\n';

        bot.reply(message, list);
    });
});

/**
 * 冷蔵庫内の在庫確認
 */
controller.hears(['冷蔵庫*'], ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
    var trello = new Trello(process.env.TRELLO_APPLICATION_KEY, process.env.TRELLO_USER_TOKEN);
    var foodsListId = process.env.TRELLO_FOODS_LIST_ID;
    var seasoningListId = process.env.TRELLO_SEASONING_LIST_ID;
    var instantListId = process.env.TRELLO_INSTANT_LIST_ID;

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

    // インスタント一覧
    trello.get('1/lists/' + instantListId + '/cards', function(err, data) {
        if (err) {
            throw err;
        }
        bot.reply(message, createStockList('*■インスタント*', data));
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
