import React, { FC, useMemo } from "react";
import BaseDialog from "../dialogs/BaseDialog";
import dis from "../../../dispatcher/dispatcher";
import AccessibleButton from "../elements/AccessibleButton";
import { BLOCKCHAINNETWORKS, DOMAINNAMEPROVIDERS } from "../../../@variables/common";


interface IProps {
    wallets?: any,
    onFinished(): void;
    saveDomainName?: any;
}

const DomainCategoryDialog: FC<IProps> = (props) => {
    const showDomainDialog = (domainProvider: string) => {
        let wallet;
        switch(domainProvider) {
            case DOMAINNAMEPROVIDERS.Bonfida:
                wallet = props.wallets?.find(wallet => wallet.type === "solana");
                break;
            case DOMAINNAMEPROVIDERS.Ens:
                wallet = props.wallets?.find(wallet => wallet.type === "ethereum");
                break;
        }

        console.log({wallets: props.wallets, wallet});
        if(!wallet) return;
        props.onFinished();
        dis.dispatch({
            action: "show_domain_name_dialog",
            wallet,
            saveDomainName: props.saveDomainName,
            domainProvider
        });
    }
    return (
        <BaseDialog className="mx_DomainCategoryDialog" title="Blockchain Networks" onFinished={props.onFinished} hasCancel={true}>
            <div className="mx_DomainCategoryDialog_body">
                <AccessibleButton
                    className="mx_DomainCategoryDialog_categoryButton common-btn btn-large my-4 green-btn btn-hover-purple px-4"
                    onClick={() => {showDomainDialog(DOMAINNAMEPROVIDERS.Bonfida)}}
                >
                    <div className="logo img-fill bonfida"></div>
                    <div className="label">Bonfida Domains</div>
                </AccessibleButton>
                <AccessibleButton
                    className="mx_DomainCategoryDialog_categoryButton common-btn btn-large my-4 green-btn btn-hover-purple px-4"
                    onClick={() => {showDomainDialog(DOMAINNAMEPROVIDERS.Ens)}}
                >
                    <div className="logo img-fill ens"></div>
                    <div className="label">Ens Domains</div>
                </AccessibleButton>
            </div>
        </BaseDialog>
    )
}

export default DomainCategoryDialog