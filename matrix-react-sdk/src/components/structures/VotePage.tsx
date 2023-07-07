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
import { useContext, useState } from "react";

import AutoHideScrollbar from './AutoHideScrollbar';
import { getHomePageUrl } from "../../utils/pages";
import { _t } from "../../languageHandler";
import SdkConfig from "../../SdkConfig";
import * as sdk from "../../index";
import dis from "../../dispatcher/dispatcher";
import AccessibleButton from "../views/elements/AccessibleButton";
import Analytics from "../../Analytics";
import CountlyAnalytics from "../../CountlyAnalytics";
import NavBar from './NavBar';
import Dropdown from "../views/elements/Dropdown";
import classNames from "classnames";
import { getAllCategories } from "../../apis";
import { getRealms, PROGRAM_VERSION_V1, Realm, ProgramAccount } from '@solana/spl-governance';
import { PublicKey } from '@solana/web3.js';
import { 
    useWallet
} from "@solana/wallet-adapter-react";
import useWalletStore from "../../stores/vote/useWalletStore";
import LoadingScreen from "../views/rooms/LoadingScreen";
import LoadingLottie from "../../../res/img/cafeteria-loading.json";
import BaseAvatar from "../views/avatars/BaseAvatar";
import { RealmInfo } from "../../apis/vote";

const programId = new PublicKey('GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw');

const onClickNewRoom = () => {
    Analytics.trackEvent('home_page', 'button', 'create_room');
    CountlyAnalytics.instance.track("home_page_button", { button: "create_room" });
    dis.dispatch({ action: 'view_create_room' });
};

interface IProps {
    justRegistered?: boolean;
    onChangeTheme: (isDarkTheme: boolean) => void;
    isMinimized: boolean;
}

const FirstBackground: React.FC<{showCreateDaoDialog(): void}> = ({
    showCreateDaoDialog
}) => {
    return (
            <div className="mx_VotePage_First_background">
                <div className="mx_VotePage_introSection">
                    <div className="mx_VotePage_introSection_title">
                        Become self governing and decentralize your group. Your Group, your power
                    </div>
                    <div className="mx_VotePage_introSection_button_group">
                        <AccessibleButton onClick={showCreateDaoDialog} className="mx_VotePage_button_createGroup">
                            { `Create DAO` }
                        </AccessibleButton>
                        <AccessibleButton onClick={null} className="mx_VotePage_button_learn">
                            <div className="mx_VotePage_button_learn_img">
                                <img src={require("../../../res/img/camera.png")}/>
                            </div>
                            <div className="mx_VotePage_button_learn_content">
                                { _t("Learn") }
                            </div>
                        </AccessibleButton>
                    </div>
                </div>
            </div>
    )
}

const GroupCategoriesHeader = ({
    setSeletedCategory,
    selectedCategory
}) => {
    const [categories, setCategories] = useState(["All"]);
    const handCategoryClick = (category: string) => {
        setSeletedCategory(category)
    }

    React.useEffect(() => {
        const getInitialData = async() => {
            let allCategories = [];
            allCategories = await getAllCategories();
            setCategories(["All", ...allCategories]);
        }
        getInitialData();
    }, [])

    return (
        <div className="mx_VotePage_Vote_categories_header">
            <div className="mx_VotePage_Vote_categories_header_container">
            {
                categories.map((category: string) => {
                    return (
                        <div 
                            key={category} 
                            className={`mx_VotePage_category ${selectedCategory === category?"selected" : ""}`} 
                            onClick={() => handCategoryClick(category)}
                        >
                            {category}
                        </div>
                    )
                })                 
            }
            </div>
        </div>
    )
}

const CategoriesFilterBar = () => {
    const [filterInfo, setFilterInfo] = useState("Popular");
    const filterInfos = [
        "Popular",
        "Newest",
        "Oldest"
    ]

    const filterOptions = filterInfos.map((item) => {
        return <div key={item}>{ item }</div>
    })

    const onFilterChange = (filter: string) => {
        setFilterInfo(filter);
    }

    return (
        <div className="mx_VotePage_Categories_Filterbar">
            <div className="mx_VotePage_filterbar_leftSection">
                <div className="mx_VotePage_Filterbar_title">
                    Explore governed groups
                </div>
                <div className="mx_VotePage_Filterbar_icon">
                    <img src={require("../../../res/img/box.png")}/>
                </div>
            </div>
            <div className="mx_VotePage_filterbar_rightSection">
                <div className="mx_VotePage_filter_select">
                    <label className="mx_VotePage_filter_select_title">
                        Filter Groups
                    </label>
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

const VoteGroup: React.FC<{
    voteGroup: RealmInfo
}> = ({ voteGroup }) => {
    const [displayName, setDisplayName] = useState("");

    React.useEffect(() => {
        let name = voteGroup.displayName
        setDisplayName(name);
    }, [])
    const showGroupSuggestions = () => {
        dis.dispatch({
            action: "show_dao_suggestion",
            symbol: voteGroup.realmId.toBase58(),
        })
    }
    return (
        <div className="mx_VotePage_Public_room" onClick={() => { showGroupSuggestions() }}>
            <div className="mx_VotePage_Public_room_detail">
                <BaseAvatar
                    className="mx_VotePage_Public_room_avatar"
                    name={displayName? displayName : voteGroup.realmId.toBase58()}
                    width={100}
                    height={100}
                />
                <div className="mx_VotePage_Public_room_name">
                    { displayName }
                </div>
                {/* <div className="mx_VotePage_Public_members_number">
                    { 100 + "k Members"} 
                </div> */}
                <div className="mx_VotePage_Public_room_subinfo">
                    <div className="mx_VotePage_Public_room_category">
                        Nfts
                    </div>
                </div>
            </div>
        </div>
    )
}

const VoteGroups: React.FC<{
    voteGroups: RealmInfo[]
}>  = ({ voteGroups }) => {
    return (
        <div className="mx_VotePage_Public_groups">
            { 
                !!voteGroups.length && (
                    voteGroups.map((voteGroup) => {
                        if(voteGroup.displayName.indexOf(" [Cafeteria]") !== -1) {
                            return (
                                <VoteGroup 
                                    voteGroup={voteGroup} 
                                    key={voteGroup.realmId.toBase58()}
                                />
                            )
                        }
                    })
                )
            }            
        </div>
    )
}

const VoteCategories: React.FC<{
    voteGroups: RealmInfo[]
}> = ({ voteGroups }) => {
    const [selectedCategory, setSeletedCategory] = useState<string>("All");

    return (
        <div className="mx_VotePage_Vote_category">
            <GroupCategoriesHeader
                setSeletedCategory={setSeletedCategory}
                selectedCategory={selectedCategory}
            />
            <div className="mx_VotePage_Chat_category_body">
                <CategoriesFilterBar/>
                <VoteGroups voteGroups={voteGroups}/>
            </div>
        </div>
    )
}


const VotePage: React.FC<IProps> = ({ justRegistered = false, onChangeTheme, isMinimized }) => {
    const [allRealms, setAllRealms] = useState([]);  
    const [isLoading, setIsLoading] = useState(false); 
    const config = SdkConfig.get();
    const wallet = useWallet();
    const pageUrl = getHomePageUrl(config); 
    const {
        connection,
        set: setWalletStore,
        actions
    } = useWalletStore((state) => state)

    if (pageUrl) {
        // FIXME: Using an import will result in wrench-element-tests failures
        const EmbeddedPage = sdk.getComponent('structures.EmbeddedPage');
        return <EmbeddedPage className="mx_VotePage" url={pageUrl} scrollbar={true} />;
    }

    const VotePageClassName = classNames('mx_VotePage', 'mx_VotePage_default', {
        "mx_VotePage_minimized": isMinimized
    })

    React.useEffect(() => {
        getAllRealms();        
    }, []);

    React.useEffect(() => {
        const updateWallet = () => {
            // hack to also update wallet synchronously in case it disconnects
            setWalletStore((state) => {
              state.current = wallet
            })
          }
    
          if (document.readyState !== 'complete') {
            // wait to ensure that browser extensions are loaded
            const listener = () => {
              updateWallet()
              window.removeEventListener('load', listener)
            }
            window.addEventListener('load', listener)
            return () => window.removeEventListener('load', listener)
          } else {
            updateWallet()
        }
    }, [connection])

    const changeRealmsFormatting = (realms: ProgramAccount<Realm>[]) => {
        const formattedRealms: RealmInfo[] = realms.map((realm: ProgramAccount<Realm>) => {
            return {
                symbol: realm.account.name,
                programId: new PublicKey(realm.owner),
                realmId: realm.pubkey,
                displayName: realm.account.name,
                isCertified: false,
                enableNotifi: true, // enable by default
              } as RealmInfo
        })
        setAllRealms(formattedRealms);
    }

    const getAllRealms = async () => {
        setIsLoading(true);
        try {
            const realms = await getRealms(connection.current, programId);
            if(realms && realms.length) {
                changeRealmsFormatting(realms);
            }
            setIsLoading(false);
        }
        catch(e) {
            console.error(e);
            setIsLoading(false);
        }
    }

    const showCreateDaoDialog = () => {
        dis.dispatch({
            action: "show_create_dao"
        })
    }

    return <AutoHideScrollbar className={VotePageClassName}>
        { isLoading && <LoadingScreen label="Loading DAOs..." loadingLottie={LoadingLottie}></LoadingScreen> }
        <NavBar 
            onChangeTheme={onChangeTheme}
            createLabel={"Create DAO"}
            onClickCreate={showCreateDaoDialog}
        />
        <div className="mx_VotePage_wrapper">
            <FirstBackground showCreateDaoDialog={showCreateDaoDialog}/>
            <VoteCategories voteGroups={allRealms} />
        </div>
    </AutoHideScrollbar>;
};

export default VotePage;
