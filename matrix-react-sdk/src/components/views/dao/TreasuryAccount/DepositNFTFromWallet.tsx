import React, { useEffect, useRef, useState } from 'react'
import useTreasuryAccountStore from '../../../../stores/vote/useTreasuryAccountStore'
import useWalletStore from '../../../../stores/vote/useWalletStore'
import { NFTWithMint } from '../../../../utils/vote/uiTypes/nfts'
import { notify } from '../../../../utils/vote/notifications'
import { web3 } from '@project-serum/anchor'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { createATA } from '../../../../utils/vote/ataTools'
import { getTokenAccountsByMint } from '../../../../utils/vote/tokens'
import { sendTransaction } from '../../../../utils/vote/send'
import NFTSelector, { NftSelectorFunctions } from '../NFTS/NFTSelector'
import useGovernanceAssets from '../../../../hooks/useGovernanceAssets'
import NFTAccountSelect from './NFTAccountSelect'
import AccessibleButton from '../../elements/AccessibleButton'
import AccessibleTooltipButton from '../../elements/AccessibleTooltipButton'
import Spinner from '../../elements/Spinner'

const DepositNFTFromWallet = ({ additionalBtns }: { additionalBtns?: any }) => {
  const nftSelectorRef = useRef<NftSelectorFunctions>(null)
  const { setCurrentAccount } = useTreasuryAccountStore()
  const currentAccount = useTreasuryAccountStore((s) => s.currentAccount)
  const { getNfts } = useTreasuryAccountStore()
  const [selectedNfts, setSelectedNfts] = useState<NFTWithMint[]>([])
  const wallet = useWalletStore((s) => s.current)
  const connected = useWalletStore((s) => s.connected)
  const connection = useWalletStore((s) => s.connection)
  const [isLoading, setIsLoading] = useState(false)
  const [sendingSuccess, setSendingSuccess] = useState(false)
  const { nftsGovernedTokenAccounts } = useGovernanceAssets()
  const handleDeposit = async () => {
    setIsLoading(true)
    setSendingSuccess(false)
    try {
      const governance = currentAccount!.governance!.pubkey
      const ConnectedWalletAddress = wallet?.publicKey
      const selectedNft = selectedNfts[0]
      const nftMintPk = new PublicKey(selectedNft.mint)
      const tokenAccountsWithNftMint = await getTokenAccountsByMint(
        connection.current,
        nftMintPk.toBase58()
      )
      //we find ata from connected wallet that holds the nft
      const fromAddress = tokenAccountsWithNftMint.find(
        (x) => x.account.owner.toBase58() === ConnectedWalletAddress?.toBase58()
      )?.publicKey
      //we check is there ata created for nft before inside governance
      const isAtaForGovernanceExist = tokenAccountsWithNftMint.find(
        (x) => x.account.owner.toBase58() === governance.toBase58()
      )

      console.log("=========governance==========", governance.toBase58());
      console.log("=========ConnectedWalletAddress==========", ConnectedWalletAddress);
      console.log("=========selectedNft==========", selectedNft);
      console.log("=========nftMintPk==========", nftMintPk.toBase58());
      console.log("=========tokenAccountsWithNftMint==========", tokenAccountsWithNftMint);
      console.log("=========fromAddress==========", fromAddress);
      console.log("=========isAtaForGovernanceExist==========", isAtaForGovernanceExist);

      const ataPk = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
        TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
        nftMintPk, // mint
        governance! // owner
      )
      console.log("=========ataPk==========", ataPk);

      if (!isAtaForGovernanceExist) {
        await createATA(
          connection.current,
          wallet,
          nftMintPk,
          governance,
          wallet!.publicKey!
        )
      }
      const transaction = new web3.Transaction().add(
        Token.createTransferInstruction(
          TOKEN_PROGRAM_ID,
          fromAddress!,
          ataPk,
          wallet!.publicKey!,
          [],
          1
        )
      )
      await sendTransaction({
        connection: connection.current,
        wallet,
        transaction,
        sendingMessage: 'Depositing NFT',
        successMessage: 'NFT has been deposited',
      })
      setSendingSuccess(true)
      nftSelectorRef.current?.handleGetNfts()
      getNfts(nftsGovernedTokenAccounts, connection.current)
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (sendingSuccess) {
      setCurrentAccount(currentAccount!, connection)
    }
  }, [connected, sendingSuccess])

  let Button: React.ComponentType<React.ComponentProps<typeof AccessibleButton>> = AccessibleButton;
  if(!connected || selectedNfts.length === 0) {
    Button = AccessibleTooltipButton;
  }

  return (
    <div className='mx_DepositNFTFromWallet'>
      <NFTAccountSelect
        onChange={(value) => setCurrentAccount(value, connection)}
        currentAccount={currentAccount}
        nftsGovernedTokenAccounts={nftsGovernedTokenAccounts}
      ></NFTAccountSelect>
      <NFTSelector
        ref={nftSelectorRef}
        ownerPk={wallet!.publicKey!}
        onNftSelect={(selected) => setSelectedNfts(selected)}
      ></NFTSelector>
      <div className="mx_DepositNFTFromWallet_buttonGroup">
        {additionalBtns}
        <Button
          title={
              !connected
                ? 'Please connect your wallet'
                : selectedNfts.length === 0
                ? 'Please select nft'
                : ''
          }
          disabled={!connected || isLoading || selectedNfts.length === 0}
          className="mx_DepositNFTFromWallet_button deposit"
          onClick={handleDeposit}
        >          
          {isLoading?
          <Spinner/>
          :
          <div>Deposit</div>
          }  
        </Button>
      </div>
    </div>
  )
}

export default DepositNFTFromWallet
