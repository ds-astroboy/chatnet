import { BarrierType } from "../@types/barrier";

export const faqContents = {
    "General": [
        {
            title: "How old must I be to use Cafeteria?",
            content: "You must be at least 13 to use Cafeteria. If you are between the ages of 13 and the age of legal majority in your jurisdiction of residence, you may only use the Cafeteria.gg Services under the supervision of a parent or legal guardian."
        },
        {
            title: "Which devices can I use Cafeteria on?",
            content: "Cafeteria is currently browserbased only. Support for IOS (apple) and Android (Google Play) devices will be made available in the future."
        },
        {
            title: "What is Web2?",
            content: "Web2 is the current version of the internet which we're are all familiar with. It refers to the 21st-century internet applications that have transformed the digital era!"
        },
        {
            title: "What is Web3?",
            content: "Web3 is the third generation of the World Wide Web. It's a vision of a decentralized and open Web with greater utility for users!"
        },
        {
            title: "What is crypto?",
            content: "Crypto is a form of currency that exists digitally and uses digital signatures to keep transactions safe. Cryptocurrencies are decentralized and controlled by many people through a distributed ledger (a list of transactions shared by everyone"
        },
        {
            title: "What are NFTs?",
            content: "NFTs are Non-Fungible Tokens. They're unique cryptographic tokens that exist on a blockchain and can't be replicated. NFTs are minted as a representation of a digital or non-digital asset, and can represent things like artwork, music and trading cards. Tokenizing assets makes buying, selling, and trading them more efficient while reducing the probability of fraud."
        },
        {
            title: "Do I need crypto to use Cafeteria?",
            content: "No, Cafeteria is for everyone! If you're not interested in crypto, you can still enjoy our platform and features! See below to learn about our non-crypto coin, the Cafeteria Credits..."
        },
        {
            title: "What are Cafeteria Credits?",
            content: "Cafeteria Credits are the native ‘in-game’ currency or points for use on the platform. They may be used for tipping other users and groups, and in the future the purchase of services."
        },
        {
            title: "What fees are involved when Tipping or Donating?",
            content: "When tipping or making a donation there is a fee of 15% that is taken off the amount sent. There are no fees on tips or donations of Cafeteria Credits and the KIN cryptocurrency."
        },
        {
            title: "What are the community guidelines?",
            content: "The use of Cafeteria can be summarised as the expectation that all users are honest and respectful to eachother and themselves. Please view our detailed Community Guidelines for more information."
        },
        {
            title: "What is Cafeteria's policy?",
            content: "Cafeteria has a policy that all users should be free to use the platform without fear, harm or abuse; in addition users should not explore or promote any suicidal or self harm themes or actions. Cafeteria will actively take appropriate action working with neccessary law enforcement and health organisations to protect all users. Please view our detailed Community Guidelines for more information."
        },
        {
            title: "Is Cafeteria Secure?",
            content: "All data requests as well as personal data such as emails, wallet addresses and IPs on the platform are fully encrypted using SSL during transport and AES on our servers."
        },
        {
            title: "How is my information stored?",
            content: "Cafeteria takes your data confidentiality and security very seriously, we are registered with The United Kingdom Information Commisioners Office and use industry standard encryption for data storage and transmission. For more details please view our Privacy Policy."
        },
        {
            title: "Does Cafeteria have access to connected wallet?",
            content: "No. You are in full control of your wallet and will be asked to approve transactions such as peer-to-peer tips or purchases. We never have access to your private keys and cannot submit transactions on your behalf."
        }
    ],
    "SiguUp": [
        {
            title: "How do I signup for an account?",
            content: "Go to <a href='https://beta.cafeteria.gg/'>https://beta.cafeteria.gg/</a> > Click 'Create Account' > Enter your details & click 'Register' > Open your confirmation email & click 'Verify Your Email Address' > Proceed to login with your username & password"
        }
    ],
    "Login": [
        {
            title: "How do I login with my account?",
            content: "Go to <a href='https://beta.cafeteria.gg/'>https://beta.cafeteria.gg/</a> > Enter your username & password in the Legacy section"
        },
        {
            title: "How do I login with my crypto wallet?",
            content: "Go to <a href='https://beta.cafeteria.gg/'>https://beta.cafeteria.gg/</a> > Click 'Wallet' in the Web3 section > Select your wallet (Phantom etc.) > Connect your wallet"
        }         
    ],
    "Wallet Connect": [
        {
            title: "How do I connect my wallet?",
            content: "From the home page, click 'Connect Wallet' in the top right corner > Select your wallet (Phantom etc.) > Connect your wallet"
        }
    ],
    "Creating Groups": [
        {
            title: "How do I create a group?",
            content: "From the home page, click 'Create Group' in the top right corner > Enter your group info > Click 'Create'"
        }
    ],
    "Setting Group Barriers": [
        {
            title: "How do I set a Group Barrier with Cafeteria Credits?",
            content: "From the home page, click 'Create Group' in the top right corner > Enter your group info > Click 'Set Credit Barrier > Enter Cafeteria Credits amount > Select 'Balace Check' or 'Pay-to-enter' > Click 'Create'"
        },
        {
            title: "How do I set a Group Barrier with crypto?",
            content: "From the home page, click 'Create Group' in the top right corner > Enter your group info > Click 'Set Crypto or NFT Barrier' > Select 'Cryptocurrency' (your wallet must be connected) > Select cryptocurrency & enter amount > Select 'Balace Check' or 'Pay-to-enter' > Click 'Create'"
        },
        {
            title: "How do I set a Group Barrier with NFTs?",
            content: "From the home page, click 'Create Group' in the top right corner > Enter your group info > Click 'Set Crypto or NFT Barrier' > Select 'Verified NFT' (your wallet must be connected) > Select NFT collection > Click 'Create'"
        }
    ]
}

export const WALLETNAMES = {
    INJECTED: "Metamask"
}

export const PROVIDERNAMES = {
    "SOLANA": "Solana",
    "INJECTED": "injected",
    "WALLETCONNECT": "walletConnect",
    "COINBASE": "coinbase",
    "APTOS": "aptos"
}

export const ENSDOMAINCONTRACTADDRESS = "0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85";

export const PARTNERS = [
    {
        name: "Kreechures",
        logo: require("../../res/img/partners/kreechures.png")
    },
   
    {
        name: "Solana",
        logo: require("../../res/img/partners/solana.svg")
    },
    {
        name: "Bonfida",
        logo: require("../../res/img/partners/bonfida.svg")
    },
    {
        name: "Kin",
        logo: require("../../res/img/partners/kin.svg")
    },
    {
        name: "Cloudflare",
        logo: require("../../res/img/partners/cloudflare.svg")
    }
]

export const SITEDOMAIN = "main.cafeteria.gg";
export const CAFETERIAOFFICIALGROUPID = "!ChJoLyNmuTLpNoMmhT:main.cafeteria.gg"
export const GROUPAWARDS = [
    "FirstColonies"
]

export const USERPANELAWARDS = [
    "BetaTesters",
    "OG"
]

export const BACKPACKAWARDS = [
    "BetaTesters",
    "OG"
]

export const AWARDS = {
    "BetaTesters": {
        name: "Beta Tester",
        logo: require("../../res/img/awards/award-alphabetatester.svg")
    },
    "BaconClub": {
        name: "Bacon Club",
        logo: require("../../res/img/awards/award-baconclub.svg")
    },
    "BonfidaWolves": {
        name: "Bonfida Wolves",
        logo: require("../../res/img/awards/award-bonfidawolves.svg")
    },
    "FirstColonies": {
        name: "First Colonies",
        logo: require("../../res/img/awards/award-firstcolonies.svg")
    },
    "GMSun": {
        name: "GM Sun",
        logo: require("../../res/img/awards/award-gmsun.svg")
    },
    "Kreechures": {
        name: "Kreechures",
        logo: require("../../res/img/awards/award-kreechures.svg")
    },
    "OG": {
        name: "Real OG",
        logo: require("../../res/img/awards/award-og.svg")
    } 
}

export const NOTIFICATIONACTIONS = {
    "SentEmail": "sent_email",
}

export const NOTIFICATIONS = {
    "SentEmail": "Please check your inbox.",
}

export const EXClUSIVITY = {
    [BarrierType.NFTCheck]: "NFT ownership required",
    [BarrierType.WalletCheck]: "Token balance check required",
    [BarrierType.WalletPay]: "Token payment required",
    [BarrierType.PointsCheck]: "Credits balance check required",
    [BarrierType.PointsPay]: "Credits payment required",
    [BarrierType.NFTSoftBarrier]: "NFT verification optional"
}

export const BLOCKCHAINNETWORKS = {
    Solana: "solana",
    Ethereum: "ethereum",
    BSC: "bsc",
    Polygon: "polygon",
    Aptos: "aptos",
}

export const DOMAINNAMEPROVIDERS = {
    Bonfida: "bonfida",
    Ens: "ens"
}

export const METAMASKNETWORKS = {
    ethereum: {
      chainId: `0x${Number(1).toString(16)}`,
      chainName: "Ethereum Mainnet",
      nativeCurrency: {
        name: "Ethereum",
        symbol: "ETH",
        decimals: 18
      },
      rpcUrls: ["https://mainnet.infura.io/v3/"],
      blockExplorerUrls: ["https://etherscan.io"]
    },
    polygon: {
      chainId: `0x${Number(137).toString(16)}`,
      chainName: "Polygon Mainnet",
      nativeCurrency: {
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18
      },
      rpcUrls: ["https://polygon-rpc.com/"],
      blockExplorerUrls: ["https://polygonscan.com/"]
    },
    bsc: {
      chainId: `0x${Number(56).toString(16)}`,
      chainName: "Binance Smart Chain Mainnet",
      nativeCurrency: {
        name: "Binance Chain Native Token",
        symbol: "BNB",
        decimals: 18
      },
      rpcUrls: [
        "https://bsc-dataseed1.binance.org",
        "https://bsc-dataseed2.binance.org",
        "https://bsc-dataseed3.binance.org",
        "https://bsc-dataseed4.binance.org",
        "https://bsc-dataseed1.defibit.io",
        "https://bsc-dataseed2.defibit.io",
        "https://bsc-dataseed3.defibit.io",
        "https://bsc-dataseed4.defibit.io",
        "https://bsc-dataseed1.ninicoin.io",
        "https://bsc-dataseed2.ninicoin.io",
        "https://bsc-dataseed3.ninicoin.io",
        "https://bsc-dataseed4.ninicoin.io",
        "wss://bsc-ws-node.nariox.org"
      ],
      blockExplorerUrls: ["https://bscscan.com"]
    }
  };
