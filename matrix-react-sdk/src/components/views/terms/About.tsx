import React, { FC, useState, useEffect } from "react";
import NavBar from "../../structures/NavBar";
import Accordian from "../../structures/Accordion";
import { faqContents, PARTNERS } from "../../../@variables/common";
import CarouselSlider from "react-carousel-slider";
interface IProps {
    onChangeTheme: (isDarkTheme: boolean) => void;
}

const About: FC<IProps> = ({
    onChangeTheme
}) => {
    const [faqCategories, setFaqCategories] = useState([]);
    const [partnerItemWidth, setPartnerItemWidth] = useState(160);

    useEffect(() => {
        let categories = Object.keys(faqContents);
        if (!categories.length) return;
        setFaqCategories(categories);
        calculateItemsWidth();
    }, [])

    const calculateItemsWidth = () => {
        let partnerWrapElement = document.querySelector(".mx_Partner_wrap")
        let itemWidth = partnerWrapElement.clientWidth / 3 - 40; // 40 is margin size of item
        setPartnerItemWidth(itemWidth);
    }


    let iconItemsStyle = {
        padding: "0px",
        background: "transparent",
        margin:"0 20px",
        height: "50%",
        width: `${partnerItemWidth}px`
    };
    
    let iconsSlides = PARTNERS.map((item, index) => 
        <div className="mx_Partner_logoWrap" key = {index} >
            <img src = {item.logo} ></img>
        </div>
    );

    const sliderBoxStyle = {
        height: "100px",
        width: "100%",
        background: "transparent"
    }

    let icons = (<CarouselSlider 
        sliderBoxStyle = {sliderBoxStyle} 
        accEle = {{dots: false}}
        slideCpnts = {iconsSlides} 
        itemsStyle = {iconItemsStyle}
        buttonSetting = {{placeOn: 'middle-outside'}}
    />);

    return (
        <div className="mx_About">
            <NavBar
                onChangeTheme={onChangeTheme}
            />
            <div className="mx_About_container">
                <div className="mx_About_wrap">
                    <div className="mx_About_header">
                        <h5 className="bg-purple px-4 py-2 t-white bold">About</h5>
                    </div>
                    <div className="mx_About_body">
                        <p>
                            Cafeteria is a modernized chat platform built for both mainstream and cryptocentric communities to thrive.
                        </p>
                        <p>
                            Designed with ease of use in mind, Cafeteria has all of the traditional chat elements a user would expect to find, and also offers simplified crypto features and educational content for those who want to dip their toes into the web3 world.
                        </p>
                        <p>
                        Users can easily form gated groups using multiple blockchains and non-crypto means, monetize and be rewarded for engagement, and democratize their group through voting, whilst easily discovering other communities.
                        </p>
                    </div>
                </div>
                <div className="mx_Faq_wrap">
                    <div className="mx_Faq_header">
                        <h5 className="bg-light-purple px-4 py-2 t-white bold">FAQ</h5>
                    </div>
                    <div className="mx_Faq_body">
                        {faqCategories.length && (
                            faqCategories.map((category => {
                                return faqContents[category].map((item) => {
                                    return (
                                        <Accordian title={item.title} content={item.content} className="my-4" />
                                    )
                                })
                            }))
                        )}
                    </div>
                </div>
                <div className="mx_Partner_wrap">
                    <div className="mx_Partner_header">
                        <h5 className="bg-yellowness px-4 py-2 t-white bold">Partners</h5>
                    </div>
                    <div className="mx_Partner_body" >
                        {icons}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default About