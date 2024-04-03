const { pluralize, model, Schema } = require("mongoose");
pluralize(null);

const broadcastinfoSchema = new Schema({
    chat_id: {
        type: Number,
        required: true
    },

    from_chat_id: {
        type: Number,
        required: true
    },

    message_id: {
        type: Number,
        required: true
    },

    type: {
        type: String,
        required: true
    },

    status: {
        type: Boolean,
        required: true,
        default: true
    }
});

module.exports = model("broadcastinfo", broadcastinfoSchema);