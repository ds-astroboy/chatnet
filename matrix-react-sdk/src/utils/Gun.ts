import Gun from 'gun';
export default Gun(['https://main.cafeteria.gg/gun/']);
// export default Gun(['https://invokergun.herokuapp.com/gun']);

export const getWalletAddress = async (userId: string) => {
    const profile: any = await new Promise((resolve, reject) => {
        let status = 0;
        Gun(['https://main.cafeteria.gg/gun/'])
        // Gun(['https://invokergun.herokuapp.com/gun'])
        .get('meme_user').get(userId).once(function (data, key) {
            // console.log("getWalletAddress get=============");
            if (status == 0) {
                // console.log("getWalletAddress get status:0 =============");
                status = 1;
                resolve(data);
            }
        });
        setTimeout(() => {
            // console.log("getWalletAddress setTimeout =============");
            if (status == 0) {
                // console.log("getWalletAddress setTimeout status:0 =============");
                status = 1;
                reject();
            }
        }, 10000);
    })
    return profile?.wallet;
}

export const getWalletUserId = async (address: string) => {
    const profile: any = await new Promise((resolve, reject) => {
        let status = 0;
        Gun(['https://main.cafeteria.gg/gun/'])
        // Gun(['https://invokergun.herokuapp.com/gun'])
        .get('meme_user').get(address).once(function (data, key) {
            // console.log("getWalletAddress get=============");
            if (status == 0) {
                // console.log("getWalletAddress get status:0 =============");
                status = 1;
                resolve(data);
            }
        });
        setTimeout(() => {
            // console.log("getWalletAddress setTimeout =============");
            if (status == 0) {
                // console.log("getWalletAddress setTimeout status:0 =============");
                status = 1;
                reject();
            }
        }, 10000);
    })
    return profile?.userId;
}