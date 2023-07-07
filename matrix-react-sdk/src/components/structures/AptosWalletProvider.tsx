import * as React from "react";
import { useMemo, useEffect, useState } from "react";

import { NightlyWallet } from "@nightlylabs/aptos-wallet-adapter-plugin";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { RiseWallet } from "@rise-wallet/wallet-adapter";
import { MSafeWalletAdapter } from "msafe-plugin-wallet-adapter";
import { WalletConnector } from "@aptos-labs/wallet-adapter-mui-design";

import {
  AptosWalletAdapterProvider,
  NetworkName,
} from "@aptos-labs/wallet-adapter-react";


const AptosWalletProvider = props => {    
    const wallets = [
            new PetraWallet(), new MSafeWalletAdapter(), new NightlyWallet(), new RiseWallet()
        ]
    return (
        <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
            {props.children}
        </AptosWalletAdapterProvider>
    );
}

export default AptosWalletProvider

