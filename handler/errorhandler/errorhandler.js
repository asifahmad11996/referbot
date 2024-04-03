
const Userinfo = require("../../database/userinfoSchema");

const { ignore_error, user_blocked } = require("../../config");

const HandleError = async (error, error_name) => {
    try {
        const error_content = error.message || error.description || "";
        const shouldIgnore = ignore_error.some(ignoreMessage => error_content.includes(ignoreMessage));

        if (shouldIgnore) return;

        const userBlocked = user_blocked.some(userBlockedMessage => error_content.includes(userBlockedMessage));

        if (userBlocked) {
            let user_id = error?.payload?.chat_id;
            await Userinfo.updateOne({ user_id }, { $set: { is_blocked: true } });
            return;
        }

        const error_context = Object.entries(error).reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});

        const errorJson = {
            error_name: error_name,
            error_stack: error?.stack || error,
            error_code: error?.error_code || error?.statusCode || error?.error?.error_code || 999,
            error_message: error_content,
            error_context: error_context || error,
            notes: `${error_name} `
        };

        console.log(errorJson);

    } catch (catchError) {
        console.log(`Error in ${error_name}:`, catchError);
    }
};

const BotError = async (error) => {
    await HandleError(error, "BotError");
};

const TryCatchError = async (error, ctx) => {
    await HandleError(error, "TryCatchError");

    if (ctx) {
        try {
            await ctx.reply(`⚠️ You are not allowed to do this!`, {
                reply_markup: {
                    remove_keyboard: true
                }
            });
        } catch (err) {
            await HandleError(err, "TryCatchError");
        }
    }
};

const ProcessError = async (error) => {
    await HandleError(error, "ProcessError");
};

module.exports = {
    BotError,
    TryCatchError,
    ProcessError
};