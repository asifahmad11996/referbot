const { pluralize, model, Schema } = require("mongoose");
pluralize(null);

const bonusinfoSchema = new Schema({
    user_id: {
        type: Number,
        required: true,
        unique: true
    },

    reward: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

module.exports = model("bonusinfo", bonusinfoSchema);