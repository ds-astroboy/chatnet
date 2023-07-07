import React, { useState, useEffect } from "react";
import { mediaFromMxc } from "../../../../../customisations/Media";
import { MatrixClientPeg } from "../../../../../MatrixClientPeg";
import BaseAvatar from "../../../avatars/BaseAvatar";
import { trimString, trimUserId } from "../../../../../hooks/trimString";
import classNames from "classnames";


const transactions = [
    {
        date: "Dec. 12, 2022 7PM UTC",
        roomId: "#23094092",
        traderId: "@richietest:main.cafeteria.gg",
        data: {
            userItems: [
                {
                    type: "point",
                    img: require("../../../../../../res/img/cafeteria-point.png"),
                    amount: 200
                },
                {
                    type: "NFT",
                    img: require("../../../../../../res/img/transaction-nft.png"),
                },
                {
                    type: "crypto",
                    img: require("../../../../../../res/img/solana.png"),
                    amount: 1.5
                },
                {
                    type: "NFT",
                    img: require("../../../../../../res/img/transaction-nft.png"),
                },
                {
                    type: "NFT",
                    img: require("../../../../../../res/img/transaction-nft.png"),
                }            
                
            ],
            traderItems: [
                {
                    type: "NFT",
                    img: require("../../../../../../res/img/transaction-nft.png"),
                },
                {
                    type: "NFT",
                    img: require("../../../../../../res/img/transaction-nft.png"),
                }
            ]
        }
    },
    {
        date: "Dec. 12, 2022 7PM UTC",
        roomId: "#23094092",
        traderId: "@king:main.cafeteria.gg",
        data: {
            userItems: [
                {
                    type: "NFT",
                    img: require("../../../../../../res/img/transaction-nft.png"),
                }
            ],
            traderItems: [                
                {
                    type: "crypto",
                    img: require("../../../../../../res/img/solana.png"),
                    amount: 1.5
                },
                {
                    type: "point",
                    img: require("../../../../../../res/img/cafeteria-point.png"),
                    amount: 200
                }
            ]
        }
    },
    {
        date: "Dec. 12, 2022 7PM UTC",
        roomId: "#23094092",
        traderId: "@richietest3:main.cafeteria.gg",
        data: {
            userItems: [
                {
                    type: "NFT",
                    img: require("../../../../../../res/img/transaction-nft.png"),
                },
                {
                    type: "NFT",
                    img: require("../../../../../../res/img/transaction-nft.png"),
                },
                {
                    type: "NFT",
                    img: require("../../../../../../res/img/transaction-nft.png"),
                },
                {
                    type: "NFT",
                    img: require("../../../../../../res/img/transaction-nft.png"),
                }
            ],
            traderItems: [
                {
                    type: "point",
                    img: require("../../../../../../res/img/cafeteria-point.png"),
                    amount: 200
                },
                {
                    type: "crypto",
                    img: require("../../../../../../res/img/solana.png"),
                    amount: 1.5
                }
            ]
        }
    },
]

const UserTransaction = props => {
    const [avatarUrl, setAvatarUrl] = useState("");
    const [userName, setUserName] = useState("");
    const cli = MatrixClientPeg.get();
    let isMe = (cli.getUserId() == props.userId);

    useEffect(() => {
        console.log("props.data", props.data);
        const getUserProfile = async() => {
            const profile = await MatrixClientPeg.get().getProfileInfo(props.userId);
            let url = profile["avatar_url"];
            let imageUrl = url? mediaFromMxc(url).getSquareThumbnailHttp(24) : null;
            setAvatarUrl(imageUrl);
            setUserName(profile["displayname"]);
        }
        getUserProfile()
    }, [])

    const TransactionItem = (props) => {
        return (
            <div className={`mx_TradesTransactionsDialog_Transaction_item ${props.item.type == "NFT"? "NFT": "currency"}`}>
                <img src={props.item.img}/>
                {
                    props.item.type == "NFT"
                    ?
                    <div className="mx_TradesTransactionsDialog_NFT_Verify_Badge"></div>
                    :
                    false
                }
            </div>
        )
    }

    return (
        <div className="mx_TradesTransactionsDialog_transaction_panel">
            <div className="mx_TradesTransactionsDialog_UserAvatar">
                <BaseAvatar
                    name={userName}
                    url={avatarUrl}
                    width={32}
                    height={32}
                />
                <div className="mx_TradesTransactionsDialog_UserName">
                    {isMe? "You" : userName}
                </div>
            </div>
            <div className="mx_TradesTransactionsDialog_Transaction_items">
                {
                    props.data.map((item) => {
                        return(
                            <TransactionItem item={item}/>
                        )
                    })
                }
            </div>
        </div>
    )
}

const Transaction = props => {
    return (
        <div className="mx_TradesTransactionsDialog_transaction">
            <div className="mx_TradesTransactionsDialog_transaction_Date">
                {props.transaction.date}
            </div>
            <div className="mx_TradesTransactionsDialog_transaction_Room">
                {`in ${props.transaction.roomId}`}
            </div>
            <div className="mx_TradesTransactionsDialog_transaction_MainWrap">
                <UserTransaction userId={MatrixClientPeg.get().getUserId()} data={props.transaction.data.userItems}/>
                <div className="mx_TradesTransactionsDialog_TradeIcon"></div>
                <UserTransaction userId={props.transaction.traderId} data={props.transaction.data.traderItems}/>
            </div>
        </div>
    )
}

const TradesTransactionsDialog = () => {
    return (
        <div className="mx_TradesTransactionsDialog">
            <div className="mx_TradesTransactionsDialog_Header">Trades</div>
            <div className="mx_TradesTransactionsDialog_body">
                {
                    transactions.map((transaction) => {
                        return <Transaction transaction={transaction}/>
                    })
                }
            </div>
        </div>
    )
}

export default TradesTransactionsDialog;