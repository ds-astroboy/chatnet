import React, { FC, useState } from 'react'
import useWalletStore from '../../../../stores/vote/useWalletStore'
import DepositNFTFromWallet from './DepositNFTFromWallet'
import DepositNFTAddress from './DepositNFTAddress'
import useTreasuryAccountStore from '../../../../stores/vote/useTreasuryAccountStore'
import { abbreviateAddress } from '../../../../utils/vote/formatting'
import { ArrowLeftIcon, ExternalLinkIcon } from '@heroicons/react/solid'
import { getExplorerUrl } from '../explorer/tools'
import AccessibleButton from '../../elements/AccessibleButton'
import AccessibleTooltipButton from '../../elements/AccessibleTooltipButton'
import BaseDialog from "../../dialogs/BaseDialog";

enum DepositState {
  DepositNFTFromWallet,
  DepositNFTAddress,
}

interface IProps {
  onFinished(): void;
}

const DepositNFT: FC<IProps> = ({ onFinished }) => {
  const currentAccount = useTreasuryAccountStore((s) => s.currentAccount)
  const connection = useWalletStore((s) => s.connection)
  const connected = useWalletStore((s) => s.connected)
  const [
    currentDepositView,
    setCurrentDepositView,
  ] = useState<DepositState | null>(null)
  let DepositButton: React.ComponentType<React.ComponentProps<typeof AccessibleButton>> = AccessibleButton;
  if(!connected) {
    DepositButton = AccessibleTooltipButton
  }
  return (
    <BaseDialog className="mx_DepositNFT" title="" onFinished={onFinished}>
      <div className="mx_DepositNFT_header">
        {currentDepositView !== null && (
          <ArrowLeftIcon
            className="mx_DepositNFT_prevButton"
            onClick={() => setCurrentDepositView(null)}
          />
        )}
        Deposit NFT to
        {currentAccount
          ? abbreviateAddress(currentAccount!.governance!.pubkey)
          : ''}
        <a
          href={
            currentAccount?.governance?.pubkey
              ? getExplorerUrl(
                  connection.endpoint,
                  currentAccount!.governance!.pubkey.toBase58()
                )
              : ''
          }
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLinkIcon className="mx_DepositNFT_linkIcon" />
        </a>
      </div>
      {currentDepositView === null && (
        <div className="mx_DepositNFT_buttonGroup">
          <DepositButton
            title={!connected && 'Please connect your wallet'}
            className="mx_DepositNFT_button deposit_from_wallet"
            disabled={!connected}
            onClick={() =>
              setCurrentDepositView(DepositState.DepositNFTFromWallet)
            }
          >
              <div>Deposit NFT from my wallet</div>
          </DepositButton>
          <AccessibleButton
            className="mx_DepositNFT_button deposit_to_address"
            onClick={() =>
              setCurrentDepositView(DepositState.DepositNFTAddress)
            }
          >
            <div>Deposit NFT to Treasury account address</div>
          </AccessibleButton>
        </div>
      )}
      {currentDepositView === DepositState.DepositNFTFromWallet && (
        <DepositNFTFromWallet></DepositNFTFromWallet>
      )}
      {currentDepositView === DepositState.DepositNFTAddress && (
        <DepositNFTAddress
          additionalBtns={
            <AccessibleButton onClick={onFinished}>Close</AccessibleButton>
          }
        ></DepositNFTAddress>
      )}
    </BaseDialog>
  )
}

export default DepositNFT
