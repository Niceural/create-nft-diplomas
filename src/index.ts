const algosdk = require("algosdk");
const fs = require("fs");
require("dotenv").config();

interface Account {
  addr: string;
  sk: Uint8Array;
}

function getAccount(): Account {
  const accountFile = "./config/account.json";
  const account: Account = JSON.parse(fs.readFileSync(accountFile));
  return account;
}

function getClient(): any {
  const baseServer: string = "https://testnet-algorand.api.purestake.io/ps2";
  const port: string = "";
  const token = {
    "X-API-Key": process.env.CLIENT_API_KEY,
  };
  const algodclient = new algosdk.Algodv2(token, baseServer, port);
  return algodclient;
}

async function main() {
  const account = getAccount();
  const client = getClient();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
