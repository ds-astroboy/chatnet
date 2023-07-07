import React, { FC, useState, useEffect, useMemo } from "react";
import classNames from "classnames";

import { useSelector, useDispatch } from "react-redux";
import { getMatrixUserInfoById } from "../../apis";
import reduxActions from "../../redux/actions";

interface IProps {
    userId: string;
    children: any
}

const DomainNameCheckContainer: FC<IProps> = (props) => {
    const [isDomainName, setIsDomainName] = useState(false);
    const usersInfo = useSelector((state: any) => state.users.usersInfo);
    const dispatch = useDispatch();

    useEffect(() => {
        ;(async () => {
            let userId = props.userId;
            if(!userId) return;
    
            if(usersInfo && usersInfo[userId]) {
                setIsDomainName(usersInfo[userId]?.bonfida_domain_displayname);
            }
            else {
                const {success, data} = await getMatrixUserInfoById(userId);
                if(!success) return;
                setIsDomainName(data?.bonfida_domain_displayname);
                dispatch(
                    reduxActions.usersActions.addUser(userId, data)
                );
            }
        })();
    }, [props.userId]);

    const classnames = useMemo(() => {
        return classNames({
            "domain_name": isDomainName
        });
    }, [isDomainName]); 

    return (
        <div className={classnames}>
            {props.children}
        </div>
    )
}

export default DomainNameCheckContainer;