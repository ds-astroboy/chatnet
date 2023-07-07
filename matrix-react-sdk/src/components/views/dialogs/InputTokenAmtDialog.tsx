import React, { FC, useEffect, useMemo, useState } from "react";
import { _t } from "../../../languageHandler";
import BaseDialog from "./BaseDialog";
import AccessibleButton from "../elements/AccessibleButton";
import Dropdown from "../../views/elements/Dropdown";
import classNames from "classnames";
import { Connection } from "@solana/web3.js";
import { CurrencyAmountErrorText } from "../../../@types/error-type";
import { MatrixClientPeg } from "../../../MatrixClientPeg";
import { cafeteriaCurrencyList, solanaCurrencyList, currenciesInfo, specificCurrencyAmount, CurrencyType, maticCurrencyList, ethCurrencyList, aptosCurrencyList } from "../../../@variables/currencies";
import { PROVIDERNAMES } from "../../../@variables/common";
import { getUserNameFromId } from "../../../utils/strings";
import { getWalletAddress } from "../../../apis";
import { useLocalStorageState } from "../../../hooks/useLocalStorageState";
import { objectClone } from "../../../utils/objects";
import AccessibleTooltipButton from "../elements/AccessibleTooltipButton";

interface IProps {
  onFinished(
    proceed: boolean,
    amount: string | number,
    selectedCurrency: CurrencyType
  ): void;
  wallets: any;
  destId: string;
  destWallets: any;
}

const CurrencyGiftWrap: FC<IProps> = (props) => {
  const [tokenAmount, setTokenAmount] = useState<string>("");
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>(objectClone(currenciesInfo[cafeteriaCurrencyList[0]]));
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [walletConnectError, setwalletConnectError] = useState<string | null>(null);
  const [specificAmounts, setSpecificAmounts] = useState<number[]>(objectClone(
    specificCurrencyAmount[cafeteriaCurrencyList[0]]
  ));
  const [selectedIndex, setSelectedIndex] = useState<number>(null);
  const [currencyList, setCurrencyList] = useState(cafeteriaCurrencyList);
  const [enabledCurrencyNumber, setEnabledCurrencyNumber] = useState(0);
  const {solanaWallet, ethWallet, aptosWallet} = useMemo(() => {
    let ethWallet = props.wallets.find(wallet => wallet.type === "ethereum");
    let solanaWallet = props.wallets.find(wallet => wallet.type === "solana");
    let aptosWallet = props.wallets.find(wallet => wallet.type === "aptos");
    return {solanaWallet, ethWallet, aptosWallet}
  }, [props.wallets])

  const {isSolanaDisabled, isEthDisabled, isAptosDisabled, isAllDisabled} = useMemo(() => {
    let isSolanaDisabled = false;
    let isEthDisabled = false;
    let isAptosDisabled = false;
    let isAllDisabled = true;
    try{
      isSolanaDisabled = (!solanaWallet || !props.destWallets["solana"]);
      isEthDisabled = (!ethWallet || !props.destWallets["ethereum"]);
      isAptosDisabled = (!aptosWallet || !props.destWallets["aptos"]);
      console.log("isAptosDisabled = ", isAptosDisabled);
      isAllDisabled = (isSolanaDisabled && isEthDisabled && isAptosDisabled);
      return { isSolanaDisabled, isEthDisabled, isAptosDisabled, isAllDisabled };
    } catch (e) {
      console.log(e);
      return { isSolanaDisabled, isEthDisabled, isAptosDisabled, isAllDisabled };
    }
  }, [props.wallets, props.destWallets])

  useEffect(() => {
    let list = objectClone(cafeteriaCurrencyList);
    let count = 1;
    if(!isSolanaDisabled){
      list = [...list, ...solanaCurrencyList];
      count += solanaCurrencyList.length;
    }
    if(!isEthDisabled) {
      list = [...list, ...ethCurrencyList, ...maticCurrencyList];
      count += ethCurrencyList.length + maticCurrencyList.length;
    }
    if(!isAptosDisabled) {
      list = [...list, ...aptosCurrencyList];
      count += aptosCurrencyList.length;
    }
    else {
      list = [...list];
      count = list.length;
    }
    console.log("Currency List = ", list);

    setCurrencyList(list)
    setEnabledCurrencyNumber(count);
  }, [isSolanaDisabled, isEthDisabled, isAptosDisabled, isAllDisabled])

  useEffect(() => {
    let err = "";
    if(!solanaWallet || !ethWallet || !aptosWallet) {
      err = "Please connect your wallet.";
    }
    else if(!props.destWallets["solana"] || !props.destWallets["ethereum"] || !props.destWallets["aptos"]) {
      err = "Another user didn't attach wallet to his account."
    }
    if(err) {
      setwalletConnectError(err);
    }
  }, [props.wallets, props.destWallets]);

  const onCurrencyChange = (currency: string) => {
    console.log("CurrencyChange");
    console.log("currencies = ", currency);
    if (currency === selectedCurrency.name) return;
    console.log("CCCCC = ", currenciesInfo[currency]);
    setSelectedCurrency(objectClone(currenciesInfo[currency]))
    setSpecificAmounts(objectClone(
      specificCurrencyAmount[currenciesInfo[currency].name]
    ))
    console.log("Finished");
  };

  const onChangeTokenAmt = (e) => {
    if (errMsg) {
      setErrMsg(null);
    }
    const value = e.target.value;
    setSelectedIndex(null);
    setTokenAmount(value)
  };

  const onClickGo = (e) => {
    let errMsg;
    const amount = selectedIndex !== null
    ? specificAmounts[selectedIndex]
    : tokenAmount;
    if(!amount) {
      errMsg = "Please check the balance";
    }
    else if (parseFloat(amount.toString()) < CurrencyAmountErrorText[selectedCurrency.name].minAmount) {
      console.log("amount in wallet = ", amount.toString());
      errMsg = CurrencyAmountErrorText[selectedCurrency.name].error;
    }
    if (errMsg) {
      setErrMsg(errMsg)
      return;
    }
    props.onFinished(
      true,
      amount,
      selectedCurrency
    );
  };

  const changeSelectedIndex = (index: number) => {
    setSelectedIndex(index);
    setTokenAmount("");
  };

  return (
    <div className="mx_InputTokenAmtDialog_currency">
      <div className="mx_InputTokenAmtDialog_currency_dropdown">
        <div className="mx_InputTokenAmtDialog_currency_dropdown_title grey">Choose currency...</div>
        <Dropdown
          id="mx_SelectItemDialog_currenyDropdown"
          onOptionChange={onCurrencyChange}
          searchEnabled={false}
          value={selectedCurrency.name}
          label={"Category Dropdown"}
        >
          {currencyList.map((currency, index) => {
            return (
              <div className="mx_InputTokenAmtDialog_currency_dropdown_option" key={currenciesInfo[currency].name}>
                <img src={currenciesInfo[currency].logo} />
                <p className={`mx_InputTokenAmtDialog_currency_logo_lbl dark bold`}>
                  {currenciesInfo[currency].name}
                </p>
              </div>
            );
          })}
          {
            (isAllDisabled || isSolanaDisabled || isEthDisabled || isAptosDisabled) ?
              // isSolanaDisabled ?
              <AccessibleTooltipButton 
                key={`${enabledCurrencyNumber}_enabled`}
                title={walletConnectError}
                onClick={null}
                className={`img-fill`}
              />
              :
              <div key="empty"></div>
          }
        </Dropdown>
      </div>
      <div className="mx_InputTokenAmtDialog_currency_body">
        <div className="mx_InputTokenAmtDialog_currency_items">
          <div
            className={`mx_InputTokenAmtDialog_currency_item ${selectedIndex === 0 ? "selected" : ""
              }`}
            onClick={() => changeSelectedIndex(0)}
          >
            <div className="mx_InputTokenAmtDialog_currency_wrap">
              <p className="mx_InputTokenAmtDialog_currency_amount">
                {specificAmounts[0]}
              </p>
            </div>
            <div className="mx_InputTokenAmtDialog_currency_emoji emoji1"></div>
          </div>
          <div
            className={`mx_InputTokenAmtDialog_currency_item ${selectedIndex === 1 ? "selected" : ""
              }`}
            onClick={() => changeSelectedIndex(1)}
          >
            <div className="mx_InputTokenAmtDialog_currency_wrap">
              <p className="mx_InputTokenAmtDialog_currency_amount">
                {specificAmounts[1]}
              </p>
            </div>
            <div className="mx_InputTokenAmtDialog_currency_emoji emoji2"></div>
          </div>
          <div
            className={`mx_InputTokenAmtDialog_currency_item ${selectedIndex === 2 ? "selected" : ""
              }`}
            onClick={() => changeSelectedIndex(2)}
          >
            <div className="mx_InputTokenAmtDialog_currency_wrap">
              <p className="mx_InputTokenAmtDialog_currency_amount">
                {specificAmounts[2]}
              </p>
            </div>
            <div className="mx_InputTokenAmtDialog_currency_emoji emoji3"></div>
          </div>
        </div>
        <div className="mx_InputTokenAmtDialog_currency_items">
          <div
            className={`mx_InputTokenAmtDialog_currency_item ${selectedIndex === 3 ? "selected" : ""
              }`}
            onClick={() => changeSelectedIndex(3)}
          >
            <div className="mx_InputTokenAmtDialog_currency_wrap">
              <p className="mx_InputTokenAmtDialog_currency_amount">
                {specificAmounts[3]}
              </p>
            </div>
            <div className="mx_InputTokenAmtDialog_currency_emoji emoji4"></div>
          </div>
          <div className="mx_InputTokenAmtDialog_currency_customAmount">
            <div className="mx_InputTokenAmtDialog_currency_customAmount_wrap">
              <input
                className="mx_InputTokenAmtDialog_currency_input"
                placeholder="Enter Custom Amount"
                type="number"
                value={tokenAmount}
                onChange={onChangeTokenAmt}
                onClick={() => setSelectedIndex(null)}
              />
            </div>
            <div className="mx_InputTokenAmtDialog_currency_emoji emoji5"></div>
          </div>
        </div>
      </div>
      <div className="mx_InputTokenAmtDialog_currency_errorMessage">
        {errMsg}
      </div>
      <div className="mx_InputTokenAmtDialog_currency_sendBtnContainer">
        <AccessibleButton
          className="mx_InputTokenAmtDialog_currency_sendButton common-btn bg-green small-shadow"
          onClick={onClickGo}
        >
          {"Send Tip"}
        </AccessibleButton>
      </div>
      <div className="mx_InputTokenAmtDialog_currency_footer">
        <div className="mx_InputTokenAmtDialog_currency_statement">
          Click here to learn more about Tips & Collectables
        </div>
      </div>
    </div>
  )
}

const CollectableGiftWrap: FC = () => {

  const emptyWrap = (
    <div className="mx_InputTokenAmtDialog_collectable_emptyWrap">
      <div className="mx_InputTokenAmtDialog_collectable_emptyWrap_img">
        <img src={require("../../../../res/img/fruit-bite.svg")} />
      </div>
      <p className="mx_InputTokenAmtDialog_collectable_emptyWrap_label bold grey">
        Nothing here yet...
      </p>
    </div>
  )
  return (
    <div className="mx_InputTokenAmtDialog_collectable">
      {emptyWrap}
    </div>
  )
}

const InputTokenAmtDialog: FC<IProps> = (props) => {
  const [selectedTapIndex, setSelectedTapIndex] = useState<number>(0);
  const taps = ["Tips", "Collectables"];

  const bodyComponent = useMemo(() => {
    if (selectedTapIndex) {
      return <CollectableGiftWrap />
    }
    return <CurrencyGiftWrap {...props} />
  }, [selectedTapIndex])

  return (
    <BaseDialog
      className="mx_InputTokenAmtDialog"
      title="Gift"
      onFinished={props.onFinished}
    >
      <div className="mx_InputTokenAmtDialog_header">
        <div className="mx_InputTokenAmtDialog_taps">
          {taps.map((tap, index) => {
            const className = classNames("mx_InputTokenAmtDialog_tap", {
              selected: index === selectedTapIndex
            })
            return (
              <div
                key={index}
                className={className}
                onClick={() => setSelectedTapIndex(index)}
              >
                {tap}
              </div>
            )
          })}
        </div>
      </div>
      <div className="mx_InputTokenAmtDialog_body">
        {bodyComponent}
      </div>
    </BaseDialog>
  )
}

export default InputTokenAmtDialog

