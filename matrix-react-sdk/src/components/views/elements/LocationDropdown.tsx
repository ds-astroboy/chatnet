import React, {useState, useEffect} from "react";
import * as sdk from '../../../index';

interface IProps {
    className: string;
    value: string;
    disabled?: boolean;
    onOptionChange: (location: string) => void
}

const locations = [
    "Los Angeles, USA"
]
const LocationDropdown = (props: IProps) => {
    const Dropdown = sdk.getComponent('elements.Dropdown');
    let options = locations.map((location: string) => {
        return <div key={location}>
            { location }
        </div>;
    })
    return (
        <Dropdown
            id="mx_LanguageDropdown"
            className={props.className}
            onOptionChange={props.onOptionChange}
            // onSearchChange={_onSearchChange}
            searchEnabled={true}
            value={props.value}
            label={"Location Dropdown"}
            disabled={props.disabled}
        >
            { options }
        </Dropdown>
    )
}

export default LocationDropdown