# ETH L2 Notification Bot

在 Telegram 推送 ETH L2 交易通知

## Start

### 1. Clone
```bash
git clone https://github.com/Arsfy/eth-l2-notify-bot.git
cd eth-l2-notify-bot
```

### 1. Config

1. 重新命名 `config.example.json` 到 `config.json`
2. 設定 `polygon_token` 在 [PolygonScan API Key](https://polygonscan.com/myapikey)
3. 設定 `bsc_token` 在 [BSC API Key](https://bscscan.com/myapikey)
4. 設定 `telegram_token` 在 [@BotFather](https://t.me/BotFather)
5. 設定 `time_zone`

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