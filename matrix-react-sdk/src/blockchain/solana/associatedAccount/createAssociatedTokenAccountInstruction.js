import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { TransactionInstruction, SystemProgram, SYSVAR_RENT_PUBKEY, PublicKey } from '@solana/web3.js'

export const createAssociatedTokenAccountInstruction = (
    payerPub,
    associatedToken,
    ownerPub,
    mintPub,
    programId = TOKEN_PROGRAM_ID,
    associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID
) => {

    const keys = [
        { pubkey: payerPub, isSigner: true, isWritable: true },
        { pubkey: associatedToken, isSigner: false, isWritable: true },
        { pubkey: ownerPub, isSigner: false, isWritable: false },
        { pubkey: mintPub, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: programId, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ]

    return new TransactionInstruction({
        programId: associatedTokenProgramId,
        data: Buffer.alloc(0),
        keys,
    })
}   