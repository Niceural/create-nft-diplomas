const algosdk = require("algosdk");
const crypto = require("crypto");

const CERTIFICATE_METADATA =
    "https://raw.githubusercontent.com/Niceural/create-nft-diplomas/main/diplomas/certificate.json";

export async function createCertificate(
    account: typeof algosdk.types.Account,
    client: typeof algosdk.Algodv2,
    line: string
): Promise<string> {
    const rawTxn = await createNftTxn(account.addr, client, line);
    const signedTxn = rawTxn.signTxn(account.sk);
    const txn = await client.sendRawTransaction(signedTxn).do();
    const confirmedTxn = await algosdk.waitForConfirmation(client, txn.txId, 4);
    const assetId = confirmedTxn["asset-index"];
    console.log(
        `Certificate created (https://testnet.algoexplorer.io/asset/${assetId})`
    );
    return assetId;
}

async function createNftTxn(
    pk: string,
    client: typeof algosdk.Algodv2,
    toBeHashed: string
): Promise<typeof algosdk.Transaction> {
    const params = await client.getTransactionParams().do();
    // params.fee = 1000;
    // params.flatFee = true;
    const metadataHash: Uint8Array = hashMetadata(toBeHashed);
    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        from: pk,
        total: 1,
        decimals: 0,
        assetName: "Imperial College London",
        unitName: "ICL",
        assetURL: CERTIFICATE_METADATA,
        assetMetadataHash: metadataHash,
        defaultFrozen: false,
        freeze: undefined,
        manager: pk,
        clawback: undefined,
        reserve: undefined,
        suggestedParams: params,
    });
    return txn;
}

function hashMetadata(metadata: string): Uint8Array {
    const hash = crypto.createHash("sha256");
    hash.update(metadata);
    return new Uint8Array(hash.digest());
}
