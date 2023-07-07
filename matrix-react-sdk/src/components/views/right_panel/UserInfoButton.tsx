import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import UserMenu from '../../structures/UserMenu';
import classNames from "classnames";
import { MatrixClientPeg } from '../../../MatrixClientPeg';
import { useWeb3React } from '@web3-react/core';
import { useAlert } from 'react-alert'
import { PROVIDERNAMES } from '../../../@variables/common';
import { Connection } from '@solana/web3.js';

const UserInfoButton = () => {
    const alert = useAlert();

    const UserInfoButtonClassName = classNames({
        mx_RoomHeader_UserInfoButton: true,
    })

    return (
        <div className={UserInfoButtonClassName}>
            <UserMenu
                isMinimized={true}
                showWalletButton={true}
                alert={alert}
            />
        </div>
    )
}

export default UserInfoButton;