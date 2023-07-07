import {
    SystemProgram,
    PublicKey,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";

export const getSolInstruction = async (
    owner,
    dest,
    amount,
    connection,
    wallet
) => {
    const ownerPub = new PublicKey(owner);
    const destPub = new PublicKey(dest);
    return SystemProgram.transfer({
        fromPubkey: ownerPub,
        toPubkey: destPub,
        lamports: amount * LAMPORTS_PER_SOL, // 10**9 is 1 sol
    }) 
}
