const client = require('cheerio-httpcli');
const moment = require('moment');

const TYPE_ESPECIALLY_TIMETABLE = '◆';
const TYPE_FIRST_TRAIN = '●';
const RESULT_LIMIT = 10;

/**
 * 現在時刻から RESULT_LIMIT 分の電車到着時刻を通知する
 *
 * @todo: 駅名を指定できるように
 * @todo: 基準時間を指定できるように
 */
controller.hears(['電車'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
    // yahoo路線情報をscrape
    // @link https://transit.yahoo.co.jp/station/time
    const TIMETABLE_URL = process.env.TIMETABLE_URL;

    client.fetch(TIMETABLE_URL)
        .then((result) => {
            bot.reply(message, getRecentTimetable(result.$));
        });
});

/**
 * 対象サイトから時刻情報をスクレイピングして返す
 *
 * @param {cheerio} $ 対象サイトの取得結果
 * @returns {string} 直近の電車到着時間一覧
 */
const getRecentTimetable = ($) => {
    let count = 0;
    let now = moment();
    let table = '```\n';

    // thisを束縛したくないのでアロー関数を使わない
    $('.tblDiaDetail tr').each(function() {
        let id = $(this).attr('id');

        if (id === undefined) {
            return;
        }

        let hour = id.replace(/hh_/, '');
        if (parseInt(now.hour()) > parseInt(hour)) {
            return;
        }

        $('#' + id + ' .timeNumb dt').each(function() {
            if ($(this).text().match(TYPE_ESPECIALLY_TIMETABLE)) {
                return;
            }

            let minute = $(this).text().replace(TYPE_FIRST_TRAIN, '');
            if (parseInt(now.hour()) === parseInt(hour) && parseInt(now.minute()) > parseInt(minute)) {
                return;
            }

            table += padZero(hour) + ':' + padZero(minute) + '\n';

            count++;
            if (count >= RESULT_LIMIT) {
                return false;
            }
        });

        if (count >= RESULT_LIMIT) {
            return false;
        }
    });
    table += '```';

    return table;
};

/**
 * 数字を２桁にフォーマットする(0埋め)
 *
 * @param {int} num
 * @returns {string}
 */
const padZero = (num) => {
    return ('00' + num).slice(-2);
};
