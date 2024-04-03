const { pluralize, model, Schema } = require("mongoose");
pluralize(null);

const userinfoSchema = new Schema({
    user_id: {
        type: Number,
        required: true,
        unique: true,
        index: true
    },

    main_balance: {
        type: Number,
        required: true,
        default: 0
    },

    referred_by: {
        type: Number,
        required: true,
        default: process.env.ADMIN_CHAT_ID,
    },

    is_subscribed: {
        type: Boolean,
        required: true,
        default: false
    },

    is_banned: {
        type: Boolean,
        required: true,
        default: false
    },

    ban_reason: {
        type: String
    },
    
    can_withdraw: {
        type: Boolean,
        required: true,
        default: true
    },

    withdraw_ban_reason: {
        type: String
    },

    is_blocked: {
        type: Boolean,
        required: true,
        default: false
    },

    last_clicked_at: {
        type: Date,
        required: true,
        default: Date.now
    },

    joined_at: {
        type: Date,
        required: true,
        default: Date.now
    }
});

module.exports = model("userinfo", userinfoSchema);