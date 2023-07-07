import { PublicKey, Transaction } from "@solana/web3.js";

export const signTransaction = async(
    transaction,
    owner,
    wallet,
    connection,
    signersExceptWallet = [],
) => {
    try{
        const ownerPub = new PublicKey(owner);
        console.log("Getting recent blockhash");
        transaction.recentBlockhash = (await connection.getRecentBlockhash("max")).blockhash;
        transaction.setSigners(
            ...([ownerPub]), //change user
            ...signersExceptWallet.map(s => s.publicKey)
        );
        signersExceptWallet.forEach(acc => {
            transaction.partialSign(acc);
        });
        console.log("==========transaction==========", transaction);
        console.log("Sending signature request to wallet");
        const signed = await wallet.signTransaction(transaction);
        return { result: true, signedTransaction: signed }
    } catch (e) {
        console.warn(e);
        console.log(`Error: ${e.message}`);
        return { result: false, signedTransaction: null}
    }
}