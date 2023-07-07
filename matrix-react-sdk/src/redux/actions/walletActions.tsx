import { WALLETACTIONTYPE } from "./actionTypes";

const setWallets = (wallets) => {
  console.log("setWallets: ", wallets)
    return {
      type: WALLETACTIONTYPE.SET_WALLETS,
      wallets
    };
};
  
export default {
    setWallets
};