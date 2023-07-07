import React, { useEffect, useState } from 'react'
import AddWalletModal from './AddWalletModal'
import { TrashIcon } from '@heroicons/react/solid'
import { PlusCircleIcon } from '@heroicons/react/outline'
import useWalletStore from '../../../../../stores/vote/useWalletStore'
import AccessibleTooltipButton from '../../../elements/AccessibleTooltipButton'
import AccessibleButton from '../../../elements/AccessibleButton'

const TeamWalletField: React.FC<{
  onInsert: (wallets: string[]) => void
  onRemove: (index: number) => void
  wallets?: string[]
}> = ({ wallets = [], onInsert, onRemove }) => {
  const [showAddWalletModal, setShowWalletModal] = useState(false)
  const { current: wallet } = useWalletStore((s) => s)

  const isCurrentWallet = (index: number) =>
    wallets[index] === wallet?.publicKey?.toBase58()

  const handleRemoveWallet = (index: number) => {
    if (!isCurrentWallet(index)) onRemove(index)
  }

  const trashIcon = (
    type: 'disabled' | 'enabled' = 'enabled',
    index: number
  ) => {
    return (
      <TrashIcon
        onClick={() => {
          handleRemoveWallet(index)
        }}
      />
    )
  }

  useEffect(() => {
    if (
      wallet?.publicKey &&
      !wallets.find((addr) => addr === wallet.publicKey?.toBase58())
    ) {
      onInsert([wallet.publicKey?.toBase58()])
    }
  }, [wallets.length, wallet?.publicKey])

  return (
    <div className="mx_TeamWalletField">
      <div className="mx_TeamWalletField_header">Team wallets</div>
      {wallets.map((wallet, index) => (
        <div className="mx_TeamWalletField_member" key={index}>
          <div className='mx_TeamWalletField_member_number'>Member {index + 1}:</div>
          <div className="mx_TeamWalletField_member_detail">
            <div
              className="mx_TeamWalletField_member_address"
            >
              {wallet}
            </div>
            {isCurrentWallet(index) ? (
              <AccessibleTooltipButton 
                className='mx_TeamWalletField_member_icon'
                title="The current wallet is required" 
                onClick={null}
                disabled={true}
              >
                {trashIcon('disabled', index)}
              </AccessibleTooltipButton>
            ) : (
              <AccessibleButton
                onClick={null}
                className={"mx_TeamWalletField_member_icon"}
              >
                {trashIcon('enabled', index)}
              </AccessibleButton>
            )}
          </div>
        </div>
      ))}

      <AddWalletModal
        isOpen={showAddWalletModal}
        onOk={onInsert}
        onClose={() => {
          setShowWalletModal(false)
        }}
      />
      {
        !showAddWalletModal && (
          <AccessibleButton className="mx_TeamWalletField_addButton"
          onClick={() => {
            setShowWalletModal(true)
          }}
        >
          <PlusCircleIcon />
        </AccessibleButton>
        )
      }
    </div>
  )
}

export default TeamWalletField
