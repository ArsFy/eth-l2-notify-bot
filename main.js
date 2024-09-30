const telegram = require('node-telegram-bot-api');

const todo = require("./do");
const config = require("./config.json")

const bot = new telegram(config.telegram_token, { polling: true });

// Config Check
if (!config.telegram_token || !config.polygon_token || !config.bsc_token) {
    console.log("請完整配置 config.json");
    process.exit();
}

// Get Bot Username
let username = "";
bot.getMe().then((me) => {
    username = me.username;
});

// Error Handling
bot.on("polling_error", (error) => {
    console.log(error);
});

// Message Handling
bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const commands = msg.text.split(" ");

    if (msg.chat.type !== "private") {
        bot.sendMessage(chatId, "不支援群組使用");
        return;
    }

    switch (commands[0]) {
        case "/start": case `/start@${username}`:
            bot.sendMessage(chatId, [
                "歡迎使用 ETH Layer 2 監控 Bot",
                "使用 /listen <address> 添加監控地址",
                "使用 /unlisten <address> 移除監控地址",
            ].join("\n"));
            break;
        case "/listen": case `/listen@${username}`:
            if (commands.length < 2) {
                bot.sendMessage(chatId, "Usage: /listen <address>");
            } else {
                bot.sendMessage(chatId, "請選擇網絡", {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "Polygon", callback_data: `polygon-add_${commands[1]}` }],
                            [{ text: "BSC", callback_data: `bsc-add_${commands[1]}` }]
                        ]
                    },
                    reply_to_message_id: msg.message_id
                });
            }
            break;
        case "/unlisten": case `/unlisten@${username}`:
            if (commands.length < 2) {
                bot.sendMessage(chatId, "Usage: /unlisten <address>");
            } else {
                bot.sendMessage(chatId, "請選擇網絡", {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "Polygon", callback_data: `polygon-remove_${commands[1]}` }],
                            [{ text: "BSC", callback_data: `bsc-remove_${commands[1]}` }]
                        ]
                    },
                    reply_to_message_id: msg.message_id
                });
            }
            break;
    }
});

const handleAddListener = (network, command, userId) => {
    todo.AddListener(command, userId, network).then((response) => {
        if (response[1]) {
            bot.sendMessage(userId, `[${network.toUpperCase()}] 添加成功: ${command}`);
        } else {
            bot.sendMessage(userId, `[${network.toUpperCase()}] 添加失敗: ${response[0]}`);
        }
    });
}

const handleRemoveListener = (network, command, userId) => {
    todo.RemoveListener(command, network).then((response) => {
        if (response[1]) {
            bot.sendMessage(userId, `[${network.toUpperCase()}] 移除成功: ${command}`);
        } else {
            bot.sendMessage(userId, `[${network.toUpperCase()}] 移除失敗: ${response[0]}`);
        }
    });
}

bot.on("callback_query", (query) => {
    const commands = query.data.split("_");

    switch (commands[0]) {
        case "polygon-add":
            handleAddListener("polygon", commands[1], query.from.id);
            break;
        case "bsc-add":
            handleAddListener("bsc", commands[1], query.from.id);
            break;
        case "polygon-remove":
            handleRemoveListener("polygon", commands[1], query.from.id);
            break;
        case "bsc-remove":
            handleRemoveListener("bsc", commands[1], query.from.id);
            break;
    }

    bot.answerCallbackQuery(query.id);
    bot.deleteMessage(query.message.chat.id, query.message.message_id);
});

todo.ScanTasks(async (datalist, account, chat, chain) => {
    const scanInfo = (()=>{
        switch(chain){
            case "bsc": return {
                url: "https://bscscan.com",
                value: 18
            };
            case "polygon": return {
                url: "https://polygonscan.com",
                value: 6
            };
        }
    })();

    for (let i = 0; i < datalist.length; i++) {
        const data = datalist[i];

        const out = data.from === account;
        for (let c in chat) {
            await bot.sendMessage(chat[c], [
                `#${chain.toUpperCase()} 新交易: ` + (out ? "-" : "+") + data.value / (10 ** scanInfo.value) + " " + data.tokenSymbol + "\n",
                `交易類型: ` + (out ? "#轉出" : "#轉入"),
                `交易金額: ${data.value / (10 ** scanInfo.value)} ${data.tokenSymbol}`,
                `出賬地址: \`${data.from}\`` + (out ? " (監控地址)" : ""),
                `入賬地址: \`${data.to}\`` + (!out ? " (監控地址)" : ""),
                `交易時間: ${new Date(data.timeStamp * 1000).toLocaleString("en-US", { timeZone: config.time_zone })} (${config.time_zone})`,
                `交易哈希: \`${data.hash}\``,
                `區塊哈希: \`${data.blockHash}\``,
                `區塊高度: \`${data.blockNumber}\``,
            ].join("\n"), {
                parse_mode: "Markdown", 
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "View Transaction", url: `${scanInfo.url}/tx/${data.hash}` }]
                    ]
                }
            });
        }
    }
})

console.log("Bot is running...");