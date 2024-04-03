
const StartKeyboard = [
    [
        { text: "💰 Balance" }, { text: "💵 Withdraw" }
    ],
    [
        { text: "🎁 Bonus" }, { text: "👭 Referrals" }
    ],
    [
        { text: "📞 Support" }
    ]
];

const CancelKeyboard = [
    [
        { text: `❌Cancel` }
    ]
];

const FormatKeyboard = [
    [
        {
            text: "Send as «Forward» ➠  (▶️ On)"
        },
        {
            text: "Send as «Forward» ➠  (⏹ Off)"
        }
    ],
    [
        {
            text: "❌Cancel"
        }
    ]
];

const AdminPanelKeyboard = [
    [
        { text: "Bot Statistics", callback_data: "BotStatistics" },
        { text: "Command Guide", callback_data: "CommandGuide" },
    ],
    [
        { text: "Broadcast Panel", callback_data: "BroadcastPanel" },
        { text: "Channels Panel", callback_data: "Channels" },
    ]
];

const BroadcastKeyboard = [
    [
        { text: "New Broadcast", callback_data: "NewBroadCast" },
    ],
    [
        { text: "Start Timex", callback_data: "StartTimex" },
        { text: "Stop Timex", callback_data: "StopTimex" }
    ],
    [
        { text: "Start Broadcast", callback_data: "StartBroadcast" },
        { text: "Stop Broadcast", callback_data: "StopBroadcast" }
    ],
    [
        { text: "Pending Broadcast", callback_data: "PendingBroadcast" },
        { text: "Remove Broadcast", callback_data: "RemoveBroadcast" }
    ],
    [
        { text: "Back", callback_data: "AdminPanel" }
    ]
];

const ChannelsKeyboard = [
    [
        {
            text: "Add Channel", callback_data: "AddChannel"
        },
        {
            text: "Remove Channel", callback_data: "RemoveChannel"
        }
    ],
    [
        {
            text: "Back", callback_data: "AdminPanel"
        }
    ]
];

module.exports = {
    StartKeyboard,
    CancelKeyboard,
    FormatKeyboard,
    AdminPanelKeyboard,
    BroadcastKeyboard,
    ChannelsKeyboard
};