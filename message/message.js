
const BOT_NAME = process.env.BOT_NAME;
const BOT_LINK = process.env.BOT_LINK;
const BONUS_REWARD = process.env.BONUS_REWARD;

const StartMessage = `🔥 Welcome on ${BOT_NAME}!\n\nHere you can earn money by refer users`;

const BalanceMessage = (main_balance) => `<u><b>💰 Balance Information</b></u>

<b>💳 Withdrawable Balance :</b> <code>${main_balance}</code> <b>USD</b>`;

const ReferralMessage = (user_id, total_invited, active_users) => `🌐 Invite active users and earn rewards in cryptocurrency:

✅ Get <b>0.0500 USD</b> for every active refer you bring to <a href="${BOT_LINK}">${BOT_NAME}</a>

🔗 Use these links below to invite new users:

👉 ${BOT_LINK}?start=${user_id}

<b>🔘 Total invited:</b> ${total_invited}
<b>🟢 Active users:</b> ${active_users}`;

const SuccessBonusMessage = `<b>🎁 You claimed bonus successfully!</b>

💸 You earned <b>${BONUS_REWARD} USD</b> for claim a bonus!`

const AdminPanelMessage = `<b>Welcome on Admin Panel!</b>`

module.exports = {
    StartMessage,
    BalanceMessage,
    ReferralMessage,
    SuccessBonusMessage,
    AdminPanelMessage
};