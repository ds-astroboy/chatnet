import React, { useState, useEffect } from "react";
import classNames from "classnames";
import Lottie from "lottie-react";
import oneCoinLottie from "../../../../res/img/lottie/points-tip-animations/1.json";
import threeCoinLottie from "../../../../res/img/lottie/points-tip-animations/3.json";
import fiveCoinLottie from "../../../../res/img/lottie/points-tip-animations/5.json";
import muchCoinLottie from "../../../../res/img/lottie/points-tip-animations/Much.json";
import receiveLottie from "../../../../res/img/lottie/points-tip-animations/receive.json";
import { debounce } from "lodash";
import AccessibleTooltipButton from "../elements/AccessibleTooltipButton";
import Modal from "../../../Modal";
import UserWalletDialog from "../dialogs/UserWalletDialog";

interface IProps {
  receivedTipAmount?: number;
  setReceivedTipAmount?: (value: number) => void;
  sentTipAmount?: number;
  setSentTipAmount?: (value: number) => void;
  isMobileView?: boolean;
}



const UserCoinWallet = (props: IProps) => {
  const [isShowAnimation, setIsShowAnimation] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);
  const selectLottieData = () => {
    if (tipAmount > 0) {
      return receiveLottie;
    } else if (tipAmount < -50) {
      return muchCoinLottie;
    } else if (tipAmount < -30) {
      return fiveCoinLottie;
    } else if (tipAmount < -10) {
      return threeCoinLottie;
    } else if (tipAmount < 0) {
      return oneCoinLottie;
    }
  };

  const className = classNames("mx_UserCoinWallet");

  const trimAmount = () => {
    let amount = tipAmount;
    if (Math.abs(tipAmount) >= 1000) {
      amount = Math.round(Math.abs(tipAmount) / 100) / 10;
      if (tipAmount > 0) return `+${amount}k`;
      else return `-${amount}k`;
    }
    if (amount > 0) return `+${amount}`;
    else return `${amount}`;
  };

  let animation;
  let lottieData;
  let tipCoin;
  if (isShowAnimation) {
    lottieData = selectLottieData();
    animation = (
      <div className="mx_Tip_Animation">
        <Lottie
          className="mx_Tip_Animation_Lottie"
          animationData={lottieData}
          loop={false}
        />
      </div>
    );
    let tipCoinClassName = classNames("mx_Tipped_Coin", {
      received: tipAmount > 0,
    });
    let pointsAmount = trimAmount();
    tipCoin = <div className={tipCoinClassName}>{pointsAmount}</div>;
  }

  const clearTipInfo = debounce(() => {
    setIsShowAnimation(false);
    setTipAmount(0);
    props.setReceivedTipAmount(0);
    props.setSentTipAmount(0);
  }, 5000);

  useEffect(() => {
    if (props.receivedTipAmount || props.sentTipAmount) {
      if (props.receivedTipAmount) {
        setTipAmount(props.receivedTipAmount);
      } else {
        setTipAmount(-props.sentTipAmount);
      }
      setIsShowAnimation(true);
      clearTipInfo();
    }
  }, [props.receivedTipAmount, props.sentTipAmount]);
  const showUserWallet = () => {
    Modal.createTrackedDialog(
      "User Wallet",
      "",
      UserWalletDialog
    )
  }

  return (
    <React.Fragment>
      <AccessibleTooltipButton
        onClick={showUserWallet}
        title="My Bag"
        className={className}
      >
        {tipCoin}
        {animation}
      </AccessibleTooltipButton>
    </React.Fragment>
  );
};

export default UserCoinWallet;
