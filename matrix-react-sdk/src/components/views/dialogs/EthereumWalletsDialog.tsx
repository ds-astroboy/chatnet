import React, { FC, useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { connectors } from "../../../blockchain/ethereum/connectors";
import AccessibleButton from "../elements/AccessibleButton";
import Modal from 'react-bootstrap/Modal';
import { PROVIDERNAMES } from "../../../@variables/common";
import { useLocalStorageState } from "../../../hooks/useLocalStorageState";

interface IProps {
    show: boolean;
    handleEthereumWalletsModal: (value: boolean) => void;
}

const EthereumWalletsDialog: FC<IProps> = (props) => {
    const { activate } = useWeb3React();
    const handleClose = () => props.handleEthereumWalletsModal(false);
    const [, setProvider] = useLocalStorageState("provider", null);

    return (
        <Modal
            {...props}
            className="mx_EthereumWalletsModal"
            size="sm"
            centered
            onHide={handleClose}
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Select Wallet
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <AccessibleButton
                    className="mx_EthereumWalletsModal_button"
                    onClick={() => {
                        activate(connectors.coinbaseWallet);
                        setProvider(PROVIDERNAMES.COINBASE);
                        handleClose();
                    }}
                >
                    <div className="mx_EthereumWalletsModal_button_label">
                        Coinbase Wallet
                    </div>
                    <div className="mx_EthereumWalletsModal_button_logo coinbase img-fill"></div>
                </AccessibleButton>
                <AccessibleButton
                    className="mx_EthereumWalletsModal_button"
                    onClick={() => {
                        activate(connectors.walletConnect);
                        setProvider(PROVIDERNAMES.WALLETCONNECT);
                        handleClose();
                    }}
                >
                    <div className="mx_EthereumWalletsModal_button_label">
                        Wallet Connect
                    </div>
                    <div className="mx_EthereumWalletsModal_button_logo wallet-connect img-fill"></div>
                </AccessibleButton>
                <AccessibleButton
                    className="mx_EthereumWalletsModal_button"  
                    onClick={() => {
                        activate(connectors.injected);
                        setProvider(PROVIDERNAMES.INJECTED);
                        handleClose();
                    }}
                >
                    <div className="mx_EthereumWalletsModal_button_label">
                        Metamask
                    </div>
                    <div className="mx_EthereumWalletsModal_button_logo metamask img-fill"></div>
                </AccessibleButton>
            </Modal.Body>
        </Modal>
    )
}

export default EthereumWalletsDialog;