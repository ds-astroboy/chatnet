import React from 'react'
import { BN } from '@project-serum/anchor'
import { MintInfo } from '@solana/spl-token'
import { getMintDecimalAmount } from '../../../tools/sdk/units'
import Tooltip from '../elements/Tooltip'

const VotingPowerBox = ({
  votingPower,
  mint,
  votingPowerFromDeposits,
  className = '',
  style,
}: {
  votingPower: BN
  mint: MintInfo
  votingPowerFromDeposits: BN
  className?: string
  style?: any
}) => {
  const votingPowerFmt =
    votingPower && mint
      ? getMintDecimalAmount(mint, votingPower).toFormat(0)
      : '0'

  return (
    <div className={`bg-bkg-1 rounded-md ${className}`} style={style}>
      <p className="text-fgd-3">Votes</p>
      <span className="mb-0 flex font-bold items-center hero-text">
        {votingPowerFmt}{' '}
        {!votingPowerFromDeposits.isZero() && !votingPower.isZero() && (
          <Tooltip label="Vote Weight Multiplier – Increase your vote weight by locking tokens">
            <div className="cursor-help flex font-normal items-center text-xs ml-3 rounded-full bg-bkg-3 px-2 py-1">
              {`${(
                votingPower.toNumber() / votingPowerFromDeposits.toNumber()
              ).toFixed(2)}x`}
            </div>
          </Tooltip>
        )}
      </span>
    </div>
  )
}

export default VotingPowerBox
