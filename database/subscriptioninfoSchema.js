const { pluralize, model, Schema } = require("mongoose");
pluralize(null);

const subscriptioninfoSchema = new Schema({
    chat_id: {
        type: Number,
        required: true,
        unique: true
    },

    anchor_data: {
        type: String,
        required: true
    },

    chat_link: {
        type: String,
        required: true,
        unique: true
    },

    checking: {
        type: Boolean,
        required: true,
        default: true
    },

}, {
    timestamps: true
});

module.exports = model("subscriptioninfo", subscriptioninfoSchema);