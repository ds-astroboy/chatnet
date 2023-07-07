import React, { FC } from "react";
import { useRovingTabIndex } from "../../accessibility/RovingTabIndex";
import dis from "../../dispatcher/dispatcher";
import {
  aboveLeftOf,
  ContextMenuTooltipButton,
  useContextMenu,
} from "./ContextMenu";
import { _t } from "../../languageHandler";
import IconizedContextMenu, {
  IconizedContextMenuOption,
  IconizedContextMenuOptionList,
} from "../views/context_menus/IconizedContextMenu";
import classNames from "classnames";

interface IProps {
  isMinimized: boolean;
  isMobileView: boolean;
}

const OptionList = (props) => {
  const showPage = (pageName: string) => {
    dis.dispatch({
      action: `view_${pageName}_page`,
    });
    props.onFinished();
  };

  const showContactWindow = () => {
    window.open("https://mail.google.com/mail/?view=cm&fs=1&to=contact@cafeteria.gg", "_blank");
    props.onFinished();
  }

  const showTwitterWindow = () => {
    window.open("https://twitter.com/cafeteriagg", "_blank");
    props.onFinished();
  }

  let items = (
    <IconizedContextMenuOptionList>
      <IconizedContextMenuOption
        label={"Contact"}
        onClick={() => showContactWindow()}
      />
      <IconizedContextMenuOption
        label={"Twitter"}
        onClick={() => showTwitterWindow()}
      />
    </IconizedContextMenuOptionList>
  );
  if (props.isMinimized) {
    items = (
      <IconizedContextMenuOptionList>
        <IconizedContextMenuOption
          label={"Home"}
          onClick={() => showPage("home")}
        />
        <IconizedContextMenuOption
          label={"About"}
          onClick={() => showPage("about")}
        />
        <IconizedContextMenuOption
          label={"Privacy"}
          onClick={() => showPage("privacy")}
        />
        <IconizedContextMenuOption
          label={"Terms"}
          onClick={() => showPage("terms")}
        />
        <IconizedContextMenuOption
          label={"Contact"}
          onClick={() => showContactWindow()}
        />
        <IconizedContextMenuOption
          label={"Twitter"}
          onClick={() => showTwitterWindow()}
        />
      </IconizedContextMenuOptionList>
    );
  }
  return (
    <IconizedContextMenu
      {...props}
      className="mx_LeftPanel_Footer_OptionList"
      compact={true}
    >
      {items}
    </IconizedContextMenu>
  );
};

const OptionsButton = ({ isMinimized, isMobileView }) => {
  const [menuDisplayed, button, openMenu, closeMenu] = useContextMenu();
  const [onFocus, isActive, ref] = useRovingTabIndex(button);

  let contextMenu;
  if (menuDisplayed) {
    const buttonRect = button.current.getBoundingClientRect();
    contextMenu = (
      <OptionList
        {...aboveLeftOf(buttonRect)}
        onFinished={closeMenu}
        isRight={isMobileView? true : false}
        isLeft={isMobileView? false: true}
        isMinimized={isMinimized}
      />
    );
  }

  const className = classNames("mx_LeftPanel_Footer_more_dots", {
    active: menuDisplayed,
  });

  return (
    <React.Fragment>
      <ContextMenuTooltipButton
        className={className}
        title={"More"}
        onClick={openMenu}
        isExpanded={menuDisplayed}
        inputRef={ref}
        onFocus={onFocus}
        tabIndex={isActive ? 0 : -1}
      />

      {contextMenu}
    </React.Fragment>
  );
};

const LeftPanelFooter: FC<IProps> = ({ isMinimized, isMobileView }) => {
  const year = new Date().getFullYear();

  const showPage = (pageName: string) => {
    dis.dispatch({ action: `view_${pageName}_page` });
  };

  return (
    <div className="mx_LeftPanel_Footer">
      <div className="mx_LeftPanel_Footer_infos">
        <a
          className="mx_LeftPanel_Footer_info"
          onClick={() => showPage("home")}
        >
          Home
        </a>
        <a
          className="mx_LeftPanel_Footer_info"
          onClick={() => showPage("about")}
        >
          About
        </a>
        <a
          className="mx_LeftPanel_Footer_info"
          onClick={() => showPage("terms")}
        >
          Terms
        </a>
        <a
          className="mx_LeftPanel_Footer_info"
          onClick={() => showPage("privacy")}
        >
          Privacy
        </a>
        <OptionsButton isMinimized={isMinimized} isMobileView={isMobileView}/>
      </div>
      <div className="mx_LeftPanel_Footer_prev">
        <a className="mx_LeftPanel_Footer_info year">{`@${year} Cafeteria.gg`}</a>
      </div>
    </div>
  );
};

export default LeftPanelFooter;
