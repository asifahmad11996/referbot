
const moment = require("moment");

const Userinfo = require("../../database/userinfoSchema");
const Bonusinfo = require("../../database/bonusinfoSchema");

const { TryCatchError } = require("../errorhandler/errorhandler");

const { SuccessBonusMessage } = require("../../message/message");

const reward = process.env.BONUS_REWARD;

const DeleteExpiredBonus = async () => {
    try {
        let completed_at = new Date(Date.now() - 86400000);

        await Bonusinfo.bulkWrite([{ deleteMany: { "filter": { "createdAt": { $lt: completed_at } } } }]);

    } catch (error) {
        await TryCatchError(error);
    }
};

setInterval(() => {
    DeleteExpiredBonus();
}, 3000);

const BonusHandler = async (ctx) => {
    try {
        const user_id = ctx.from.id;

        const data = await Bonusinfo.findOne({ user_id });

        if (data) {
            let future_time = moment(data.createdAt);
            let current_time = moment().subtract(moment.duration(0.25, "days"));
            let difference = future_time.diff(current_time, "seconds");
            let formattedTime = moment.utc(difference * 1000).format("HH:mm:ss");

            const waitingmessage = `🕐 Please wait for <b>${formattedTime}</b> to claim bonus again!`;

            await ctx.reply(waitingmessage, {
                parse_mode: "HTML",
                disable_web_page_preview: true
            });
        } else { 
            const claimed = await Bonusinfo.create({ user_id, reward });

            if (!claimed) return await ctx.reply("😔 Something went wrong!", {
                reply_markup: {
                    remove_keyboard: true
                }
            });

            await Userinfo.findOneAndUpdate({ user_id }, { $inc: { main_balance: reward } });

            await ctx.reply(SuccessBonusMessage, {
                parse_mode: "HTML",
                disable_web_page_preview: true
            });
        }
    } catch (error) {
        await TryCatchError(error);
    }
};

module.exports = { BonusHandler };

