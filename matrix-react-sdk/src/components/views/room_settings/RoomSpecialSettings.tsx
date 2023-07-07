import React, { ChangeEvent, FC, useEffect, useMemo, useState } from "react";
import { MESSAGES } from "../../../@types/error-type";
import { BLOCKCHAINNETWORKS, PROVIDERNAMES } from "../../../@variables/common";
import { currenciesInfo, cafeteriaCurrencyList, solanaCurrencyList, ethCurrencyList, maticCurrencyList, aptosCurrencyList } from "../../../@variables/currencies";
import { deleteBarrierFromRoom, getAllCategories, getCategoryForRoom, setBarrierToRoom, setCategoryToRoom } from "../../../apis";
import dis from "../../../dispatcher/dispatcher";
import { getProtocol } from "../../../hooks/commonFuncs";
import { MatrixClientPeg } from "../../../MatrixClientPeg";
import DMRoomMap from "../../../utils/DMRoomMap";
import { objectClone } from "../../../utils/objects";
import AccessibleButton from "../elements/AccessibleButton";
import Dropdown from "../elements/Dropdown";
import Field from "../elements/Field";
import LabelledToggleSwitch from "../elements/LabelledToggleSwitch";
import Spinner from "../elements/Spinner";

interface IProps {
    roomId: string;
    wallets?: any;
    alert?: any;
    onFinished: (value: boolean) => void;
}

const RoomSpecialSettings: FC<IProps> = (props) => {
    const [optionIndex, setOptionIndex] = useState(0);
    const [barrierRuleIndex, setBarrierRuleIndex] = useState(0);
    const [pointBarrierSelectValue, setPointBarrierSelectValue] = useState(currenciesInfo[cafeteriaCurrencyList[0]].name);
    const [pointBarrierAmount, setPointBarrierAmount] = useState("50");
    const [cryptoBarrierSelectValue, setCryptoBarrierSelectValue] = useState("");
    const [cryptoBarrierAmount, setcryptoBarrierAmount] = useState("1");
    const [nftBarrierInfo, setNftBarrierInfo] = useState(null);
    const [currencyList, setCurrencyList] = useState([]);
    const [isBusy, setIsBusy] = useState(false);
    const [isEmptyCategory, setIsEmptyCategory] = useState(false);
    const [categoryValue, setCategoryValue] = useState("Category");
    const [originalCategory, setOriginalCategory] = useState("Category");
    const [categories, setCategories] = useState(["Category"]);
    const [isBarrier, setIsBarrier] = useState(true);
    const cli = MatrixClientPeg.get();
    const isWalletConnected = !!props.wallets?.length

    const categoryOptions = useMemo(() => {
        return  categories.map((category) => {
            return <div key={category}>
                {category}
            </div>
        });
    }, [categories]);

    useEffect(() => {
        (async() => {
            if(!props.roomId) return;
            const categories = await getAllCategories();
            setCategories(["Category", ...categories]);
            let isPrivateMessage = !!DMRoomMap.shared().getUserIdForRoomId(props.roomId);
            if(isPrivateMessage) return;
            let category = await getCategoryForRoom(props.roomId);
            if(!category) return;
            setCategoryValue(category);
            setOriginalCategory(category);
        })();
    }, [])

    useEffect(() => {
        const solanaWallet = props.wallets.find(wallet => wallet.type === "solana");
        const ethWallet = props.wallets.find(wallet => wallet.type === "ethereum");
        const aptosWallet = props.wallets.find(wallet => wallet.type === "aptos");
        let list = objectClone(currencyList);
        if(solanaWallet) {
            list = [...list, ...solanaCurrencyList];
        }
        if(ethWallet) {
            list = [...list, ...ethCurrencyList, ...maticCurrencyList];
        }
        if(aptosWallet) {
            list = [...list, ...aptosCurrencyList];
        }
        setCurrencyList(list);
        if(list?.length) {
            setCryptoBarrierSelectValue(currenciesInfo[list[0]].name)
        }
    }, [props.wallets])

    const changeOptionIndex = (index) => {
        if (!isWalletConnected && index) return;
        setOptionIndex(index);
    }

    const onPointBarrierAmountChange = (ev: ChangeEvent<HTMLInputElement>) => {
        setPointBarrierAmount(ev.target.value);
    }

    const onPointBarrierSelectChange = (currency: string) => {
        if (pointBarrierSelectValue === currency) return;
        setPointBarrierSelectValue(currency);
    }

    const onCryptoBarrierAmountChange = (ev: ChangeEvent<HTMLInputElement>) => {
        setcryptoBarrierAmount(ev.target.value);
    }

    const onCryptoBarrierSelectChange = (currency: string) => {
        if (!isWalletConnected) return;
        if (cryptoBarrierSelectValue === currency) return;
        setCryptoBarrierSelectValue(currency);
    }

    const showNftCategoryDialog = () => {
        dis.dispatch({
            action: "show_nft_category_dialog",
            wallets: props.wallets,
            getNftData
        })
    }

    const getNftData = (data) => {
        setNftBarrierInfo(data);
    }

    const clickWalletConnectButton = () => {
        props.onFinished(false);
        document.getElementById("wallet-connect-button").click();
    }

    const pointOptions = cafeteriaCurrencyList.map(currency => {
        return (
            <div key={currenciesInfo[currency].name} className="mx_RoomSpecialSettings_currencyOption">
                <div className="mx_RoomSpecialSettings_currencyLogo">
                    <img src={currenciesInfo[currency].logo} />
                </div>
                <div className="mx_RoomSpecialSettings_currencyName">
                    {currenciesInfo[currency].name}
                </div>
            </div>
        )
    })

    const currencyOptions = currencyList.map(currency => (
            <div key={currenciesInfo[currency].name} className="mx_RoomSpecialSettings_currencyOption">
                <div className="mx_RoomSpecialSettings_currencyLogo">
                    <img src={currenciesInfo[currency].logo} />
                </div>
                <div className="mx_RoomSpecialSettings_currencyName">
                    {currenciesInfo[currency].name}
                </div>
            </div>
        )
    )

    const getBarrierInfo = () => {
        const solanaWallet = props.wallets.find(wallet => wallet.type === "solana");
        const ethWallet = props.wallets.find(wallet => wallet.type === "ethereum");
        const aptosWallet = props.wallets.find(wallet => wallet.type === "aptos");
        let obj;
        let barrierRule;
        let protocol = getProtocol(cryptoBarrierSelectValue);
        let wallet = ethWallet;
        if(protocol === BLOCKCHAINNETWORKS.Solana) {
            wallet = solanaWallet;
        }
        else if(protocol === BLOCKCHAINNETWORKS.Aptos) {
            wallet = aptosWallet;
        }
        switch (optionIndex) {
            case 0:
                barrierRule = "points.check"
                if (barrierRuleIndex) {
                    barrierRule = "points.pay"
                }
                obj = {
                    "type": barrierRule,
                    "currency_type": "cafeteria.points",
                    "amount": parseFloat(pointBarrierAmount),
                    "creator": cli.getUserId()
                }
                break;
            case 1:
                barrierRule = "wallet.check"
                if (barrierRuleIndex) {
                    barrierRule = "wallet.pay"
                }
                let temp = "";
                if (wallet?.account?.publicKey?.toString()) temp = wallet?.account?.publicKey?.toString();
                else temp = wallet?.account || wallet?.publicKey?.toBase58();
                obj = {
                    "type": barrierRule,
                    "currency_type": cryptoBarrierSelectValue,
                    "amount": parseFloat(cryptoBarrierAmount),
                    "creator": temp,
                    "protocol": protocol
                }
                break;
            case 2:
                obj = {
                    "type": "nft.check",
                    "nft_update_auth_addr": nftBarrierInfo.updateAuthority,
                    "uri": nftBarrierInfo.img,
                    "protocol": nftBarrierInfo.protocol,
                    "hard_barrier": !!barrierRuleIndex
                }
                break;
        }
        return obj;
    }

    const updateBarrier = async() => {
        const accessToken = cli.getAccessToken();
        if(!accessToken) return false;
        if(!props.roomId) return false;
        let success = false;
        if(isBarrier) {
            let barrierObj = getBarrierInfo();
            console.log({barrierObj});
            success = await setBarrierToRoom(accessToken, props.roomId, barrierObj);
        }
        else {
            success = await deleteBarrierFromRoom(accessToken, props.roomId);
        }

        if(success) {
            props.alert.success(MESSAGES.UPDATEBARRIERSUCCESS);
        }
        else {
            props.alert.error(MESSAGES.UPDATEBARRIERFAILD);
        }
        return success;
    }

    const onCategoryChange = (category: string) => {
        if(category === "Category") {
            setIsEmptyCategory(true);
        } 
        else {
            setIsEmptyCategory(false)
        }
        if (categoryValue === category) return;
        setCategoryValue(category);
    }

    const updateCategory = async() => {
        if(categoryValue === originalCategory) return false;
        const accessToken = cli.getAccessToken();
        if(!accessToken) return false;
        if(!props.roomId) return false;
        const success = await setCategoryToRoom(accessToken, categoryValue, props.roomId);
        if(success) {
            props.alert.success(MESSAGES.UPDATECATEGORYSUCCESS);
            return true;
        }
        else {
            props.alert.error(MESSAGES.UPDATECATEGORYFAILED);
            return false;
        }
    }

    const saveChanges = async() => {
        if(categoryValue === "Category") {
            setIsEmptyCategory(true);
        }
        false;
        setIsBusy(true);
        let isReLoad1 = await updateCategory();
        let isReLoad2 = await updateBarrier();
        setIsBusy(false);
        if(isReLoad1 || isReLoad2) {
            window.location.reload();
        }
    }

    const DomainBarrierBody = (
        <div className="mx_RoomSpecialSettings_option_body mt-4">
            <div className="mx_RoomSpecialSettings_option_description">
                Require users to have crypto specific official domains such as .sol from Bonfida, This may help in the verification of users.
            </div>
            <div className="mx_RoomSpecialSettings_joinConditions">
                <div className="mx_RoomSpecialSettings_joinCondition">
                    <div className={`mx_RoomSpecialSettings_radio_button active`}></div>
                    <div className="mx_RoomSpecialSettings_joinCondition_content">
                        Bonfida .sol domains
                    </div>
                </div>
            </div>
        </div>
    )

    const CreditBarrierBody = (
        <div className="mx_RoomSpecialSettings_option_body">
            <div className="mx_RoomSpecialSettings_currency_wrap mt-4">
                <div className="mx_RoomSpecialSettings_Dropdown">
                    <Dropdown
                        id="mx_PointBarrierDropdown"
                        onOptionChange={onPointBarrierSelectChange}
                        searchEnabled={false}
                        value={pointBarrierSelectValue}
                        label={"Credits Dropdown"}>
                        {pointOptions}
                    </Dropdown>
                </div>
                <div className="mx_RoomSpecialSettings_AmountInput">
                    <Field
                        onChange={onPointBarrierAmountChange}
                        value={pointBarrierAmount}
                        type="number"
                    />
                </div>
            </div>
            <div className="mx_RoomSpecialSettings_joinConditions mt-4">
                <div className="mx_RoomSpecialSettings_joinCondition">
                    <div className={`mx_RoomSpecialSettings_radio_button ${barrierRuleIndex == 0 ? "active" : ""}`} onClick={() => setBarrierRuleIndex(0)}></div>
                    <div className="mx_RoomSpecialSettings_joinCondition_content">
                        Balance Check
                    </div>
                </div>
                <div className="mx_RoomSpecialSettings_joinCondition">
                    <div className={`mx_RoomSpecialSettings_radio_button ${barrierRuleIndex == 1 ? "active" : ""}`} onClick={() => setBarrierRuleIndex(1)}></div>
                    <div className="mx_RoomSpecialSettings_joinCondition_content">
                        Pay-to-enter
                    </div>
                </div>
            </div>
        </div>
    )

    const CryptoBarrierBody = (
        <div className="mx_RoomSpecialSettings_option_body">
            <div className="mx_RoomSpecialSettings_currency_wrap mt-4">
                <div className="mx_RoomSpecialSettings_Dropdown">
                    <Dropdown
                        id="mx_CryptoBarrierDropdown"
                        onOptionChange={onCryptoBarrierSelectChange}
                        searchEnabled={false}
                        value={cryptoBarrierSelectValue}
                        disabled={isWalletConnected ? false : true}
                        label={"Crypto Dropdown"}>

                        {currencyOptions}
                    </Dropdown>
                </div>
                <div className="mx_RoomSpecialSettings_AmountInput">
                    <Field
                        onChange={onCryptoBarrierAmountChange}
                        value={cryptoBarrierAmount}
                        disabled={isWalletConnected ? false : true}
                        type="number"
                    />
                </div>
            </div>
            <div className="mx_RoomSpecialSettings_joinConditions mt-4">
                <div className="mx_RoomSpecialSettings_joinCondition">
                    <div className={`mx_RoomSpecialSettings_radio_button ${barrierRuleIndex == 0 ? "active" : ""}`} onClick={() => setBarrierRuleIndex(0)}></div>
                    <div className="mx_RoomSpecialSettings_joinCondition_content">
                        Balance Check
                    </div>
                </div>
                <div className="mx_RoomSpecialSettings_joinCondition">
                    <div className={`mx_RoomSpecialSettings_radio_button ${barrierRuleIndex == 1 ? "active" : ""}`} onClick={() => setBarrierRuleIndex(1)}></div>
                    <div className="mx_RoomSpecialSettings_joinCondition_content">
                        Pay-to-enter
                    </div>
                </div>
            </div>
        </div>
    )

    const nftBarrierLabel = barrierRuleIndex?
        "Select a Verified NFT from your wallet to only allow users with the select NFT collection to enter your group. Users will be prompted for a wallet check before being allowed to enter."
        :
        "Select a Verified NFT from your wallet if you want to allow anyone to join your group, but give holders of this NFT an option to prove their ownership for more exclusive perks in the future."

    const NftBarrierBody = (
        <div className="mx_RoomSpecialSettings_option_body">
            <div className="mx_RoomSpecialSettings_option_description">
                {nftBarrierLabel}
            </div>
            <div className="mx_RoomSpecialSettings_option_select_item">
                <div className={`mx_RoomSpecialSettings_option_item ${nftBarrierInfo ? "item" : ""}`} onClick={showNftCategoryDialog}>
                    <div className="mx_RoomSpecialSettings_option_bg"></div>
                    { !!nftBarrierInfo && <img src={nftBarrierInfo.img} /> }
                </div>
                {!!nftBarrierInfo && (
                        <div className="mx_RoomSpecialSettings_option_item_info">
                            <div className="mx_RoomSpecialSettings_option_item_name">
                                <p>{nftBarrierInfo.name}</p>
                                <img src={require("../../../../res/img/verify.png")} />
                            </div>
                            <div className="mx_RoomSpecialSettings_option_item_content">
                                Selected Verified NFT Collection.
                            </div>
                        </div>
                )}
            </div>
            <div className="mx_RoomSpecialSettings_joinConditions mt-4">
                <div className="mx_RoomSpecialSettings_joinCondition">
                    <div className={`mx_RoomSpecialSettings_radio_button ${barrierRuleIndex == 0 ? "active" : ""}`} onClick={() => setBarrierRuleIndex(0)}></div>
                    <div className="mx_RoomSpecialSettings_joinCondition_content">
                        NFT Optional
                    </div>
                </div>
                <div className="mx_RoomSpecialSettings_joinCondition">
                    <div className={`mx_RoomSpecialSettings_radio_button ${barrierRuleIndex == 1 ? "active" : ""}`} onClick={() => setBarrierRuleIndex(1)}></div>
                    <div className="mx_RoomSpecialSettings_joinCondition_content">
                        NFT Required
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <div className="mx_RoomSpecialSettings">
            <span className='mx_SettingsTab_subheading'>Group Category</span>
            <div className='mx_SettingsTab_section'>
                <Dropdown
                    id="mx_CategoryDropdown"
                    onOptionChange={onCategoryChange}
                    searchEnabled={false}
                    value={categoryValue}
                    label={"Category Dropdown"}
                    className={`mx_CategoryDropdown ${isEmptyCategory? "empty" : ""}`}
                >
                    {categoryOptions}
                </Dropdown>
            </div>
            <span className='mx_SettingsTab_subheading'>
                <LabelledToggleSwitch
                    label={"Group Barrier"}
                    onChange={setIsBarrier}
                    className="d-flex justify-content-between align-items-center"
                    value={isBarrier}
                />
            </span>
            <div className='mx_SettingsTab_section'>
                {isBarrier && (
                    <>
                        <div className="mx_RoomSpecialSettings_wrap">
                            <div className="mx_RoomSpecialSettings_option">
                                <div className="mx_RoomSpecialSettings_option_header">
                                    <div className={`mx_RoomSpecialSettings_radio_button ${!optionIndex ? "active" : ""}`} onClick={() => changeOptionIndex(0)}></div>
                                    <div className="mx_RoomSpecialSettings_option_content">
                                        Cafeteria Credits
                                    </div>
                                </div>
                                { optionIndex == 0 && CreditBarrierBody }
                            </div>
                        </div>
                        <div className={`mx_RoomSpecialSettings_wrap ${isWalletConnected ? "" : "disable"}`}>
                            <div className="mx_RoomSpecialSettings_option">
                                <div className="mx_RoomSpecialSettings_option_header">
                                    <div className={`mx_RoomSpecialSettings_radio_button ${optionIndex == 1 ? "active" : ""}`} onClick={() => changeOptionIndex(1)}></div>
                                    <div className="mx_RoomSpecialSettings_option_content">
                                        Cryptocurrency
                                    </div>
                                </div>
                                { optionIndex == 1 && CryptoBarrierBody }
                            </div>
                            {/* <div className="mx_RoomSpecialSettings_option">
                                <div className="mx_RoomSpecialSettings_option_header">
                                    <div className={`mx_RoomSpecialSettings_radio_button ${optionIndex == 3 ? "active" : ""}`} onClick={() => changeOptionIndex(3)}></div>
                                    <div className="mx_RoomSpecialSettings_option_content">
                                        Crypto Domains
                                    </div>
                                </div>
                                { optionIndex == 3 && DomainBarrierBody }
                            </div> */}
                            <div className="mx_RoomSpecialSettings_option">
                                <div className="mx_RoomSpecialSettings_option_header">
                                    <div className={`mx_RoomSpecialSettings_radio_button ${optionIndex == 2 ? "active" : ""}`} onClick={() => changeOptionIndex(2)}></div>
                                    <div className="mx_RoomSpecialSettings_option_content">
                                        Verified NFT
                                    </div>
                                </div>
                                { optionIndex == 2 && NftBarrierBody }
                            </div>
                            {
                                !isWalletConnected && (
                                    <div className="mx_RoomSpecialSettings_wallet_connect_button" onClick={clickWalletConnectButton}>
                                        <p>Connect wallet to unlock crypto features.</p>
                                    </div>
                                )                                
                            }
                        </div>
                    </>
                )}
                <div className="mx_RoomSpecialSettings_ButtonGroup mx-4 mt-4">
                    <AccessibleButton  className="common-btn btn-large green-btn btn-hover-purple px-4" onClick={saveChanges}>
                        {
                            isBusy
                            ?
                            <Spinner/>
                            :
                            "Save Changes"
                        }
                    </AccessibleButton>
                </div>
            </div>
        </div>
    )
}

export default RoomSpecialSettings;