import React, { FC, useEffect, useRef, useState } from "react";
import { Stream } from "./Stream";

import moment from "moment";
import io from "socket.io-client";

// Socket.IO Endpoint
var SocketEndpoint = "ws://localhost:3000";
if (window && window.location && window.location.hostname) {
  let hostname = window.location.hostname;
  if (hostname === "stage.cafeteria.gg" ||hostname === "node-stage.cafeteria.gg") {
    SocketEndpoint = "wss://node-stage.cafeteria.gg";
  } else if (hostname === "cafeteria.gg" || hostname === "main.cafeteria.gg" || hostname === "node-main.cafeteria.gg") {
    SocketEndpoint = "wss://node-main.cafeteria.gg";
  }
}

// Returns API URL depending on hostname
const getApiUrl = () => {
  var url = "http://localhost:3000/v1";
  if (window && window.location && window.location.hostname) {
    let hostname = window.location.hostname;
    if (hostname === "stage.cafeteria.gg" || hostname === "node-stage.cafeteria.gg") {
      url = "https://node-stage.cafeteria.gg/v1";
    } else if (hostname === "cafeteria.gg" || hostname === "main.cafeteria.gg" || hostname === "node-main.cafeteria.gg") {
      url = "https://node-main.cafeteria.gg/v1";
    }
  }
  return url;
};

// Component Props
export interface StreamViewProps {
  roomId: string;
  className?: string;
}

// Functional Component
export const StreamView: FC<StreamViewProps> = (props: StreamViewProps) => {

  const containerStyle = {
    backgroundColor: 'rgba(26, 26, 26, 1.0)',
    height: '100%',
    width: '100%',
    position: 'absolute',
    margin: 0,
    padding: 0
  } as React.CSSProperties;

  const countdownBadgeTitle = {
    fontFamily: 'Inter',
    fontWeight: 900,
    color: 'white',
    margin: 0
  } as React.CSSProperties;

  const countdownBadgeStyle = {
    backgroundColor: 'rgba(21, 21, 21, 1.0)',
    padding: '5px 15px 5px 10px',
    borderRadius: '10px',
    margin: 0
  } as React.CSSProperties;

  const countdownStyle = {
    color: 'white',
    fontSize: '4rem',
    fontWeight: 900,
    marginBottom: '3rem'
  } as React.CSSProperties;

  const cardStyle = {
    fontFamily: 'Inter',
    borderRadius: '0.5rem',
    border: '0px',
    borderColor: 'rgba(26, 26, 26, 1.0)',
  } as React.CSSProperties;

  const cardRatioStyle = {
    background: 'linear-gradient(60deg,#09d8a2,#4532a0)',
    borderRadius: '0.5rem 0.5rem 0 0'
  } as React.CSSProperties;

  const cardRatioImageStyle = {
    borderRadius: '0.5rem 0.5rem 0 0'
  } as React.CSSProperties;

  const cardTitleStyle = {
    fontSize: "1.6rem",
    marginTop: '1rem',
    fontFamily: 'Inter',
    fontWeight: 900,
    color: 'rgba(72, 72, 72, 1.0)',
  } as React.CSSProperties;

  const cardTextStyle = {
    fontSize: "1.4rem",
    fontFamily: 'Inter',
    fontWeight: 500,
    color: 'rgba(100, 100, 120, 1.0)',
  } as React.CSSProperties;

  const cardCategoryStyle = {
    position: 'absolute',
    bottom: '25px',
    marginLeft: '10px',
    backgroundColor: 'white',
    padding: '10px 20px 10px 15px',
    fontWeight: 600,
    fontSize: '1.2rem',
    boxShadow: '0 0 10px rgb(0 0 0 / 15%)'
  } as React.CSSProperties;

  const cardCategoryTextStyle = {
    color: 'rgba(106, 106, 106, 1.0)',
  } as React.CSSProperties;

  const cardFooterStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
    backgroundColor: 'rgba(26, 26, 26, 1.0)',
  } as React.CSSProperties;

  const cardFooterBadgeLeftStyle = {
    backgroundColor: 'rgb(21, 21, 21)',
    padding: '0.75rem',
    marginRight: '2rem',
    fontWeight: 900,
    fontSize: '1.2rem'
  } as React.CSSProperties;

  const cardFooterBadgeRightStyle = {
    backgroundColor: 'rgb(21, 21, 21)',
    padding: '0.75rem',
    fontWeight: 900,
    fontSize: '1.2rem'
  } as React.CSSProperties;

  const cardFooterBadgeImageStyle = {
    marginRight: '0.5rem'
  } as React.CSSProperties;

  // Socket.IO
  const [isConnected, setIsConnected] = useState(false);

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [isStreamReady, setIsStreamReady] = useState(false);
  const [countdownText, setCountdownText] = useState('00:00:00');
  const [controlOpacity, setControlOpacity] = useState(0);
  const [controlBackgroundColor, setControlBackgroundColor] = useState('rgba(0, 0, 0, 0)');
  const [isMuteButtonShowing, setIsMuteButtonShowing] = useState(false);

  // UI Ref
  const streamRef = useRef(undefined);

  // Required stream meta data
  const [streamData, setStreamData] = useState(undefined);
  const [streamMuted, setStreamMuted] = useState(true);
  const [streamLoop, setStreamLoop] = useState(false);
  const [streamImageSrc, setStreamImageSrc] = useState('');
  const [streamVideoId, setStreamVideoId] = useState('');
  const [streamTitle, setStreamTitle] = useState('');
  const [streamText, setStreamText] = useState('');
  const [streamCategory, setStreamCategory] = useState('');
  const [streamStartTime, setStreamStartTime] = useState(1);
  const [streamViewers, setStreamViewers] = useState(0);
  const [streamScheduleText, setStreamScheduleText] = useState('');

  // Optional stream meta data
  const [streamAdUrl, setStreamAdUrl] = useState(undefined);

  // Get stream start time 
  const getStreamStartTime = (data: any) => {
    var currentTime = +new Date();
    var startTime = new Date(data.startDate).getTime();
    var secondsElapsed = (currentTime - startTime) / 1000;
    secondsElapsed = parseInt(secondsElapsed.toString());
    // Check if we are playing this stream on a loop and substract number of plays in seconds
    if (data.loop && secondsElapsed > data.duration) {
      const numberOfLoops = parseInt((secondsElapsed / data.duration).toString());
      secondsElapsed = parseInt((secondsElapsed - (data.duration * numberOfLoops)).toString());
    }
    return secondsElapsed;
  };

  // hasStreamExpired (to set today or tomorrow's date)
  const hasStreamExpired = (endDateTime: number) => {
    let currentTime = +new Date();
    if (currentTime > endDateTime) {
      return true;
    } else {
      return false;
    }
  };

  // Player event
  const onLoadedData = (e: Event) => {
    let time = getStreamStartTime(streamData);
    setStreamStartTime(time);
    console.log('StreamView : onLoadedData : seek', time);
  };

  // Player event
  const onSeeked = (e: Event) => {
    console.log('StreamView : onSeeked');
    // @ts-ignore: Unreachable code error
    if (streamRef && streamRef.current && streamRef.current.paused) {
      // @ts-ignore: Unreachable code error
      streamRef.current.play();
      setIsLoading(false);
    }
  };

  // Countdown interval or playback
  var countdownInterval = 0;
  const startCountdownOrPlayback = (data: any) => {

    // Set startDate based on current date @ startTime
    let times = data.startTime.split(':');
    var startDate = new Date();
    startDate.setUTCHours(times[0]);
    startDate.setUTCMinutes(times[1]);
    startDate.setUTCSeconds(times[2]);
    data.startDate = startDate;

    // Set endDate based on startTime + number of repeats in milliseconds
    var durationMs = data.duration * 1000;
    var playbackTime = durationMs * data.repeat;
    var endDateTime = startDate.valueOf() + playbackTime;
    var endDate = new Date(endDateTime);
    data.endDate = endDate;

    // Add 1 day to dates if stream has ended
    if (hasStreamExpired(endDateTime)) {
      let startDateTomorrow = moment(startDate).add(1, 'days');
      let endDateTomorrow = moment(endDate).add(1, 'days');
      data.startDate = startDateTomorrow.toDate();
      data.endDate = endDateTomorrow.toDate();
    }

    // Update local stream data
    setStreamData(data);

    // Get dates
    var currentTime = +new Date();
    var startTime = new Date(data.startDate).getTime();
    var endTime = new Date(data.endDate).getTime();

    console.log(`StreamView : startCountdownOrPlayback : startTime ${startTime} : endTime ${endTime} : currentTime :`, +new Date())

    // Toggle UI
    if (!countdownInterval) {
      countdownInterval = window.setInterval(() => {
        currentTime = +new Date();
        if (currentTime > startTime && currentTime < endTime) {
          clearInterval(countdownInterval);
          let time = getStreamStartTime(data);
          // Update UI
          console.log('StreamView : startCountdownOrPlayback : start @ ', time);
          setStreamStartTime(time);
          setIsStreamReady(true);
        } else {
          var countTime = startTime - currentTime;
          var duration = moment.duration(countTime, 'milliseconds');
          var countdown = moment.utc(duration.asMilliseconds()).format('HH:mm:ss');
          console.log('StreamView : startCountdownOrPlayback : wait');
          // Update UI
          if (currentTime > endTime) {
            setCountdownText('Ended');
            clearInterval(countdownInterval);
          } else {
            setCountdownText(countdown);
          }
          setIsStreamReady(false);
          setIsLoading(false);
        }
      }, 1000);
    }
  };

  // Player event
  const onPlaying = (e: Event) => {
    // @ts-ignore: Unreachable code error
    if (streamData && streamData.endDate) {
      // @ts-ignore: Unreachable code error
      let expired = hasStreamExpired(streamData.endDate.valueOf());
      console.log('StreamView : onPlaying : expired :', expired);
      if (expired) {
        // @ts-ignore: Unreachable code error
        if (streamRef && streamRef.current) {
          // @ts-ignore: Unreachable code error
          streamRef.current.pause();
          startCountdownOrPlayback(streamData);
        }
      }
    }
  };  

  // Fetch latest stream data
  const fetchStreamData = async () => {
    try {
      let API_URL = `${getApiUrl()}/streams/latest/room/${encodeURIComponent(props.roomId)}`;
      let res = await fetch(API_URL, {
        method: "GET"
      });
      let data = await res.json();
      console.log('StreamView : data', data);
      // Set data
      setStreamData(data);
      setStreamVideoId(data.id);
      setStreamTitle(data.title);
      setStreamText(data.text);
      setStreamImageSrc(data.image);
      setStreamCategory(data.category);
      setStreamScheduleText(data.schedule);
      setStreamLoop(data.loop);
      // Continue
      startCountdownOrPlayback(data);
    } catch (err) {
      console.log('StreamView : err', err);
      // TODO set error flag and show error UI 
    }
  }

  useEffect(() => {
    console.log('StreamView:onMount', props);
    // Enable Socket.IO with websocket-only transport
    const socket = io(SocketEndpoint, {
      transports: ['websocket']
    });
    // Socket Listener
    socket.on('connect', () => {
      console.log('StreamView: socket: connect');
      setIsConnected(true);
    });
    // Socket Listener
    socket.on('disconnect', () => {
      console.log('StreamView: socket: disconnect');
      setIsConnected(false);
    });
    // Socket Listener
    socket.on('clientsCount', (count) => {
      setStreamViewers(count);
    });
    // Fetch Data
    fetchStreamData();
    // Unmount
    return () => {
      console.log('StreamView:onUnmount');
      // Remove Socket Listeners
      socket.off('connect');
      socket.off('disconnect');
      // Clear intervals
      clearInterval(countdownInterval);
    }
  }, []);

  /** Bottom Control Section */

  const controlContainerStyle = {
    height: "100%",
    maxHeight: "100%",
    backgroundColor: controlBackgroundColor,
    bottom: 0,
    position: 'absolute'
  } as React.CSSProperties;

  const muteButtonStyle = {
    bottom: 0,
    right: "30px",
    position: 'absolute',
    width: '62px',
    height: '62px',
    marginTop: '4rem',
    marginBottom: '4rem',
    borderRadius: '62px',
    boxShadow: '0 0 10px rgb(0 0 0 / 50%)'
  } as React.CSSProperties;

  var controlFadeOpacity = 0;
  const onMouseEnterControl = (e: any) => {
    const fadeInterval = window.setInterval(() => {
      if (controlFadeOpacity < 0.66) {
        controlFadeOpacity += 0.03;
        // setControlOpacity(controlFadeOpacity);
        // setControlBackgroundColor(`rgba(0, 0, 0, ${controlFadeOpacity})`);
        setIsMuteButtonShowing(true);
      } else {
        window.clearInterval(fadeInterval);
      }
    }, 15)
  }

  const onMouseLeaveControl = (e: any) => {
    // setControlOpacity(0);
    // setControlBackgroundColor(`rgba(0, 0, 0, ${controlFadeOpacity})`);
    setIsMuteButtonShowing(false);
  }

  const onToggleMuteButton = (e: any) => {
    setStreamMuted(!streamMuted);
  }

  return (
    <div className={`${props.className} container-fluid`} style={containerStyle}>

      { /** SPINNER */}
      <div className={"row align-items-center justify-content-center gx-0 h-100 " + (isLoading ? "" : "d-none")}>
        <div className="spinner-border text-light" role="status"></div>
      </div>

      { /** STREAM */}
      {isStreamReady ? <div className={"row gx-0 h-100 position-relative " + ((isStreamReady && !isLoading) ? "" : "d-none")}>
        <Stream preload="metadata" streamRef={streamRef} onLoadedData={onLoadedData} onSeeked={onSeeked} adUrl={streamAdUrl} src={streamVideoId} startTime={streamStartTime} currentTime={streamStartTime}
          loop={streamLoop} muted={streamMuted} autoplay={false} onPlaying={onPlaying}/>
        <div className="container-fluid" style={controlContainerStyle} onMouseEnter={onMouseEnterControl} onMouseLeave={onMouseLeaveControl}>
          <div className="row align-items-center justify-content-center">
            <button className={"btn btn-circle btn-light mr-3 d-flex justify-content-center align-items-center " + (isMuteButtonShowing ? "" : "d-none")} style={muteButtonStyle} onClick={onToggleMuteButton}>
              <img width="64" height="64" className={(!streamMuted ? "" : "d-none")} alt="Mute" src="data:image/png;base64,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" />
              <img width="64" height="64" className={(streamMuted ? "" : "d-none")} alt="Unmute" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsSAAALEgHS3X78AAAEoklEQVR4nO2bS0gVURjHP29KmOajsrIGFCrcNQrtChxbuUoXuarFLTcFgboJWxTSA9ypq9pYdxttNAjcNS5c6yylgitNEAj5yoKMbnzjmWHuufM4Z+bM3DPiD4bZzJxz/v857/NNTalUgrQwNbUFALpJdp3kQorkQlYU3dhMq0yJGmBqqgYA9tXL+foiAOh4KbqhJ1RE8QYQ0XkAGASAZkHJbgHAHAAURJshzABTU1H0BAB0CEnQnzXMR9GNgojEYhuQonAaIUZENsDUVOzMpiO0bdFgXzGq6MZKlHRzUV4yNXUUAJYlEA+kDMukTNxw1QAyjGGVG0hKTUzmsQPmGUaZDSDisQdWq6ONGQOHXVYTmJpAhsQDKaNOyhxKqAEZE2/DbEKgARkVb8NkQlgNKGRUvI1KNPjiawAZVmTt7XkYCBoiPUcBMslZlkSAKHq8Jkt+NWA6E5L48NRUYQCZ2yc+w8s1NCadBU0v0VZeDo8HJ5IsBQpvHX8K5z4sWfeUqdBWZgBxKLFVXd2FLmibeQ0N/ft9q31PkQ66FtA1ILGvf6z/BrTNzELdxa60RdOUaXQMIDs5wr++XeVPjD+DXONx0clHoYNo3S+fK4GKDiIudJWXCEdrratMgyLL13jzFjTl78vy1WkcrVYNIFVCyAYmVvmTz6eg5cFDWcUjzXYzsJuAFvw8G1jlT8++g/pr1yOn0ZS/B/VX+7jewefxPU4szXYTiG0AVnn86nHBZoP8mHwMvxbeh6aGowt2sMh24RVP7mUGBM78MJOgjgyruqjhDYWjIFtUkAlu8fgeJ5bmmq+9l3G9vOH37pEz7dD+dkGIOC9MrXK1TQvzMoHlGQZac66zOk9qz55PRnkAKMb+oigSxboRJB7pjrQtngZ+JggUb1HrOqGV0gQgBuB1tPuK0xeJEI/aczIbAFRNECwe6ZS2CaRFzhWYICXuNr+7MG/dvTrGiBSlNoDu8DYmnwSODhEoStsE/Hr7sCGSFzQg8Fj57/dviQgMImyoE2jCirUtbmpq4AkpLjYah24HpoRDVBTomSDPOB93TqDoRo1tgB53JxhNan3Ev+tDG6DohnWPshjymlYHsKjohmYvhmIb8HvpI/wZHoJTL2ZiLYy2Cy9h79OqlR4LaFJpZwfqLnHnaQVb2TUAl4ZsOTKAe4Cs22CcX00kfRhx5hyNmZq6KTCszaqaLLtCVTJgS9EN69TYPQzOicwBq+b6yDDsfV4VmawoHK1uA4TE3bnZ+7IK6yN3nRmcRDhay06HTU0tJnUy5NckqtAE1hTdcBaAqZ0MSdQkvE+GYH8MLpAIzESgm0QVmsYaHVlaESBBDg/fJF0SPD/4t/sz6Wxo7oQaAPsmxJ4YSYg186OL5bcajBR2KjmemjwNILE0YwdI/JhfMHVgqKypqXMHIFJsXtEN34PfsA2RPIm9zSpG2LF/oAEk4FjLqAlMQdOhW2IZNYE5YpxpTzBjJogPl4dyE6Rb2biY5xGPRPpniMTeTkUrY2LgUMcd4RppW5xk1EN+WKo2iyQOOFJ47+Fvc4c/Th7+Oivlz9Nb5MQqez9PByHd7/MA8B9VriFwSHb+UQAAAABJRU5ErkJggg==" />
            </button>
          </div>
        </div>
      </div> : null}

      { /** COUNTDOWN */}
      <div className={"row align-items-center justify-content-center gx-0 h-100 " + ((isStreamReady || isLoading) ? "d-none" : "")}>
        <div className="col-8 col-md-6 col-lg-5 col-xl-4 py-8 py-md-11" style={{ maxWidth: "500px", minWidth: "300px" }}>

          {/** Badge */}
          <div>
            <h1 className="text-center" style={countdownBadgeTitle}>
              <span className="badge" style={countdownBadgeStyle}>
                <img alt="Countdown" width="50" height="50" src="data:image/png;base64,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" />
                Countdown
              </span>
            </h1>
            <h1 className="mb-6 text-center" style={countdownStyle}>{countdownText}</h1>
          </div>

          {/** Card */}
          <div className="card" style={cardStyle}>
            <div className="ratio ratio-16x9" style={cardRatioStyle}>
              <img alt="Stream Poster" style={cardRatioImageStyle} src={streamImageSrc} />
            </div>
            <div className="ratio ratio-16x9">
              <div className="card-body">
                <h5 className="card-title" style={cardTitleStyle}>{streamTitle}</h5>
                <p className="card-text" style={cardTextStyle}>{streamText}</p>
                <span className="badge rounded-pill text-dark" style={cardCategoryStyle}>
                  <span style={cardCategoryTextStyle}>{streamCategory}</span>
                </span>
              </div>
            </div>
          </div>

          {/** Footer */}
          <div style={cardFooterStyle}>
            <span className="badge badge-pill" style={cardFooterBadgeLeftStyle}>
              <img alt="Viewer Count" style={cardFooterBadgeImageStyle} width="25" height="25" src="data:image/png;base64,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" />
              Viewers: {streamViewers}
            </span>
            <span className="badge badge-pill" style={cardFooterBadgeRightStyle}>
              <img alt="Stream Schedule" style={cardFooterBadgeImageStyle} width="25" height="25" src="data:image/png;base64,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" />
              {streamScheduleText}
            </span>
          </div>
      
        </div>
      </div>
    </div>
  );
};
