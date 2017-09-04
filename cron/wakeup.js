var CronJob = require('cron').CronJob;
var Trello = require('node-trello');
var moment = require('moment');

var CHANNEL = 'refrigerator';

/**
 * cron定義
 */
module.exports = function(bot) {

    new CronJob('0 30 19 * * *', function() {
        bot.say({
            text: 'ここ2週間くらいで切れそうな食材があるぞ！',
            channel: CHANNEL
        });
        getOldItems();
    }, null, true, 'Asia/Tokyo');

    /**
     * 賞味期限が切れそうな在庫の一覧をslackに通知する。
     */
    function getOldItems() {
        var trello = new Trello(process.env.TRELLO_APPLICATION_KEY, process.env.TRELLO_USER_TOKEN);
        var foodsListId = process.env.TRELLO_FOODS_LIST_ID;
        var seasoningListId = process.env.TRELLO_SEASONING_LIST_ID;
        var instantListId = process.env.TRELLO_INSTANT_LIST_ID;

        // 食材一覧
        trello.get('1/lists/' + foodsListId + '/cards', function(err, data) {
            if (err) {
                throw err;
            }
            bot.say({
                text: createOldList('*■食材*', data),
                channel: CHANNEL
            });
        });

        // 調味料一覧
        trello.get('1/lists/' + seasoningListId + '/cards', function(err, data) {
            if (err) {
                throw err;
            }
            bot.say({
                text: createOldList('*■調味料*', data),
                channel: CHANNEL
            });
        });

        // インスタント一覧
        trello.get('1/lists/' + instantListId + '/cards', function(err, data) {
            if (err) {
                throw err;
            }
            bot.say({
                text: createOldList('*■インスタント*', data),
                channel: CHANNEL
            });
        });
    }

    /**
     * 渡された一覧から期限が切れそうな在庫の一覧を作成して返す
     *
     * @param {String} title 返却値にセットするタイトル
     * @param {Array} list Trelloのリストから取得したカード一覧
     * @returns {String}
     */
    function createOldList(title, list) {
        var filter = moment().add(14, 'days');
        var stock = '';

        list.forEach(function(data) {
            if (!!data.badges.due === false) {
                return;
            }

            var due = moment(data.badges.due);
            if (filter.diff(due) > 0) {
                stock += data.name + ': ' + due.format('YYYY-MM-DD') + '\n';
            }
        });

        var result = '';
        if (stock) {
            result = title + '\n```\n' + stock + '```\n';
        }
        return result;
    }
};
