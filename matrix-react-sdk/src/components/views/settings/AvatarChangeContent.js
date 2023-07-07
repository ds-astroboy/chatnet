import React from "react";
import dis from "../../../dispatcher/dispatcher";

const AvatarChangeContent = props => {
    const showNftCategoryDialog = () => {
        dis.dispatch({
            action: "show_nft_category_dialog",
            wallets: props.wallets,
            adjustableNftAvatar: props.adjustableNftAvatar
        })
        console.log("Dispatch executed");
    }
    
    return (
        <div className='mx_ProfileSettings_avatar_change'>
            <div className="mx_ProfileSettings_avatar_change_title dark bold">
                Photo
            </div>
            <div className="mx_ProfileSettings_avatar_change_content mt-2">
                <span className='color_green' onClick={props.uploadAvatar}>Add photo</span> or <span className='color_green' onClick={showNftCategoryDialog}>Choose NFT</span> from your wallet
            </div>
        </div>
    )
}

export default AvatarChangeContent