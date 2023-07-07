import classNames from "classnames";
import React, { useEffect, useRef, useState } from "react";
import { getRoomCreatorUsername, getTilesByRoomId } from "../../../apis";

import { StreamView } from "stream-react";
import LiveView, { LiveViewMode } from "./LiveView";

import Lottie from "lottie-react";
import SelectedLineAnimation from "../../../../res/img/lottie/green-line-animation.json";
import BroadcastAnimation from "../../../../res/img/lottie/broadcast-active.json";
import axios from "axios";
import LiveStreamView from "./LiveStreamView";

interface LiveSidePanelProps {
  roomId: string
};

const panelWidthDefault = '80px';
var openPanelWidthDefault = '65%';

var API = "https://node-main.cafeteria.gg";
if (window.location.host != "cafeteria.gg") {
  API = "https://node-stage.cafeteria.gg";
}

const tvRoomIds = [
  '!ZaTwZVGZPTJxLVzpzO:stage.cafeteria.gg',
  '!GKePbDsouiOwylHvqX:stage.cafeteria.gg',
  '!ZJDYWJHVMHxjAFUgtr:main.cafeteria.gg'
];

const LiveSidePanel = (props: LiveSidePanelProps) => {
  const ref = useRef(null);

  // UI State
  const [liveTiles, setLiveTiles] = useState<number[]>([]);
  const [scheduledTiles, setScheduledTiles] = useState<number[]>([]);
  const [disabledTiles, setDisabledTiles] = useState<number[]>([1, 2, 3, 4, 5]);
  const [selectedTile, setSelectedTile] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(panelWidthDefault);
  const [containerHeight, setContainerHeight] = useState('auto');

  // Window Dimensions
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // User State
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  // Monitor ref size
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      // Collapse on mobile view
      if (width < 100) {
        // do something when the width is less than 100
        //console.log('LiveSidePanel: collapsed');
        setIsCollapsed(true);
      } else {
        //console.log('LiveSidePanel: extended');
        setIsCollapsed(false);
      }
    });
    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  // Monitor window size
  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // MobileView tweaks
  useEffect(() => {
    setIsSmallScreen(width < 600);
    if (width < 600 && height >= 900) {
      setContainerHeight('85%');
    } else {
      setContainerHeight('80%');
    }
    // Increase panel width on wide screens
    if (width > 2048) {
      openPanelWidthDefault = '80%';
    } else if (width > 1536) {
      openPanelWidthDefault = '75%';      
    } else {
      openPanelWidthDefault = '65%';
    }
    // Responsive panel width
    if (isPanelOpen) {
      setPanelWidth(openPanelWidthDefault);
    }
  }, [width]);

  const runAsync = async () => {
    try {
      // Setup Admin UI
      const userAuthData = JSON.parse(window.localStorage.getItem('mx_userData'));
      var localIsAdmin = false;
      var adminRes = await getRoomCreatorUsername(props.roomId.toString(), userAuthData);
      if (!adminRes.success && adminRes.username) { throw Error('Room Creator Username API Error') } else {
        if (userAuthData.username === adminRes.username) {
          setIsAdmin(true);
          localIsAdmin = true;
        }
      }
      // Setup Tiles
      var tilesRes = await getTilesByRoomId(props.roomId.toString());
      if (!tilesRes.success && tilesRes.tiles) { throw Error('Room Tiles API Error') } else {
        console.log('LiveSidePanel:runAsync:tiles', tilesRes);

        setScheduledTiles(tilesRes.tiles.scheduledTiles);
        setDisabledTiles(tilesRes.tiles.disabledTiles);
        setLiveTiles(tilesRes.tiles.liveTiles);

        // Autoplay TV
        if (selectedTile === 0 && !isPanelOpen && tvRoomIds.indexOf(props.roomId.toString()) > -1 && tilesRes.tiles.disabledTiles.indexOf(1) === -1) {
          setSelectedTile(1);
          setIsPanelOpen(true);
          setPanelWidth(openPanelWidthDefault);
        }
        
        // Autoplay LiveStream (one-to-many) if live
        if (selectedTile === 0 && !isPanelOpen && tilesRes.tiles.liveTiles.indexOf(1) > -1) { 
          setSelectedTile(1);
          setIsPanelOpen(true);
          setPanelWidth(openPanelWidthDefault);          
        }

        // Lock LiveStream (one-to-many) if not live, not a tv channel and not room admin
        if (tvRoomIds.indexOf(props.roomId.toString()) === -1 && tilesRes.tiles.liveTiles.indexOf(1) === -1 && !localIsAdmin) {
          let newDisabledTiles = disabledTiles;
          newDisabledTiles.push(1);
          setDisabledTiles(newDisabledTiles);
        }

        // Autoplay LiveStream (many-to-many) if live
        if (selectedTile === 0 && !isPanelOpen && tilesRes.tiles.liveTiles.indexOf(2) > -1) { 
          setSelectedTile(2);
          setIsPanelOpen(true);
          setPanelWidth(openPanelWidthDefault);          
        }
      }
    } catch (err) {
      console.log('LiveSidePanel:runAsync:err', err);
    }
  };

  useEffect(() => {
    console.log('LiveSidePanel:opened', props.roomId);
    runAsync();
    return () => {
      console.log('LiveSidePanel:closed', props.roomId);
    }
  }, []);

  const createVideoSession = (mode) => {
    console.log('LiveSidePanel:createVideoSession', mode, props.roomId);
    if (!isCreatingSession) {
      setIsCreatingSession(true);
      setLiveTiles([2]);
    }
  };

  const closeView = (e?: any, groupCamEnded?: boolean) => {
    setSelectedTile(0);
    setIsPanelOpen(false);
    setPanelWidth(panelWidthDefault);
    if (groupCamEnded) {
      let newLiveTiles = liveTiles.filter(item => item !== 2)
      setLiveTiles(newLiveTiles);
    }
  };

  const onClickGroupCamAction = async () => {
    if (isAdmin) {
      // TODO open create session modal but for now close and remove participants
      closeView();
      let newLiveTiles = liveTiles.filter(item => item !== 2)
      setLiveTiles(newLiveTiles);
      try {
        console.log('LiveSidePanel:onClickGroupCamAction');
        const auth = JSON.parse(window.localStorage.getItem('mx_userData'));
        await axios.delete(`${API}/v1/streams/live/room/${encodeURIComponent(props.roomId)}`, {auth});
      } catch (err) {
        console.log('LiveSidePanel:onClickGroupCamAction:error', err);
      }
    } else {
      closeView();
    }
  };

  const onClickPodiumAction = () => {
    if (isAdmin) {
      // TODO open create session modal 
    } else {
      closeView();
    }
  };

  const openView = () => {
    setIsPanelOpen(true);
    setPanelWidth(openPanelWidthDefault);
  };

  const switchView = (event, index) => {
    try {
      let isDisabled = event.target.classList.contains('disabled');
      if (!isDisabled) {
        setIsCreatingSession(false);
        if (isPanelOpen && index === selectedTile) { // close/minimize panel
          closeView();
        } else if (isPanelOpen && index != selectedTile) { // switch view
          setSelectedTile(index);
        } else { // open view
          setSelectedTile(index);
          openView();
        }
      }
    } catch (err) {
      console.log('LiveSidePanel:switchView:err', err);
    }
  };

  const panelStyle = {
    width: panelWidth,
    height: isSmallScreen && isPanelOpen ? '100%' : 'auto',
    display: (isSmallScreen && !isCollapsed) ? 'block' : 'flex'
  };

  let tvClassNames = classNames('tile tv', {
    disabled: (disabledTiles.indexOf(1) > -1),
    live: (liveTiles.indexOf(1) > -1),
    active: (selectedTile === 1)
  });

  let tvActionClassNames = classNames('action tv');

  let groupCamClassNames = classNames('tile group-cam', {
    disabled: (disabledTiles.indexOf(2) > -1),
    live: (liveTiles.indexOf(2) > -1),
    active: (selectedTile === 2)
  });

  let groupCamActionClassNames = classNames('action', {
    standby: (isAdmin && liveTiles.indexOf(2) > -1),
    leave: !isAdmin,
  });

  let podiumClassNames = classNames('tile podium', {
    disabled: (disabledTiles.indexOf(3) > -1),
    live: (liveTiles.indexOf(3) > -1),
    active: (selectedTile === 3)
  });

  let podiumActionClassNames = classNames('action d-none', {
    standby: (isAdmin && liveTiles.indexOf(3) > -1),
    leave: !isAdmin,
  });

  let voteClassNames = classNames('tile vote', {
    disabled: (disabledTiles.indexOf(4) > -1),
    live: (liveTiles.indexOf(4) > -1),
    active: (selectedTile === 4)
  });

  /*
  let storeClassNames = classNames('tile store', {
    disabled: (disabledTiles.indexOf(5) > -1),
    live: (liveTiles.indexOf(5) > -1),
    active: (selectedTile === 5)
  });
  */

  let containerStyle = { 
    height: isSmallScreen && isPanelOpen ? containerHeight : 'auto'
  }

  return (
    <div className="mx_RoomView_liveSidePanel" style={panelStyle} ref={ref}>
      {/* Side Panel Tiles */}
      <div className="tiles">
        <div className={tvClassNames} onClick={(e) => { switchView(e, 1) }}>
          <span className="lock"></span>
          <Lottie className="broadcast" animationData={BroadcastAnimation} loop={true} />
          {(selectedTile === 1) && <Lottie className="selected" animationData={SelectedLineAnimation} loop={false} />}
        </div>

        <div className={groupCamClassNames} onClick={(e) => { switchView(e, 2) }}>
          <span className="lock"></span>
          <Lottie className="broadcast" animationData={BroadcastAnimation} loop={true} />
          {(selectedTile === 2) && <Lottie className="selected" animationData={SelectedLineAnimation} loop={false} />}
        </div>

        <div className={podiumClassNames} onClick={(e) => { switchView(e, 3) }}>
          <span className="lock"></span>
          <Lottie className="broadcast" animationData={BroadcastAnimation} loop={true} />
          {(selectedTile === 3) && <Lottie className="selected" animationData={SelectedLineAnimation} loop={false} />}
        </div>

        <div className={voteClassNames} onClick={(e) => { switchView(e, 4) }}>
          <span className="lock"></span>
          <Lottie className="broadcast" animationData={BroadcastAnimation} loop={true} />
          {(selectedTile === 4) && <Lottie className="selected" animationData={SelectedLineAnimation} loop={false} />}
        </div>

        {/**
        <div className={storeClassNames} onClick={(e) => { switchView(e, 5) }}>
          <span className="lock"></span>
          <span className="broadcast"></span>
          <span className={(selectedTile === 5) ? "selected" : "not-selected"}></span>
        </div>         
         */}

      </div>
      {/* Container View */}
      <div className="container-fluid view" style={containerStyle}>
        {(selectedTile === 1 && isPanelOpen && tvRoomIds.indexOf(props.roomId.toString()) > -1) &&
          <div className="feature">
            <div className={tvActionClassNames} onClick={closeView}></div>
            <StreamView roomId={props.roomId.toString()} />
          </div>
        }

        {(selectedTile === 1 && isPanelOpen && tvRoomIds.indexOf(props.roomId.toString()) === -1 && liveTiles.indexOf(1) > -1) &&
          <LiveStreamView isSmallScreen={isSmallScreen} roomId={props.roomId.toString()} admin={false}
            create={() => {}} dismiss={closeView}
          />
        }

        {(selectedTile === 1 && isPanelOpen && tvRoomIds.indexOf(props.roomId.toString()) === -1 && isAdmin) &&
          <LiveStreamView isSmallScreen={isSmallScreen} roomId={props.roomId.toString()} admin={true}
            create={() => {}} dismiss={closeView}
          />
        }

        {(selectedTile === 2 && isPanelOpen) &&
          <div className="feature grey h-100">
            <div className={groupCamActionClassNames} onClick={onClickGroupCamAction}></div>
            <LiveView mode={LiveViewMode.Video} roomId={props.roomId.toString()} admin={isAdmin} 
              scheduled={(scheduledTiles.indexOf(2) > -1)} live={(liveTiles.indexOf(2) > -1)}
              create={createVideoSession} dismiss={closeView} feature="Group Cam" isSmallScreen={isSmallScreen}/>
          </div>
        }

        {(selectedTile === 3 && isPanelOpen) &&
          <div className="feature grey h-100">
            <div className={podiumActionClassNames} onClick={onClickPodiumAction}></div>
            <LiveView mode={LiveViewMode.Audio} roomId={props.roomId.toString()} admin={isAdmin}
              scheduled={(scheduledTiles.indexOf(3) > -1)} live={(liveTiles.indexOf(3) > -1)}
              create={createVideoSession} dismiss={closeView} feature="Podium" isSmallScreen={isSmallScreen}/>
          </div>
        }
      </div>
    </div>
  );
};

export default LiveSidePanel;