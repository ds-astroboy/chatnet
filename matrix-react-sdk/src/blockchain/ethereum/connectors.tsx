import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";

const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 97, 80001, 137]
});

const walletconnect = new WalletConnectConnector({
  rpc: `https://mainnet.infura.io/v3/d44a0a3a0f5d4a3d9b840b3d36b48e3e`,
  bridge: "https://bridge.walletconnect.org",
  qrcode: true
});

const walletlink = new WalletLinkConnector({
  url: `https://mainnet.infura.io/v3/d44a0a3a0f5d4a3d9b840b3d36b48e3e`,
  appName: "web3-react-demo"
});

export const connectors = {
  injected: injected,
  walletConnect: walletconnect,
  coinbaseWallet: walletlink
};
