const CronJob = require('cron').CronJob;
const Trello = require('node-trello');
const moment = require('moment');

const CHANNEL = 'refrigerator';

/**
 * cron定義
 */
module.exports = (bot) => {

    new CronJob('0 30 19 * * *', () => {
        bot.say({
            text: 'ここ2週間くらいで切れそうな食材があるぞ！',
            channel: CHANNEL
        });
        getOldItems();
    }, null, true, 'Asia/Tokyo');

    /**
     * 賞味期限が切れそうな在庫の一覧をslackに通知する。
     */
    let getOldItems = () => {
        const trello = new Trello(process.env.TRELLO_APPLICATION_KEY, process.env.TRELLO_USER_TOKEN);
        const foodsListId = process.env.TRELLO_FOODS_LIST_ID;
        const seasoningListId = process.env.TRELLO_SEASONING_LIST_ID;
        const instantListId = process.env.TRELLO_INSTANT_LIST_ID;

        // 食材一覧
        trello.get(`1/lists/${foodsListId}/cards`, (err, data) => {
            if (err) {
                throw err;
            }
            bot.say({
                text: createOldList('*■食材*', data),
                channel: CHANNEL
            });
        });

        // 調味料一覧
        trello.get(`1/lists/${seasoningListId}/cards`, (err, data) => {
            if (err) {
                throw err;
            }
            bot.say({
                text: createOldList('*■調味料*', data),
                channel: CHANNEL
            });
        });

        // インスタント一覧
        trello.get(`1/lists/${instantListId}/cards`, (err, data) => {
            if (err) {
                throw err;
            }
            bot.say({
                text: createOldList('*■インスタント*', data),
                channel: CHANNEL
            });
        });
    };

    /**
     * 渡された一覧から期限が切れそうな在庫の一覧を作成して返す
     *
     * @param {String} title 返却値にセットするタイトル
     * @param {Array} list Trelloのリストから取得したカード一覧
     * @returns {String}
     */
    let createOldList = (title, list) => {
        let filter = moment().add(14, 'days');
        let stock = '';

        list.forEach((data) => {
            if (!!data.badges.due === false) {
                return;
            }

            let due = moment(data.badges.due);
            if (filter.diff(due) > 0) {
                stock += `${data.name}: ${due.format('YYYY-MM-DD')}\n`;
            }
        });

        let result = '';
        if (stock) {
            result = title + '\n```\n' + stock + '```\n';
        }
        return result;
    }
};
