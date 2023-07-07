import {
  ReactElement,
  useEffect,
  useState,
} from 'react';

import { Participant } from 'livekit-client';
import { useParticipant, VideoRenderer } from '@livekit/react-core';

import { faMicrophoneSlash, faVideoSlash, faUserSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React from 'react';
import { MatrixClientPeg } from '../../../MatrixClientPeg';
import { OwnProfileStore } from '../../../stores/OwnProfileStore';
import NftAvatarCheckContainer from '../../structures/NftAvatarCheckContainer';
import axios from 'axios';

export interface VideoParticipantProps {
  participant: Participant;
  admin: Boolean;
  onMuteAudio: Function;
  onMuteVideo: Function;
  onMuteUser: Function;
};

export const LiveViewVideoParticipant = ({
  participant,
  admin,
  onMuteAudio,
  onMuteVideo,
  onMuteUser
}: VideoParticipantProps) => {
  const { cameraPublication, isLocal, connectionQuality, isSpeaking } = useParticipant(participant);

  const avatarImageClassNames = classNames("img-fluid rounded-circle border border-5", { isSpeaking });
  const [avatarUrl, setAvatarUrl] = useState("data:image/png;base64,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");
  const [displayName, setDisplayName] = useState("Chatter");

  var HOST = "https://main.cafeteria.gg";
  var MATRIX_HS = "main.cafeteria.gg";
  if (window.location.host != "cafeteria.gg") {
    HOST = "https://stage.cafeteria.gg";
    MATRIX_HS = "stage.cafeteria.gg";
  }

  useEffect(() => {
    const avatar = MatrixClientPeg.get() ? OwnProfileStore.instance.getHttpAvatarUrl(0) : null;
    const user_info_api = `/api/user_info/@${participant.identity}:${MATRIX_HS}/`;
    const user_info_key = `LiveViewVideoParticipant:user_info:${participant.identity}`;

    if (isLocal && avatar) {
      setAvatarUrl(avatar);
      let localDisplayName = window.localStorage.getItem("mx_profile_displayname");
      if (localDisplayName) {
        setDisplayName(localDisplayName);
      } 
    } else {
      // Check if we have user info in local storage
      var userInfoItem = window.localStorage.getItem(user_info_key);
      var userInfo;
      if (userInfoItem) {
        try {
          userInfo = JSON.parse(userInfoItem);
          if (userInfo.displayname) {
            setDisplayName(userInfo.displayname);
          }
          if (userInfo.avatar_url) {
            setAvatarUrl(userInfo.avatar_url);
          }
        } catch (err) {
          console.log('LiveView:user_info:error:', err);
        } finally { // Delete stale user info
          if (userInfo && userInfo.ts) {
            let expiryMs = 15 * 60 * 1000; // 15 min default
            let expiryTs = +new Date() - expiryMs; 
            if (userInfo.ts > expiryTs) {
              console.log('LiveView:user_info:purge', userInfo);
              window.localStorage.removeItem(user_info_key);
            }
          }
        }
      } else { // Fetch user info and cache in local storage
        // Create local data object
        userInfo = {
          displayname: null,
          avatar_url: null,
          ts: +new Date()
        }
        // Save initial to prevent multiple requests 
        window.localStorage.setItem(user_info_key, JSON.stringify(userInfo));
        // Fetch from api
        axios(`${HOST}${user_info_api}`).then((res) => {
          if (res && res.data && res.data.response && res.data.response.length > 0) {
            let user = res.data.response[0];
            userInfo.displayname = user.displayname;
            userInfo.avatar_url = user.avatar_url;
            // Transform Matrix Avatar URL
            if (userInfo.avatar_url) {
              let mxc = userInfo.avatar_url.split('/').pop();
              userInfo.avatar_url = `${HOST}:8448/_matrix/media/r0/thumbnail/${MATRIX_HS}/${mxc}?width=256&height=256`;
            }
            // Cache locally
            window.localStorage.setItem(user_info_key, JSON.stringify(userInfo));
            // Update local state
            if (userInfo.displayname) {
              setDisplayName(userInfo.displayname);
            }
            if (userInfo.avatar_url) {
              setAvatarUrl(userInfo.avatar_url);
            }
          }
        }).catch((err) => { });
      }
    }
  });

  let mainElement: ReactElement;
  if (cameraPublication?.isSubscribed && cameraPublication?.track && !cameraPublication?.isMuted) {
    mainElement = (
      <div className="card-container">
        <VideoRenderer
          track={cameraPublication.track}
          isLocal={isLocal}
          width="100%"
          height="100%"
        />
        <div className="card-overlay">
          <NftAvatarCheckContainer userId={participant.identity}>
            <img width="35" height="35" className="img-fluid rounded-circle" src={avatarUrl} />
            <span className="participant-displayname">{displayName}</span>
          </NftAvatarCheckContainer>
        </div>
      </div>
    );
  } else {
    mainElement = <div className="participant-placeholder">

      <div className="card">
        <div className="card-body text-center box-container">
          <div className="box"></div>
          <div className="box avatar">
            <NftAvatarCheckContainer userId={participant.identity}>
              <img className={avatarImageClassNames} src={avatarUrl} />
              <span className="participant-displayname">{displayName}</span>
            </NftAvatarCheckContainer>
          </div>
          <div className="box"></div>
        </div>
      </div>

    </div>;
  }

  const [showDropDownMenu, setShowDropDownMenu] = useState(false);

  const dropDownMenuClassNames = classNames("dropdown-menu", {
    show: showDropDownMenu
  });

  return (<div key={participant.sid} className="participant ratio ratio-16x9" onClick={(e) => {
    if (admin && !isLocal) {
      setShowDropDownMenu(!showDropDownMenu);
    }
  }} onContextMenu={(e) => {
    e.preventDefault();
    if (admin && !isLocal) {
      setShowDropDownMenu(!showDropDownMenu);
    }
  }}>

    <ul className={dropDownMenuClassNames}>
      <li>
        <a className="dropdown-item video-device" href="#" onClick={() => onMuteAudio(participant)}>
          <FontAwesomeIcon width={24} icon={faMicrophoneSlash} />
          &nbsp; Mute Audio
        </a>
      </li>
      <li>
        <a className="dropdown-item video-device" href="#" onClick={() => onMuteVideo(participant)}>
          <FontAwesomeIcon width={24} icon={faVideoSlash} />
          &nbsp; Mute Video
        </a>
      </li>
      <li>
        <a className="dropdown-item video-device" href="#" onClick={() => onMuteUser(participant)}>
          <FontAwesomeIcon width={24} icon={faUserSlash} />
          &nbsp; Mute User
        </a>
      </li>
    </ul>

    {mainElement}
  </div>);
};