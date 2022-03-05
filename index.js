import axios from 'axios';
import { LAMPORTS_PER_SOL, Keypair, PublicKey } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { base58_to_binary } from 'base58-js';
import dotenv from 'dotenv';
import promptSync from 'prompt-sync';

import { getCandyMachineAccounts, sleep, getCandyMachineState, mintOneToken } from "./helpers.js";

const prompt = promptSync({ sigint: true });
let option;
let taskCount;
let delay;
let connection;
let secretKey;
let wallet;
let bots = [];
let target_candy_machine_id = ""
let userLink = ""
let quicknode = ""

console.log("----------------------------------------------------------------------------");
console.log("\x1b[34m%s\x1b[0m : User Link", "Option 1");
console.log("\x1b[34m%s\x1b[0m : CMID input", "Option 2");
console.log("\x1b[34m%s\x1b[0m : CMID monitor", "Option 3");
console.log("----------------------------------------------------------------------------");
option = Number(prompt("Which mode would you like to use? "));
taskCount = Number(prompt("How many tasks would you like to run? "));
delay = Number(prompt("What is the retry delay? "));
if(delay < 500) delay = 500
quicknode = String(prompt("Quicknode URL(option): "));

console.log("\x1b[32m%s\x1b[0m", `[${ new Date() }] Starting task...`);
console.log("\x1b[32m%s\x1b[0m", `[${ new Date() }] Connecting to the solana network...`);
console.log("\x1b[33m%s\x1b[0m", `[${ new Date() }] Connected to cluster!`);
console.log("\x1b[32m%s\x1b[0m", `[${ new Date() }] Connecting wallet...`);


secretKey = base58_to_binary(process.env.WALLET_SECRET_KEY);
wallet = new anchor.Wallet(anchor.web3.Keypair.fromSecretKey(secretKey));
console.log("\x1b[33m%s\x1b[0m", `[${ new Date() }] Connected wallet! ADDRESS: ${ wallet.publicKey.toString() }`);

const createBot = async (pubkey) => {
    console.log("pubkey: ", pubkey.toString());
    bots.push(pubkey);

    console.log("**************************************************************");
    console.log("New Candy Machine Found!");
    console.log("CMID: ", pubkey.toString());
    const state = await getCandyMachineState(wallet, pubkey, connection);

    console.log(`\x1b[34m%s\x1b[0m : ${ state.state.itemsRemaining }/${ state.state.itemsAvailable }`, "Available");
    console.log(`\x1b[34m%s\x1b[0m : ${ state.state.price / LAMPORTS_PER_SOL } SOL`, "Price");
    console.log(`\x1b[34m%s\x1b[0m : ${ state.state.isActive ? "Yes" : "No" }`, "MintLive");
    console.log(`\x1b[34m%s\x1b[0m : ${ new Date(Number(state.state.goLiveDate * 1000)) }`, "goLiveDate");
    console.log(`\x1b[34m%s\x1b[0m : ${ state.state.whitelistMintSettings ? "Yes" : "No" }`, "IsWhitelist");
    console.log(`\x1b[34m%s\x1b[0m : ${ state.state.gatekeeper }`, "gateKeeper");
    console.log("**************************************************************");
}

const createBotURL = async (pubkey) => {
    // console.log("pubkey: ", pubkey.toString());
    bots.push(pubkey);

    const monitor = async () => {
        let newUrls = [];
        // ... add funcs
    }
    await monitor();
}

const load = async () => {
    if(option === 3)
    try {
        let accounts = await getCandyMachineAccounts(connection);
        for(let i = 0; i < accounts.length; i ++) {
            let account = accounts[i];
            await createBot(account.pubkey);
            await sleep(delay);
        };
    } catch(e) {}
    else if(option === 2){

        // await createBot(new PublicKey(target_candy_machine_id));
        let pubkey = new PublicKey(target_candy_machine_id)
        console.log("pubkey: ", pubkey.toString());
        bots.push(pubkey);

        console.log("**************************************************************");
        console.log("New Candy Machine Found!");
        console.log("CMID: ", pubkey.toString());
        let state = await getCandyMachineState(wallet, pubkey, connection);
        console.log(`\x1b[34m%s\x1b[0m : ${ state.state.itemsRemaining }/${ state.state.itemsAvailable }`, "Available");
        console.log(`\x1b[34m%s\x1b[0m : ${ state.state.price / LAMPORTS_PER_SOL } SOL`, "Price");
        console.log(`\x1b[34m%s\x1b[0m : ${ state.state.isActive ? "Yes" : "No" }`, "MintLive");
        console.log(`\x1b[34m%s\x1b[0m : ${ new Date(Number(state.state.goLiveDate * 1000)) }`, "goLiveDate");
        console.log(`\x1b[34m%s\x1b[0m : ${ state.state.whitelistMintSettings ? "Yes" : "No" }`, "IsWhitelist");
        console.log(`\x1b[34m%s\x1b[0m : ${ state.state.gatekeeper }`, "gateKeeper");
        console.log("**************************************************************");
        for(var i = 0; i < (taskCount < state.state.itemsRedeemed ? taskCount : state.state.itemsRemaining); i ++){
            state = await getCandyMachineState(wallet, pubkey, connection);
            while(1) {
                if(state.state.gatekeeper === null && state.state.itemsRemaining > 0 && state.state.isActive === true && new Date().getTime() > Number(state.state.goLiveDate) * 1000 )
                    mintOneToken(state, wallet.payer);
                await sleep(delay)
            }
        }
    }
    else if(option === 1){
        console.log("....")
        console.log(userLink)
        try {
            let accounts = await getCandyMachineAccounts(connection);
            for(let i = 0; i < accounts.length; i ++) {
                let account = accounts[i];
                await createBotURL(account.pubkey);
                await sleep(delay);
            };
        } catch(e) {}
    }
}

console.log("\x1b[32m%s\x1b[0m", `[${ new Date() }] Scraping candy machines with hawk-eye...`);

load();
