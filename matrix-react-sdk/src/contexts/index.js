import { createContext, useContext, useReducer } from "react";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// The Soft UI Dashboard PRO Material main context
const MaterialUI = createContext();

// Setting custom name for the context which is visible on react dev tools
MaterialUI.displayName = "MaterialUIContext";

// Material Dashboard 2 PRO React reducer
function reducer(state, action) {
  switch (action.type) {
    case "MINI_SIDENAV": {
      return { ...state, miniSidenav: action.value };
    }
    case "WebSocket": {
      return { ...state, webSocket: action.value }
    }
    case "NotifyWebSocket": {
      return { ...state, notifyWebSocket: action.value }
    }
    case "TradingWebSocket": {
      return { ...state, tradingWebSocket: action.value }
    }
    case "PublicRoomInfo": {
      return { ...state, publicRoomInfo: action.value }
    }
    case "AllCategories": {
      return { ...state, allCategories: action.value }
    }
    case "CanJoin": {
      return { ...state, canJoin: action.value }
    }    
    case "ReceivedCredits": {
      return { ...state, receivedCredits: action.value }
    }
    case "Backgrounds": {
      return { ...state, backgrounds: action.value }
    }
    case "UserBackgrounds": {
      return { ...state, userBackgrounds: action.value }
    }
    case "UserStatus": {
      return { ...state, userStatus: action.value }
    }
    case "Realms": {
      return { ...state, realms: action.value }
    }    
    case "FormattedRealms": {
      return { ...state, formattedRealms: action.value }
    }
    case "UserDetail": {
      return { ...state, userDetail: action.value }
    }
    case "UsersData": {
      return { ...state, usersData: action.value }
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

// Material Dashboard 2 PRO React context provider
function MatrixContextsProvider({ children }) {
  const exclusive = {
    ["!ItxBzauJzSFYNPjHpv:main.cafeteria.gg"]: {
      image_url: require("../../res/img/backgrounds/kreechures1.png"),
      price: 500,
      isExclusive: true,
      id: 100
    }
  }
  let currentBackgroound;
  if(!!localStorage.getItem("userBackgrounds")) {
    currentBackgroound = JSON.parse(localStorage.getItem("userBackgrounds"));
    let keys = Object.keys(currentBackgroound);
    let index = keys.indexOf("!ItxBzauJzSFYNPjHpv:main.cafeteria.gg");
    if(index === -1) {
      currentBackgroound = {...currentBackgroound, ...exclusive}
    }
  } 
  else {
    currentBackgroound = {
      ...exclusive
    }
  }
  const initialState = {
    miniSidenav: false,  
    webSocket: null,
    notifyWebSocket: null,
    tradingWebSocket: null,
    publicRoomInfo: [],
    allCategories: [],
    canJoin: false,
    receivedCredits: 0,
    backgrounds: null,
    userBackgrounds: {...currentBackgroound},
    userStatus: "",
    realms: [],
    formattedRealms: [],
    userDetail: null,
    usersData: {},
  };

  const [controller, dispatch] = useReducer(reducer, initialState);

  return <MaterialUI.Provider value={[controller, dispatch]}>{children}</MaterialUI.Provider>;
}

// Material Dashboard 2 PRO React custom hook for using context
function useMatrixContexts() {
  const context = useContext(MaterialUI);

  if (!context) {
    throw new Error(
      "useMatrixContexts should be used inside the MatrixContextsProvider."
    );
  }

  return context;
}

// Typechecking props for the MatrixContextsProvider
MatrixContextsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Context module functions
const setMiniSidenav = ( dispatch, value ) => dispatch({ type: "MINI_SIDENAV", value });

const setWebSocket = ( dispatch, value ) => dispatch({ type: "WebSocket", value })

const setNotifyWebSocket = ( dispatch, value ) => dispatch({ type: "NotifyWebSocket", value })

const setTradingWebSocket = ( dispatch, value ) => dispatch({ type: "TradingWebSocket", value })

const setPublicRoomInfo = ( dispatch, value ) => dispatch({ type: "PublicRoomInfo", value })

const setAllCategories = ( dispatch, value ) => dispatch({ type: "AllCategories", value })

const setCanJoin = ( dispatch, value ) => dispatch({ type: "CanJoin", value })

const setReceivedCredits = ( dispatch, value ) => dispatch({ type: "ReceivedCredits", value });

const setBackgrounds = ( dispatch, value ) => dispatch({ type: "Backgrounds", value });

const setUserBackgrounds = ( dispatch, value ) => dispatch({ type: "UserBackgrounds", value });

const setUserStatus = ( dispatch, value ) => dispatch({ type: "UserStatus", value });

const setRealms = ( dispatch, value ) => dispatch({ type: "Realms", value });

const setFormattedRealms = ( dispatch, value ) => dispatch({ type: "FormattedRealms", value });

const setUserDetail = ( dispatch, value ) => dispatch({ type: "UserDetail", value });

const setUsersData = ( dispatch, value ) => dispatch({ type: "UsersData", value });


export {
  MatrixContextsProvider,
  useMatrixContexts,
  setMiniSidenav,
  setWebSocket,
  setNotifyWebSocket,
  setTradingWebSocket,
  setPublicRoomInfo,
  setAllCategories,
  setCanJoin,
  setReceivedCredits,
  setBackgrounds,
  setUserBackgrounds,
  setUserStatus,
  setRealms,
  setFormattedRealms,
  setUserDetail,
  setUsersData
};
