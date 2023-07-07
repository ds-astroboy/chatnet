/*
Copyright 2020 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import * as React from "react";
import { useState } from "react";

import AutoHideScrollbar from '../../../structures/AutoHideScrollbar';
import { getHomePageUrl } from "../../../../utils/pages";
import { _t } from "../../../../languageHandler";
import SdkConfig from "../../../../SdkConfig";
import * as sdk from "../../../../index";
import NavBar from '../../../structures/NavBar';
import VoteMemberList from "../../../structures/VoteMemberList";
import Spinner from "../../elements/Spinner";
import useWalletStore from "../../../../stores/vote/useWalletStore";
import LoadingScreen from "../../rooms/LoadingScreen";
import LoadingLottie from "../../../../../res/img/cafeteria-loading.json";
import useProposal from "../../../../hooks/useProposal";
import { InstructionPanel } from "../instructions/instructionPanel";
const VoteCard = React.lazy(() => import("./VoteCard"))
const ProposalInfo = React.lazy(() => import("./ProposalInfo"))

interface IProps {
    justRegistered?: boolean;
    onChangeTheme: (isDarkTheme: boolean) => void;
    createLabel?: string
}

const groupInfo = {
    name: "Richie",
    writer_id: "@richietest:main.cafeteria.gg",
    member_number: 150,
    category_name: "Nfts",  
    group_id: "!PKghQtjJjdNOAKDbIo:main.cafeteria.gg"   
}

const voteMembers = [
    {
        user_id: "@king:main.cafeteria.gg",
        vote_status: "Yes"
    },
    {
        user_id: "@richietest:main.cafeteria.gg",
        vote_status: "No"
    },
    {
        user_id: "@victoriia:main.cafeteria.gg",
        vote_status: "Yes"
    }
]

const ProposalWrap = () => {
    const { proposal } = useProposal();
    const routerUrls = location.href.split("/");
    const pk = routerUrls[7]; 
    return (
        <div className="mx_Proposal_Vote_category">
            {proposal && proposal.pubkey.toBase58() === pk?
            <>
                <div className="mx_Proposal_voteWrap">
                    <React.Suspense fallback={<Spinner></Spinner>}>
                        <VoteCard/>
                    </React.Suspense>
                </div>
                <div className="mx_Proposal_infoWrap">
                    <React.Suspense fallback={<Spinner></Spinner>}>
                        <ProposalInfo/>
                    </React.Suspense>
                </div>
            </>
            :
            <Spinner/>
            }            
        </div>
    )
}


const Proposal: React.FC<IProps> = ({ justRegistered = false, onChangeTheme , createLabel}) => {
    const { proposal } = useProposal();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const routerUrls = location.href.split("/");
    const symbol = routerUrls[5];
    const proposalPk = routerUrls[7];  
    const config = SdkConfig.get();
    const pageUrl = getHomePageUrl(config); 

    const {
        actions,
    } = useWalletStore((state) => state);

    React.useEffect(() => {
        getRealmBySymbol();
    }, [])

    const getRealmBySymbol = async() => {
        setIsLoading(true);
        try {
            await actions.fetchRealmBySymbol("devnet", symbol);
            await actions.fetchProposal(proposalPk);
        }
        catch(e) {
            console.error(e);
        }
        setIsLoading(false);   
    }

    if (pageUrl) {
        // FIXME: Using an import will result in wrench-element-tests failures
        const EmbeddedPage = sdk.getComponent('structures.EmbeddedPage');
        return <EmbeddedPage className="mx_Proposal" url={pageUrl} scrollbar={true} />;
    }

    return <AutoHideScrollbar className="mx_Proposal mx_Proposal_default">
        { isLoading && <LoadingScreen label="Loading Proposals..." loadingLottie={LoadingLottie}></LoadingScreen> }    
        <NavBar onChangeTheme={onChangeTheme} createLabel={createLabel}/>
        <div className="mx_Proposal_container">
            <div className="mx_Proposal_wrapper">
                <ProposalWrap/>
            </div>
            <aside className="mx_RightPanel dark-panel" id="mx_RightPanel">
                <VoteMemberList roomId={groupInfo.group_id} members={voteMembers}/>
            </aside>
        </div>
        { (proposal && proposal.pubkey.toBase58() === proposalPk) &&  <InstructionPanel/>}
    </AutoHideScrollbar>;
};

export default Proposal;
