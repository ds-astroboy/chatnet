import * as React from "react";
import { useMemo, useEffect, useState } from "react";

import { clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  getPhantomWallet,
//   getSlopeWallet,
  getSolflareWallet,
  getSolflareWebWallet,
  getSolletWallet,
  getSolletExtensionWallet,
  getCoin98Wallet,
  getMathWallet,
} from '@solana/wallet-adapter-wallets';

import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'; 

import { NightlyWallet } from "@nightlylabs/aptos-wallet-adapter-plugin";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { RiseWallet } from "@rise-wallet/wallet-adapter";
import { MSafeWalletAdapter } from "msafe-plugin-wallet-adapter";
import { WalletConnector } from "@aptos-labs/wallet-adapter-mui-design";

import {
  AptosWalletAdapterProvider,
  NetworkName,
} from "@aptos-labs/wallet-adapter-react";


const WalletContainer = props => {    
    const network = "mainnet-beta" as WalletAdapterNetwork;
    const endpoint = useMemo(() => clusterApiUrl(network), []);  
    const wallets = useMemo(
        () => [
            getPhantomWallet(),
            // getSlopeWallet(),
            getSolflareWallet(),
            getSolflareWebWallet(),
            getCoin98Wallet(),
            getMathWallet(),
            getSolletWallet({network}),
            getSolletExtensionWallet({network}),
        ],
        []
    );
    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect> 
            {
                props.children
            }                       
            </WalletProvider>
        </ConnectionProvider>
    );
}

export default WalletContainer

