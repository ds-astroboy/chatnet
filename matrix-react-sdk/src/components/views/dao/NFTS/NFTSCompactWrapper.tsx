import { getExplorerUrl } from '../explorer/tools';
import ImgWithLoader from '../ImgWithLoader';
import React from 'react';
import useGovernanceAssets from '../../../../hooks/useGovernanceAssets';
import { DEFAULT_NFT_TREASURY_MINT } from '../instructions/tools'
import useRealm from '../../../../hooks/useRealm';
import useTreasuryAccountStore from '../../../../stores/vote/useTreasuryAccountStore';
import useWalletStore from '../../../../stores/vote/useWalletStore';
import { PhotographIcon } from '@heroicons/react/outline';
import Spinner from "../../elements/Spinner";
import AccessibleButton from "../../elements/AccessibleButton";
import dis from "../../../../dispatcher/dispatcher";

const NFTSCompactWrapper = () => {
  const { nftsGovernedTokenAccounts } = useGovernanceAssets()
  const connection = useWalletStore((s) => s.connection)
  const realmNfts = useTreasuryAccountStore((s) => s.allNfts)
  const isLoading = useTreasuryAccountStore((s) => s.isLoadingNfts)

  const showGallery = () => {
    dis.dispatch({
      action: "show_gallery",
      governancePk: DEFAULT_NFT_TREASURY_MINT 
    })
  }

  return nftsGovernedTokenAccounts.length ? (
    <div className="mx_NFTSCompactWrapper">
      <div className="mx_NFTSCompactWrapper_header">
        <div className="mx_NFTSCompactWrapper_title">NFTs</div>
        <AccessibleButton
          className="mx_NFTSCompactWrapper_view"
          onClick={showGallery}
        >
          View all
        </AccessibleButton>
      </div>
      <div
        className="mx_NFTSCompactWrapper_body"
      >
        <div className="mx_NFTSCompactWrapper_nftWrap">
          {isLoading ? (
            <Spinner/>
          ) : realmNfts.length ? (
            realmNfts.map((x, idx) => (
              <a
                className="mx_NFTSCompactWrapper_nft"
                key={idx}
                href={getExplorerUrl(connection.endpoint, x.mint)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <ImgWithLoader
                  className="mx_NFTSCompactWrapper_nft_img"
                  src={x.val.image}
                />
              </a>
            ))
          ) : (
            <div className="mx_NFTSCompactWrapper_empty">
                <PhotographIcon className="mx_NFTSCompactWrapper_empty_icon"></PhotographIcon>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null
}

export default NFTSCompactWrapper
