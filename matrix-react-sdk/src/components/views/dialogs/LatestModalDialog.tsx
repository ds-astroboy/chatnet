import React, { FC, useEffect } from 'react';
import AccessibleButton from '../elements/AccessibleButton';
import BaseDialog from "./BaseDialog";

interface IProps {
    onFinished: () => void;
    data: any;
}
const LatestModalDialog: FC<IProps> = (props: IProps) => {

    useEffect(() => {
        window.localStorage.setItem("latest_modal_number", props.data.number);
    }, []);

    return (
        <BaseDialog className="mx_LatestModalDialog" title={props.data.header} onFinished={props.onFinished} headerImage={props.data.icon}>
            <div
                className='mx_LatestModalDialog_title dark bold'
                dangerouslySetInnerHTML={{ __html: props.data.title }}
            ></div>
            <div
                className='mx_LatestModalDialog_content dark'
                dangerouslySetInnerHTML={{ __html: props.data.html }}
            ></div>
            {props.data.image && <div className='mx_LatestModalDialog_image'><img src={props.data.image} /></div>}
            <AccessibleButton
                className='mx_LatestModalDialog_button common-btn btn-hover-purple green-btn btn-lg px-4'
                onClick={props.onFinished}
            >
                {props.data.dismiss}
            </AccessibleButton>
        </BaseDialog>
    )
}

export default LatestModalDialog