const { pluralize, model, Schema } = require("mongoose");
pluralize(null);

const paymentinfoSchema = new Schema({
    user_id: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        required: true,
        enum: ["COMPLETED", "PENDING", "REJECTED"]
    },

    currency: {
        type: String,
        required: true
    },

    currency_amount: {
        type: Number,
        required: true
    },

    usd_amount: {
        type: Number,
        required: true
    },

    currency_address: {
        type: String,
        required: true
    },

    hash: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = model("paymentinfo", paymentinfoSchema);