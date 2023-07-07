import '../../../../res/css/views/rooms/LiveView.scss';
import '../../../../res/css/views/rooms/LiveStreamView.scss';
import ClickAnimation from "../../../../res/img/lottie/click-join-coloured.json";

import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';

import moment from 'moment';
import axios from 'axios';

import { useRoom, AudioRenderer } from '@livekit/react-core';
import { Participant, Room, ConnectionState, RoomEvent, DataPacket_Kind, RemoteParticipant } from 'livekit-client';

import { LiveViewVideoParticipant } from './LiveViewVideoParticipant';
import { LiveViewControls } from './LiveViewControls';

import Lottie from 'lottie-react';
import { LiveStreamParticipant } from './LiveStreamParticipant';

interface LiveStreamViewProps {
  roomId: string,
  admin: Boolean,
  dismiss: Function,
  create: Function,
  isSmallScreen: Boolean
}

export interface MenuItem {
  label: string;
}

const LIVE_SERVER = "wss://live.cafeteria.gg";
var API = "https://node-main.cafeteria.gg";
if (window.location.host != "cafeteria.gg") {
  API = "https://node-stage.cafeteria.gg";
}

function LiveStreamView(props: LiveStreamViewProps) {
  // UI
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Live UI
  const [gridClass, setGridClass] = React.useState('grid1x1');
  const [visibleParticipants, setVisibleParticipants] = useState<Participant[]>([]);

  // Video Selectors
  const [activeVideoSource, setActiveVideoSource] = useState('Default Camera');
  const [isVideoSelectorVisible, setIsVideoSelectorVisible] = useState(false);
  const [videoSources, setVideoSources] = useState<MediaDeviceInfo[]>([]);
  const [videoMenuItems, setVideoMenuItems] = useState<MenuItem[]>([]);

  // Audio Selectors
  const [activeAudioSource, setActiveAudioSource] = useState('Default Microphone');
  const [isAudioSelectorVisible, setIsAudioSelectorVisible] = useState(false);
  const [audioSources, setAudioSources] = useState<MediaDeviceInfo[]>([]);
  const [audioMenuItems, setAudioMenuItems] = useState<MenuItem[]>([]);

  // Live Data
  const [currentRoom, setCurrentRoom] = useState<Room | undefined>();
  const [token, setToken] = useState('');
  const [roomCreatorUsername, setRoomCreatorUsername] = useState('');
  const { connect, isConnecting, room, error, participants, audioTracks, connectionState } = useRoom({
    adaptiveStream: true,
    dynacast: true
  });

  const listVideoDevices = useCallback(async () => {
    const devices = await Room.getLocalDevices('videoinput', false);
    setVideoSources(devices);
    setVideoMenuItems(
      devices.map((item) => {
        return { label: item.label };
      }),
    );
    //console.log('LiveStreamView:video:devices', devices);
  }, []);

  const listAudioDevices = useCallback(async () => {
    const devices = await Room.getLocalDevices('audioinput', false);
    setAudioSources(devices);
    setAudioMenuItems(
      devices.map((item) => {
        return { label: item.label };
      }),
    );
    //console.log('LiveStreamView:audio:devices', devices);
  }, []);

  // Get User Data for API authentication
  const getUserData = () => {
    var userData = window.localStorage.getItem('mx_userData') || '{}';
    return userData;
  }

  // Get Token
  const getTokenDetails = async () => {
    const userData = getUserData();
    const auth = JSON.parse(userData);
    let res = await axios.get(`${API}/v1/streams/live/room/${encodeURIComponent(props.roomId)}/token`, { auth });
    if (res.status === 200) {
      setToken(res.data.token);
      //startTimer(res.data.startedAt);
      setIsLoading(false);
      if (props.admin) {
        setIsReady(true);
      }
      console.log('LiveStreamView:getTokenDetails', res.data);
    } else {
      // !TODO show error UI
    }
  };

  const onChangeRoomLiveState = async () => {
    try {
      console.log('LiveStreamView:onChangeRoomLiveState');
      const userData = getUserData();
      const auth = JSON.parse(userData);
      let res = await axios.post(`${API}/v1/streams/live/room/${encodeURIComponent(props.roomId)}/state`, {
        type: "ONE_TO_MANY"
      }, { auth });
    } catch (err) {
      console.log('LiveStreamView:onChangeRoomLiveState:error', err);
    }
  };

  const getRoomCreatorUsername = async () => {
    try {
      const userData = getUserData();
      const auth = JSON.parse(userData);
      let res = await axios.get(`${API}/v1/rooms/${encodeURIComponent(props.roomId)}/creator/username`, { auth });
      if (res && res.data && res.data.username) {
        console.log('LiveStreamView:getRoomCreatorUsername', res.data.username);
        const room_creator_key = `LiveStream:room_creator:${props.roomId}`;
        window.localStorage.setItem(room_creator_key, res.data.username);
        setRoomCreatorUsername(res.data.username);
      }
    } catch (err) {
      console.log('LiveStreamView:getRoomCreatorUsername:error', err);
    }
  };

  const onConnect = async () => {
    try {
      setIsLoading(true);
      if (props.admin) {
        await onChangeRoomLiveState();
      }
      await getRoomCreatorUsername();
      let roomConnection = await connect(LIVE_SERVER, token);
      setCurrentRoom(roomConnection);
      console.log('LiveStreamView:onConnect', roomConnection, error, isConnecting, connectionState);
      setIsLoading(false);
      setIsReady(true);
      // Enable media devices for admins
      if (props.admin) {
        //await room?.localParticipant.enableCameraAndMicrophone();
      }
      listVideoDevices();
      listAudioDevices();
      navigator.mediaDevices.addEventListener('devicechange', listVideoDevices);
      navigator.mediaDevices.addEventListener('devicechange', listAudioDevices);
    } catch (err) {
      console.log('LiveStreamView:onConnect:err', err);
    }
  };

  const onControlAction = async (event, data) => {
    console.log('LiveStreamView:onControlAction:event', event, data);
    // Hacky but easy way to listen for device event changes !!!TODO !!!FIXME
    //@ts-ignore
    if (!window.listAudioDevicesInterval) {
      //@ts-ignore
      window.listAudioDevicesInterval = setInterval(() => {
        listAudioDevices();
        //@ts-ignore
        setTimeout(() => clearInterval(window.listAudioDevicesInterval), 30 * 1000);
      }, 1000);
    }
    //@ts-ignore
    if (!window.listVideoDevicesInterval) {
      //@ts-ignore
      window.listVideoDevicesInterval = setInterval(() => {
        listVideoDevices();
        //@ts-ignore
        setTimeout(() => clearInterval(window.listVideoDevicesInterval), 30 * 1000);
      }, 1000);
    }
  };

  const notScheduledAction = () => {
    if (props.admin) {
      setIsLoading(true);
      props.create();
      return onConnect();
    } else {
      props.dismiss();
    }
  };

  const onClickLive = () => {
    if (!isLoading && !isReady && !props.admin) {
      setIsLoading(true);
      return onConnect();
    }
  };

  // On Init
  const onInit = async () => {
    try {
      // Get token and details from api
      await getTokenDetails();
    } catch (err) {
      console.log('LiveStreamView:onInit:err', err);
    }
  };

  // Watch Room To Add Listeners
  useEffect(() => {
    if (room) {
      room.once(RoomEvent.DataReceived, (payload: Uint8Array, participant?: RemoteParticipant, kind?: DataPacket_Kind) => {
        console.log('LiveStreamView:onRoomDataReceived', payload, participant, kind);
      });
    }
  }, [room]);

  useEffect(() => {
    console.log('LiveStreamView:opened:mode', 'roomId', props.roomId, props, 'isReady', isReady);
    onInit();
    return () => {
      console.log('LiveStreamView:closed', props.roomId, props);
      navigator.mediaDevices.removeEventListener('devicechange', listVideoDevices);
      navigator.mediaDevices.removeEventListener('devicechange', listAudioDevices);
    }
  }, []);

  const onVideoSourceSelection = (e: any) => {
    let deviceLabel = e.target.innerText;
    const device = videoSources.find((d) => d.label === deviceLabel);
    console.log('LiveStreamView:onVideoSourceSelection', deviceLabel, device);
    if (device && room && room.state === ConnectionState.Connected) {
      room.switchActiveDevice('videoinput', device.deviceId);
      setActiveVideoSource(deviceLabel);
    }
  };

  const onAudioSourceSelection = (e: any) => {
    let deviceLabel = e.target.innerText;
    const device = audioSources.find((d) => d.label === deviceLabel);
    console.log('LiveStreamView:onAudioSourceSelection', deviceLabel, device);
    if (device && room && room.state === ConnectionState.Connected) {
      room.switchActiveDevice('audioinput', device.deviceId);
      setActiveAudioSource(deviceLabel);
    }
  };

  const onHeaderClick = (e: any) => {
    let tag = e.target.tagName;
    let type = e.target.type;
    let id = e.target.id;
    let classList = e.target.classList;
    if (tag === "BUTTON" || type === "button") {
      if (id === "videoSelector") {
        if (isAudioSelectorVisible) {
          setIsAudioSelectorVisible(false);
        }
        setIsVideoSelectorVisible(!isVideoSelectorVisible);
      } else if (id === "audioSelector") {
        if (isVideoSelectorVisible) {
          setIsVideoSelectorVisible(false);
        }
        setIsAudioSelectorVisible(!isAudioSelectorVisible);
      }
    } else if (tag === "HEADER") {
      setIsVideoSelectorVisible(false);
      setIsAudioSelectorVisible(false);
    } else if (tag === "A") {
      if (classList.contains("video-device")) {
        setIsVideoSelectorVisible(false);
        onVideoSourceSelection(e);
      } else if (classList.contains("audio-device")) {
        setIsAudioSelectorVisible(false);
        onAudioSourceSelection(e);
      }
    }
  };

  const checkForDummyDevice = (device) => {
    const noLabel = device.label === '';
    return noLabel;
  };

  const videoMenuClassNames = classNames('btn-group', {
    'd-none': (videoSources.length === 0 || videoSources.length > 0 && videoSources.some(checkForDummyDevice))
  });

  const videoMenuItemsClassNames = classNames('dropdown-menu', {
    show: isVideoSelectorVisible
  });

  const audioMenuClassNames = classNames('btn-group', {
    'd-none': (audioSources.length === 0 || audioSources.length > 0 && audioSources.some(checkForDummyDevice))
  });

  const audioMenuItemsClassNames = classNames('dropdown-menu', {
    show: isAudioSelectorVisible
  });

  const liveViewContainerClassNames = classNames('container-fluid live-stream-view bright h-100 video');

  // compute visible participants and sort.
  useEffect(() => {
    // determine grid size
    let numVisible = 1;

    setGridClass('grid1x1');

    // remove any participants that are no longer connected
    const newParticipants: Participant[] = [];
    visibleParticipants.forEach((p) => {
      if (room?.participants.has(p.sid) || room?.localParticipant.sid === p.sid) {
        newParticipants.push(p);
      }
    });

    // ensure active speakers are all visible
    room?.activeSpeakers?.forEach((speaker) => {
      if (
        newParticipants.includes(speaker) ||
        (speaker !== room?.localParticipant && !room?.participants.has(speaker.sid))
      ) {
        return;
      }
      // find a non-active speaker and switch
      const idx = newParticipants.findIndex((p) => !p.isSpeaking);
      if (idx >= 0) {
        newParticipants[idx] = speaker;
      } else {
        newParticipants.push(speaker);
      }
    });

    // add other non speakers
    for (const p of participants) {
      if (newParticipants.length >= numVisible) {
        break;
      }
      if (newParticipants.includes(p) || p.isSpeaking) {
        continue;
      }
      newParticipants.push(p);
    }

    if (newParticipants.length > numVisible) {
      newParticipants.splice(numVisible, newParticipants.length - numVisible);
    }
    setVisibleParticipants(newParticipants);

  }, [participants]);

  return (
    <div className={liveViewContainerClassNames}>
      { /** SPINNER */}
      <div className={"row align-items-center justify-content-center gx-0 h-100 " + (isLoading ? "" : "d-none")}>
        <div className="spinner-border" role="status"></div>
      </div>

      { /** LIVE */}
      {(!isLoading) && <div className="container-fluid d-flex flex-column live h-100 m-0 p-0" onClick={onClickLive}>

        <section className="participant-container">
          {audioTracks?.map((track) => (
            <AudioRenderer key={track.sid} track={track} isLocal={false} />
          ))}

          <div className={`gridStage ${gridClass}`}>
            {connectionState === ConnectionState.Connected &&
              (!participants.some((participant) => participant.identity === 'sn6zrhjxzofai7lwndbznbvftrkibb9afuta') && // WEBCAM STREAM
                participants.map((participant) => (
                  <LiveStreamParticipant
                    key={participant.sid}
                    participant={participant}
                    admin={props.admin}
                    creator={roomCreatorUsername}
                  />
                )))}
            {connectionState === ConnectionState.Connected &&
              participants
                .filter((participant) => participant.identity.includes('sn6zrhjxzofai7lwndbznbvftrkibb9afuta')) // RTMP INPUT STREAM
                .map((participant) => (
                  <LiveStreamParticipant
                    key={participant.sid}
                    participant={participant}
                    admin={props.admin}
                    creator="sn6zrhjxzofai7lwndbznbvftrkibb9afuta"
                  />
                ))}
          </div>

        </section>

        {isReady &&
          <header onClick={onHeaderClick}>
            <span className="badge badge-pill">
              <img alt="Viewer Count" width="25" height="25" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAB1FBMVEUAAACuucauucauucauucauucauucauucauucauucauucauucauucauucauucauucauucauucauucavusauucauucauucauucauucauucauucauucauucauucauucauucauucauucauucauucauucauucauucauucauucauucbl5N8Asf8rO0euucbW297U7fYAsP7i4t7j49/a29rW2NcHsv7EytDf39ze3tzLz9PByM6yvMcqOka1vsm/xs26wsvZ4eHN0dO4wcoLjskRgLMOtP0kufotu/g7vveGz+yl1uit1+e52uXS1dbP09TIzdEKk9AZuP0StfxTxPNcxfLU6fCb1Omp1+fG3ePD3OPN3uIoP0/K3uIiUGkzQk6m4PgzvPgBq/ZIwfVhx/EDp/CQ0esEpOrS4OHc3dvT1tbO0dTJzdEOisIUd6YnRFUAr/wou/sGoOTJ3ePW3+EHm93R1tkTe6scYYIgVnAkSmBWyvuW2/mG1/lXxPLB4/FryfBqyPADpu92y+50y+6z2ebV3+TA2+S72uTf4t/V3N+7wsYWcZwaZ4xVYmwmR1lGxfw4wfxnzvqy4/fV4eazur+Ol56Dk5yCjZR4g4tkcHlEX25FU17h2F5sAAAAKnRSTlMAxfj+waN+V0Q5Js66tauITj0g/PLs5uLZ2LawnpSOg3RrZl9MNCEUCAV9NueyAAAF40lEQVRo3u2a91cTQRDHTQMjBKzYe9/LxLsciaSThE4QBBTpKFJUQBBFsPfee/lnDSUyc7d3uYv5xffy+Y3Hvfdl9rszuzvDmgIFCuSR484De3aWbN28CTZt3lqyc88B5/E8K2wosltBidVetCFvCofLtwNAJBhokaskL2NeqUpuCQQjkGZ7+eF8SBTvAAj5W6qYiqoWfwgAdhT/q8RBC4C/0ss08Fb6AcBy8F8kDpVCJEBi4MQTiACUHspVYuNuiMQllhUpnpbZvTE3M0rgyklmiJNXAEpysObYXlu0khmmMgq2vcdMaqxzQEBiJpACAI51pjScpYlLzCSXElDqNKGx1hKVmWnkKFjWmtAIjvPToifV3NTU/HyMnzjjQeMqTrufs6uqzw4P+YQVahvuN73g7DI/2I2t2BGXWsPb1VErKGgfTvFUXEeMiOyKViklztYJPMShLlX+R2GXAY2imKyUqBe0EBuale7HoCirxnqrIgV7GgQ9xI5qRVqGrOuzaBy1xBnhyWkhC3XnGCEOlqP6IuVBRhjxCVlpVzgThHL9Y3aTTOx4IAoG8DVSW0JW3WO5LMAwDwRjiFQlAGV6rsckslaiYBAf2WRSDHS8d50inlM/9H3pY4hT4NKuWTGyd08LJqgnOzkGmjXMgQPxcvJDHE3WTE7WJC8u/TR96+Ot1T+kk4bi0DrTQ9iRsyqJi3P97iXC7vma86dvn1jkdkZGTGFXQjaNM39fKw5EWUvOv+51I37dO7HMvYzKBYZohX18EYusE0jbghszEPU8PbOsMihyQpHBwj/WEzgQRd2tcVO+ezyelysq73mhJIB74O/Hq9WlrxF+5VlkWeVOxpVrZL32c7Mdl98OulZuJTfSEplYBjOfPcLFmJ/1FRI6a2uJ5wsaIp6nRKTOi/YXVPAsiWna/lqlEf7iWeYMWi5BeIbzkWdKsR99MUzyo9et4seKyGxa5IOQAddJPxRzjt3L6IshLDLnVjMQ/RvK4OqXHWyVy7xj2IF89+LSKPa7Ofx+tSzy+RMqcdPYeV5lscuoNgqIUTeXga+L5se/+XDF9+J0tKtFtqHLVgqLJN18wgNvf74dCM/goFEpPgnb1CJb0A5upomoSxv+tg/v4S1qESsKtUlATOqLTOBvu5GvYFWL2Fh+RRjYOCLePCxXD4qEJ2JFnjwnxof1NMKjGsZLYOUYj3bXGEl43UCm8I2m1ot2F8/4bTIKldTHeT2RN+Q2gY8t3ha240rfYNSUMLGkk2S8nVNWcO26Tyr9lLZIP7n/jZDa5eAUSD/Zw5g5beuT6DN6NPp5BbIYnycv2gXE1X4tjZsitQSR4JX6dSCRAwVzvZev8e4h+ogeJxJwbxIV2PkUvWsnuSpT1+mte4z4XsG9SLQycmxlVXlHNYS79HZXxr0SJRiiSxQIM/NhpR8PBRoIedZF0JWImCIzkioUsWYByYT7k6JAoDduGVlCsJD1ala9gK4mb/aGlxSm3rSh3/ICaQWLxoU7JDH1/Y7qzLRNTLSN8l5gjxndW/s0ng428tCqrhNM0CDR9wl6OlAcCYY5125co26WYULg0HzOAQmFdfmMatR2MxoIaLekXAmJYRpFYxpiE8NIEXDpPLEhwKiKz1AcVIMFAPTaK2UgM0JzuwE/uhlBBijTbXtYg4zSV591X80yShSs+tOIcogzSnWnrjG+xxKjxAHKs7WiQNVyTl0QNSU6z6na0DbaiuI31RIyMyjju6uSYHIESFONTxFkepDEmkfK/BfrG8c4M4gYQJGRRicEeXMA77PGjmnfUkRibX3nyDXuZCAIsMtYyxb8SIUqVfd1d/dU094z1XAdMdh8BtThNsF4WsPuNNxGh5x69TEw16yHiPmpQwhpGBttQA7zEyh1mh3SgKlJUAzQkMbEuAlMzbTQuMnc4MzodC4EaHBmegQIEMo+Z0xLkBGg+WEmGJiYomFmzmPZLLNfOpbNfcAMmlNsNGDOx6icT3pU/h8N/bX/faFAgQJ54w/Mf+JNr/VPFQAAAABJRU5ErkJggg==" />
              {` ${(participants.length || 0)}`}
            </span>
            { /** Browser Audio Playback Resolution */}
            {(room?.canPlaybackAudio === false) && <span className="badge badge-pill btn btn-success" onClick={() => {
              room?.startAudio();
            }}>
              {props.isSmallScreen ? "Tap to Enable Audio" : "Click to Enable Audio"}
            </span>}
            { /** Video Device Dropdown */}
            {(room?.localParticipant && props.admin &&
              <div className={videoMenuClassNames}>
                <button id="videoSelector" className="btn btn-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  {activeVideoSource}
                </button>
                {videoMenuItems.length > 0 && <ul className={videoMenuItemsClassNames}>
                  {videoMenuItems.map(videoMenuItem => {
                    return (
                      <li key={videoMenuItem.label}><a className="dropdown-item video-device" href="#">{videoMenuItem.label}</a></li>
                    )
                  })}
                </ul>
                }
              </div>
            )}
            { /** Audio Device Dropdown */}
            {(room?.localParticipant && props.admin &&
              <div className={audioMenuClassNames}>
                <button id="audioSelector" className="btn btn-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  {activeAudioSource}
                </button>
                {audioMenuItems.length > 0 && <ul className={audioMenuItemsClassNames}>
                  {audioMenuItems.map(audioMenuItem => {
                    return (
                      <li key={audioMenuItem.label}><a className="dropdown-item audio-device" href="#">{audioMenuItem.label}</a></li>
                    )
                  })}
                </ul>
                }
              </div>
            )}
          </header>}

        {(!isReady && !props.admin) && <section className="h-100">
          <div className="container d-flex flex-column schedule" style={{ paddingTop: props.isSmallScreen ? '0' : '15rem' }}>
            <div className="row align-items-center justify-content-center gx-0 h-100">
              <div className="col-12 col-md-10 col-lg-10 py-8 py-md-11 text-center">
                <Lottie className="text-center" animationData={ClickAnimation} loop={true} style={{ display: 'inline-block', width: 250, height: 250 }} />
                {props.isSmallScreen ? <h1 className="display-6">Tap to View Live Stream</h1> : <h1 className="display-6">Click to View Live Stream</h1>}
              </div>
            </div>
          </div>
        </section>}

        {isReady && props.admin && connectionState != ConnectionState.Connected && connectionState != ConnectionState.Connecting && <section className="h-100" onClick={onConnect}>
          <div className="container d-flex flex-column schedule" style={{ paddingTop: props.isSmallScreen ? '0' : '15rem' }}>
            <div className="row align-items-center justify-content-center gx-0 h-100">
              <div className="col-12 col-md-10 col-lg-10 py-8 py-md-11 text-center">
                <Lottie className="text-center" animationData={ClickAnimation} loop={true} style={{ display: 'inline-block', width: 250, height: 250 }} />
                {props.isSmallScreen ? <h1 className="display-6">Tap to Go Live</h1> : <h1 className="display-6">Click to Go Live</h1>}
              </div>
            </div>
          </div>
        </section>}

        {(isReady && room && connectionState === ConnectionState.Connected && props.admin) &&
          <LiveViewControls room={room} onDismiss={props.dismiss} onAction={onControlAction} />
        }
      </div>}
    </div>
  );
}

export default LiveStreamView;