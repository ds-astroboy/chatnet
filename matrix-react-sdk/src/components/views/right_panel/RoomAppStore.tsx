import React, { useState, useEffect, FC } from "react";
import { Room } from "matrix-js-sdk/src/models/room";
import { _t } from "../../../languageHandler";
import BaseCard from "./BaseCard";
import AccessibleButton from "../elements/AccessibleButton";
import AccessibleTooltipButton from "../elements/AccessibleTooltipButton";
import { useMatrixContexts, setUserBackgrounds } from "../../../contexts";
import { mediaFromMxc } from "../../../customisations/Media";
import { MatrixClientPeg } from "../../../MatrixClientPeg";
import {
  aboveLeftOf,
  ContextMenuTooltipButton,
  useContextMenu,
} from "../../structures/ContextMenu";
import IconizedContextMenu, {
  IconizedContextMenuOption,
  IconizedContextMenuOptionList,
} from "../../views/context_menus/IconizedContextMenu";
import Lottie from 'lottie-react';
import classNames from "classnames";
import { useRovingTabIndex } from "../../../accessibility/RovingTabIndex";
import axios from "axios";

interface IProps {
  room: Room;
  onClose(): void;
  setLottieBgUrl?: (url: any) => void;
}

const BOTS = [
  {
    name: "Satoshi - Price Bot",
    point: 0,
    isBuy: false,
    during: "Monthly sub",
    avatar_url: require("../../../../res/img/bots/leon1.png"),
    description: "This is price bot for cryto price",
    bought: false
  },
  {
    name: "Hooman - Verification Bot",
    point: 0,
    isBuy: true,
    during: "Monthly sub",
    avatar_url: require("../../../../res/img/bots/bot2.png"),
    description: "This is human-verification bot to make sure your group members get verified before being able to chat.",
    bought: false
  },
  // {
  //   name: "Lee - Demo Bot",
  //   point: "350",
  //   isBuy: false,
  //   during: "Monthly sub",
  //   avatar_url: require("../../../../res/img/bots/bot2.png"),
  //   description: "This is a demo bot",
  // },
  // {
  //   name: "Karina - Demo Bot",
  //   point: "275",
  //   isBuy: false,
  //   during: "Monthly sub",
  //   avatar_url: require("../../../../res/img/bots/bot3.png"),
  //   description: "This is a demo bot",
  // },
];

const BACKGROUNDS = [
  {
    id: 0,
    isLottie: false,
    url: "",
    price: 0,
    isDefault: true
  }
]

// const exclusiveBg = [
//     {
//         id: 5,
//         type: "image",
//         url: require("../../../../res/img/backgrounds/exclusive/kreechures-1.png"),
//         status: "Owned",
//     },
//     {
//         id: 6,
//         type: "image",
//         url: require("../../../../res/img/backgrounds/exclusive/kreechures-2.png"),
//         status: "Not-Owned",
//         points: 1500
//     },
//     {
//         id: 7,
//         type: "image",
//         url: require("../../../../res/img/backgrounds/exclusive/kreechures-3.png"),
//         status: "Not-Owned",
//         points: 1200
//     },
//     {
//         id: 8,
//         type: "image",
//         url: require("../../../../res/img/backgrounds/exclusive/kreechures-4.png"),
//         status: "Owned",
//     },
//     {
//         id: 9,
//         type: "image",
//         url: require("../../../../res/img/backgrounds/exclusive/kreechures-5.png"),
//         status: "Owned",
//     },
//     {
//         id: 10,
//         type: "image",
//         url: require("../../../../res/img/backgrounds/exclusive/kreechures-6.png"),
//         status: "Not-Owned",
//         points: 1350
//     }
// ]

const AppStoreBot = ({ botInfo, room, setMarketPlaceName }) => {
  useEffect(() => {
    // Update the document title using the browser API
    const getBotPurchased = async (bot, room) => {
      if (bot.name == 'Hooman - Verification Bot'){
        const botPurchase = await axios.get(
            `https://node-main.cafeteria.gg/v1/bots/humanVerificationBot/${room.roomId}/getBotEnabled`,
            { validateStatus: false } // Accept 404 as a response code
        )

        if (botPurchase.status == 200){
          if (!bot.bought){
            bot.bought = true
            setMarketPlaceName("backgrounds");
            setMarketPlaceName("bots");
          }
        }
      }
    }

    if (!botInfo.bought){
      getBotPurchased(botInfo, room);
    }
  }, [BOTS]);
  return (
    <div className="mx_RoomAppStore_bot">
      <div className="mx_RoomAppStore_bot_avatar selected">
        <img src={botInfo.avatar_url} />
      </div>
      <div className="mx_RoomAppStore_bot_detail">
        <div className="mx_RoomAppStore_bot_name">{botInfo.name}</div>
        <div className="mx_RoomAppStore_bot_description">
          {botInfo.description}
        </div>
        <div className="mx_RoomAppStore_bot_priceSection">
            <div className="mx_RoomAppStore_bot_price">
              {botInfo.point?
              (
                <>
                  <img src={require("../../../../res/img/cafeteria-point.png")} />
                  <span>{botInfo.point}</span>
                </>
              ):
              "Free"}
            </div>
            {botInfo.isBuy && !botInfo.bought?
                (
                    <>
                      <div className="mx_RoomAppStore_bot_price purchase_button">
                        <AccessibleButton onClick={() => { purchaseBot(botInfo, room, setMarketPlaceName) }}>
                          Purchase
                        </AccessibleButton>
                      </div>
                    </>
                ):
                ""}
            {botInfo.isBuy && botInfo.bought?
                (
                    <>
                      <div className="mx_RoomAppStore_bot_price bot_purchased">
                        Purchased
                      </div>
                    </>
                ):
                ""}
            {!!botInfo.point && <div className="mx_RoomAppStore_bot_during">{botInfo.during}</div>}
        </div>
      </div>
    </div>
  );
};

const purchaseBot = async (bot, room, setMarketPlaceName) => {
  const authData = JSON.parse(window.localStorage.getItem("mx_userData"));
  const auth = authData.username + ':' + authData.password
  var base64encodedData = Buffer.from(auth).toString('base64');

  if (bot.name == 'Hooman - Verification Bot'){
    const botPurchase = await axios.post(
        `https://node-main.cafeteria.gg/v1/bots/humanVerificationBot/${room.roomId}/botPurchase`,
        { validateStatus: false, headers: {"Authorization": `Basic ${base64encodedData}`} } // Accept 404 as a response code
    )

    if (botPurchase.status == 201){
      bot.bought = true
      setMarketPlaceName("backgrounds");
      setMarketPlaceName("bots");
    }
  }
}

const AppStoreBackground = ({
  item,
  seletedBackgroundId,
  setSeletedBackgroundId,
  setLottieBgUrl,
  categoryName,
  room
}) => {
  const [controller, dispatch] = useMatrixContexts();
  const { userBackgrounds } = controller;
  let img_url = item.image_url;
  if(!item.isLottie && !item.isExclusive && !item.isDefault) {
    img_url = mediaFromMxc(
      item.image_url,
      MatrixClientPeg.get()
    ).getThumbnailOfSourceHttp(110, 110, "scale");
  }

  let status = (
    <div className="mx_RoomAppStore_Backgrounds_MarketPlace_item_status not_owned">
      {!item.isDefault ? (
        <>
          <img src={require("../../../../res/img/cafeteria-point.png")} />
          <span>{item.price}</span>
        </>
      )
      :
      "Default"}
    </div>
  );

  const setRoomViewBackground = () => {
    let backgrounds;
    if(categoryName === "exclusive") {
      backgrounds = {...userBackgrounds, [room.roomId]: {...item, image_url: img_url}};
    }
    else {
      backgrounds = {...userBackgrounds, global: {...item, image_url: img_url}, [room.roomId]: null}
    }
    setUserBackgrounds(dispatch, backgrounds);
    localStorage.setItem("userBackgrounds", JSON.stringify(backgrounds));
    
    if(item.isLottie) {
      document.getElementById(
        "main_split"
      ).style.background = `transparent`;
      setLottieBgUrl(item.url);
      return;
    }
    setLottieBgUrl(null);
    if(item.isExclusive) {
      document.getElementById(
        "main_split"
      ).style.background = `url(${img_url}) 100% / cover no-repeat`;  
    }
    document.getElementById(
      "main_split"
    ).style.background = `url(${img_url}) center center / cover no-repeat`;
  };

  useEffect(() => {
    const roomId = room.roomId;
    let keys = Object.keys(userBackgrounds);
    let index = keys.indexOf(roomId);
    let index1 = keys.indexOf("global");
    if(index !== -1 && userBackgrounds[roomId]) {
      setSeletedBackgroundId(userBackgrounds[roomId].id);
    }
    else if(index1 !== -1) {
      setSeletedBackgroundId(userBackgrounds.global.id);
    }
  }, [])
  
  return (
    <div
      className={`mx_RoomAppStore_Backgrounds_MarketPlace_item ${
        seletedBackgroundId === item.id ? "selected" : ""
      }`}
      onClick={() => {
        setSeletedBackgroundId(item.id);
        setRoomViewBackground();
      }}
    >
      {
        item.isLottie?       
          <Lottie 
            animationData={item.url} 
            className="mx_RoomAppStore_Backgrounds_MarketPlace_item_lottie"
            rendererSettings={{
              preserveAspectRatio: 'xMidYMid slice'
            }}
          />
        :
        <div
          className={"mx_RoomAppStore_Backgrounds_MarketPlace_item_img"}          
          style={{ backgroundImage: `url(${img_url})` }}
        >
        </div>
      }
      <div className="mx_RoomAppStore_Backgrounds_MarketPlace_item_detail">
        {status}
      </div>
    </div>
  );
};

const BackgroundsMarketPlace = ({ setLottieBgUrl, bgs, categoryName, room, setSeletedBackgroundId, seletedBackgroundId }) => {
  return (
    <div className="mx_RoomAppStore_Backgrounds_MarketPlace">
      <div className="mx_RoomAppStore_Backgrounds_MarketPlace_items">
        {bgs?.map((item, index) => {
          return (
            <AppStoreBackground
              item={item}
              setSeletedBackgroundId={setSeletedBackgroundId}
              setLottieBgUrl={setLottieBgUrl}
              seletedBackgroundId={seletedBackgroundId}
              key={index}
              categoryName={categoryName}
              room={room}
            />
          );
        })}
      </div>
    </div>
  );
};

const BotsMarketPlace = ({ botItems, room, setMarketPlaceName }) => {
  return (
    <div className="mx_RoomAppStore_Bots_MarketPlace">
      <div className="mx_RoomAppStore_Bots_MarketPlace_items">
        {botItems.map((bot, index) => {
          return <AppStoreBot botInfo={bot} room={room} setMarketPlaceName={setMarketPlaceName} key={index} />;
        })}
      </div>
    </div>
  );
};

const MarketPlace = ({ setMarketPlaceName, marketPlaceName, categoryName, setLottieBgUrl, room, setSeletedBackgroundId, seletedBackgroundId }) => {
  const [controller] = useMatrixContexts();
  const { backgrounds } = controller;

  let botItems = BOTS;
  let keys = backgrounds ? Object.keys(backgrounds) : [];
  let index = keys.indexOf("global_backgrounds");
  let bgs;
  if(index !== -1) {
    bgs =[...backgrounds["global_backgrounds"], ...BACKGROUNDS];
  }
  else {
    bgs = [...BACKGROUNDS];
  }

  if(categoryName === "exclusive") {
    bgs = [];
    if(room.roomId === "!ItxBzauJzSFYNPjHpv:main.cafeteria.gg") {
      bgs = [{
        image_url: require("../../../../res/img/backgrounds/kreechures1.png"),
        price: 500,
        isExclusive: true,
        id: 100
      }]
    }
  }

  switch (marketPlaceName) {
    case "backgrounds":
      return (
        <BackgroundsMarketPlace 
          setLottieBgUrl={setLottieBgUrl} 
          bgs={bgs} 
          categoryName={categoryName} 
          room={room}
          setSeletedBackgroundId={setSeletedBackgroundId}
          seletedBackgroundId={seletedBackgroundId}
        />
      );

    case "bots":
      return <BotsMarketPlace botItems={botItems} room={room} setMarketPlaceName={setMarketPlaceName} />;
  }
};

const OptionList = (props) => {
  return (
    <IconizedContextMenu
      {...props}
      className="mx_LeftPanel_Footer_OptionList"
      compact={true}
    >
      <IconizedContextMenuOptionList>
        <IconizedContextMenuOption
          label={"Reset to default"}
          onClick={() => {
            props.onFinished();
            props.resetDefaultBackground();
          }}
        />
      </IconizedContextMenuOptionList>
    </IconizedContextMenu>
  );
};

const OptionsButton = ({ resetDefaultBackground }) => {
  const [menuDisplayed, button, openMenu, closeMenu] = useContextMenu();
  const [onFocus, isActive, ref] = useRovingTabIndex(button);

  let contextMenu;
  if (menuDisplayed) {
    const buttonRect = button.current.getBoundingClientRect();
    contextMenu = (
      <OptionList
        {...aboveLeftOf(buttonRect)}
        onFinished={closeMenu}
        resetDefaultBackground={resetDefaultBackground}
      />
    );
  }

  const className = classNames("mx_RoomAppStore_default_background_reset_button", {
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

const CategoryButtons = ({ setCategoryName, categoryName, setSeletedBackgroundId }) => {

  return (
    <div className="mx_RoomAppStore_Categories">
      <AccessibleButton
        className={`mx_RoomAppStore_Category_Button top_button ${
          categoryName === "top" ? "active" : ""
        }`}
        onClick={() => {
          setCategoryName("top");
        }}
      />
      <AccessibleButton
        className={`mx_RoomAppStore_Category_Button exclusive_button ${
          categoryName === "exclusive" ? "active" : ""
        }`}
        onClick={() => {
          setCategoryName("exclusive");
        }}
      />
    </div>
  );
};

const MaketPlaceSwitchButtons = ({ setMarketPlaceName, marketPlaceName, isCreator }) => {
  return (
    <div className="mx_RoomAppStore_MarketPlace_Switch_Button_groups">
      <AccessibleButton
        className={`mx_RoomAppStore_MarketPlace_Switch_Button background_button`}
        onClick={() => {
          setMarketPlaceName("backgrounds");
        }}
      >
        <div>Backgrounds</div>
        <div className={`line ${marketPlaceName === "backgrounds"? "active" : ""}`}></div>
      </AccessibleButton>
      {isCreator?
          (
              <>
                <AccessibleButton
                    className={`mx_RoomAppStore_MarketPlace_Switch_Button bot_button`}
                    onClick={() => {
                      setMarketPlaceName("bots");
                    }}
                >
                  <div>Bots & Plugins</div>
                  <div className={`line ${marketPlaceName === "bots"? "active" : ""}`}></div>
                </AccessibleButton>
              </>
          ):
          ""}
    </div>
  );
};

const CategoryName = ({ marketPlaceName, categoryName }) => {
  return (
    <div className="mx_RoomAppStore_CategoryName">
      {
        marketPlaceName === "backgrounds" && categoryName == "top"
        ?
        "Non-exclusive"
        :
        marketPlaceName === "backgrounds" && categoryName != "top"
        ?
        "Exclusive"
        :
        marketPlaceName === "bots" && categoryName == "top"
        ?
        "Chat Bots"
        :
        "Chat Plugins"
      }
    </div>
  )
}

const RoomAppStore: FC<IProps> = (props: IProps) => {
  const [marketPlaceName, setMarketPlaceName] = useState("backgrounds");
  const [categoryName, setCategoryName] = useState("top");
  const [seletedBackgroundId, setSeletedBackgroundId] = useState(0);
  let roomCreator;
  const myUserId = props.room.myUserId;
  let isCreator = false;
  props.room.currentState.events.forEach((eventMap) => {
    eventMap.forEach((event)=> {
      if(event.getType() == "m.room.create") {
        roomCreator = event.getSender();
        isCreator = (roomCreator == myUserId)
      }
    })
  })

  return (
    <BaseCard onClose={props.onClose}>
      <div className="mx_RoomAppStore">
        {/* <div className="mx_RoomAppStore_status">
          <img src={require("../../../../res/img/fruit-bite.svg")}/>
          <span className="dark bold mt-2">Coming Soon...</span>
        </div> */}
        <div className="mx_RoomAppStore_header">
          <div className="mx_RoomAppStore_title px-4 py-2 big-shadow">
            <div className="mx_RoomAppStore_icon"></div>
            <div className="mx_RoomAppStore_name dark bold">Marketplace</div>
          </div>
        </div>
        <MaketPlaceSwitchButtons
          setMarketPlaceName={setMarketPlaceName}
          marketPlaceName={marketPlaceName}
          isCreator={isCreator}
        />
        <CategoryButtons
          setCategoryName={setCategoryName}
          categoryName={categoryName}
          setSeletedBackgroundId={setSeletedBackgroundId}
        />
        <CategoryName 
          categoryName={categoryName}
          marketPlaceName={marketPlaceName}
        />
        <MarketPlace
          setMarketPlaceName={setMarketPlaceName}
          marketPlaceName={marketPlaceName}
          categoryName={categoryName}
          setLottieBgUrl={props.setLottieBgUrl}
          room={props.room}
          setSeletedBackgroundId={setSeletedBackgroundId}
          seletedBackgroundId={seletedBackgroundId}
        />
      </div>
    </BaseCard>
  );
};

export default RoomAppStore;
