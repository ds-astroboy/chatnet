import * as React from "react";

interface IProps {
    img: any
}

const UserRoleBadge = (props: IProps) => {
    return (
        <div className="mx_UserRole_badge">
            <img src={props.img} />
        </div>
    )
}

export default UserRoleBadge;