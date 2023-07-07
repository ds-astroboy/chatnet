import { WALLETACTIONTYPE } from "../actions/actionTypes";

const initialState = {
    wallets: [],
};

const setWallets = (state, wallets) => {
    return { ...state, wallets: wallets }
}

const wallet = (state = initialState, action) => {
    switch (action.type) {
      case WALLETACTIONTYPE.SET_WALLETS:
        return setWallets(state, action.wallets)
      default:
        return state;
    }
};
  
export default wallet;