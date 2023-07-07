import classNames from "classnames";
import React, { useState, useEffect, FC, useMemo } from "react"
import { getUserPoints } from "../../../apis";
import { MatrixClientPeg } from "../../../MatrixClientPeg";
import { objectClone } from "../../../utils/objects";
import BaseDialog from "./BaseDialog";
import Dropdown from "../../views/elements/Dropdown";
import { AWARDS, BACKPACKAWARDS } from "../../../@variables/common";

interface IProps {
    onFinished(): void;
}

interface Currency {
    symbol: string;
    amount: number;
    name: string;
}

interface Colletable {
    name: string;
    logo: string;
    attribute: string;
    number: string;
}

const UserCurrencyWrap: FC = () => {
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [selectedCurrency, setSelectedCurrency] = useState<Currency>(null);
    const cli = MatrixClientPeg.get();

    useEffect(() => {
        let currencies = new Array(12).fill(null);
        setCurrencies(currencies.slice());
        getUserCoin(currencies);
    }, []);

    const getUserCoin = async (currencies: Currency[]) => {
        let currency: Currency = {
            symbol: "credit",
            name: "Cafeteria Credits",
            amount: 0
        }
        const accessToken = cli.getAccessToken();
        const userId = cli.getUserId();
        if (accessToken) {
            currency.amount = await getUserPoints(accessToken, userId);
        }
        currencies[0] = currency;
        setCurrencies(objectClone(currencies));
        setSelectedCurrency(objectClone(currency));
    };

    const onChangeCurrency = (symbol) => {
        let selectedCurrency = currencies.find((currency: Currency) => currency?.symbol === symbol);
        setSelectedCurrency(selectedCurrency);
    }

    const currencyOptions: JSX.Element[] = useMemo(() => {
        let options = [];
        currencies.map((currency: Currency, index) => {
            if (!currency) return;
            const currencyLogoClassName = classNames("mx_UserCoinWalletDialog_currency_dropdown_option_logo", currency.symbol);
            options.push((
                <div key={currency.symbol} className="mx_UserCoinWalletDialog_currency_dropdown_option">
                    <div className={currencyLogoClassName}>
                    </div>
                    <div className="mx_UserCoinWalletDialog_currency_dropdown_option_amount">
                        {currency.amount}
                    </div>
                </div>
            ))
        })
        return options;
    }, [currencies])

    const currencyItems: JSX.Element[] = useMemo(() => {
        return currencies.map((currency: Currency, index) => {
            const className = classNames("mx_UserCoinWalletDialog_currency_item", {
                selected: (selectedCurrency && currency?.symbol === selectedCurrency?.symbol)
            })
            return <div key={index} className={className}>
                <div className="mx_UserCoinWalletDialog_currency_item_wrap">
                    {currency && (
                        <div className={`mx_UserCoinWalletDialog_currency_item_logo ${currency.symbol}`}>
                        </div>
                    )}
                </div>
            </div>
        })
    }, [currencies, selectedCurrency])

    return (
        <div className="mx_UserCoinWalletDialog_currency">
            <div className="mx_UserCoinWalletDialog_currency_header">
                <div className="mx_UserCoinWalletDialog_currency_title">
                    Your available balance
                </div>
                <Dropdown
                    id="mx_UserCoinWalletDialog_currency_dropdown"
                    className="mx_UserCoinWalletDialog_currency_dropdown"
                    searchEnabled={false}
                    onOptionChange={onChangeCurrency}
                    value={selectedCurrency?.symbol}
                    label={"Category Dropdown"}>
                    {currencyOptions}
                </Dropdown>
            </div>
            <div className="mx_UserCoinWalletDialog_currency_body">
                {currencyItems}
            </div>
            <div className="mx_UserCoinWalletDialog_currency_footer">
                <div className="mx_UserCoinWalletDialog_currency_name">
                    {selectedCurrency?.name}
                </div>
            </div>
        </div>
    )
}

const UserCollectableWrap: FC = () => {
    const [collectables, setCollectables] = useState<Colletable[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);

    useEffect(() => {
        let collectables = new Array(16).fill(null);
        setCollectables(objectClone(collectables));
    }, [])
    const handleClick = (index) => {
        if(!collectables[index]) return;
        if(index === selectedIndex) return;
        setSelectedIndex(index);
    }

    const collectableItems: JSX.Element[] = useMemo(() => {
        return collectables.map((collectable: Colletable, index: number) => {
            const className = classNames("mx_UserCoinWalletDialog_collectables_item", {
                selected: index === selectedIndex
            })
            return (
                <div className={className} onClick={() => handleClick(index)} key={index}>
                    <div className="mx_UserCoinWalletDialog_collectables_item_wrap">
                        {collectable && (<img src={collectable.logo}/>)}
                    </div>
                </div>
            )
        })
    }, [collectables])

    const collectableInfo = useMemo(() => {
        if (!collectables.length) return <></>;
        if(!collectables[selectedIndex]) return <></>;
        return <>
            <span className="light-purple bold">{collectables[selectedIndex].attribute}</span>
            <span className="dark bold">{` - ${collectables[selectedIndex].name} `}</span>
            <span className="grey">{`(${collectables[selectedIndex].number})`}</span>
        </>
    }, [collectables, selectedIndex])

    return (
        <div className="mx_UserCoinWalletDialog_collectables">
            <div className="mx_UserCoinWalletDialog_collectables_body">
                {collectableItems}
            </div>
            <div className="mx_UserCoinWalletDialog_collectables_footer">
                <div className="mx_UserCoinWalletDialog_collectables_info">
                    {collectableInfo}
                </div>
            </div>
        </div>
    )
}

const UserAwardsWrap: FC = () => {
    const [awards, setAwards] = useState<Colletable[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);

    useEffect(() => {
        let awards = new Array(16).fill(null);

        BACKPACKAWARDS.forEach((key, index) => {
            awards[index] = AWARDS[key];
        })
        setAwards(objectClone(awards));
    }, [])

    const handleClick = (index) => {
        if(!awards[index]) return;
        if(index === selectedIndex) return;
        setSelectedIndex(index);
    }

    const awardItems: JSX.Element[] = useMemo(() => {
        return awards.map((award, index: number) => {
            const className = classNames("mx_UserCoinWalletDialog_awards_item", {
                selected: index === selectedIndex
            })
            return (
                <div className={className} onClick={() => handleClick(index)} key={index}>
                    <div className="mx_UserCoinWalletDialog_awards_item_wrap">
                        {award && (<img src={award.logo} />)}
                    </div>
                </div>
            )
        })
    }, [awards, selectedIndex])

    const awardInfo = useMemo(() => {
        if (!awards.length) return <></>;
        if (!awards[selectedIndex]) return <></>;
        return <>
            <span className="light-purple bold">{awards[selectedIndex].name}</span>
            <span className="dark bold">{` - Non-tradeble`}</span>
        </>
    }, [awards, selectedIndex])

    return (
        <div className="mx_UserCoinWalletDialog_awards">
            <div className="mx_UserCoinWalletDialog_awards_body">
                {awardItems}
            </div>
            <div className="mx_UserCoinWalletDialog_awards_footer">
                <div className="mx_UserCoinWalletDialog_awards_info">
                    {awardInfo}
                </div>
            </div>
        </div>
    )
}

const UserWalletDialog: FC<IProps> = ({ onFinished }) => {
    const [tapIndex, setTapIndex] = useState(0);
    const taps = ["Currency", "Collectables", "Awards"];

    const switchTap = (index) => {
        if (tapIndex === index) return;
        setTapIndex(index);
    }

    const bodyComponent = useMemo(() => {
        switch(tapIndex) {
            case 0: return <UserCurrencyWrap />;
            case 1: return <UserCollectableWrap />;
            case 2: return <UserAwardsWrap />
        }
    }, [tapIndex])

    return (
        <BaseDialog title="My Bag" className="mx_UserCoinWalletDialog" onFinished={onFinished}>
            <div className="mx_UserCoinWalletDialog_header">
                <div className="mx_UserCoinWalletDialog_taps">
                    {
                        taps.map((tap, index) => {
                            const tapClass = classNames("mx_UserCoinWalletDialog_tap", {
                                active: (index === tapIndex)
                            })
                            return (
                                <div
                                    className={tapClass}
                                    onClick={() => switchTap(index)}
                                >
                                    {tap}
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <div className="mx_UserCoinWalletDialog_body">
                {bodyComponent}
            </div>
        </BaseDialog>
    );
};

export default UserWalletDialog