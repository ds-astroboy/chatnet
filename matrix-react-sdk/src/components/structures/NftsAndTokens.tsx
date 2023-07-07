import React, { useState, useEffect, FC } from "react"
import "bootstrap/dist/css/bootstrap.min.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.css";
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import NavBar from "./NavBar";
import AutoHideScrollbar from "./AutoHideScrollbar";
import dis from '../../dispatcher/dispatcher';

interface IProps {
    onChangeTheme: (isDarkTheme: boolean) => void;
}

const NftsAndTokens: FC<IProps> = ({
    onChangeTheme
}) => {
    const nftsProducts = [
        { id: 1, name: ["nfts/kreechures.png", "Kreechures"], group: ["!UDknUefHjzrBnyYpHE:main.cafeteria.gg", "Kreechures (News)"], price: "", holders: "",  marketcap: "", twitter: "https://twitter.com/kreechures", website: "https://www.kreechures.com/", pairedToken: "", vote: "2"},
        // { id: 2, name: ["nfts/tinycolony.png", "Tiny Colony"], group: ["!YSJouICNCEXoclcKHa:soon.cafeteria.gg", "Tiny Colony"], price: "", holders: "",  marketcap: "", twitter: "https://twitter.com/TinyColonyGame", website: "https://tinycolony.io/", pairedToken: "", vote: "1"}
    ];   

    const tokenProducts = [
        { id: 1, name: ["tokens/solana.png", "Solana"], group: ["", "Solana"], price: "", holders: "",  marketcap: "", twitter: "", website: "https://solana.com/", pairedToken: "", vote: "100k"},
        { id: 1, name: ["tokens/kin.svg", "Kin"], group: ["!PuNXeGHNClAhqZJWfi:main.cafeteria.gg", "Kin"], price: "", holders: "",  marketcap: "", twitter: "https://twitter.com/Kin_Ecosystem", website: "kin.org", pairedToken: "", vote: "1"},

    ]
    const [selectedProducts, setSelectedProducts] = useState(nftsProducts);
    const [selectedToken, setSelectedToken] = useState("nfts");

    useEffect(() => {
        setSelectedProducts(nftsProducts)
    }, [])

    useEffect(() => {
        if(selectedToken === "nfts") {
            setSelectedProducts(nftsProducts)
        }
        else {
            setSelectedProducts(tokenProducts)
        }
    }, [selectedToken])

    

    const defaultSorted = [
        {
          dataField: "id",
          order: "asc"
        }
    ];

    const pagination = paginationFactory({
    page: 1,
    sizePerPage: 10,
    lastPageText: ">>",
    firstPageText: "<<",
    nextPageText: ">",
    prePageText: "<",
    showTotal: true,
    alwaysShowAllBtns: true,
    onPageChange: function (page, sizePerPage) {
        console.log("page", page);
        console.log("sizePerPage", sizePerPage);
    },
    onSizePerPageChange: function (page, sizePerPage) {
        console.log("page", page);
        console.log("sizePerPage", sizePerPage);
    }
    });

    const nameFormatter = (cell, row) => {
        const image = require(`../../../res/img/nftsandtokens/${cell[0]}`);
        return (
            <div className="token_name_field">
                <div 
                    style={{
                        backgroundImage: `url(${image})`
                    }}
                    className="image"
                ></div>
                <div className="content">{cell[1]}</div>
            </div>
        )
    }

    const groupFormatter = (cell, row) => {
        const showGroup = () => {
            if(!cell[0]) return;
            dis.dispatch({
                action: 'view_room',
                show_room_tile: true, // make sure the room is visible in the list
                room_id: cell[0],
                clear_search: true,
            });
        }
        return (
            <div className="group_field" onClick={showGroup}>
                <div className="content bold">
                    {cell[1]}
                </div>
                <div className="verified_icon"></div>
            </div>
        )
    }

    const priceFormatter = (cell, row) => {
        return (
            <div className="price_field">{cell}</div>
        )
    }

    const holdersFormatter = (cell, row) => {
        return (
            <div className="holders_field">{cell}</div>
        )
    }

    const marketcapFormatter = (cell, row) => {
        return (
            <div className="marketcap_field">{cell}</div>
        )
    }

    const pairedTokenFormatter = (cell, row) => {
        return (
            <div className="paired_token_field">{cell}</div>
        )
    }

    const twitterFormatter = (cell, row) => {
        const showTwitterWebsite = () => {
            window.open(cell, "_blank")
        }
        return (
            <div className="twitter_field">
                <div className="logo"  onClick={showTwitterWebsite}></div>
            </div>
        )
    }

    const websiteFormatter = (cell, row) => {
        const showWebsite = () => {
            window.open(cell, "_blank")
        }

        return (
            <div className="website_field">
                <div className="logo img-fill" onClick={showWebsite}></div>
            </div>
        )
    }

    const voteFormatter = (cell, row) => {
        return (
            <div className="vote_field">
                <div className="logo img-fill"></div>
                <div className="content">{cell}</div>
            </div>
        )
    }

    const idFormatter = (cell, row) => {
        return (
            <div className="id_field">{cell}</div>
        )

    }

    const changeToken = (token) => {
        setSelectedToken(token);
    }

    const columns = [
        { dataField: "id", text: "Pos.", sort: false, headerFormatter: (column, colIndex) => ( <div>Pos.</div> ), formatter: idFormatter, headerClasses: "id_field_header" },
        { dataField: "name", text: "Name", sort: false, formatter: nameFormatter, headerClasses: "namd_field_header" },
        { dataField: "group", text: "Group", sort: false, formatter: groupFormatter, headerClasses: "group_field_header" },
        { dataField: "price", text: "Price", sort: false, formatter: priceFormatter, headerClasses: "price_field_header"  },
        { dataField: "holders", text: "Holders", sort: false, formatter: holdersFormatter, headerClasses: "holders_field_header"  },
        { dataField: "marketcap", text: "Marketcap", sort: false, formatter: marketcapFormatter, headerClasses: "marketcap_field_header"  },
        { dataField: "pairedToken", text: "Paired Token", formatter: pairedTokenFormatter, sort: false, headerClasses: "pairedToken_field_header"  },
        { dataField: "twitter", text: "Twitter", sort: false, formatter: twitterFormatter, headerClasses: "twitter_field_header"  },
        { dataField: "website", text: "Website", sort: false, formatter: websiteFormatter, headerClasses: "website_field_header"  },
        // { dataField: "vote", text: "Vote", sort: false, formatter: voteFormatter, headerClasses: "vote_field_header"   },
    ];

    return (
        <AutoHideScrollbar className="mx_NftsAndTokens">
            <NavBar
                onChangeTheme={onChangeTheme}
            />
            <div className="mx_NftsAndTokens_container">
                <div className="mx_NftsAndTokens_header">
                    <h2>{`Explore all Verified NFTs & Integrated Tokens on Cafeteria!`}</h2>
                </div>
                <div className="mx_NftsAndTokens_body">
                    <div className="mx_NftsAndTokens_switch big-shadow">
                        <div className={`mx_NftsAndTokens_switch_button ${selectedToken === "nfts"? "active" : ""}`} onClick={() => changeToken("nfts")}>NFTs</div>
                        <div className={`mx_NftsAndTokens_switch_button ${selectedToken === "tokens"? "active" : ""}`} onClick={() => changeToken("tokens")}>Tokens</div>
                    </div>
                    <div className="mx_NftsAndTokens_table">
                        <BootstrapTable
                            bootstrap4
                            keyField="id"
                            data={selectedProducts}
                            columns={columns}
                            defaultSorted={defaultSorted}
                            pagination={pagination}
                        />
                    </div>
                </div>
            </div>
        </AutoHideScrollbar>
    )
}

export default NftsAndTokens