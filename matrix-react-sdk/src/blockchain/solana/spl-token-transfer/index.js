import { Transaction, PublicKey, LAMPORTS_PER_SOL, TransactionInstruction } from '@solana/web3.js'
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { getOrCreateAssociatedTokenAccount } from '../associatedAccount/getOrCreateAssociatedTokenAccount'
import { createTransferInstruction } from './createTransferInstruction'
import { signAndSendTransaction } from "../sendTransaction/sendTransaction";
import { currenciesInfo } from '../../../@variables/currencies'
import { sleep } from '@project-serum/common';

export const sendSplToken = async(
    owner, 
    dest, 
    payer, 
    mint, 
    amount,
    connection,
    wallet,
    setIsShowConfirmation, 
    mxEvent,
    setShowConfirmation
) => {
    let transactionResult = false;
    let transactionError = null;
    if(setShowConfirmation) {
        setShowConfirmation(true);
    }
    try {        
        const ownerPub = new PublicKey(owner);
        const destPub = new PublicKey(dest);
        const payerPub = new PublicKey(payer);
        const mintPub = new PublicKey(mint);
        const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            payerPub,
            mintPub,
            ownerPub,
            wallet
        )
        const toTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            payerPub,
            mintPub,
            destPub,
            wallet
        )      
        const transaction = new Transaction();

        if(mintPub.toBase58() === currenciesInfo["Kin"].mintAddress) {
            /**
             * Iterate through all Kin balances and get the largest balance the user has available to avoid failed transactions
             *  
            */ 
            // console.log("kin tip started");

            // await sleep(2000)
            // let kin = await connection.getParsedTokenAccountsByOwner(ownerPub, { mint: mintPub });
            // console.log("kin: ", kin);
            // let tempKin = 0.0;
            // let largestKinAccount = new PublicKey("kinXdEcpDQeHPEuQnqmUgtYykqKGVFq6CeVX5iAHJq6");
            // for (const singleAccount of kin.value) {
            //     console.log("singleAccount: ", singleAccount);

            //     let tokenAmount = await connection.getTokenAccountBalance(
            //       singleAccount.pubkey
            //     );
            //     console.log("tokenAmount: ", tokenAmount);

          
            //     if (tokenAmount.value.uiAmount) {
            //       if (tokenAmount.value.uiAmount > tempKin) {
            //         tempKin = tokenAmount.value.uiAmount;
            //         largestKinAccount = singleAccount.pubkey;
            //       }
            //     }
            // }
          
            // let getKinAccount = largestKinAccount;
            // console.log("getKinAccount: ", getKinAccount);

            /**
             * Generate our Kin Memo Instructions for tracking P2P transactions
             * Our KIN AppIndex ID is: 386 - and the below memo was generated using:
             * https://laboratory.kin.org/memo
             */

            const appIndexMemoInstruction = new TransactionInstruction({
                keys: [{ pubkey: ownerPub, isSigner: true, isWritable: true }],
                data: Buffer.from(
                        "ZQgGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
                        "utf-8"
                    ),
                programId: new PublicKey("Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo"),
            });

            const transferInstruction = createTransferInstruction(
                fromTokenAccount.address, // from (should be a token account)
                toTokenAccount.address, // to (should be a token account)
                ownerPub, // owner of from
                amount, // amount, if your decimals is 8, send 10^8 for 1 token
                [], // for multisig account, leave empty.
                TOKEN_PROGRAM_ID // always TOKEN_PROGRAM_ID
                );
            transaction
            .add(appIndexMemoInstruction)
            .add(transferInstruction)
        }
        else {
            transaction.add(
                createTransferInstruction(
                    fromTokenAccount.address, // source
                    toTokenAccount.address, // dest
                    ownerPub,
                    amount,
                    [],
                    TOKEN_PROGRAM_ID
                )
            )
        }

        const { result, error } = await signAndSendTransaction(transaction, owner, wallet, connection, [], setIsShowConfirmation, mxEvent);
        transactionError = error;
        transactionResult = result;
        
    }
    catch(error) {
        transactionError = error;
        console.warn(error);
    }
    if(setShowConfirmation) {
        setShowConfirmation(true);
    }
    return { result: transactionResult, error: transactionError }
}