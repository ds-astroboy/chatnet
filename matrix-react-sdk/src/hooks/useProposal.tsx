import useWalletStore from "../stores/vote/useWalletStore"

export default function useProposal() {
  const routerUrls = location.href.split("/");
  const pk = routerUrls[7];  

  const {
    proposal,
    descriptionLink,
    instructions,
    proposalMint,
    governance,
    proposalOwner,
    } = useWalletStore((s) => s.selectedProposal)

  return {
    pk,
    proposal,
    descriptionLink,
    instructions,
    proposalMint,
    governance,
    proposalOwner,
  }
}
