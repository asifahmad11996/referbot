const allowed_updates = ["callback_query", "channel_post", "chat_boost", "chat_join_request", "chat_member", "chosen_inline_result", "edited_channel_post", "edited_message", "inline_query", "message", "message_reaction", "message_reaction_count", "my_chat_member", "poll", "poll_answer", "pre_checkout_query", "removed_chat_boost", "shipping_query"];

const ignore_error = [
    "Bad Request: message is not modified: specified new message content and reply markup are exactly the same as a current content and reply markup of the message",
    "Bad Request: message to delete not found",
    "Bad Request: query is too old and response timeout expired or query ID is invalid",
    "Bad Request: message to delete not found"
];

const user_blocked = [
    "Forbidden: bot was blocked by the user",
    "Forbidden: user is deactivated"
];

module.exports = {
    allowed_updates,
    ignore_error,
    user_blocked
};