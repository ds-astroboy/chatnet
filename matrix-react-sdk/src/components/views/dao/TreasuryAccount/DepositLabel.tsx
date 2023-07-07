import { getAccountName } from '../instructions/tools'
import { DuplicateIcon } from '@heroicons/react/outline'
import { PublicKey } from '@solana/web3.js'
import { abbreviateAddress } from '../../../../utils/vote/formatting'
import React from 'react'
import AccessibleButton from '../../elements/AccessibleButton'

const DepositLabel = ({
  header = 'Treasury account address',
  abbreviatedAddress = true,
  transferAddress,
}: {
  header?: string
  abbreviatedAddress?: boolean
  transferAddress: PublicKey | undefined | null
}) => {
  return (
    <div className="mx_DepositLabel">
      <div className='mx_DepositLabel_info'>
        <div className="mx_DepositLabel_title">{header}</div>
        {transferAddress && getAccountName(transferAddress) ? (
          <div className="mx_DepositLabel_name">
            {getAccountName(transferAddress)}
          </div>
        ) : null}
        <div className="mx_DepositLabel_address">
          {abbreviatedAddress
            ? abbreviateAddress(transferAddress as PublicKey)
            : transferAddress?.toBase58()}
        </div>
      </div>
      <AccessibleButton
        className="mx_DepositLabel_button"
        onClick={() => {
          navigator.clipboard.writeText(transferAddress!.toBase58())
        }}
      >
        <DuplicateIcon className="mx_DepositLabel_button_icon" />
      </AccessibleButton>
    </div>
  )
}

export default DepositLabel
