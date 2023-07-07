import React, { FC } from 'react';
import BaseDialog from "../dialogs/BaseDialog";
// import ReactPlayer from 'react-player/youtube'

interface IProps {
    onFinished: () => void;
}
const LearnVideoDialog: FC<IProps> = (props: IProps) => {
    return (
        <BaseDialog className="mx_LearnVideoDialog" title={"What is Cafeteria?"} onFinished={props.onFinished}>
            <iframe
                src={`https://www.youtube.com/embed/mvsj6XZS-Pc?autoplay=1&controls=1`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Embedded youtube"
                className='mx_LearnVideoDialog_iframe'
            />
        </BaseDialog>
    )
}
 
export default LearnVideoDialog