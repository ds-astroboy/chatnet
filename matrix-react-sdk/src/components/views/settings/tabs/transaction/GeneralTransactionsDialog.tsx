import React, { useState, useEffect } from "react";

const transactions = [
    {
        date: "Dec. 12, 2022 7PM UTC",
        transactions: [
            {
                type: "sent",
                name: "Sent Tip",
                subInfo: "@victoriia",
                currency: {
                    type: "coin",
                    logo: require("../../../../../../res/img/cafeteria-point.png"),
                    amount: 200
                }
            },
            {
                type: "received",
                name: "Received Tip",
                subInfo: "@victoriia",
                currency: {
                    type: "coin",
                    logo: require("../../../../../../res/img/cafeteria-point.png"),
                    amount: 200
                }
            }
        ]
    },
    {
        date: "Dec. 12, 2022 7PM UTC",
        transactions: [
            {
                type: "sent",
                name: "Sent Donation",
                subInfo: "@victoriia",
                currency: {
                    type: "coin",
                    logo: require("../../../../../../res/img/cafeteria-point.png"),
                    amount: 200
                }
            },
            {
                type: "received",
                name: "Received Donation",
                subInfo: "@victoriia",
                currency: {
                    type: "coin",
                    logo: require("../../../../../../res/img/cafeteria-point.png"),
                    amount: 200
                }
            },
            {
                type: "checked",
                name: "Membership renewal",
                subInfo: "Premium user",
                currency: {
                    type: "coin",
                    logo: require("../../../../../../res/img/cafeteria-point.png"),
                    amount: 200
                }
            }
        ]
    },
    {
        date: "Dec. 12, 2022 7PM UTC",
        transactions: [
            {
                type: "sent",
                name: "Cafeteria Purchase",
                subInfo: "200coins",
                currency: {
                    type: "coin",
                    logo: require("../../../../../../res/img/cafeteria-point.png"),
                    amount: 200
                }
            },
            {
                type: "received",
                name: "Cafeteria Reward",
                subInfo: "Daily Streak",
                currency: {
                    type: "coin",
                    logo: require("../../../../../../res/img/cafeteria-point.png"),
                    amount: 200
                }
            },
            {
                type: "checked",
                name: "Membership renewal",
                subInfo: "Premium user",
                currency: {
                    type: "coin",
                    logo: require("../../../../../../res/img/cafeteria-point.png"),
                    amount: 200
                }
            }
        ]
    }
]

const Transaction = props => {
    let currencyAmount;    
    if(props.info.type === "received") {
        currencyAmount = `+${props.info.currency.amount}`;
    }
    else {
        currencyAmount = `-${props.info.currency.amount}`;
    }

    return (
        <div className="mx_GeneralTransactionsDialog_transaction_body">
            <div className="mx_GeneralTransactionsDialog_transaction_info">
                <div className={`mx_GeneralTransactionsDialog_transaction_img ${props.info.type}`}>
                </div>
                <div className="mx_GeneralTransactionsDialog_transaction_detail">
                    <div className="mx_GeneralTransactionsDialog_transaction_name">
                        {props.info.name}
                    </div>
                    <div className="mx_GeneralTransactionsDialog_transaction_subinfo">
                        {props.info.subInfo}
                    </div>
                </div>
            </div>
            <div className="mx_GeneralTransactionsDialog_transaction_currency_info">
                <div className="mx_GeneralTransactionsDialog_transaction_currency_logo">
                    <img src={props.info.currency.logo}/>
                </div>
                <div className="mx_GeneralTransactionsDialog_transaction_currency_amount">
                    {currencyAmount}
                </div>
            </div>
        </div>
    )
}

const Transactions = props => {
    return (
        <>
        {
            props.transactions.map((transaction) => {
                return (
                    <div className="mx_GeneralTransactionsDialog_transaction">
                        <div className="mx_GeneralTransactionsDialog_transaction_header">
                            {transaction.date}
                        </div>
                        {
                            transaction.transactions.map((item) => {
                                return <Transaction info={item}/>
                            })
                        }
                    </div>
                )
            })
        }
        </>
    )
}

const GeneralTransactionsDialog = () => {
    return (
        <div className="mx_GeneralTransactionsDialog">
            <div className="mx_GeneralTransactionsDialog_Header">General</div>
            <div className="mx_GeneralTransactionsDialog_body">
                <Transactions transactions={transactions}/>
            </div>
        </div>
    )
}

export default GeneralTransactionsDialog