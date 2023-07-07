import React from "react";
import { Web3ReactProvider } from "@web3-react/core";
import { ethers } from "ethers";

const EthWalletProvider = (props) => {

    const getLibrary = (provider) => {
        const library = new ethers.providers.Web3Provider(provider);
        library.pollingInterval = 8000; // frequency provider is polling
        return library;
    };

    return (
        <Web3ReactProvider getLibrary={getLibrary}>
            {props.children}
        </Web3ReactProvider>
    )
}

export default EthWalletProvider