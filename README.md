# ETH L2 Notification Bot

[中文](./README.zh.md)

Push ETH L2 transaction notifications on Telegram

## Start

### 1. Clone
```bash
git clone https://github.com/Arsfy/eth-l2-notify-bot.git
cd eth-l2-notify-bot
```

### 1. Config

1. Rename `config.example.json` to `config.json`
2. Set `polygon_token` in [PolygonScan API Key](https://polygonscan.com/myapikey)
3. Set `bsc_token` in [BSC API Key](https://bscscan.com/myapikey)
4. Set `telegram_token` in [@BotFather](https://t.me/BotFather)
5. Set `time_zone`

```json
{
    "polygon_token": "",
    "bsc_token": "",
    "telegram_token": "",
    "time_zone": "Asia/Singapore"
}
```

### 2. Run
```bash
npm i
node main.js
```