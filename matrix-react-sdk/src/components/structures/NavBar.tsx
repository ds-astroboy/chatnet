import * as React from "react";
import { createRef, useMemo, useEffect, useState, FC } from "react";
import dis from "../../dispatcher/dispatcher";
import classNames from "classnames";
import { _t } from "../../languageHandler";
import SettingsStore from "../../settings/SettingsStore";
import { SettingLevel } from "../../settings/SettingLevel";
import UserMenu from "./UserMenu";
import defaultDispatcher from "../../dispatcher/dispatcher";
import AccessibleTooltipButton from "../views/elements/AccessibleTooltipButton";
import { getCustomTheme } from "../../theme";
import NavBarSearch, { SearchScope } from "./NavBarSearch";
import ConnectButton from "./ConnectButton";
import { useWallet } from "@solana/wallet-adapter-react";
import { trimString } from "../../hooks/trimString";
import { MatrixClientPeg } from "../../MatrixClientPeg";
import AccessibleButton from "../views/elements/AccessibleButton";
import Dropdown from "../views/elements/Dropdown";
import Modal from "../../Modal";
import WalletCategoryDialog from "../views/dialogs/WalletCategoryDialog";
import { useAlert } from 'react-alert'
import WalletControlDialog from "../views/dialogs/WalletControlDialog";
import { useSelector } from "react-redux";


interface NavBarProps {
  searchInProgress?: boolean;
  onCancelClick?: () => void;
  onSearch?: (term: string) => void;
  isRoomEncrypted?: boolean;
  onChangeTheme?: (isDarkTheme: boolean) => void;
  createLabel?: string;
  onClickCreate?: () => void;
  isSignout?: boolean;
  onLoginClick?: () => void;
}

const NavBarLogoAndSearch = ({
  searchInProgress,
  onCancelClick,
  onSearch,
  isRoomEncrypted,
}) => {
  console.log("logo and search");
  return (
    <div className="mx_NavBar_Logo_Search">
      {/* <NavBarLogo /> */}
      <NavBarSearch
        searchInProgress={searchInProgress}
        onCancelClick={onCancelClick}
        onSearch={onSearch}
        isRoomEncrypted={isRoomEncrypted}
      />
    </div>
  );
};

const NavBarLogo = () => {
  console.log("NavBar logo");
  const navBarLogoClassName = classNames({
    mx_NavBar_Logo: true,
  });

  const showHomePage = () => {
    if (!MatrixClientPeg.get()) {
      dis.dispatch({ action: "view_welcome_page" });
    } else {
      dis.dispatch({ action: "view_home_page" });
    }
  };

  return <div className={navBarLogoClassName} onClick={showHomePage}></div>;
};

const NavBarPageButtonGroup = () => {
  console.log("NavBarPageButtonGroup");
  const showTokensAndNftsPage = () => {
    dis.dispatch({
      action: "show_tokens_nfts_page"
    })
  }
  
  const showVotePage = () => {
    return;
    dis.dispatch({
      action: "view_vote_page"
    })
  }

  return (
    <div className="mx_NavBar_PageButtonGroup">
      <AccessibleTooltipButton
        title="Coming Soon"
        onClick={showVotePage}
        className="mx_NavBar_PageButtonGroup_button icon vote"
        alignment={4}
      />
      <AccessibleTooltipButton
        title="NFTs & Tokens"
        className="mx_NavBar_PageButtonGroup_button icon nfts-tokens"
        onClick={showTokensAndNftsPage}
        alignment={4}
      />
    </div>
  )
}

const SignInButton = ({ onLoginClick }) => {
  console.log("SignInButton");
  return (
    <div className="mx_NavBar_SignInButton common-btn green-btn px-4" onClick={onLoginClick}>
      Sign In
    </div>
  );
}; 

const CreateTableButton = ({ 
  createLabel,
  onClickCreate 
}) => {
  console.log("CreateTableButton");
  const showCreateRoomDialog = (e) => {
    console.log("create group in Navbar");
    e.preventDefault();
    e.stopPropagation();
    defaultDispatcher.dispatch({ action: "view_create_room" });
  };

  return (
    <div className="mx_NavBar_CreateRoomButton">
      <AccessibleButton 
        onClick={onClickCreate? onClickCreate : showCreateRoomDialog} 
        className="mx_NavBar_large_button common-btn btn-hover-green px-4"
      >
        {createLabel ? createLabel : _t("Create Group")}
      </AccessibleButton>
      <AccessibleButton 
        onClick={onClickCreate? onClickCreate : showCreateRoomDialog} 
        className="mx_NavBar_small_button"
      >
        <img src={require("../../../res/img/create-room.svg")} width={30} />
      </AccessibleButton>
    </div>
  );
};

const NavBarUserManage = ({
  isDarkTheme,
  isSignout,
  onLoginClick,
  createLabel,
  onClickCreate
}) => {
  console.log("NavBarUserManage");
  const [ethereumWalletsModalShow, setEthereumWalletsModalShow] = useState(false);
  const alert = useAlert();
  const wallets = useSelector((state: any) => state.wallet.wallets);

  const { narrow, walletIcon } = useMemo(() => {
    let narrow, walletIcon;
    if(wallets?.length) {
      narrow = (
        <div className="narrow">
        </div>
      );
    }
    walletIcon = (
      <div className={`wallet-icon ${(wallets?.length) ? "connected": ""}`}>
      </div>
    )
    return { narrow, walletIcon }
  }, [wallets]);

  const handleEthereumWalletsModal = (value) => {
    setEthereumWalletsModalShow(value)
  }

  const clickWalletAddButton = () => {
    // console.log("click wallet add button clicked");
    Modal.createTrackedDialog(
      "Wallet Dialog",
      "",
      WalletCategoryDialog,
      {
          handleEthereumWalletsModal,
          wallets
      },
      null,
      false,
      true
    )
  }

  const controlWallet = (wallet) => {
    Modal.createTrackedDialog(
      "Wallet Control Dialog",
      "",
      WalletControlDialog,
      {
          wallet,
          alert
      }
    )
  }

  const walletsDropdownOptions = useMemo(() => {
    let options = [];
    let childNode = <div  >{_t("Connect Wallet")}</div>;
    if(wallets?.length) {
      if(wallets?.length === 1) {
        childNode = (
          <div className="mx_Wallet_Info" key="connected-wallets">
            {`${wallets?.length} wallet connected`}
          </div>
        );
      }
      else {
        childNode = (
          <div className="mx_Wallet_Info" key="connected-wallets">
            {`${wallets?.length} wallets connected`}
          </div>
        );
      }
    }
    const connectStatus = (
      <div className="mx_Navbar_walletButton_dropdown_option" key="connected-wallets">
        {walletIcon}
        {childNode}
        {narrow}
      </div>
    );
    options.push(connectStatus);
    wallets?.forEach((wallet, index) => {
      let temp;
      if (wallet?.account?.publicKey?.toString()) temp = wallet?.account?.publicKey?.toString();
      else temp = wallet?.account || wallet?.publicKey?.toBase58();
      const trimPK = trimString(temp);
      let logoUrl;
      if(wallet?.wallet?.icon) {
        logoUrl = wallet?.wallet?.icon;
      }
      else {
        logoUrl = require(`../../../res/img/wallets/metamask.svg`);
      }
      let option = (
        <div className="mx_Navbar_walletButton_dropdown_option mx_Wallet_Info" key={index} onClick={() => {controlWallet(wallet)}}>
          <div className="mx_Wallet_logo">
            <img src={logoUrl}/>
          </div>
          <div>
            <div className="mx_Wallet_PK">{trimPK}</div>
            <div className="mx_Wallet_Name">
              <div className="mx_Wallet_State"></div>
              <div>{wallet.type}</div>
            </div>
          </div>
        </div>
      )
      options.push(option)
    })

    let addOption = (
      <div className="mx_Navbar_walletButton_dropdown_option add-option" key="add-option" onClick={clickWalletAddButton}>
        <div className="add-icon"></div>
        <div>Add Wallet</div>
      </div>
    )
    options.push(addOption);
    return options
  }, [wallets, narrow, walletIcon]);

  const userMenu = <UserMenu isMinimized={true} alert={alert} />
  const createTableButton = (isSignout || !MatrixClientPeg.get()) ? <></> : <CreateTableButton createLabel={createLabel} onClickCreate={onClickCreate}/>;
  let connectOrSignInButton = (
    <ConnectButton
      handleEthereumWalletsModal={handleEthereumWalletsModal}
      ethereumWalletsModalShow={ethereumWalletsModalShow}
    >
      <Dropdown
        id="mx_WalletsDropdown"
        className="mx_Navbar_walletButton common-btn btn-hover-green px-4"
        onOptionChange={(option) => {return;}}
        searchEnabled={false}
        value={"connected-wallets"}
        label={"Credits Dropdown"}
      >
        {walletsDropdownOptions}
      </Dropdown>
    </ConnectButton>
  );

  if (isSignout) {
    connectOrSignInButton = <SignInButton onLoginClick={onLoginClick} />;
  }

  const navBarUserManageClassName = classNames({
    mx_NavBar_UserManage: true,
  });

  return (
    <div className={navBarUserManageClassName}>
      {createTableButton}
      {connectOrSignInButton}
      {userMenu}

      {/* Hide for alpha */}
      {/* {
            props.isSignout
            ?
            <React.Fragment></React.Fragment>
            :
            <SwitchThemeButton />
        } */}
    </div>
  );
};

const NavBar = (props: NavBarProps) => {
  console.log("NavBar");
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  var themeWatcherRef;

  useEffect(() => {
    setIsDarkTheme(isUserOnDarkTheme());
    themeWatcherRef = SettingsStore.watchSetting("theme", null, onThemeChanged);
  }, []);

  useEffect(() => {
    if (props.onChangeTheme) {
      props.onChangeTheme(isDarkTheme);
    }
  }, [isDarkTheme]);

  const navBarClassName = classNames({
    mx_NavBar: true,
    dark_mode: isDarkTheme,
  });

  const onSwitchThemeClick = (ev: React.MouseEvent) => {
    ev.preventDefault();
    ev.stopPropagation();

    // Disable system theme matching if the user hits this button
    SettingsStore.setValue(
      "use_system_theme",
      null,
      SettingLevel.DEVICE,
      false
    );

    const newTheme = isDarkTheme ? "light" : "dark";
    SettingsStore.setValue("theme", null, SettingLevel.DEVICE, newTheme); // set at same level as Appearance tab
  };

  const isUserOnDarkTheme = (): boolean => {
    if (SettingsStore.getValue("use_system_theme")) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } else {
      const theme = SettingsStore.getValue("theme");
      if (theme.startsWith("custom-")) {
        return getCustomTheme(theme.substring("custom-".length)).is_dark;
      }
      return theme === "dark";
    }
  };

  const onThemeChanged = () => {
    setIsDarkTheme(isUserOnDarkTheme());
  };

  const SwitchThemeButton = () => {
    return (
      <div className="mx_NavBar_SwitchThemeButton">
        <AccessibleTooltipButton
          className="mx_UserMenu_contextMenu_themeButton"
          onClick={onSwitchThemeClick}
          title={
            isDarkTheme ? _t("Switch to light mode") : _t("Switch to dark mode")
          }
        ></AccessibleTooltipButton>
      </div>
    );
  };

  return (
    <div className={navBarClassName}>
      <div className="mx_NavBar_Search_Buttons">
        <NavBarLogoAndSearch
          searchInProgress={props.searchInProgress}
          onCancelClick={props.onCancelClick}
          onSearch={props.onSearch}
          isRoomEncrypted={props.isRoomEncrypted}
        />
        {!props.isSignout && <NavBarPageButtonGroup/>}
      </div>
      <NavBarUserManage
        isDarkTheme={isDarkTheme}
        isSignout={props.isSignout}
        onLoginClick={props.onLoginClick}
        createLabel={props.createLabel}
        onClickCreate={props.onClickCreate}
      />
    </div>
  );
};

export default NavBar;
