import {
    Keypair,
    PublicKey,
    Transaction,
    TransactionInstruction,
  } from '@solana/web3.js'
  import {
    ChatMessageBody,
    getGovernanceProgramVersion,
    GOVERNANCE_CHAT_PROGRAM_ID,
    Proposal,
    Realm,
    withPostChatMessage,
    YesNoVote,
  } from '@solana/spl-governance'
  import { ProgramAccount } from '@solana/spl-governance'
  import { RpcContext } from '@solana/spl-governance'
  
  import { Vote } from '@solana/spl-governance'
  
  import { withCastVote } from '@solana/spl-governance'
  import { sendTransaction } from '../utils/vote/send'
  import { VotingClient } from '../utils/vote/uiTypes/VotePlugin'
  
  export async function castVote(
    { connection, wallet, programId, walletPubkey }: RpcContext,
    realm: ProgramAccount<Realm>,
    proposal: ProgramAccount<Proposal>,
    tokeOwnerRecord: PublicKey,
    yesNoVote: YesNoVote,
    message?: ChatMessageBody | undefined,
    votingPlugin?: VotingClient
  ) {
    const signers: Keypair[] = []
    const instructions: TransactionInstruction[] = []
  
    const governanceAuthority = walletPubkey
    const payer = walletPubkey
    // Explicitly request the version before making RPC calls to work around race conditions in resolving
    // the version for RealmInfo
    const programVersion = await getGovernanceProgramVersion(
      connection,
      programId
    )
  
    //will run only if any plugin is connected with realm
    const plugin = await votingPlugin?.withCastPluginVote(
      instructions,
      proposal.pubkey
    )

    console.log("===============instructions================", instructions);
    console.log("===============programId================", programId.toBase58());
    console.log("===============programVersion================", programVersion);
    console.log("===============realm.pubkey================", realm.pubkey.toBase58());
    console.log("===============proposal.account.governance================", proposal.account.governance.toBase58());
    console.log("===============proposal.pubkey================", proposal.pubkey.toBase58());
    console.log("===============proposal.account.tokenOwnerRecord================", proposal.account.tokenOwnerRecord.toBase58());
    console.log("===============tokeOwnerRecord================", tokeOwnerRecord.toBase58());
    console.log("===============governanceAuthority================", governanceAuthority.toBase58());
    console.log("===============proposal.account.governingTokenMint================", proposal.account.governingTokenMint.toBase58());
    await withCastVote(
      instructions,
      programId,
      programVersion,
      realm.pubkey,
      proposal.account.governance,
      proposal.pubkey,
      proposal.account.tokenOwnerRecord,
      tokeOwnerRecord,
      governanceAuthority,
      new PublicKey("KinDesK3dYWo3R2wDk6Ucaf31tvQCCSYyL8Fuqp33GX"),
      Vote.fromYesNoVote(yesNoVote),
      payer,
      plugin?.voterWeightPk,
      plugin?.maxVoterWeightRecord
    )
  
    if (message) {
      const plugin = await votingPlugin?.withUpdateVoterWeightRecord(
        instructions,
        'commentProposal'
      )
      await withPostChatMessage(
        instructions,
        signers,
        GOVERNANCE_CHAT_PROGRAM_ID,
        programId,
        realm.pubkey,
        proposal.account.governance,
        proposal.pubkey,
        tokeOwnerRecord,
        governanceAuthority,
        payer,
        undefined,
        message,
        plugin?.voterWeightPk
      )
    }
  
    const transaction = new Transaction()
    transaction.add(...instructions)
  
    await sendTransaction({ transaction, wallet, connection, signers })
  }
  