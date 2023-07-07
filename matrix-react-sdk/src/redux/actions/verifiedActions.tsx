import { VERIFIEDACTIONTYPE } from "./actionTypes";

const addOne = (id, key, data) => {
    return {
      type: VERIFIEDACTIONTYPE.ADD_ONE,
      id,
      key,
      data
    };
};

export default {
    addOne
};