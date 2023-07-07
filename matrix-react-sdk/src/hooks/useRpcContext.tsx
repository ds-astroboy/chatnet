import { getProgramVersionForRealm } from '../apis/vote'
import { RpcContext } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import useWalletStore from '../stores/vote/useWalletStore'
import useRealm from './useRealm'

export default function useRpcContext() {
  const { realmInfo, realm } = useRealm()
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const getRpcContext = () =>
    new RpcContext(
      new PublicKey(realm!.owner.toString()),
      getProgramVersionForRealm(realmInfo!),
      wallet!,
      connection.current,
      connection.endpoint
    )

  return {
    getRpcContext,
  }
}
