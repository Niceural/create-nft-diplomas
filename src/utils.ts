const algosdk = require("algosdk");
const fs = require("fs");

export interface Account {
  addr: string;
  sk: Uint8Array;
}

export function getAccount(file: string): Account {
  const temp = JSON.parse(fs.readFileSync(file));
  const account: Account = { addr: temp.addr, sk: new Uint8Array(temp.sk) };
  return account;
}

export function getClient(apiKey: string): typeof algosdk.Algodv2 {
  const baseServer: string = "https://testnet-algorand.api.purestake.io/ps2";
  const port: string = "";
  const token = {
    "X-API-Key": apiKey,
  };
  const client: typeof algosdk.Algodv2 = new algosdk.Algodv2(
    token,
    baseServer,
    port
  );
  return client;
}
