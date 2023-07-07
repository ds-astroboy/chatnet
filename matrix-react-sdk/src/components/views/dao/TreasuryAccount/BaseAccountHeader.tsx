import React from 'react'
import { TokenInfo } from '@solana/spl-token-registry'

const BaseAccountHeader: React.FC<{
  isNFT?: boolean
  tokenInfo?: TokenInfo
  amountFormatted: string
  totalPrice?: string
}> = ({ isNFT, tokenInfo, amountFormatted, totalPrice }) => {
  return (
    <div className="mx_BaseAccountHeader">
      <div className='mx_BaseAccountHeader_container'>
        {(tokenInfo?.logoURI || isNFT) && (
          <img
            className={`mx_BaseAccountHeader_logo`}
            src={isNFT ? '/img/collectablesIcon.svg' : tokenInfo?.logoURI}
          />
        )}
        <div className='mx_BaseAccountHeader_info'>
          <div className="mx_BaseAccountHeader_amount">
            {amountFormatted}{' '}
            <span className="mx_BaseAccountHeader_symbol">
              {!isNFT ? tokenInfo?.symbol : 'NFTS'}
            </span>
          </div>
          <div className="mx_BaseAccountHeader_price">
            {totalPrice && totalPrice !== '0' ? <>${totalPrice}</> : ''}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BaseAccountHeader
