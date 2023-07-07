import { getExplorerUrl } from '../explorer/tools'
import { getAccountName } from '../instructions/tools'
import useGovernanceAssets from '../../../../hooks/useGovernanceAssets'
import useRealm from '../../../../hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import { abbreviateAddress, fmtUnixTime } from '../../../../utils/vote/formatting'
import BN from 'bn.js'
import React, { useEffect, useState } from 'react'
import useTreasuryAccountStore from '../../../../stores/vote/useTreasuryAccountStore'
import useWalletStore from '../../../../stores/vote/useWalletStore'
import AccountHeader from './AccountHeader'
import DepositNFT from './DepositNFT'
import SendTokens from './SendTokens'
import GenericSendTokens, { GenericSendTokensProps } from './GenericSendTokens'
import {
  ExternalLinkIcon,
  PlusCircleIcon,
  XCircleIcon,
} from '@heroicons/react/outline'
import ConvertToMsol from './ConvertToMsol'
import useStrategiesStore from '../../../../Strategies/store/useStrategiesStore'
import DepositModal from '../../../../Strategies/components/DepositModal'
import { TreasuryStrategy } from '../../../../Strategies/types/types'
import BigNumber from 'bignumber.js'
import { MangoAccount } from '@blockworks-foundation/mango-client'
import {
  calculateAllDepositsInMangoAccountsForMint,
  MANGO,
  tryGetMangoAccountsForOwner,
} from '../../../../Strategies/protocols/mango/tools'
import useMarketStore from '../../../../Strategies/store/marketStore'
import TokenAccounts from './TokenAccounts'
import AccessibleButton from '../../elements/AccessibleButton'
import AccessibleTooltipButton from '../../elements/AccessibleTooltipButton'
import Spinner from '../../elements/Spinner'
import Modal from '../../../../Modal'

const AccountOverview = () => {
  const currentAccount = useTreasuryAccountStore((s) => s.currentAccount)
  const governanceNfts = useTreasuryAccountStore((s) => s.governanceNfts)
  const nftsCount =
    currentAccount?.governance && currentAccount.isNft
      ? governanceNfts[currentAccount?.governance?.pubkey.toBase58()]?.length
      : 0
  const { symbol } = useRealm()
  const isNFT = currentAccount?.isNft
  const isSol = currentAccount?.isSol
  const { canUseTransferInstruction } = useGovernanceAssets()
  const connection = useWalletStore((s) => s.connection)
  const recentActivity = useTreasuryAccountStore((s) => s.recentActivity)
  const isLoadingRecentActivity = useTreasuryAccountStore(
    (s) => s.isLoadingRecentActivity
  )
  const market = useMarketStore((s) => s)
  const [currentMangoDeposits, setCurrentMangoDeposits] = useState(0)
  const [mngoAccounts, setMngoAccounts] = useState<MangoAccount[]>([])
  const [openNftDepositModal, setOpenNftDepositModal] = useState(false)
  const [openCommonSendModal, setOpenCommonSendModal] = useState(false)
  const [openMsolConvertModal, setOpenMsolConvertModal] = useState(false)
  const accountPublicKey = currentAccount?.transferAddress
  const strategies = useStrategiesStore((s) => s.strategies)
  const [accountInvestments, setAccountInvestments] = useState<
    TreasuryStrategy[]
  >([])
  const [eligibleInvestments, setEligibleInvestments] = useState<
    TreasuryStrategy[]
  >([])
  const [showStrategies, setShowStrategies] = useState(false)
  const [
    genericSendTokenInfo,
    setGenericSendTokenInfo,
  ] = useState<GenericSendTokensProps | null>(null)
  const [
    proposedInvestment,
    setProposedInvestment,
  ] = useState<TreasuryStrategy | null>(null)
  const [isCopied, setIsCopied] = useState<boolean>(false)

  useEffect(() => {
    if (strategies.length > 0) {
      const eligibleInvestments = strategies.filter(
        (strat) =>
          strat.handledMint === currentAccount?.token?.account.mint.toString()
      )
      setEligibleInvestments(eligibleInvestments)
    }
  }, [currentAccount, strategies])
  useEffect(() => {
    const handleGetMangoAccounts = async () => {
      const currentAccountMint = currentAccount?.token?.account.mint
      const currentPositions = calculateAllDepositsInMangoAccountsForMint(
        mngoAccounts,
        currentAccountMint!,
        market
      )
      setCurrentMangoDeposits(currentPositions)

      if (currentPositions > 0) {
        setAccountInvestments(
          eligibleInvestments.filter((x) => x.protocolName === MANGO)
        )
      } else {
        setAccountInvestments([])
      }
    }
    if (eligibleInvestments.filter((x) => x.protocolName === MANGO).length) {
      handleGetMangoAccounts()
    }
  }, [eligibleInvestments, currentAccount, mngoAccounts])
  useEffect(() => {
    const getMangoAcccounts = async () => {
      const accounts = await tryGetMangoAccountsForOwner(
        market,
        currentAccount!.governance!.pubkey
      )
      setMngoAccounts(accounts ? accounts : [])
    }
    if (currentAccount) {
      getMangoAcccounts()
    }
  }, [currentAccount, eligibleInvestments, market])

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isCopied])

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    setIsCopied(true)
  }

  if (!currentAccount) {
    return null
  }

  let SendButton: React.ComponentType<React.ComponentProps<typeof AccessibleButton>> = AccessibleButton;
  if(!canUseTransferInstruction || (isNFT && nftsCount === 0)) {
    SendButton = AccessibleTooltipButton;
  }

  let StakeButton: React.ComponentType<React.ComponentProps<typeof AccessibleButton>> = AccessibleButton;
  if(!canUseTransferInstruction || (isNFT && nftsCount === 0)) {
    StakeButton = AccessibleTooltipButton;
  }

  const showNFTDepositeModal = () => {
    Modal.createTrackedDialog(
      "Deposit NFT",
      "",
      DepositNFT
    )
  }

  const showSendModal = () => {
    Modal.createTrackedDialog(
      "Send Tokens",
      "",
      SendTokens
    )
  }

  return (
    <div className='mx_AccountOverview'>
      <div className="mx_AccountOverview_info">
        <div className="mx_AccountOverview_title">
          {currentAccount?.transferAddress &&
          getAccountName(currentAccount.transferAddress)
            ? getAccountName(currentAccount.transferAddress)
            : accountPublicKey &&
              abbreviateAddress(accountPublicKey as PublicKey)}
        </div>
        <div className="mx_AccountOverview_view">
          {isNFT && (
            <div
              className="mx_AccountOverview_viewCollection"
              onClick={() => {
                // const url = fmtUrlWithCluster(
                //   `/dao/${symbol}/gallery/${currentAccount.transferAddress}`
                // )
                // router.push(url)
              }}
            >
              View Collection
            </div>
          )}
          <a
            className="mx_AccountOverview_viewLink"
            href={
              accountPublicKey
                ? getExplorerUrl(connection.endpoint, accountPublicKey)
                : ''
            }
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className='mx_AccountOverview_viewLink_content'>
              Explorer
            </div>
            <ExternalLinkIcon className="mx_AccountOverview_viewLink_icon" />
          </a>
        </div>
      </div>
      <AccountHeader />
      <div className={`mx_AccountOverview_buttonGroup`}>
        <AccessibleButton
          className="mx_AccountOverview_button copy_address"
          onClick={() =>
            isNFT
              ? showNFTDepositeModal()
              : handleCopyAddress(currentAccount?.transferAddress!.toBase58())
          }
        >
          {isNFT ? 'Deposit' : 'Copy Deposit Address'}
          {isCopied && (
          <div className="mx_AccountOverview_button_tooltip">
            Copied to Clipboard
          </div>
          )}
        </AccessibleButton>
        <SendButton
          title={
            !canUseTransferInstruction
              ? 'You need to have connected wallet with ability to create token transfer proposals'
              : isNFT && nftsCount === 0
              ? 'Please deposit nfts first'
              : ''
          }
          className="mx_AccountOverview_button send"
          onClick={() => showSendModal()}
          disabled={!canUseTransferInstruction || (isNFT && nftsCount === 0)}
        >
          Send
        </SendButton>
        {/* {isSol ? (
          <StakeButton
            className="mx_AccountOverview_button stake"
            onClick={() => setOpenMsolConvertModal(true)}
            disabled={!canUseTransferInstruction}
            title={
                !canUseTransferInstruction &&
                'You need to be connected to your wallet to have the ability to create a staking proposal'
            }
          >
            <div>Stake with Marinade</div>
          </StakeButton>
        ) : null} */}
      </div>
      <div className="mx_AccountOverview_investmentSection">
        <div className="mx_AccountOverview_investmentSection_header">
          <div className="mx_AccountOverview_investmentSection_title">
            {showStrategies ? 'Available Investments' : 'Current Investments'}
          </div>
          <AccessibleButton
            className="mx_AccountOverview_investmentSection_button"
            onClick={() => setShowStrategies(!showStrategies)}
          >
            {showStrategies ? (
              <>
                <XCircleIcon className="mx_AccountOverview_investmentSection_button_icon" />
                <div className='mx_AccountOverview_investmentSection_button_content'>
                  Cancel
                </div>
              </>
            ) : (
              <>
                <PlusCircleIcon className="mx_AccountOverview_investmentSection_button_icon" />
                <div className='mx_AccountOverview_investmentSection_button_content'>
                  New Investment
                </div>
              </>
            )}
          </AccessibleButton>
        </div>
        {showStrategies ? (
          eligibleInvestments.length > 0 ? (
            eligibleInvestments.map((strat, i) => (
              <StrategyCard
                key={strat.handledTokenSymbol + i}
                currentMangoDeposits={currentMangoDeposits}
                onClick={() => setProposedInvestment(strat)}
                strat={strat}
              />
            ))
          ) : (
            <div className="mx_AccountOverview_investmentSection_body">
              <div className="mx_AccountOverview_investmentSection_body_content">
                No investments available for this account
              </div>
            </div>
          )
        ) : accountInvestments.length > 0 ? (
          accountInvestments.map((strat, i) => (
            <StrategyCard
              key={strat.handledTokenSymbol + i}
              strat={strat}
              currentMangoDeposits={currentMangoDeposits}
            />
          ))
        ) : (
          <div className="mx_AccountOverview_investmentSection_body">
            <p className="mx_AccountOverview_investmentSection_body_content">
              No investments for this account
            </p>
          </div>
        )}
      </div>
      {/* Only display owned token accounts if is SOL */}
      {isSol && (
        <div className="mx_AccountOverview_tokenAccount">
          <div className="mx_AccountOverview_tokenAccount_title">Associated Token Accounts</div>
          <TokenAccounts setSendTokenInfo={setGenericSendTokenInfo} />
        </div>
      )}
      <div className='mx_AccountOverview_activity'>
        <div className="mx_AccountOverview_activity_title">Recent Activity</div>
        <div className='mx_AccountOverview_activity_body'>
          {isLoadingRecentActivity ? (
            <Spinner />
          ) : recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <a
                href={
                  activity.signature
                    ? getExplorerUrl(
                        connection.endpoint,
                        activity.signature,
                        'tx'
                      )
                    : ''
                }
                target="_blank"
                rel="noopener noreferrer"
                className="mx_AccountOverview_activity_info"
                key={activity.signature}
              >
                <div className='mx_AccountOverview_activity_signature'>{activity.signature.substring(0, 12)}...</div>
                <div className="mx_AccountOverview_activity_view">
                  <div className="mx_AccountOverview_activity_time">
                    {activity.blockTime
                      ? fmtUnixTime(new BN(activity.blockTime))
                      : null}
                  </div>
                  <ExternalLinkIcon className="mx_AccountOverview_activity_icon" />
                </div>
              </a>
            ))
          ) : (
            <div className="mx_AccountOverview_activity_content">
              No recent activity
            </div>
          )}
        </div>
      </div>

      {/* {proposedInvestment && (
        <DepositModal
          governedTokenAccount={currentAccount}
          mangoAccounts={mngoAccounts}
          currentPosition={currentMangoDeposits}
          apy={proposedInvestment.apy}
          handledMint={proposedInvestment.handledMint}
          onClose={() => {
            setProposedInvestment(null)
          }}
          isOpen={proposedInvestment}
          protocolName={proposedInvestment.protocolName}
          protocolLogoSrc={proposedInvestment.protocolLogoSrc}
          handledTokenName={proposedInvestment.handledTokenSymbol}
          strategyName={proposedInvestment.strategyName}
          createProposalFcn={proposedInvestment.createProposalFcn}
        />
      )} */}
      {/* {openCommonSendModal && (
        <div
          sizeClassName="sm:max-w-3xl"
          onClose={() => {
            setOpenCommonSendModal(false)
          }}
          isOpen={openCommonSendModal}
        >
          <SendTokens />
        </div>
      )} */}
      {/* {openMsolConvertModal && (
        <Modal
          sizeClassName="sm:max-w-3xl"
          onClose={() => {
            setOpenMsolConvertModal(false)
          }}
          isOpen={openMsolConvertModal}
        >
          <ConvertToMsol />
        </Modal>
      )} */}
      {/* {genericSendTokenInfo && (
        <Modal
          sizeClassName="sm:max-w-3xl"
          onClose={() => {
            setGenericSendTokenInfo(null)
          }}
          isOpen={!!genericSendTokenInfo}
        >
          <GenericSendTokens {...genericSendTokenInfo} />
        </Modal>
      )} */}
    </div>
  )
}

interface StrategyCardProps {
  onClick?: () => void
  strat: TreasuryStrategy
  currentMangoDeposits: number
}

const StrategyCard = ({
  onClick,
  strat,
  currentMangoDeposits,
}: StrategyCardProps) => {
  const {
    handledTokenImgSrc,
    strategyName,
    protocolName,
    handledTokenSymbol,
    apy,
  } = strat
  const currentPositionFtm = new BigNumber(
    currentMangoDeposits.toFixed(0)
  ).toFormat()
  return (
    <div className="border border-fgd-4 flex items-center justify-between mt-2 p-4 rounded-md">
      <div className="flex items-center">
        {handledTokenImgSrc ? (
          <img
            src={strat.handledTokenImgSrc}
            className="h-8 mr-3 rounded-full w-8"
          ></img>
        ) : null}
        <div>
          <p className="text-xs">{`${strategyName} ${handledTokenSymbol} on ${protocolName}`}</p>
          <p className="font-bold text-fgd-1">{`${currentPositionFtm} ${handledTokenSymbol}`}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-xs">Interest Rate</p>
          <p className="font-bold text-green">{apy}</p>
        </div>
        {onClick ? (
          <AccessibleButton onClick={onClick}>{`Propose ${strategyName}`}</AccessibleButton>
        ) : null}
      </div>
    </div>
  )
}

export default AccountOverview
