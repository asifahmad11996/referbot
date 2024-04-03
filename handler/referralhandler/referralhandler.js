
const Userinfo = require("../../database/userinfoSchema");

const { TryCatchError } = require("../errorhandler/errorhandler");

const { ReferralMessage } = require("../../message/message");

const ReferralHandler = async (ctx) => {
    try {
        const user_id = ctx.from.id;
        const total_invited = await Userinfo.countDocuments({ referred_by: user_id }) || 0;
        const active_users = await Userinfo.countDocuments({ referred_by: user_id, is_subscribed: true }) || 0;

        const message = ReferralMessage(user_id, total_invited, active_users);

        await ctx.reply(message, {
            parse_mode: "HTML",
            disable_web_page_preview: true
        });
    } catch (error) {
        await TryCatchError(error);
    }
};

module.exports = { ReferralHandler };