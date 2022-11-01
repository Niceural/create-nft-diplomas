const algosdk = require("algosdk");
const events = require("events");
const fs = require("fs");
const crypto = require("crypto");
const readline = require("readline");
require("dotenv").config();
const { Account, getAccount, getClient } = require("./utils");
const { createCertificate } = require("./certificate");

const GRADUATES_INFO = "./config/aero_graduates.csv";
const IMPERIAL_ACCOUNT = "./config/imperialAccount.json";

async function main() {
    // get imperial account and connect to blockchain
    const account = getAccount(IMPERIAL_ACCOUNT);
    const algodClient = getClient(process.env.CLIENT_API_KEY);

    // read graduates file line by line
    const lines: string[] = [];
    try {
        const rl = readline.createInterface({
            input: fs.createReadStream(GRADUATES_INFO),
            crlfDelay: Infinity,
        });
        rl.on("line", async (line: string) => {
            lines.push(line);
        });
        await events.once(rl, "close");
    } catch (err) {
        console.error(err);
    }

    const assetIds: string[] = [];
    for (let i = 0; i < lines.length; i++) {
        assetIds.push(await createCertificate(account, algodClient, lines[i]));
    }
    fs.writeFileSync("./diplomas/assetIds.json", JSON.stringify(assetIds));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
