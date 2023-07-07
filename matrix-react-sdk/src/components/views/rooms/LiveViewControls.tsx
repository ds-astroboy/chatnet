import React, { ReactElement, useEffect, useState } from 'react';

import { useParticipant } from '@livekit/react-core';
import { Room } from 'livekit-client';

import { faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';

export interface ControlsProps {
  room: Room | undefined;
  onDismiss: Function | undefined;
}

export const LiveViewControls = ({
  room,
  onDismiss
}: ControlsProps) => {

  const [isDisconnected, setIsDisconnected] = useState(false);

  const { cameraPublication: camPub, microphonePublication: micPub, metadata } = useParticipant(
    room!.localParticipant,
  );

  const [muteButtonDisabled, setMuteButtonDisabled] = React.useState(false);
  let muteButton: ReactElement | undefined;
  const audioEnabled = !(micPub?.isMuted ?? true);
  const audioButtonClassNames = classNames("btn-floating btn-secondary", {
    disabled: (metadata && metadata.split(';').length > 0 && metadata.split(';').indexOf('disabled=audio') > -1)
  });
  muteButton = (
    <a className={audioButtonClassNames} onClick={() => {
      if (!muteButtonDisabled) {
        setMuteButtonDisabled(true);
        room!.localParticipant
          .setMicrophoneEnabled(!audioEnabled)
          .finally(() => setMuteButtonDisabled(false));  
      }    
    }}>
      <FontAwesomeIcon height={24} icon={ audioEnabled ? faMicrophone : faMicrophoneSlash} />
    </a>
  )

  const [videoButtonDisabled, setVideoButtonDisabled] = React.useState(false);
  let videoButton: ReactElement | undefined;
  const videoEnabled = !(camPub?.isMuted ?? true);
  const videoButtonClassNames = classNames("btn-floating btn-success", {
    disabled: (metadata && metadata.split(';').length > 0 && metadata.split(';').indexOf('disabled=video') > -1)
  });
  videoButton = (
    <a className={videoButtonClassNames} onClick={() => {
      if (!videoButtonDisabled) {
        setVideoButtonDisabled(true);
        room!.localParticipant
          .setCameraEnabled(!videoEnabled)
          .finally(() => setVideoButtonDisabled(false));   
      }   
    }}>
      <FontAwesomeIcon height={24} icon={ videoEnabled ? faVideo : faVideoSlash} />
    </a>
  )

  const onDisconnect = () => {
    setIsDisconnected(true);
    room?.disconnect();
    if (onDismiss) {
      onDismiss();
    }
  }

  const onMetaDataChange = (m: any) => {
    if (m && m.split(';').length > 0) {
      m.split(';').indexOf('disabled=audio') === -1 ? setMuteButtonDisabled(false) : setMuteButtonDisabled(true);
    };
    if (m && m.split(';').length > 0) {
      m.split(';').indexOf('disabled=video') === -1 ? setVideoButtonDisabled(false) : setVideoButtonDisabled(true);
    };
    if (m && m.split(';').length > 0) {
      m.split(';').indexOf('dismiss=true') === -1 ? null : onDismiss(null, true);
    }
  }

  useEffect(() => {
    onMetaDataChange(metadata);
  }, [metadata]);

  return (
    <footer className={isDisconnected ? "d-none" : ""}>
      <nav className="section-preview">
        {muteButton}
        {videoButton}
        <a className="btn-floating btn-secondary" onClick={onDisconnect}>
          <FontAwesomeIcon height={24} icon={faXmark} />
        </a>
      </nav>
    </footer>
  )
};