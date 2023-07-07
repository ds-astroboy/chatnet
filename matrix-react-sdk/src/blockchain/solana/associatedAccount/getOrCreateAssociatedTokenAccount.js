import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Transaction } from '@solana/web3.js';
import { sendSolTransaction } from '../../../components/views/dialogs/SolInstruction/sendSolTransaction';
import { createAssociatedTokenAccountInstruction } from "./createAssociatedTokenAccountInstruction";
import { getAccountInfo } from "../getAccountInfo";
import { getAssociatedTokenAddress } from "./getAssociatedTokenAddress"

export const getOrCreateAssociatedTokenAccount = async (
    connection,
    payerPub,
    mintPub,
    ownerPub,
    wallet,
    allowOwnerOffCurve = false,
    programId = TOKEN_PROGRAM_ID,
    associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID
) => {
    const associatedToken = await getAssociatedTokenAddress(
        mintPub,
        ownerPub,
        allowOwnerOffCurve,
        programId,
        associatedTokenProgramId,
    );

    console.log("ownerPub===", ownerPub.toBase58());
    console.log("associatedToken===", associatedToken.toBase58());

    let account;
    try {
        account = await getAccountInfo(
            connection, associatedToken, programId
        )
        console.log("account===", account);
    }
    catch(error) {
        console.error("error: ", error)
        try {
            const transaction = new Transaction().add(
                createAssociatedTokenAccountInstruction(
                    payerPub,
                    associatedToken,
                    ownerPub,
                    mintPub,
                    programId,
                    associatedTokenProgramId,
                )
            )
            await sendSolTransaction(transaction, payerPub.toBase58(), wallet, connection);
        } catch (error) {
            // Ignore all errors; for now there is no API-compatible way to selectively ignore the expected
            // instruction error if the associated account exists already.
        }

        // Now this should always succeed
        account = await getAccountInfo(
            connection, 
            associatedToken, 
            programId
        )
        console.log("account===", account);

    }
    if (!account.mint.equals(mintPub.toBuffer())) throw Error('TokenInvalidMintError')
    if (!account.owner.equals(ownerPub.toBuffer())) throw new Error('TokenInvalidOwnerError')

    return account
}