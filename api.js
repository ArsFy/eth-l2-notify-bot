const axios = require("axios");
const config = require("./config.json");

const GetTokenTx = (account, startBlock, sort = "asc", chain) => {
    return new Promise((resolve, reject) => {
        const apiInfo = (()=>{
            switch(chain){
                case "bsc":
                    return {
                        url: "https://api.bscscan.com/api",
                        token: config.bsc_token
                    };
                case "polygon":
                    return {
                        url: "https://api.polygonscan.com/api",
                        token: config.polygon_token
                    };
                default: return "";
            }
        })()

        axios({
            method: "get",
            url: apiInfo.url,
            params: {
                module: "account",
                action: "tokentx",
                address: account,
                startblock: startBlock,
                endblock: 99999999,
                page: 1,
                offset: 10000,
                sort: sort,
                apikey: apiInfo.token
            }
        }).then(response => {
            if (response.data.status === "1") {
                resolve(response.data.result);
            }else{
                reject(response.data.result);
            }
        }).catch(error => {
            console.log(error);
        });
    })
}

module.exports = {
    GetTokenTx
}