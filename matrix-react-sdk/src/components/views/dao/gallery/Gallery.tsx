import { getExplorerUrl } from '../explorer/tools'
import React, { FC, useEffect, useState } from 'react'
import useWalletStore from '../../../../stores/vote/useWalletStore'
import { PhotographIcon, PlusCircleIcon } from '@heroicons/react/outline'
import { NFTWithMint } from '../../../../utils/vote/uiTypes/nfts'
import { DEFAULT_NFT_TREASURY_MINT } from '../instructions/tools'
import useGovernanceAssets from '../../../../hooks/useGovernanceAssets'
import AccountItemNFT from '../TreasuryAccount/AccountItemNFT'
import useTreasuryAccountStore from '../../../../stores/vote/useTreasuryAccountStore'
import ImgWithLoader from '../ImgWithLoader'
import DepositNFT from '../TreasuryAccount/DepositNFT'
import AccessibleButton from "../../elements/AccessibleButton";
import Modal from "../../../../Modal";
import DropDown from "../../elements/Dropdown";
import BaseDialog from "../../dialogs/BaseDialog";
import dis from "../../../../dispatcher/dispatcher";
import Spinner from "../../elements/Spinner";

interface IProps {
    onFinished(): void;
    governancePk: string;
}

const Gallery: FC<IProps> = ({ 
    onFinished,
    governancePk
}) => {
  const connection = useWalletStore((s) => s.connection)
  const realmNfts = useTreasuryAccountStore((s) => s.allNfts)
  const isLoading = useTreasuryAccountStore((s) => s.isLoadingNfts)
  const governanceNfts = useTreasuryAccountStore((s) => s.governanceNfts)
  const { nftsGovernedTokenAccounts } = useGovernanceAssets()
  const fetchAllNftsForRealm = DEFAULT_NFT_TREASURY_MINT === governancePk
  const currentAccount = nftsGovernedTokenAccounts.find(
    (x) => x.governance?.pubkey.toBase58() === governancePk
  )

  console.log("========nftsGovernedTokenAccounts==========", nftsGovernedTokenAccounts);
  console.log("========currentAccount==========", currentAccount);

  const { setCurrentAccount } = useTreasuryAccountStore()
  const [nfts, setNfts] = useState<NFTWithMint[]>([])

  useEffect(() => {
    const governedNfts = governanceNfts[governancePk as string]
    if (fetchAllNftsForRealm) {
      setNfts(realmNfts)
    } else if (governedNfts) {
      setNfts(governanceNfts[governancePk as string])
    }
  }, [realmNfts.length, JSON.stringify(governanceNfts), governancePk])
  const showNFTDepositeModal = () => {
    Modal.createTrackedDialog(
      "Deposit NFT",
      "",
      DepositNFT
    )
  }

  return (
    <BaseDialog className="mx_Gallery" title="NFTs" onFinished={onFinished}>
      <div className="mx_Gallery_header">
        <AccessibleButton
            onClick={() => {
                setCurrentAccount(nftsGovernedTokenAccounts[0], connection)
                showNFTDepositeModal()
            }}
            className="mx_Gallery_button deposit"
        >
            <PlusCircleIcon className="mx_Gallery_button_icon" />
            <div className="mx_Gallery_button_content">
                Deposit NFT
            </div>
        </AccessibleButton>
        <DropDown
            className="mx_Gallery_dropdown"
            onOptionChange={(value) => {
                dis.dispatch({
                    action: "show_gallery",
                    governancePk: value
                })
            }}
            value={currentAccount? currentAccount?.governance?.pubkey.toBase58() : DEFAULT_NFT_TREASURY_MINT}
        >
            <div key={DEFAULT_NFT_TREASURY_MINT} className="mx_Gallery_dropdown_option">
                <div>Show All</div>
                <div>{nfts.length} NFTs</div>
            </div>

            {nftsGovernedTokenAccounts.map((accountWithGovernance) => (
            <div
                key={accountWithGovernance?.governance?.pubkey.toBase58()}
            >
                <AccountItemNFT
                    onClick={() => null}
                    className="m-0 p-0 py-0 px-0 border-0 hover:bg-bkg-2"
                    governedAccountTokenAccount={accountWithGovernance}
                />
            </div>
            ))}
        </DropDown>
    </div>
    <div className="mx_Gallery_body">
        <div className="mx_Gallery_nftWrap">
        {isLoading ? (
            <Spinner/>
        ) : nfts.length ? (
            nfts.map((x, idx) => (
            <a
                className="mx_Gallery_nft"
                key={idx}
                href={
                connection.endpoint && x.mint
                    ? getExplorerUrl(connection.endpoint, x.mint)
                    : ''
                }
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
            >
                <ImgWithLoader
                className="mx_Gallery_nft_img"
                src={x.val.image}
                />
            </a>
            ))
        ) : (
            <div className="mx_Gallery_empty">
                <PhotographIcon className="mx_Gallery_empty_icon" />
            </div>
        )}
        </div>
    </div>
    </BaseDialog>
  )
}

export default Gallery
