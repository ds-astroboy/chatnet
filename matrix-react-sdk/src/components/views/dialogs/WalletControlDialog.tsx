import React, { FC } from "react";
import BaseDialog from "../dialogs/BaseDialog";
import AccessibleButton from "../elements/AccessibleButton";

const WalletControlDialog: FC<{
    onFinished(): void;
    wallet: any;
    alert: any;
}> = ({ onFinished, wallet, alert }) => {  

    const copyWalletAddress = () => {
        let temp;
        if (wallet?.account?.publicKey?.toString()) temp = wallet?.account?.publicKey?.toString();
        else temp = wallet?.account || wallet?.publicKey?.toBase58();
        let address = (temp);
        navigator.clipboard.writeText(address);
        alert.success("Copied wallet address!");
        onFinished();
    }

    const disconnectWallet = () => {
        if(wallet?.disconnect) {
            wallet.disconnect();
        }
        else if(wallet?.deactivate) {
            wallet.deactivate();
            window.localStorage.setItem("provider", "");
            alert.error("Wallet Disconnected.")
        }
        onFinished();
    }

    return (
        <BaseDialog className="mx_WalletControlDialog" title="Control Wallet" onFinished={onFinished}>
            <div className="mx_WalletControlDialog_buttonGroup">
                <AccessibleButton 
                    className="mx_WalletControlDialog_button common-btn px-4 py-2 bg-green btn-hover-purple my-4"
                    onClick={copyWalletAddress}
                >
                    <div className="mx_WalletControlDialog_button_logo clipboard"></div>
                    <div className="mx_WalletControlDialog_button_label">
                        Copy Wallet Address
                    </div>
                </AccessibleButton>
                <AccessibleButton 
                    className="mx_WalletControlDialog_button common-btn px-4 py-2 bg-green btn-hover-purple my-4"
                    onClick={disconnectWallet}
                >
                    <div className="mx_WalletControlDialog_button_logo disconnect"></div>
                    <div className="mx_WalletControlDialog_button_label">
                        Wallet Disconnect
                    </div>
                </AccessibleButton>
            </div>
        </BaseDialog>
    )
}

export default WalletControlDialog;