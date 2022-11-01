const algosdk = require("algosdk");
const events = require("events");
const fs = require("fs");
const crypto = require("crypto");
const readline = require("readline");
require("dotenv").config();
const { Account, getAccount, getClient } = require("./utils");

const GRADUATES_INFO = "./config/aero_graduates.csv";
const CERTIFICATE_METADATA =
  "https://raw.githubusercontent.com/Niceural/create-nft-diplomas/main/diplomas/certificate.json";
const IMPERIAL_ACCOUNT = "./config/imperialAccount.json";

function createNFTTxn(
  params: any,
  account: typeof Account,
  toBeHashed: string
): any {
  const metadataHash = crypto.createHash("sha256");
  metadataHash.update(toBeHashed);
  // console.log(toBeHashed);
  const metadata = new Uint8Array(metadataHash.digest());
  // console.log(metadata);
  const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
    from: account.addr,
    total: 1,
    decimals: 0,
    assetName: "Aeronautical Engineering (H401)",
    unitName: "ICL-MEng-H401",
    assetURL: CERTIFICATE_METADATA,
    assetMetadataHash: metadata,
    defaultFrozen: false,
    freeze: undefined,
    manager: undefined,
    clawback: undefined,
    reserve: undefined,
    suggestedParams: params,
  });
  return txn;
}

async function main() {
  // get imperial account and connect to blockchain
  const account: typeof algosdk.Account = getAccount(IMPERIAL_ACCOUNT);
  const client = getClient(process.env.CLIENT_API_KEY);

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

  for (const line in lines) {
    // create digital certificate
    const params = await client.getTransactionParams().do();
    const txn = createNFTTxn(params, account, line);
    const rawSignedTxn = txn.signTxn(account.sk);
    const sentTx = await client.sendRawTransaction(rawSignedTxn).do();
    // wait for transaction to be confirmed
    const confirmedTxn = await algosdk.waitForConfirmation(
      client,
      sentTx.txId,
      4
    );
    const assetId = confirmedTxn["asset-index"];
    console.log(
      `Certificate created (https://testnet.algoexplorer.io/asset/${assetId})`
    );
    return;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
