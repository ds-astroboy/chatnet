import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { signAndSendTransaction } from "./sendTransaction/sendTransaction";

export const solTransfer = async(
    owner,
    dest,
    amount,
    wallet,
    connection,
    setIsShowConfirmation,
    mxEvent,
    setShowConfirmation
) => {
    const ownerPub = new PublicKey(owner);
    const destPub = new PublicKey(dest);
    const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: ownerPub,
          toPubkey: destPub,
          lamports: amount * LAMPORTS_PER_SOL, // 10**9 is 1 sol
        })
    );

    if(setShowConfirmation) {
        setShowConfirmation(true);
    }
    const { result, error } = await signAndSendTransaction(
        transaction,
        owner,
        wallet,
        connection,
        [],
    )
    if(setShowConfirmation) {
        setShowConfirmation(false);
    }
    return result;
}