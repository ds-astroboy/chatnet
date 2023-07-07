import React, { useState, useEffect, useMemo } from "react";
import useProposal from "../../../../hooks/useProposal";
import { resolveProposalDescription } from "../../../../utils/vote/helpers";
import Spinner from "../../elements/Spinner";
const ProposalInfoCard = React.lazy(() => import("./ProposalInfoCard"));

const ProposalInfo = () => {  
    const [description, setDescription] = useState<string>("");
    const { proposal } = useProposal();

    useEffect(() => {
        const handleResolveDescription = async () => {
          const description = await resolveProposalDescription(proposal.account.descriptionLink!)
          setDescription(description)
        }
        if (proposal.account.descriptionLink) {
          handleResolveDescription()
        }
    }, [proposal.account.descriptionLink])

    return (
        <div className="mx_ProposalInfo">
            <div className="mx_ProposalInfo_title">
                {proposal.account.name}
            </div>
            <div className="mx_ProposalInfo_description">
                {description}
            </div>
            <div className="mx_ProposalInfo_subinfo">
                <div className="mx_ProposalInfo_subinfo_content">The Solana Explorer can be used to view a wallet (by searching for its address) and its token accounts.</div>
                <div className="mx_ProposalInfo_subinfo_content bold">Example</div>
                <div className="mx_ProposalInfo_subinfo_content">Here is an example of a token account on the Solana Explorer, where the token's address, mint(i.e.the Kin token) and the owner of the token account are all displayed.</div>
                <div className="mx_ProposalInfo_subinfo_image">
                    <img src={require("../../../../../res/img/group_suggestion_example.png")}/>
                </div>
                <div className="mx_ProposalInfo_subinfo_note">Note: Under the Token tab with 'Detailed' selected in the drop down</div>                
            </div>
            <React.Suspense fallback={<Spinner></Spinner>}>
                <ProposalInfoCard/>
            </React.Suspense>
        </div>
    )
}

export default ProposalInfo