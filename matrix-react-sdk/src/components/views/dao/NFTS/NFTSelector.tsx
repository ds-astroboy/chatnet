import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
} from 'react'
import { PhotographIcon } from '@heroicons/react/solid'
import { PublicKey } from '@solana/web3.js'
import useWalletStore from '../../../../stores/vote/useWalletStore'
import { NFTWithMint } from '../../../../utils/vote/uiTypes/nfts'
import Spinner from '../../elements/Spinner'
import { getNfts } from '../../../../utils/vote/tokens'
export interface NftSelectorFunctions {
handleGetNfts: () => void
}
  
  function NFTSelector(
    {
      ownerPk,
      onNftSelect,
      nftWidth = '150px',
      nftHeight = '150px',
      selectable = true,
      predefinedNfts,
    }: {
      ownerPk: PublicKey
      onNftSelect: (nfts: NFTWithMint[]) => void
      nftWidth?: string
      nftHeight?: string
      selectable?: boolean
      predefinedNfts?: NFTWithMint[]
    },
    ref: React.Ref<NftSelectorFunctions>
  ) {
    const isPredefinedMode = typeof predefinedNfts !== 'undefined'
    const [nfts, setNfts] = useState<NFTWithMint[]>([])
    const [selectedNfts, setSelectedNfts] = useState<NFTWithMint[]>([])
    const connection = useWalletStore((s) => s.connection)
    const [isLoading, setIsLoading] = useState(false)
    const handleSelectNft = (nft: NFTWithMint) => {
      const isSelected = selectedNfts.find((x) => x.mint === nft.mint)
      if (isSelected) {
        setSelectedNfts([...selectedNfts.filter((x) => x.mint !== nft.mint)])
      } else {
        //For now only one nft at the time
        setSelectedNfts([nft])
      }
    }
    const handleGetNfts = async () => {
      setIsLoading(true)
      const nfts = await getNfts(connection.current, ownerPk)
      if (nfts.length === 1) {
        handleSelectNft(nfts[0])
      }
      setNfts(nfts)
      setIsLoading(false)
    }
    useImperativeHandle(ref, () => ({
      handleGetNfts,
    }))
  
    useEffect(() => {
      if (ownerPk && !isPredefinedMode) {
        handleGetNfts()
      }
    }, [ownerPk])
    useEffect(() => {
      if (!isPredefinedMode) {
        onNftSelect(selectedNfts)
      }
    }, [selectedNfts])
    useEffect(() => {
      if (predefinedNfts && isPredefinedMode) {
        setNfts(predefinedNfts)
      }
    }, [predefinedNfts])
    return (
      <div
        className="mx_NFTSelector"
      >
        {!isLoading ? (
          nfts.length ? (
            <div className="mx_NFTSelector_container">
              {nfts.map((x) => (
                <div
                  onClick={() => (selectable ? handleSelectNft(x) : null)}
                  key={x.mint}
                  className={`mx_NFTSelector_nft`}
                >
                  {selectedNfts.find(
                    (selectedNfts) => selectedNfts.mint === x.mint
                  ) && (
                    <div className="selected"></div>
                  )}
                  <img src={x.val.image} />
                </div>
              ))}
            </div>
          ) : (
            <div className="mx_NFTSelector_empty">
              <div className="mx_NFTSelector_empty_content">
                {"Connected wallet doesn't have any NFTs"}
              </div>
              <div className='mx_NFTSelector_empty_imgContainer'>
                <PhotographIcon className="mx_NFTSelector_empty_img"></PhotographIcon>
              </div>
            </div>
          )
        ) : (
          <Spinner></Spinner>
        )}
      </div>
    )
  }
  
  export default forwardRef(NFTSelector)
  