import type { EndpointTypes, EndpointInfo } from '../@types/connection-endpoint'
import { Connection } from '@solana/web3.js'
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

const ENDPOINTS: EndpointInfo[] = [
  {
    name: 'mainnet',
    url: 'https://api.mainnet.solana.com',
  },
  {
    name: 'devnet',
    url: 'https://api.devnet.solana.com',
  },
  {
    name: 'localnet',
    url: 'http://127.0.0.1:8899',
  },
]

console.log('deployed ENDPOINTS:', ENDPOINTS)

export interface ConnectionContext {
  cluster: EndpointTypes
  current: Connection
  endpoint: string
}

export function getConnectionContext(cluster: string): ConnectionContext { 
  const ENDPOINT = ENDPOINTS.find((e) => e.name === cluster) || ENDPOINTS[0]
  return {
    cluster: ENDPOINT!.name as EndpointTypes,
    current: new Connection(ENDPOINT!.url, 'recent'),
    endpoint: ENDPOINT!.url,
  }
}
