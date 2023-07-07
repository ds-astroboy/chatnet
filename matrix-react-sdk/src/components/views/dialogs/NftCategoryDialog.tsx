import React, { FC, useMemo } from "react";
import BaseDialog from "../dialogs/BaseDialog";
import dis from "../../../dispatcher/dispatcher";
import AccessibleButton from "../elements/AccessibleButton";
import { BLOCKCHAINNETWORKS } from "../../../@variables/common";


interface IProps {
    wallets?: any,
    onFinished(): void;
    adjustableNftAvatar?: (img_url: string) => void;
    getNftData?: (data: any) => void;
    searchCollectionAddress?: string;
}

const NftCategoryDialog: FC<IProps> = (props) => {
    const [
        isSolanaWalletConnected,
        isEthWalletConnected,
        isAptosWalletConnected
    ] = useMemo(() => {
        const solanaWallet = props.wallets?.find(wallet => wallet.type === "solana");
        const ethWallet = props.wallets?.find(wallet => wallet.type === "ethereum");
        const aptosWallet = props.wallets?.find(wallet => wallet.type === "aptos");
        return [
            !!solanaWallet,
            !!ethWallet,
            !!aptosWallet
        ];
    }, [props.wallets]);
    const showNftDialog = (network: string) => {
        let wallet;

        switch(network) {
            case BLOCKCHAINNETWORKS.Solana:
                wallet = props.wallets?.find(wallet => wallet.type === "solana");
                break;
            case BLOCKCHAINNETWORKS.Aptos:
                wallet = props.wallets?.find(wallet => wallet.type === "aptos");
                break;
            case BLOCKCHAINNETWORKS.Ethereum:
            case BLOCKCHAINNETWORKS.Polygon:
                wallet = props.wallets?.find(wallet => wallet.type === "ethereum");
                break;
        }

        console.log({"MyWallets": props.wallets, "MyWallet": wallet});
        if(!wallet) return;
        props.onFinished();
        dis.dispatch({
            action: "show_nft_check_dialog",
            wallet,
            adjustableNftAvatar: props.adjustableNftAvatar,
            getNftData: props.getNftData,
            searchCollectionAddress: props.searchCollectionAddress,
            network
        });
    }
    return (
        <BaseDialog className="mx_NftCategoryDialog" title="Blockchain Networks" onFinished={props.onFinished} hasCancel={true}>
            <div className="mx_NftCategoryDialog_body">
                <AccessibleButton
                    className="mx_NftCategoryDialog_categoryButton common-btn btn-large my-4 green-btn btn-hover-purple px-4"
                    onClick={() => {showNftDialog(BLOCKCHAINNETWORKS.Solana)}}
                    disabled={!isSolanaWalletConnected}
                >
                    <div className="logo img-fill solana"></div>
                    <div className="label">Solana</div>
                </AccessibleButton>
                <AccessibleButton
                    className="mx_NftCategoryDialog_categoryButton common-btn btn-large my-4 green-btn btn-hover-purple px-4"
                    onClick={() => {showNftDialog(BLOCKCHAINNETWORKS.Ethereum)}}
                    disabled={!isEthWalletConnected}
                >
                    <div className="logo img-fill ethereum"></div>
                    <div className="label">Ethereum</div>
                </AccessibleButton>
                <AccessibleButton
                    className="mx_NftCategoryDialog_categoryButton common-btn btn-large my-4 green-btn btn-hover-purple px-4"
                    onClick={() => {showNftDialog(BLOCKCHAINNETWORKS.Aptos)}}
                    disabled={!isAptosWalletConnected}
                >
                    <div className="logo img-fill polygon"></div>
                    <div className="label">Aptos</div>
                </AccessibleButton>
            </div>
        </BaseDialog>
    )
}

export default NftCategoryDialog