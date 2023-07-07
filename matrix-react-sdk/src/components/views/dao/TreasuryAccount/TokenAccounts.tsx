import useGovernanceAssets from '../../../../hooks/useGovernanceAssets'
import { fmtTokenInfoWithMint } from '../../../../tools/sdk/units'
import React from 'react'
import useTreasuryAccountStore from '../../../../stores/vote/useTreasuryAccountStore'
import { GenericSendTokensProps } from './GenericSendTokens'
import Spinner from '../../elements/Spinner'
import AccessibleTooltipButton from '../../elements/AccessibleTooltipButton'
import AccessibleButton from '../../elements/AccessibleButton'

const TokenAccounts: React.FC<{
  setSendTokenInfo: React.Dispatch<
    React.SetStateAction<GenericSendTokensProps | null>
  >
}> = ({ setSendTokenInfo }) => {
  const { canUseTransferInstruction } = useGovernanceAssets()
  const tokenAccounts = useTreasuryAccountStore((s) => s.allTokenAccounts)
  const isLoadingTokenAccounts = useTreasuryAccountStore(
    (s) => s.isLoadingTokenAccounts
  )
  let Button: React.ComponentType<React.ComponentProps<typeof AccessibleButton>> = AccessibleButton;
  if(!canUseTransferInstruction) {
      Button = AccessibleTooltipButton;
  }
  return (
    <div className='mx_TokenAccounts'>
      {isLoadingTokenAccounts ? (
        <Spinner />
      ) : tokenAccounts.length > 0 ? (
        tokenAccounts.map((tokenAccount, index) => (
          <div
            key={index.toString()}
            className="mx_TokenAccounts_account"
          >
            <div className='mx_TokenAccounts_account_token'>{fmtTokenInfoWithMint(tokenAccount)}</div>
            <Button
              title={
                !canUseTransferInstruction
                  ? 'You need to have connected wallet with ability to create token transfer proposals'
                  : ''
              }
              className="mx_TokenAccounts_account_button"
              onClick={() =>
                setSendTokenInfo({
                  mintDecimals: tokenAccount.mintInfo.decimals,
                  tokenSource: tokenAccount.key,
                  mintBeingTransferred: tokenAccount.mint,
                  tokenAccount,
                })
              }
              disabled={!canUseTransferInstruction}
            >
              Send
            </Button>
          </div>
        ))
      ) : (
        <div className="mx_TokenAccounts_empty">
          No Token Accounts Found
        </div>
      )}
    </div>
  )
}

export default TokenAccounts
