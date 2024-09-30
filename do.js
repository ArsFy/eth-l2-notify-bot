const fs = require("fs");
const api = require("./api");

if (!fs.existsSync("./data.json")) fs.writeFileSync("./data.json", JSON.stringify({
    bsc: {},
    polygon: {}
}));
const data = JSON.parse(fs.readFileSync("./data.json"));

const save = () => fs.writeFileSync("./data.json", JSON.stringify(data));

const AddListener = (account, chat, chain) => {
    account = account.toLowerCase();

    return new Promise((resolve, reject) => {
        if (account.length !== 42) resolve(["地址格式錯誤", false]);
        if (account in data) resolve(["已被添加", false]);

        api.GetTokenTx(account, 0, "desc", chain).then(response => {
            if (response.length === 0) resolve(["無交易紀錄，僅支援添加已有交易紀錄的地址", false]);

            if (account in data[chain]) {
                if (data[chain][account].chat.includes(chat)) resolve(["已被添加", false]);
                else data[chain][account].chat.push(chat);
            }else{
                data[chain][account] = {
                    block: String(Number(response[0].blockNumber) + 1),
                    chat: [chat]
                };
            }
            save();

            resolve(["", true]);
        });
    });
}

const RemoveListener = (account, chain) => {
    account = account.toLowerCase();

    return new Promise((resolve, reject) => {
        if (!(account in data[chain])) resolve(["未被添加", false]);

        delete data[chain][account];
        save();

        resolve(["", true]);
    });
}

const ScanTasks = (callback) => {
    setInterval(async () => {
        for (let chain in data) {
            for (let i in data[chain]) {
                try {
                    const res = await api.GetTokenTx(i, data[chain][i].block, "asc", chain);
    
                    if (res.length > 0) {
                        data[chain][i].block = String(Number(res[res.length - 1].blockNumber) + 1);
                        save();
    
                        (async () => callback(res, i, data[chain][i].chat, chain))();
                    }
                } catch (e) {
                    continue;
                }
            }
        }
    }, 1000 * 15);
}

module.exports = {
    AddListener,
    RemoveListener,
    ScanTasks
}