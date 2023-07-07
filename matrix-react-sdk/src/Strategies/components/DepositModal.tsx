import ModalHeader from './ModalHeader'
import MangoDeposit from './MangoDepositComponent'
import BigNumber from 'bignumber.js'
import React from "react"

const DepositModal = ({
  onClose,
  isOpen,
  handledMint,
  apy,
  protocolName,
  protocolLogoSrc,
  handledTokenName,
  strategyName,
  currentPosition,
  createProposalFcn,
  mangoAccounts,
  governedTokenAccount,
}) => {
  const currentPositionFtm = new BigNumber(
    currentPosition.toFixed(0)
  ).toFormat()
  return (
    <div>
      <ModalHeader
        apy={apy}
        protocolLogoURI={protocolLogoSrc}
        protocolName={protocolName}
        TokenName={handledTokenName}
        strategy={strategyName}
      />

      {protocolName === 'Mango' ? (
        <MangoDeposit
          governedTokenAccount={governedTokenAccount}
          mangoAccounts={mangoAccounts}
          handledMint={handledMint}
          currentPositionFtm={currentPositionFtm}
          createProposalFcn={createProposalFcn}
        ></MangoDeposit>
      ) : null}
    </div>
  )
}

export default DepositModal
