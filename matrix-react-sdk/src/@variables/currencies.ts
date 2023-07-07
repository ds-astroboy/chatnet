export const cafeteriaCurrencyList = [
    "Cafeteria Credits",
    // "DevCoin"
]

export const currenciesInfo = {
    "Cafeteria Credits": {
        name: "Cafeteria Credits",
        symbol: "credits",
        logo: require("../../res/img/currency/credit.png")
    },
    Solana: {
        name: "Solana",
        symbol: "sol",
        logo: require("../../res/img/currency/solana.png")
    },
    Aptos: {
        name: "Aptos",
        symbol: "apt",
        logo: require("../../res/img/currency/aptos.png")
    },
    Kin: {
        name: "Kin",
        symbol: "kin",
        mintAddress: "kinXdEcpDQeHPEuQnqmUgtYykqKGVFq6CeVX5iAHJq6",
        logo: require("../../res/img/currency/kin.svg"),
        decimal: 5
    },
    DevCoin: {
        name: "DevCoin",
        symbol: "devcoin",
        mintAddress: "Dzq7krrT43xfDSqGRc48Zkzy3VAVEUG2tvtf39h8MyXx",
        logo: require("../../res/img/currency/devcoin.png"),
        decimal: 9
    },
    Ethereum: {
        name: "Ethereum",
        symbol: "eth",
        logo: require("../../res/img/currency/ethereum.svg"),
        decimal: 18
    },
    BNB: {
        name: "BNB",
        symbol: "bnb",
        logo: require("../../res/img/currency/bnb.svg"),
        decimal: 18
    },
    Matic: {
        name: "Matic",
        symbol: "matic",
        logo: require("../../res/img/currency/matic.svg"),
        mintAddress: "0xc40f25c805249b1cd35c455d5e7e3c5f11732849",
        decimal: 18
    }
}

export const specificCurrencyAmount = {
    "Cafeteria Credits": [25, 50, 100, 1000],
    "Solana": [0.0001, 0.0005, 0.001, 0.1],
    "Kin": [1000, 2500, 5000, 25000],
    "DevCoin": [0.001, 0.005, 0.01, 0.1],
    "BNB": [0.001, 0.004, 0.01, 0.1],
    "Matic": [0.001, 0.004, 0.01, 0.1],
    "Ethereum": [0.00001, 0.00005, 0.0001, 0.01],
    "Aptos": [0.0001, 0.0005, 0.001, 0.1]
}

export const solanaCurrencyList = [
    "Solana",
    "Kin"
]

export const aptosCurrencyList = [
    "Aptos",
]

export const ethCurrencyList = [
    "Ethereum"
]

export const bscCurrencyList = [
    "BNB"
]

export const maticCurrencyList = [
    "Matic"
]

export interface CurrencyType {
    logo: any;
    name: string;
    symbol: string;
    mintAddress?: string;
    deciman?: number;
}