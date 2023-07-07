import React, { useState } from 'react'
import { publicKeyValidationTest } from '../validators/createRealmValidator';
import AccessibleButton from '../../../elements/AccessibleButton';
import Field from '../../../elements/Field';

const AddWalletModal: React.FC<{
  onOk: (wallets: string[]) => void
  onClose: () => void
  isOpen: boolean
}> = ({ isOpen = false, onOk, onClose }) => {
  const [walletAddr, setWalletAddr] = useState('')
  const [hasErrors, setErrors] = useState<string[]>()

  const handleAddWallet = () => {
    const wallets = walletAddr.replace(/ +/gim, '').split(/,|\n/gim)
    const errors: string[] = []
    const parsedWallets: string[] = []
    wallets.forEach((wallet, index) => {
      if (wallet.length) {
        parsedWallets.push(wallet)
        if (!publicKeyValidationTest(wallet)) {
          errors.push(
            `Entry ${index + 1} (${wallet.substr(
              0,
              8
            )}...)  is not a valid public key.`
          )
        }
      }
    })
    if (errors.length) setErrors(errors)
    else {
      onClose()
      setWalletAddr('')
      onOk(parsedWallets)
    }
  }

  const getAddMembersText = () => {
    let message = 'Add Member'
    const wallets = walletAddr.split(/\n/)
    if (wallets.length > 1 && wallets[1].length > 1) message += 's'
    return message
  }

  return (
    <>
      {isOpen && (
        <div 
          className="mx_AddWalletModal"
        >
          <Field
            className='mx_AddWalletModal_walletField'
            label='Member Address'
            placeholder="(e.g: E2MTC...5MCKT)"
            value={walletAddr}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (hasErrors) setErrors(undefined)
              setWalletAddr(e.target.value)
            }}
          />
          {!!hasErrors && (
            <div className="mx_AddWalletModal_error">
              {hasErrors.map((error, index) => (
                <div className="mx_AddWalletModal_error_content" key={index}>
                  {error}
                  <br />
                </div>
              ))}
            </div>
          )}
          <div className="mx_AddWalletModal_buttonGroup">
            <AccessibleButton
              className='mx_AddWalletModal_button cancel'
              onClick={() => {
                onClose()
              }}
            >
              Cancel
            </AccessibleButton>
            <AccessibleButton
              disabled={!walletAddr.length}
              className="mx_AddWalletModal_button add"
              onClick={handleAddWallet}
            >
              {getAddMembersText()}
            </AccessibleButton>
          </div>
        </div>
      )}
    </>
  )
}

export default AddWalletModal
