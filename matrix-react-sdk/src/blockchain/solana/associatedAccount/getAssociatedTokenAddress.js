import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'

export const getAssociatedTokenAddress = async (
    mintPub,
    ownerPub,
    allowOwnerOffCurve = false,
    programId = TOKEN_PROGRAM_ID,
    associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID
) => {
    if (!allowOwnerOffCurve && !PublicKey.isOnCurve(ownerPub.toBuffer())) throw new Error('TokenOwnerOffCurveError')

    const [ address ] = await PublicKey.findProgramAddress(
        [
            ownerPub.toBuffer(), 
            programId.toBuffer(), 
            mintPub.toBuffer()
        ],
        associatedTokenProgramId
    )
    
    return address
}
    