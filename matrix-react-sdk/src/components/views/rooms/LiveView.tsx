import '../../../../res/css/views/rooms/LiveView.scss';
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

export enum LiveViewMode {
  Audio, Video
}

interface LiveViewProps {
  roomId: string,
  mode: LiveViewMode,
  admin: Boolean,
  scheduled: Boolean,
  live: Boolean,
  feature: string,
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

function LiveView(props: LiveViewProps) {

  // UI
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Live UI
  const [duration, setDuration] = useState('00:00:00');
  const [timer, setTimer] = useState<NodeJS.Timer>();
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
    //console.log('LiveView:video:devices', devices);
  }, []);

  const listAudioDevices = useCallback(async () => {
    const devices = await Room.getLocalDevices('audioinput', false);
    setAudioSources(devices);
    setAudioMenuItems(
      devices.map((item) => {
        return { label: item.label };
      }),
    );
    //console.log('LiveView:audio:devices', devices);
  }, []);

  // Start Timer
  const startTimer = (startedAt: number) => {
    setTimer(setInterval(() => {
      let diff = +new Date() - startedAt;
      let dur = moment.duration(diff, 'milliseconds');
      let hours = Math.floor(dur.asHours());
      let mins = Math.floor(dur.asMinutes()) - hours * 60;
      let sec = Math.floor(dur.asSeconds()) - hours * 60 * 60 - mins * 60;
      if (hours >= 0 && mins >= 0 && sec >= 0) {
        setDuration(`${(hours < 10) ? '0' : ''}${hours}:${(mins < 10) ? '0' : ''}${mins}:${(sec < 10) ? '0' : ''}${sec}`);
      }
    }, 1000));
  };

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
      console.log('LiveView:getTokenDetails', res.data);
    } else {
      // !TODO show error UI
    }
  };

  const onMuteAudioParticipant = async (p: Participant) => {
    try {
      console.log('LiveView:onMuteAudioParticipant', p);
      const userData = getUserData();
      const auth = JSON.parse(userData);
      let res = await axios.post(`${API}/v1/streams/live/room/${encodeURIComponent(props.roomId)}/mute/audio`, {
        identity: p.identity,
        audioTracks: Array.from(p.audioTracks.keys()),
        videoTracks: Array.from(p.videoTracks.keys())
      }, { auth });
    } catch (err) {
      console.log('LiveView:onMuteAudioParticipant:error', err);
    }
  };

  const onMuteVideoParticipant = async (p: Participant) => {
    try {
      console.log('LiveView:onMuteVideoParticipant', p);
      const userData = getUserData();
      const auth = JSON.parse(userData);
      let res = await axios.post(`${API}/v1/streams/live/room/${encodeURIComponent(props.roomId)}/mute/video`, {
        identity: p.identity,
        audioTracks: Array.from(p.audioTracks.keys()),
        videoTracks: Array.from(p.videoTracks.keys())
      }, { auth });
    } catch (err) {
      console.log('LiveView:onMuteVideoParticipant:error', err);
    }
  };

  const onMuteUserParticipant = async (p: Participant) => {
    try {
      console.log('LiveView:onMuteUserParticipant', p);
      const userData = getUserData();
      const auth = JSON.parse(userData);
      let res = await axios.post(`${API}/v1/streams/live/room/${encodeURIComponent(props.roomId)}/mute/user`, {
        identity: p.identity,
        audioTracks: Array.from(p.audioTracks.keys()),
        videoTracks: Array.from(p.videoTracks.keys())
      }, { auth });
    } catch (err) {
      console.log('LiveView:onMuteUserParticipant:error', err);
    }
  };

  const onChangeRoomLiveState = async () => {
    try {
      console.log('LiveView:onChangeRoomLiveState');
      const userData = getUserData();
      const auth = JSON.parse(userData);
      let res = await axios.post(`${API}/v1/streams/live/room/${encodeURIComponent(props.roomId)}/state`, {
        type: "MANY_TO_MANY"
      }, { auth });
    } catch (err) {
      console.log('LiveView:onChangeRoomLiveState:error', err);
    }
  };

  const onConnect = async () => {
    try {
      setIsLoading(true);
      await onChangeRoomLiveState();
      let roomConnection = await connect(LIVE_SERVER, token);
      setCurrentRoom(roomConnection);
      console.log('LiveView:onConnect', roomConnection, error, isConnecting, connectionState);
      setIsLoading(false);
      setIsReady(true);
      // Enable media devices for admins?
      /*
      if (props.admin) {
        await room?.localParticipant.enableCameraAndMicrophone();
      }
      */
      listVideoDevices();
      listAudioDevices();
      navigator.mediaDevices.addEventListener('devicechange', listVideoDevices);
      navigator.mediaDevices.addEventListener('devicechange', listAudioDevices);
    } catch (err) {
      console.log('LiveView:onConnect:err', err);
    }
  };

  const onControlAction = async (event, data) => {
    console.log('LiveView:onControlAction:event', event, data);
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
      props.create(props.mode.valueOf());
      return onConnect();
    } else {
      props.dismiss();
    }
  };

  const onClickLive = () => {
    if (!isLoading && !isReady && !props.admin && props.live) {
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
      console.log('LiveView:onInit:err', err);
    }
  };

  // Watch Room To Add Listeners
  useEffect(() => {
    if (room) {
      room.once(RoomEvent.DataReceived, (payload: Uint8Array, participant?: RemoteParticipant, kind?: DataPacket_Kind) => {
        console.log('LiveView:onRoomDataReceived', payload, participant, kind);
      });
    }
  }, [room]);

  useEffect(() => {
    console.log('LiveView:opened:mode', props.mode, 'roomId', props.roomId, props, 'isReady', isReady);
    onInit();
    return () => {
      console.log('LiveView:closed', props.roomId, props);
      navigator.mediaDevices.removeEventListener('devicechange', listVideoDevices);
      navigator.mediaDevices.removeEventListener('devicechange', listAudioDevices);
    }
  }, []);

  const onVideoSourceSelection = (e: any) => {
    let deviceLabel = e.target.innerText;
    const device = videoSources.find((d) => d.label === deviceLabel);
    console.log('LiveView:onVideoSourceSelection', deviceLabel, device);
    if (device && room && room.state === ConnectionState.Connected) {
      room.switchActiveDevice('videoinput', device.deviceId);
      setActiveVideoSource(deviceLabel);
    }
  };

  const onAudioSourceSelection = (e: any) => {
    let deviceLabel = e.target.innerText;
    const device = audioSources.find((d) => d.label === deviceLabel);
    console.log('LiveView:onAudioSourceSelection', deviceLabel, device);
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

  const liveViewContainerClassNames = classNames('container-fluid live-view dark h-100', {
    audio: (props.mode === LiveViewMode.Audio.valueOf()),
    video: (props.mode === LiveViewMode.Video.valueOf())
  });

  // compute visible participants and sort.
  useEffect(() => {
    // determine grid size
    let numVisible = 1;

    /*
    if (participants.length === 1) {
      setGridClass('grid1x1');
    } else if (participants.length === 2) {
      setGridClass('grid2x1');
      numVisible = 2;
    } else if (participants.length <= 4) {
      setGridClass('grid2x2');
      numVisible = Math.min(participants.length, 4);
    } else if (participants.length <= 9) {
      setGridClass('grid3x3');
      numVisible = Math.min(participants.length, 9);
    } else if (participants.length <= 16) {
      setGridClass('grid4x4');
      numVisible = Math.min(participants.length, 16);
    } else {
      setGridClass('grid5x5');
      numVisible = Math.min(participants.length, 25);
    }*/

    if (props.isSmallScreen) {
      setGridClass('grid1x1');
    } else {
      if (participants.length === 1) {
        setGridClass('grid1x1');
      } else if (participants.length === 2) {
        setGridClass('grid2x1');
        numVisible = 2;
      } else if (participants.length <= 4) {
        setGridClass('grid2x2');
        numVisible = Math.min(participants.length, 4);
      } else {
        setGridClass('grid3x3');
        numVisible = Math.min(participants.length, 9);
      }
    }

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
        <div className="spinner-border text-light" role="status"></div>
      </div>

      { /** NOT SCHEDULED */}
      {(!isLoading && !props.live && !props.scheduled) && <div className="container d-flex flex-column schedule h-100">
        <div className="row align-items-center justify-content-center gx-0 h-100">
          <div className="col-12 col-md-10 col-lg-10 py-8 py-md-11">
            <h1 className="display-3 text-light fw-bold text-center">
              No {props.feature} active
            </h1>
            <p className="display-6 text-light mb-5 text-center">
              {props.admin && "Start a new session below"}
              {!props.admin && "Only admins are able to create sessions"}
            </p>
            <div className="text-center">
              <button disabled={isReady ? false : true} className={"btn btn-success " + (props.admin ? '' : 'd-none')} onClick={notScheduledAction}>
                {props.admin && `Start ${props.feature}`}
              </button>
              <button className={"btn btn-success " + (props.admin ? 'd-none' : '')} onClick={notScheduledAction}>
                {props.admin && `Start ${props.feature}`}
                {!props.admin && "Okay"}
              </button>
            </div>
          </div>
        </div>
      </div>}

      { /** LIVE */}
      {(!isLoading && props.live && !props.scheduled) && <div className="container-fluid d-flex flex-column live h-100 m-0 p-0" onClick={onClickLive}>
        {isReady &&
          <header onClick={onHeaderClick}>
            <span className="badge badge-pill">
              {(props.mode === LiveViewMode.Audio) ? `Listeners: ${(participants.length || 0)}` : `Viewers: ${(participants.length || 0)}`}
            </span>
            <span className="badge badge-pill d-none">
              Duration: {duration}
            </span>
            { /** Browser Audio Playback Resolution */}
            {(room?.canPlaybackAudio === false) && <span className="badge badge-pill btn btn-success" onClick={() => {
              room?.startAudio();
            }}>
              Click to Enable Audio
            </span>}
            { /** Video Device Dropdown */}
            {(room?.localParticipant &&
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
            {(room?.localParticipant &&
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

        {(!isReady && !props.admin && props.live) && <section className="h-100">
          <div className="container d-flex flex-column schedule h-100" style={{ paddingTop: props.isSmallScreen ? '0' : '15rem' }}>
            <div className="row align-items-center justify-content-center gx-0 h-100">
              <div className="col-12 col-md-10 col-lg-10 py-8 py-md-11 text-center">
                <Lottie className="text-center" animationData={ClickAnimation} loop={true} style={{ display: 'inline-block', width: 250, height: 250 }} />
                { props.isSmallScreen ? <h1 className="display-6 text-light">Tap to Join</h1> : <h1 className="display-6 text-light">Click to Join</h1> }
              </div>
            </div>
          </div>
        </section>}

        {isReady && props.admin && props.live && connectionState != ConnectionState.Connected && connectionState != ConnectionState.Connecting && <section className="h-100" onClick={onConnect}>
          <div className="container d-flex flex-column schedule h-100" style={{ paddingTop: props.isSmallScreen ? '0' : '15rem' }}>
            <div className="row align-items-center justify-content-center gx-0 h-100">
              <div className="col-12 col-md-10 col-lg-10 py-8 py-md-11 text-center">
                <Lottie className="text-center" animationData={ClickAnimation} loop={true} style={{ display: 'inline-block', width: 250, height: 250 }} />
                { props.isSmallScreen ? <h1 className="display-6 text-light">Tap to Continue</h1> : <h1 className="display-6 text-light">Click to Continue</h1> }
              </div>
            </div>
          </div>
        </section>}

        <section className="participant-container h-100">
          {audioTracks?.map((track) => (
            <AudioRenderer key={track.sid} track={track} isLocal={false} />
          ))}

          <div className={`gridStage ${gridClass}`}>
            {(props.mode === LiveViewMode.Video && connectionState === ConnectionState.Connected && participants.map((participant) => {
              return (
                <LiveViewVideoParticipant key={participant.sid} participant={participant} admin={props.admin}
                  onMuteAudio={onMuteAudioParticipant} onMuteVideo={onMuteVideoParticipant} onMuteUser={onMuteUserParticipant}
                />
              );
            }))}
          </div>
        </section>

        {(isReady && props.live && room && connectionState === ConnectionState.Connected) &&
          <LiveViewControls room={room} onDismiss={props.dismiss} onAction={onControlAction} />
        }
      </div>}
    </div>
  );
};

export default LiveView;
