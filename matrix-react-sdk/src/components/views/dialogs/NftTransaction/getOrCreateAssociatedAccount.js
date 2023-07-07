import { PublicKey } from '@solana/web3.js';
import { findAssociatedTokenAccountPublicKey, } from './associatedAccounts';
import { getAccountInfo } from './getAccountInfo';
import { createAssociatedTokenAccount } from './AssociatedAccounts1';

export const getOrCreateAssociatedAccount = async (
    owner,
    mint,
    payer,
    connection
) => {
    let pubOwner = new PublicKey(owner);
    let pubMint = new PublicKey(mint);
    let payerPub = new PublicKey(payer);

    let associatedAddress = await findAssociatedTokenAccountPublicKey(pubOwner, pubMint);
    let ix;
    try {
        let accInfo = await getAccountInfo(associatedAddress, connection);
        return [accInfo, null]
    }
    catch (err) {
        if (err) {
            try {
                ix = await createAssociatedTokenAccount(
                    null,
                    true,
                    pubMint,
                    pubOwner,
                    payerPub,
                    connection
                )
            } catch (err) {
                console.log(err);
            }
        }
    }
    return [associatedAddress, ix];
}