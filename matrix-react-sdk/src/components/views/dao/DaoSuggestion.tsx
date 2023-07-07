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
import { useState, Suspense } from "react";

import AutoHideScrollbar from '../../structures/AutoHideScrollbar';
import { getHomePageUrl } from "../../../utils/pages";
import { _t } from "../../../languageHandler";
import SdkConfig from "../../../SdkConfig";
import * as sdk from "../../../index";
import dis from "../../../dispatcher/dispatcher";
import AccessibleButton from "../elements/AccessibleButton";
import NavBar from '../../structures/NavBar';
import { MatrixClientPeg } from "../../../MatrixClientPeg";
import { mediaFromMxc } from "../../../customisations/Media";
import Dropdown from "../elements/Dropdown";
import VoteMemberList from "../../structures/VoteMemberList";
import useWalletStore from "../../../stores/vote/useWalletStore";
import LoadingScreen from "../rooms/LoadingScreen";
import LoadingLottie from "../../../../res/img/cafeteria-loading.json";
import useRealm from "../../../hooks/useRealm";
import {
    ProgramAccount,
    Proposal,
} from '@solana/spl-governance'
import { PublicKey } from "@solana/web3.js";
import Spinner from "../elements/Spinner";
import TokenBalanceCardWrap from "./TokenBalanceCardWrap";
import NFTSCompactWrapper from "./NFTS/NFTSCompactWrapper";
import AccountsCompactWrapper from "./TreasuryAccount/AccountsCompactWrapper";
import AssetsCompactWrapper from "./AssetsList/AssetsCompactWrapper";
import NewProposalBtn from "./proposal/NewProposalBtn";
const DaoInfoCard = React.lazy(() => import('./DaoInfoCard'));
const DaoProposalCard = React.lazy(() => import('./DaoProposalCard'));

interface IProps {
    justRegistered?: boolean;
    onChangeTheme: (isDarkTheme: boolean) => void;
    createLabel? : string;
    symbol?: string;
}

const CategoriesFilterBar: React.FC = () => {
    const [filterInfo, setFilterInfo] = useState("All");
    const filterInfos = [
        "All",
        "Popular",
        "trending",
        "New"
    ]

    const filterOptions = filterInfos.map((item) => {
        return <div key={item}>{ item }</div>
    })

    const onFilterChange = (filter: string) => {
        setFilterInfo(filter);
    }

    return (
        <div className="mx_DaoSuggestion_Categories_Filterbar">
            <div className="mx_DaoSuggestion_filterbar_leftSection">
                <div className="mx_DaoSuggestion_Filterbar_title">
                    Group Suggestions
                </div>
                <div className="mx_DaoSuggestion_Filterbar_newProposalBtn">
                    <NewProposalBtn/>
                </div>
            </div>
            <div className="mx_DaoSuggestion_filterbar_rightSection">
                <div className="mx_DaoSuggestion_filter_select">
                    <Dropdown
                        id="mx_LanguageDropdown"
                        onOptionChange={onFilterChange}
                        searchEnabled={false}
                        value={filterInfo}
                        label={_t("Language Dropdown")}>
                        { filterOptions }
                    </Dropdown>
                </div>
            </div>
        </div>
    )
}

const Proposals: React.FC = ()  => { 
    const { realm, realmInfo, proposals, symbol } = useRealm();
    const [displayedProposals, setDisplayedProposals] = useState<[string, ProgramAccount<Proposal>][]>([]);
    React.useEffect(() => {
        let allProposals = Object.entries(proposals);
        if(allProposals?.length) {
            setDisplayedProposals(allProposals);
        }
    }, [proposals])

    return (
        <>
        {(realm && realmInfo && symbol === realmInfo.realmId.toBase58()) ?
            <div className="mx_DaoSuggestion_suggestions">
                <Suspense fallback={<Spinner></Spinner>}>
                    {
                        displayedProposals.map(([k, v]) => 
                            <DaoProposalCard 
                                key={k} 
                                proposalPk={new PublicKey(k)}
                                proposal={v.account}
                            />                
                        )  
                    }
                </Suspense>
            </div>
            :
            <Spinner></Spinner>
        }
        </>
    )
}

const GroupCategories: React.FC = () => {
    return (
        <div className="mx_DaoSuggestion_Vote_category">
            <div className="mx_DaoSuggestion_group">
                <Suspense fallback={<Spinner></Spinner>}>
                    <DaoInfoCard/>
                </Suspense>
            </div>
            <div className="mx_DaoSuggestion_proposals_wrap">
                <CategoriesFilterBar/>
                <Proposals/>
            </div>
        </div>
    )
}

const DaoSuggestion: React.FC<IProps> = ({ justRegistered = false, onChangeTheme, createLabel, symbol }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const config = SdkConfig.get();
    const pageUrl = getHomePageUrl(config);    
    const {
        actions,
    } = useWalletStore((state) => state);

    if (pageUrl) {
        // FIXME: Using an import will result in wrench-element-tests failures
        const EmbeddedPage = sdk.getComponent('structures.EmbeddedPage');
        return <EmbeddedPage className="mx_DaoSuggestion" url={pageUrl} scrollbar={true} />;
    }

    React.useEffect(() => {
        getRealmBySymbol();
    }, [])

    const getRealmBySymbol = async() => {
        setIsLoading(true);
        try {
            await actions.fetchRealmBySymbol("devnet", symbol);
        }
        catch(e) {
            console.error(e);
        }
        setIsLoading(false);   
    }

    return <AutoHideScrollbar className="mx_DaoSuggestion mx_DaoSuggestion_default">
        { isLoading && <LoadingScreen label="Loading Proposals..." loadingLottie={LoadingLottie}></LoadingScreen> }    
        <NavBar 
            onChangeTheme={onChangeTheme} 
            createLabel={createLabel}
        />
        <div className="mx_DaoSuggestion_container">
            <div className="mx_DaoSuggestion_wrapper">
                <GroupCategories />                
            </div>
            <aside className="mx_DaoSuggestion_rightPanel dark-panel" id="mx_RightPanel">
                <TokenBalanceCardWrap />
                <NFTSCompactWrapper />
                <AccountsCompactWrapper />
                {/* <AssetsCompactWrapper /> */}
            </aside>
        </div>        
    </AutoHideScrollbar>;
};

export default DaoSuggestion;
