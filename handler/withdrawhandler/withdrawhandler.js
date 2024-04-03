
const { default: axios } = require("axios");
const { API } = require("faucetpayjs");

const FAUCETPAY_API_KEY = process.env.FAUCETPAY_API_KEY;
const faucetpay = new API(FAUCETPAY_API_KEY);

const Userinfo = require("../../database/userinfoSchema");
const Paymentinfo = require("../../database/paymentinfoSchema");

const { math } = require("../../helpers/helpers");

const { TryCatchError } = require("../errorhandler/errorhandler");

const { StartKeyboard, CancelKeyboard } = require("../../keyboard/keyboard");

const MINIMUM_WITHDRAW = process.env.MINIMUM_WITHDRAW;

const FaucetPayWithdraw = async (currency, to, amount) => {
    try {
        const { data } = await axios.get(`https://api.coinbase.com/v2/exchange-rates?currency=${currency}`);
        const _amount = math.divide(amount, data.data.rates.USD);

        const account = await faucetpay.getBalance(currency);

        if (account.balance_bitcoin < _amount) return {
            success: false,
            message: `This provider is under maintenance try other provider!`
        };

        const currency_amount = Number(Number(_amount) * 100000000).toFixed(8);

        const sendMoney = await faucetpay.send(currency_amount, to, currency);

        if (sendMoney.status != 200) {
            await api.sendMessage(ADMIN_CHAT_ID, `${sendMoney.message}`);
            return {
                success: false,
                message: (sendMoney.message == "The user has been blacklisted by the faucet owner.") ? "block" : `Contact Support`
            };
        }

        sendMoney.currency_amount = _amount;
        return { success: true, message: sendMoney };

    } catch (error) {
        return { success: false, message: `Contact Support` };
    }
};

const WithdrawMiddleware = async (ctx, next) => {
    try {
        const user_id = ctx.from.id;
        const user = await Userinfo.findOne({ user_id });

        if (!user.can_withdraw) {
            return await ctx.reply(`You are banned to use this section\n\n<b>Reason :</b> ${user?.ban_reason}`, {
                parse_mode: "HTML",
                reply_markup: {
                    keyboard: StartKeyboard,
                    resize_keyboard: true
                }
            });
        }

        if (user.main_balance < MINIMUM_WITHDRAW) {
            return await ctx.reply(`😢 Your balance is too small to withdraw.\n\n<b>Minimum withdrawal :</b> ${MINIMUM_WITHDRAW} <b>USD</b>`, {
                parse_mode: "HTML",
                reply_markup: {
                    keyboard: StartKeyboard,
                    resize_keyboard: true
                }
            });
        }

        await next();

    } catch (error) {
        await TryCatchError(error);
    }
};

const WithdrawHandler = async (ctx) => {
    try {
        await ctx.conversation.enter("WithdrawAddress");
    } catch (error) {
        await TryCatchError(error);
    }
};

const WithdrawAddress = async (conversation, ctx) => {
    try {
        await ctx.reply(`📧 Send me your faucetpay email or account ....`, {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: CancelKeyboard,
                resize_keyboard: true,
                input_field_placeholder: "Send me your faucetpay email or account ...."
            }
        });

        ctx = await conversation.waitFor(":text");

        const currency_address = ctx.message?.text.trim();
        const isValidFaucetPay = await faucetpay.checkAddress(currency_address);

        if (isValidFaucetPay.status != 200) {
            await ctx.reply(`⚠️ This is not valid faucetpay email or account ....`, {
                parse_mode: "HTML",
                reply_markup: {
                    keyboard: CancelKeyboard,
                    resize_keyboard: true,
                    input_field_placeholder: "Enter a valid faucetpay email or account ...."
                }
            });
            return await WithdrawAddress(conversation, ctx);
        }

        await ctx.reply(`💵 Send me how much you want to withdraw ....`, {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: CancelKeyboard,
                resize_keyboard: true,
                input_field_placeholder: "Send me how much you want to withdraw ...."
            }
        });

        await WithdrawAmount(conversation, ctx, currency_address);

    } catch (error) {
        await TryCatchError(error);
    }
};

const WithdrawAmount = async (conversation, ctx, currency_address) => {
    try {
        const user_id = ctx.from.id;

        ctx = await conversation.waitFor(":text");

        const usd_amount = validator.isNumeric(ctx.message?.text) ? ctx.message?.text : false;

        if (!usd_amount) {
            await ctx.reply(`⚠️ This is not valid number.`, {
                parse_mode: "HTML",
                reply_markup: {
                    keyboard: CancelKeyboard,
                    resize_keyboard: true,
                    input_field_placeholder: "Enter a valid number ...."
                }
            });
            return await WithdrawAmount(conversation, ctx, currency_address);
        }

        const input_amount = Number(ctx.message.text);
        const currency = "LTC";
        const user = await Userinfo.findOne({ user_id });

        if (user.main_balance < MINIMUM_WITHDRAW) {
            return await ctx.reply(`😢 Your balance is too small to withdraw.\n\n<b>Minimum withdrawal :</b> ${MINIMUM_WITHDRAW} <b>USD</b>`, {
                parse_mode: "HTML",
                reply_markup: {
                    keyboard: StartKeyboard,
                    resize_keyboard: true
                }
            });
        }

        if (input_amount < MINIMUM_WITHDRAW) {
            return await ctx.reply(`<b>Minimum withdrawal :</b> ${MINIMUM_WITHDRAW} USD\n\nInput greater than or equal <code>${MINIMUM_WITHDRAW}</code> <b>USD</b>`, {
                parse_mode: "HTML",
                reply_markup: {
                    keyboard: StartKeyboard,
                    resize_keyboard: true
                }
            });
        }

        if (user.main_balance < input_amount) {
            return await ctx.reply(`😔 You have not that much balance!\n\n<b>Your withdrawable balance is</b> <code>${Number(user.main_balance).toFixed(8)}</code> <b>USD</b>`, {
                parse_mode: "HTML",
                reply_markup: {
                    keyboard: StartKeyboard,
                    resize_keyboard: true
                }
            });
        }

        await Userinfo.findOneAndUpdate({ user_id }, { $inc: { main_balance: -usd_amount } });

        const FW = await FaucetPayWithdraw(currency, currency_address, usd_amount);

        if (FW.message == "block") return;

        if (!FW.success) {
            await ctx.api.sendMessage(ADMIN_CHAT_ID, `An error occured when send money\n\nUser : ${user_id}\nAmount : ${usd_amount} USD\nRefund : false\nMessage : ${FW.message}`);

            return await ctx.reply(FW.message, {
                parse_mode: "HTML",
                reply_markup: {
                    keyboard: StartKeyboard,
                    resize_keyboard: true
                }
            });
        }

        const username = ctx.from.first_name || ctx.from.last_name || ctx.from.username || ctx.from.id;
        const currency_amount = FW.message.currency_amount;
        const hash = FW.message.payout_id;

        const createPayment = await Paymentinfo.create({
            user_id, status: "COMPLETED", currency, currency_amount, usd_amount, currency_address, hash
        });

        if (!createPayment) {
            return await ctx.reply(`Something wrong`);
        }

        await ctx.reply(`Your payment sended successfully!`, {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: StartKeyboard,
                resize_keyboard: true
            }
        });

    } catch (error) {
        await TryCatchError(error);
    }
};

module.exports = { WithdrawMiddleware, WithdrawHandler, WithdrawAddress };