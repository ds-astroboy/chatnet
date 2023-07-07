import * as React from "react";
import { useState, useEffect } from "react";
import AutoHideScrollbar from "./AutoHideScrollbar";
import { getHomePageUrl } from "../../utils/pages";
import { _t } from "../../languageHandler";
import SdkConfig from "../../SdkConfig";
import * as sdk from "../../index";
import dis from "../../dispatcher/dispatcher";
import AccessibleButton from "../views/elements/AccessibleButton";
import AccessibleTooltipButton from "../views/elements/AccessibleTooltipButton";
import Analytics from "../../Analytics";
import CountlyAnalytics from "../../CountlyAnalytics";
import NavBar from "./NavBar";
import { MatrixClientPeg } from "../../MatrixClientPeg";
import { mediaFromMxc } from "../../customisations/Media";
import Dropdown from "../views/elements/Dropdown";
import classNames from "classnames";
import { createClient } from "matrix-js-sdk/src/matrix";
import SettingsStore from "../../settings/SettingsStore";
import { SettingLevel } from "../../settings/SettingLevel";
import { getCustomTheme } from "../../theme";
import {
  checkHideRoom,
  checkVerifiedUserOrRoom,
} from "../../hooks/commonFuncs";
import { useMatrixContexts } from "../../contexts";
import { BarrierTootip, BarrierType } from "../../@types/barrier";
import { MatrixClientConfig } from "../../@types/variables";
import { PublicRoomType } from "../../@types/publicRoom";
import { MatrixClient, RoomMember } from "matrix-js-sdk/src";
import EffectsOverlay from "../views/elements/EffectsOverlay";
import ContextProvider from "./contextProvider";
import LoadingScreen from "../views/rooms/LoadingScreen";
import LoadingLottie from "../../../res/img/cafeteria-loading.json";
import GroupFilterOrderStore from "../../stores/GroupFilterOrderStore";
import NetworkDropdown, { ALL_ROOMS, Protocols } from "../views/directory/NetworkDropdown";
import FlairStore from "../../stores/FlairStore";
import GroupStore from "../../stores/GroupStore";
import { IRoomDirectoryOptions } from "matrix-js-sdk/src/@types/requests";
import ScrollPanel from "./ScrollPanel";
import Spinner from "../views/elements/Spinner";
import { checkBarrierRooms, getCategoryForRoom } from "../../apis";
import axios from "axios";
import { httpsRequest } from "../../@types/httpsRequest";
import { useAlert } from 'react-alert'
import { titleString } from "../../utils/strings";
import { Action } from "../../dispatcher/actions";
import { CAFETERIAOFFICIALGROUPID } from "../../@variables/common";
import UserInfoButton from "../views/right_panel/UserInfoButton";

const LAST_SERVER_KEY = "mx_last_room_directory_server";
const LAST_INSTANCE_KEY = "mx_last_room_directory_instance";

// const onClickSendDm = () => {
//     Analytics.trackEvent('home_page', 'button', 'dm');
//     CountlyAnalytics.instance.track("home_page_button", { button: "dm" });
//     dis.dispatch({ action: 'view_create_chat' });
// };

// const onClickExplore = () => {
//     Analytics.trackEvent('home_page', 'button', 'room_directory');
//     CountlyAnalytics.instance.track("home_page_button", { button: "room_directory" });
//     dis.fire(Action.ViewRoomDirectory);
// };

// const getOwnProfile = (userId: string) => ({
//     displayName: OwnProfileStore.instance.displayName || userId,
//     avatarUrl: OwnProfileStore.instance.getHttpAvatarUrl(AVATAR_SIZE),
// });

// const UserWelcomeTop = () => {
//     const cli = useContext(MatrixClientContext);
//     const userId = cli.getUserId();
//     const [ownProfile, setOwnProfile] = useState(getOwnProfile(userId));
//     useEventEmitter(OwnProfileStore.instance, UPDATE_EVENT, () => {
//         setOwnProfile(getOwnProfile(userId));
//     });

//     return <div>
//         <MiniAvatarUploader
//             hasAvatar={!!ownProfile.avatarUrl}
//             hasAvatarLabel={_t("Great, that'll help people know it's you")}
//             noAvatarLabel={_t("Add a photo so people know it's you.")}
//             setAvatarUrl={url => cli.setAvatarUrl(url)}
//         >
//             <BaseAvatar
//                 idName={userId}
//                 name={ownProfile.displayName}
//                 url={ownProfile.avatarUrl}
//                 width={AVATAR_SIZE}
//                 height={AVATAR_SIZE}
//                 resizeMethod="crop"
//             />
//         </MiniAvatarUploader>

//         <h1>{ _t("Welcome %(name)s", { name: ownProfile.displayName }) }</h1>
//         <h4>{ _t("Now, let's help you get started") }</h4>
//     </div>;
// };

interface IProps {
  justRegistered?: boolean;
  onChangeTheme?: (isDarkTheme: boolean) => void;
  isMinimized?: boolean;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  isSignout?: boolean;
  isMobileView?: boolean;
  setIsShowLeftPanel?: (value: boolean) => void;
}

const onClickNewRoom = () => {
  console.log("create group in homepage");
  Analytics.trackEvent("home_page", "button", "create_room");
  CountlyAnalytics.instance.track("home_page_button", {
    button: "create_room",
  });
  dis.dispatch({ action: "view_create_room" });
};

const showPublicRoom = (roomId: string) => {
  if (MatrixClientPeg.get()) {
    dis.dispatch({
      action: "view_room",
      show_room_tile: true, // make sure the room is visible in the list
      room_id: roomId,
    });
  } else {
    dis.dispatch({
      action: "start_login",
    });
  }
};

const FirstBackground: React.FC<{
  isSignout: boolean;
  setIsShowLeftPanel: (value: boolean) => void;
}> = ({ isSignout, setIsShowLeftPanel }) => {

  const showRecommendedGroups = () => {
    setIsShowLeftPanel(true);
  };

  const showLearnVideo = () => {
    dis.dispatch({
      action: "show_learn_video"
    })
  }

  let buttonsGroup;
  if (isSignout) {
    buttonsGroup = (
      <div className="mx_HomePage_introSection_button_group">
        <AccessibleButton
          onClick={showRecommendedGroups}
          className="common-btn green-btn btn-hover-purple px-4 mx-4 mx_HomePage_button_createGroup"
        >
          {"Recommended Groups"}
        </AccessibleButton>
      </div>
    );
  } else {
    buttonsGroup = (
      <div className="mx_HomePage_introSection_button_group">
        <AccessibleButton
          onClick={onClickNewRoom}
          className="common-btn btn-large green-btn btn-hover-purple px-4 mx-4"
        >
          Create Group
        </AccessibleButton>
        <AccessibleTooltipButton 
          onClick={null} 
          className="common-btn btn-large btn-hover-purple px-4 learn-btn mx-4 shadow"
          alignment={3}
          title="Coming Soon"
        >
        {/* <AccessibleToop onClick={showLearnVideo} className="common-btn btn-hover-purple px-4 learn-btn mx-4"> */}
          <div className="icon"></div>
          <div className="content">{"Learn"}</div>
        {/* </AccessibleButton> */}
        </AccessibleTooltipButton>
      </div>
    );
  }
  
  return (
    <div className="mx_HomePage_First_background">
      <img src={require("../../../res/img/Illustration.svg")} className="mx_HomePage_left_illustration"/>
      <img src={require("../../../res/img/right-table-caf.svg")} className="mx_HomePage_right_table"/>
      <div className="mx_HomePage_introSection">
        <div className="mx_HomePage_introSection_content">
          <img src={require("../../../res/img/findyourforevergroup.svg")}/>
          <div className="mx_HomePage_introSection_statement">
            Join thriving communities & create your own exclusive or non-exclusive groups using easy plug & play tools!
          </div>
        </div>
        {buttonsGroup}
      </div>
      <div className="mx_HomePage_mobile_bg">
        <img src={require("../../../res/img/bg-graphics.svg")}/>
      </div>
    </div>
  );
};

const ChatCategoriesHeader: React.FC<{
  allCategories: string[];
  setSelectedCategory: (value: string) => void;
  selectedCategory: string;
}> = ({ allCategories, setSelectedCategory, selectedCategory }) => {
  const handCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="mx_HomePage_Chat_categories_header">
      <div className="mx_HomePage_Chat_categories_header_container">
        {["All", ...allCategories].map((category: string) => {
          return (
            <div
              key={category}
              className={`mx_HomePage_category ${
                category === selectedCategory ? "selected" : ""
              }`}
              onClick={() => handCategoryClick(category)}
            >
              {category}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CategoriesFilterBar: React.FC<{
  publicRoomInfo: PublicRoomType[];
  matrixClient: MatrixClient | undefined;
  isSignout: boolean;
  setFilterInfo: (info: string) => void;
  filterInfo: string
}> = ({ publicRoomInfo, matrixClient, isSignout, setFilterInfo, filterInfo }) => {
  
  const filterInfos = ["popular", "newest", "oldest"];

  const filterOptions = filterInfos.map((item) => {
    return (
      <div key={item} className="filter-option d-flex align-items-center">
        <div className={`icon ${item} img-fill`}></div>
        <div className="content">
          { titleString(item) }
        </div>
      </div>
    );
  });

  const roomIds = [];
  if (!isSignout) {
    publicRoomInfo.map((room) => {
      if (!matrixClient?.getRoom(room.room_id)) roomIds.push(room.room_id);
    });
  }

  const onFilterChange = (filter: string) => {
    setFilterInfo(filter);
  };

  const joinToRandomPublicRoom = () => {
    const count = roomIds.length;
    if (!count) return;
    const randomNumber = Math.floor(count * Math.random());
    dis.dispatch({
      action: "view_room",
      show_room_tile: true, // make sure the room is visible in the list
      room_id: roomIds[randomNumber],
    });
  };

  const JoinRandomButton = () => {
    return (
      <div
        className="mx_HomePage_JoinRandom_bt px-3"
        onClick={joinToRandomPublicRoom}
      >
        <div className="mx_HomePage_JoinRandom_bt_img">
        </div>
        <div className="mx_HomePage_JoinRandom_bt_content">Join Random</div>
      </div>
    )
  }

  const FilterButton = () => {
    return (
      <Dropdown
        id="mx_LanguageDropdown"
        onOptionChange={onFilterChange}
        searchEnabled={false}
        value={filterInfo}
        label={_t("Language Dropdown")}
      >
        { filterOptions }
      </Dropdown>
    )
  }

  return (
    <div className="mx_HomePage_Categories_Filterbar">
      <div className="mx_HomePage_filterbar_leftSection">
        <div className="mx_HomePage_Filterbar_title">Explore Groups</div>
        <JoinRandomButton/>
      </div>
      <div className="mx_HomePage_filterbar_rightSection">
        <div className="mx_HomePage_filter_select d-flex justify-content-center align-items-center">
          <div className="mx_HomePage_filter_select_title dark bold mx-4">
            Filter Groups
          </div>
          <FilterButton />
          <JoinRandomButton/>
        </div>
      </div>
    </div>
  );
};

const PublicRoom: React.FC<{
  room: PublicRoomType;
  isSignout: boolean;
  matrixClient: MatrixClient | undefined;
  selectedCategory: string;
  searchString: string;
}> = ({ room, isSignout, matrixClient, selectedCategory, searchString }) => {
  const [onlineNumber, setOnlineNumber] = useState(0);
  const [isShowPublicRoom, setIsShowPublicRoom] = useState(true);
  const [roomDisplayName, setRoomDisplayName] = useState(room.name);
  const [roomTopic, setRoomTopic] = useState(room.topic);
  
  const publicRoom = matrixClient?.getRoom(room.room_id);

  const imageUrl =
    room.avatar_url && matrixClient
      ? mediaFromMxc(room.avatar_url, matrixClient).getThumbnailOfSourceHttp(
          150,
          150,
          "scale"
        )
      : null;      
  const isVerified = checkVerifiedUserOrRoom(room.room_id, room.name);
  let exclusiveBadge, roomBadge, tooltip, verifiedBadge;
  const roomBadgeClassName = classNames("mx_HomePage_Public_room_badge_logo", {
    barrier_badge: !!room.barrierInfo?.type,
  });
  const nameClass = classNames({
    mx_HomePage_Public_room_name: true,
    mx_HomePage_Public_room_verified: isVerified,
  });

  let tooltipLabel;

  if (room.barrierInfo?.type) {
    if(room.barrierInfo?.type !== BarrierType.WalletCheck && room.barrierInfo?.type !== BarrierType.WalletPay) {
      tooltipLabel = BarrierTootip[room.barrierInfo?.type]
    }
    else {
      if(room.barrierInfo?.type === BarrierType.WalletCheck) {
        tooltipLabel = `Crypto(${room.barrierInfo?.currency_type}) Barrier Room(Check)`
      }
      else {
        tooltipLabel = `Crypto(${room.barrierInfo?.currency_type}) Barrier Room(Pay)`
      }
    }

    exclusiveBadge = (
      <div className="mx_HomePage_Public_room_category exclusive">
        Exclusive
      </div>
    );

    tooltip = <div className="mx_HomePage_Public_room_tooltip">
      {tooltipLabel}
    </div>

    roomBadge = (
      <div className="mx_HomePage_Public_room_badge">
        <div className="mx_HomePage_Public_room_badge_container">
          { tooltip }
          <div className={roomBadgeClassName}></div>
        </div>
      </div>
    );
  }

  if (isVerified) {
    verifiedBadge = <div className="mx_User_verified"></div>;
  }

  let roomDetail = (
    <div className="mx_HomePage_Public_room_detail">
      <div className={nameClass}>
        <span
          dangerouslySetInnerHTML={{
            __html : roomDisplayName
          }}
        />
        {verifiedBadge}
      </div>
      <div 
        className="mx_HomePage_Public_room_topic"
        dangerouslySetInnerHTML={{
          __html : roomTopic
        }}
      ></div>
      <div className="mx_HomePage_Public_room_subinfo">
        {room.categoryName && (
          <div className="mx_HomePage_Public_room_category">
            <div className={`icon ${room.categoryName.toLowerCase()}`}></div>
            <div className="content dark">
              {room.categoryName}
            </div>
          </div>
        )}
        {/* {exclusiveBadge} */}
      </div>
    </div>
  );
  let members = (
    <div className="mx_HomePage_Public_room_members">
      {!isSignout ? (
        <>
          <div className="mx_HomePage_Public_room_members_img px-1">
            <img src={require("../../../res/img/person-white.png")} />
          </div>
          <div className="mx_HomePage_Public_room_member_number">
            {onlineNumber}
          </div>
        </>
      ): 
      (
        <>
          <div className="mx_HomePage_Public_room_members_img px-1">
            <img src={require("../../../res/img/person-white.png")} />
          </div>
          <div className="mx_HomePage_Public_room_member_number">
            {room.num_joined_members}
          </div>
        </>
      )}
    </div>
  )

  let publicRoomCard = (
    <div
      className="mx_HomePage_Public_room"
      onClick={() => {
        showPublicRoom(room.room_id);
      }}
    >
      <div 
        className="mx_HomePage_Public_room_img"
        style={imageUrl? {backgroundImage: `url(${imageUrl})`} : null}
      >
        {/* <img src={imageUrl} /> */}
        { members }
        { roomBadge }
      </div>
      { roomDetail }
    </div>
  );

  const onPresenceUpdate = () => {
    const myId = publicRoom?.myUserId;
    const members = publicRoom?.getJoinedMembers();
    let count = 0
    let isJoin = false;
    members?.map((member: RoomMember) => {
        if(member.user?.presence == "online" && myId != member.userId) {
            count ++;
        }
        if(myId == member.userId) {
            isJoin = true;
        }
    })
    if(isJoin) count ++;
    setOnlineNumber(count);
}   

  useEffect(() => {
    if (selectedCategory === room.categoryName || selectedCategory === "All") {
      setIsShowPublicRoom(true);
    } else setIsShowPublicRoom(false);

    if(searchString) {
      let index1 = room.name.toUpperCase().indexOf(searchString.toUpperCase());
      let index2 = -1;
      let searchRegEx = new RegExp(searchString, 'ig');
      if(room.topic) {
        index2 = room.topic?.toUpperCase().indexOf(searchString.toUpperCase());
      }
      if(index1 !== -1 || index2 !== -1) {
        if(index1 !== -1) {
          const nameColor = room.name.replace(searchRegEx, match => `<span style="background-color: yellow">${match}</span>` );
          setRoomDisplayName(nameColor);
        }
        else {
          setRoomDisplayName(room.name);
        }
        if(index2 !== -1) {
          const topicColor = room.topic.replace(searchRegEx, match => `<span style="background-color: yellow">${match}</span>` );
          setRoomTopic(topicColor);
        }
        else {
          setRoomTopic(room.topic)
        }
        setIsShowPublicRoom(true)
      }
      else {
        setIsShowPublicRoom(false)
      }
    }
    else {
      setRoomDisplayName(room.name);
      setRoomTopic(room.topic)
    }
  }, [selectedCategory, searchString]);

  useEffect(() => {
    onPresenceUpdate();
    const members = publicRoom?.getJoinedMembers(); 
    members?.map((member: RoomMember) => {
        matrixClient?.getUser(member.userId).on("User.currentlyActive", onPresenceUpdate)
        matrixClient?.getUser(member.userId).on("User.presence", onPresenceUpdate)
    })

    return () => {
        members?.map((member: RoomMember) => {
          matrixClient?.getUser(member.userId).off("User.currentlyActive", onPresenceUpdate)
          matrixClient?.getUser(member.userId).off("User.presence", onPresenceUpdate)
        })
    }
  }, [])

  return isShowPublicRoom ? publicRoomCard : <React.Fragment></React.Fragment>;
};

const PublicGroups: React.FC<{
  publicRoomInfo: PublicRoomType[];
  matrixClient: MatrixClient | undefined;
  isSignout: boolean;
  selectedCategory: string;
  searchString: string;
}> = ({ publicRoomInfo, matrixClient, isSignout, selectedCategory, searchString }) => {
  let publicRooms;
  if (publicRoomInfo.length) {
    publicRooms = publicRoomInfo.map((room) => {
      let isJoined = false;
      if (!isSignout) {
        isJoined = !!matrixClient?.getRoom(room.room_id);
      }
      let isHideRoom = checkHideRoom(room.name);
      if (isHideRoom) return;
      return (
        <PublicRoom
          key={room.room_id}
          room={room}
          isSignout={isSignout}
          matrixClient={matrixClient}
          selectedCategory={selectedCategory}
          searchString={searchString}
        />
      );
    });
  }
  return <div className="mx_HomePage_Public_groups">{publicRooms}</div>;
};

const ChatCategories: React.FC<{
  publicRoomInfo: PublicRoomType[];
  allCategories: string[];
  matrixClient: MatrixClient | undefined;
  isSignout: boolean;
  searchString: string;
  isLoading: boolean;
  setFilterInfo: (info: string) => void;
  filterInfo: string;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}> = ({ publicRoomInfo, allCategories, matrixClient, isSignout, searchString, isLoading, filterInfo, setFilterInfo, selectedCategory, setSelectedCategory }) => {
  return (
    <div className="mx_HomePage_Chat_category">
      <ChatCategoriesHeader
        allCategories={allCategories}
        setSelectedCategory={setSelectedCategory}
        selectedCategory={selectedCategory}
      />
      <div className="mx_HomePage_Chat_category_body">
        <CategoriesFilterBar
          publicRoomInfo={publicRoomInfo}
          matrixClient={matrixClient}
          isSignout={isSignout}
          setFilterInfo={setFilterInfo}
          filterInfo={filterInfo}
        />
        <PublicGroups
          publicRoomInfo={publicRoomInfo}
          matrixClient={matrixClient}
          isSignout={isSignout}
          selectedCategory={selectedCategory}
          searchString={searchString}
        />
        { isLoading && <Spinner/> }
      </div>
    </div>
  );
};

const Header: React.FC<{
  setIsShowLeftPanel: (value: boolean) => void;
  isMobileView: boolean;
}> = ({ setIsShowLeftPanel, isMobileView }) => {
  const className = classNames("mx_HomePage_Header");

  const showVotePage = () => {
    if (isMobileView) return;
    dis.dispatch({ action: "view_vote_page" });
  };

  const showHomePage = () => {
    dis.dispatch({ action: "view_home_page" });
    setIsShowLeftPanel(false);
  };

  const showMessagePanel = () => {
    setIsShowLeftPanel(true);
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

  const changeTheme = () => {
    SettingsStore.setValue(
      "use_system_theme",
      null,
      SettingLevel.DEVICE,
      false
    );
    const isDarkTheme = isUserOnDarkTheme();
    const newTheme = isDarkTheme ? "light" : "dark";
    SettingsStore.setValue("theme", null, SettingLevel.DEVICE, newTheme); // set at same level as Appearance tab
  };

  return (
    <div className={className}>
      <div className="mx_HomePage_Header_logo" onClick={showHomePage}>
        <img src={require("../../../res/img/cafeteria-icon-svg.svg")} />
      </div>
      <div className="mx_HomePage_Header_Buttons">
        <div
          className="mx_HomePage_Header_Button message_button"
          onClick={showMessagePanel}
        ></div>
        <div
          className="mx_HomePage_Header_Button vote_button"
          onClick={showVotePage}
        ></div>
      </div>
      {/* <div className="dropdown">
        <input
          type="checkbox"
          id="mx_HomePage_Header_menu_checkbox"
          className="mx_HomePage_Header_menu_checkbox"
        />
        <label
          className="dropdown__face"
          htmlFor="mx_HomePage_Header_menu_checkbox"
        >
          <div className="mx_HomePage_Header_menu_Button"></div>
        </label>
        <ul className="dropdown__items">
          <div className="dropdown__item" onClick={changeTheme}>
            <div className="dropdown__item__darkIcon"></div>
            <div className="dropdown__item__switchIcon"></div>
            <div className="dropdown__item__lightIcon"></div>
          </div>
        </ul>
      </div> */}
      <UserInfoButton />
    </div>
  );
};

const HomePage: React.FC<IProps> = ({
  justRegistered = false,
  onChangeTheme,
  isMinimized,
  onLoginClick,
  onRegisterClick,
  isSignout,
  isMobileView,
  setIsShowLeftPanel,
}) => {
  const config = SdkConfig.get();
  const pageUrl = getHomePageUrl(config);
  const [matrixClient, setMatrixClient] = useState(null);
  const [searchString, setSearchString] = useState("");
  const [publicRooms, setPublicRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [nextBatch, setNextBatch] = useState(null);
  const [limit, setLimit] = useState(20);
  const [filterInfo, setFilterInfo] = useState("popular");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [controller] = useMatrixContexts();
  const { publicRoomInfo, allCategories } = controller;
  const alert = useAlert();

  var startTime: number; 
  var unmounted: boolean = false

  useEffect(() => {
    getInitialState();
    getMatrixClient();    
    getMoreRooms();
    return () => {
      CountlyAnalytics.instance.trackRoomDirectory(startTime);
    } 
  }, []);

  useEffect(() => {
    if(MatrixClientPeg.currentUserIsJustRegistered()) {
      console.log("joining to cafeteria official room");
      Promise.resolve().then(() => {
          dis.dispatch({
              action: Action.JoinRoom,
              roomId: CAFETERIAOFFICIALGROUPID,
              opts: { inviteSignUrl: null },
              _type: "unknown", // TODO: instrumentation
          });
          return Promise.resolve();
      });
      dis.dispatch({
        action: "effects.confetti",
        isHomePage: true
      })
      dis.dispatch({
        action: "show_Congratulation_Dialog",
        userId: MatrixClientPeg.get().getUserId()
      })
      MatrixClientPeg.setJustRegisteredUserId(null);
    }
  }, [publicRoomInfo])

  useEffect(() => {
    if(publicRooms.length) {
      setInitialLoading(false);
    }
  }, [publicRooms])

  useEffect(() => {
    setPublicRooms([]);
    setLimit(20);
    setNextBatch(null);
    setIsLoading(true);
  }, [filterInfo, selectedCategory])

  useEffect(() => {
    if(!publicRooms.length && limit === 20 && nextBatch === null && isLoading) {
      getMoreRooms();
    }
  }, [publicRooms, limit, nextBatch, isLoading])

  const getMatrixClient = () => {
    let cli = MatrixClientPeg.get();
    if (!cli) {
      cli = createClient({
        baseUrl: MatrixClientConfig.hsUrl,
        idBaseUrl: MatrixClientConfig.isUrl,
      });
    }
    setMatrixClient(cli);
  }

  const onSearch = (str: string) => {
    setSearchString(str);
  }

  const clickSearchCancel = () => {
    setSearchString("");
  }

  const track = (action: string) => {
    Analytics.trackEvent('RoomDirectory', action);
  }

  const getInitialState = () => {
    setInitialLoading(true);
    CountlyAnalytics.instance.trackRoomDirectoryBegin();
    startTime = CountlyAnalytics.getTimestamp();
    getMoreRooms();
  }

  const onFillRequest = (backwards: boolean) => {
    if (backwards || (!nextBatch && filterInfo === "all") || (limit === 20 && filterInfo !== "all")) return Promise.resolve(false);

    return getMoreRooms();
  };

  const getBarrierInfos = async(chunkRooms) => {
    let arr = [];
    let barriers = [];

    arr = await new Promise(async (resolve, reject) => {
        let arr1 = [];
        for (let i = 0; i < chunkRooms.length; i++) {
            let val = checkBarrierRooms(chunkRooms[i].room_id).then();
            arr1.push(val);
        }
        try {
            Promise.allSettled(arr1).then((data1) => {
                resolve(data1);
            })
        }
        catch (e) {
            console.error(e);
            reject(e);
        }
    })

    if (arr.length) {
        barriers = arr.map((item) => item.value);
    }
    return barriers;
  }

  const getCategories = async(chunkRooms) => {
    let arr = [];
    let categories = [];
    arr = await new Promise(async (resolve, reject) => {
        let arr1 = [];
        for (let i = 0; i < chunkRooms.length; i++) {
            let val = getCategoryForRoom(chunkRooms[i].room_id).then();
            arr1.push(val);
        }
        try {
            Promise.allSettled(arr1).then((data1) => {
                resolve(data1);
            })
        }
        catch (e) {
            console.error(e);
            reject(e);
        }
    })
    if (arr.length) {
        categories = arr.map((item) => item.value);
    }
    return categories
  }

  const getCategoryAndBarrierInfos = async (chunkRooms) => {
    let barriers = await getBarrierInfos(chunkRooms);
    let categories = await getCategories(chunkRooms);
    let roomsInfo = chunkRooms.map((room, index) => {
      let info = {
          ...room,
          barrierInfo: barriers[index],
          categoryName: categories[index]
      }
      return info;
    })
    if(filterInfo === "all") {
      setPublicRooms([...publicRooms, ...roomsInfo]);
    }
    else {
      setPublicRooms(roomsInfo);
    }
  }

  const getMoreRooms = (): Promise<boolean> => {
    setIsLoading(true);
    // remember the next batch token when we sent the request
    // too. If it's changed, appending to the list will corrupt it.
    
    let url;
    if(filterInfo === "all") {
      if(nextBatch) {
        url = `${httpsRequest.PublicRooms}?limit=20&since=${nextBatch}`;
      }
      else {
        url = `${httpsRequest.PublicRooms}?limit=20`;
      }
    }
    else {
      let category = selectedCategory === "All"? "all" : selectedCategory;
      url = `${httpsRequest.SpecificPublicRooms}/${category}/${filterInfo}/${limit}`;
    }
    
    return axios.get(url).then(async (response) => {
      if(unmounted) {
        return false;
      }
      if(filterInfo === "all") {
        if (searchString) {
          const count = response.data.total_room_count_estimate || response.data.chunk.length;
          CountlyAnalytics.instance.trackRoomDirectorySearch(count, searchString);
        }
        if(response.data.chunk.length) {
          await getCategoryAndBarrierInfos(response.data.chunk);
        }
        setInitialLoading(false);
        setNextBatch(response.data.next_batch)
        setIsLoading(false);
        return Boolean(response.data.next_batch);
      }
      else {
        if(response.data && response.data.length) {
          await getCategoryAndBarrierInfos(response.data);
        }
        setInitialLoading(false);
        if(response.data?.length === limit) {
          setLimit(limit + 20);
        }
        else {
          setLimit(20);
        }
        setIsLoading(false);
        return Boolean(response.data?.length === limit)
      }
    }, (err) => {
      if(unmounted) {
        return false;
      }

      console.error("Failed to get publicRooms: %s", JSON.stringify(err));
      track('Failed to get public room list');
      alert.error("Failed to get public room list.")
      setIsLoading(false);
    })
  }

  if (pageUrl) {
    // FIXME: Using an import will result in wrench-element-tests failures
    const EmbeddedPage = sdk.getComponent("structures.EmbeddedPage");
    return (
      <EmbeddedPage className="mx_HomePage" url={pageUrl} scrollbar={true} />
    );
  }

  if (pageUrl) {
    // FIXME: Using an import will result in wrench-element-tests failures
    const EmbeddedPage = sdk.getComponent("structures.EmbeddedPage");
    return (
      <EmbeddedPage className="mx_HomePage" url={pageUrl} scrollbar={true} />
    );
  }

  const homePageClassName = classNames("mx_HomePage", "mx_HomePage_default", {
    mx_HomePage_minimized: isMinimized,
    mx_HomePage_MobileView: isMobileView,
  });

  let navBar = (
    <NavBar
      onChangeTheme={onChangeTheme}
      isSignout={isSignout}
      onLoginClick={onLoginClick}
      onSearch={onSearch}
      onCancelClick={clickSearchCancel}
    />
  );
  if (isMobileView) {
    navBar = (
      <Header
        setIsShowLeftPanel={setIsShowLeftPanel}
        isMobileView={isMobileView}
      />
    );
  }

  return (
    <div>
      { initialLoading && <LoadingScreen label="Loading Public Groups..." loadingLottie={LoadingLottie}></LoadingScreen> }
      <ScrollPanel 
        className={homePageClassName}
        onFillRequest={onFillRequest}
        isHideRoomView={true}
        stickyBottom={false}
        startAtBottom={false}
      >
        <EffectsOverlay roomWidth={window.innerWidth} isHomePage={true}/>
        { navBar }
        <div className="mx_HomePage_wrapper">
          <FirstBackground
            isSignout={isSignout}
            setIsShowLeftPanel={setIsShowLeftPanel}
          />
          <ChatCategories
            publicRoomInfo={publicRooms}
            allCategories={allCategories}
            matrixClient={matrixClient}
            isSignout={isSignout}
            searchString={searchString}
            isLoading={isLoading}
            filterInfo={filterInfo}
            setFilterInfo={setFilterInfo}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </div>
      </ScrollPanel>
    </div>
  );
};

export default HomePage;
