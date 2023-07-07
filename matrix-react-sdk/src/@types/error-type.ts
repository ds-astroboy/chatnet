export const ErrorType = {
    WalletPay: "wallet.pay",
    WalletCheck: "wallet.check",
    PointsPay: "points.pay",
    PointsCheck: "points.check",
    NftCheck: "nft.check",
    DomainCheck: "domain.check",
    WalletConnect: "wallet.disconnect",
}

export const ErrorText = {
    NftRequirement: "Oops! You don't have the NFT to join this group!",
    NftBuyContent: "Please Buy or Mint NFT to your wallet in order gain entry",
    CryptoRequirement: "Oops! You don't have enough Crypto to join this group!",
    SolDepositeContent: "Please deposit more Sol to your wallet in order gain entry",
    EthDepositeContent: "Please deposit more Eth to your wallet in order gain entry",
    AptDepositeContent: "Please deposit more Apt to your wallet in order gain entry",
    PointsRequirement: "Oops! You don't have enough Cafeteria Credits to join this group!",
    PointsGetContent: "Click here to earn Cafeteria Credits",
    WalletConnectRequirement: "Please make sure your wallet is connected to access this group",
    WalletConnectContent: `If you do not have a wallet, we recommend <a href='https://phantom.app' target='_blank'>Phantom</a>`,
    DomainRequirement: "Oops! You don't have the Domain to join this group!",
    DomainGetContent: `If you'd like to purchase one please go to <a href="https://naming.bonfida.org/#/auctions" target="_blank"> Bonfida Domain Name</a>`,
}

export const MESSAGES = {
    INFFICIENTCREDITS: "Oops! You don't have enough Cafeteria Credits!",
    TIPFAILED: "YOUR CREDIT TIP FAILED DUE TO A CONNECTION TIMEOUT. PLEASE TRY AGAIN LATER.",
    TIPSUCCESS: "CONGRATULATIONS! YOUR CREDIT TIP WAS SUCCESSFUL",
    UPDATEBARRIERSUCCESS: "Group Barrier was updated successfully.",
    UPDATEBARRIERFAILD: "Failed to update group barrier, please try again.",
    UPDATECATEGORYSUCCESS: "Group Category was updated successfully.",
    UPDATECATEGORYFAILED: "Failed to update group category, please try again.",
}

export const CurrencyAmountErrorText = {
    "Cafeteria Credits": {
        minAmount: 1,
        error: "You have to input minimum 1 point."
    },
    Solana: {
        minAmount: 0.0001,
        error: "You have to input minimum 0.0001 sol."
    },
    Kin: {
        minAmount: 1,
        error: "You have to input minimun 1 kin."
    },
    DevCoin: {
        minAmount: 0.001,
        error: "You have to input minimun 0.001"
    },
    BNB: {
        minAmount: 0.001,
        error: "You have to input minimun 0.001"
    },
    Ethereum: {
        minAmount: 0.00001,
        error: "You have to input minimun 0.00001"
    },
    Matic: {
        minAmount: 0.001,
        error: "You have to input minimun 0.001"
    },
    Aptos: {
        minAmount: 0.0001,
        error: "You have to input minimun 0.001"
    }
}