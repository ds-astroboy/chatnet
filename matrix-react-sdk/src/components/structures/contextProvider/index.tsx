import React, { useState, useEffect } from "react";
import { createClient, MatrixClient } from "matrix-js-sdk/src/matrix";
import { checkBarrierRooms, getAllCategories, getCategoryForRoom } from "../../../apis";
import { MatrixClientPeg } from "../../../MatrixClientPeg";
import { fakeCategorie, MatrixClientConfig } from "../../../@types/variables";
import { 
    useMatrixContexts, 
    setPublicRoomInfo, 
    setAllCategories 
} from "../../../contexts";
interface IProps {
    setIsLoading: (value: boolean) => void;
    children: any;
}

const ContextProvider = ( props: IProps ) => {
    const [publicRoomsChunk, setPublicRoomsChunk] = useState(null);
    const [roomBarriers, setRoomBarriers] = useState(null);
    const [roomCategories, setRoomCategories] = useState(null);
    const [controller, dispatch] = useMatrixContexts();
    const { canJoin } = controller;
    const client = MatrixClientPeg.get();

    const getPublicRooms = async (cli: MatrixClient) => {
        props.setIsLoading(true);

        try {
            await cli?.publicRooms({})
                .then(data => {
                    setPublicRoomsChunk(data.chunk)
                })            
        }
        catch (e) {
            props.setIsLoading(false);
            console.warn(e);
        }
    }

    const getBarrierInfo = async () => {
        let arr = [];
        let barriers = [];

        arr = await new Promise(async (resolve, reject) => {
            let arr1 = [];
            for (let i = 0; i < publicRoomsChunk.length; i++) {
                let val = checkBarrierRooms(publicRoomsChunk[i].room_id).then();
                arr1.push(val);
            }
            try {
                Promise.allSettled(arr1).then((data1) => {
                    resolve(data1);
                })
            }
            catch (e) {
                console.error(e);
                reject(e);
            }
        })

        if (arr.length) {
            barriers = arr.map((item) => item.value);
        }
        setRoomBarriers(barriers);
    }

    const getCategoryInfo = async () => {
        let arr = [];
        let categories = [];
        arr = await new Promise(async (resolve, reject) => {
            let arr1 = [];
            for (let i = 0; i < publicRoomsChunk.length; i++) {
                let val = getCategoryForRoom(publicRoomsChunk[i].room_id).then();
                arr1.push(val);
            }
            try {
                Promise.allSettled(arr1).then((data1) => {
                    resolve(data1);
                })
            }
            catch (e) {
                console.error(e);
                reject(e);
            }
        })
        if (arr.length) {
            categories = arr.map((item) => item.value);
        }
        setRoomCategories(categories);
    }

    const fetchPublicRooms = async () => {
        let cli = MatrixClientPeg.get();
        if (!cli) {
            cli = createClient({
                baseUrl: MatrixClientConfig.hsUrl,
                idBaseUrl: MatrixClientConfig.isUrl,
            });
        }
        try {
            await getPublicRooms(cli);
        }
        catch (e) {
            console.warn(e);
            props.setIsLoading(false);
        }
    }

    const fetchCategories = async() => {
        let allCategories = await getAllCategories();
        setAllCategories(dispatch, allCategories);
    }

    useEffect(() => {
        if(canJoin || client) {
            fetchPublicRooms();
        }
        fetchCategories();
    }, [canJoin, client])

    useEffect(() => {
        if (publicRoomsChunk) {
            if(publicRoomsChunk.length) {
                getBarrierInfo();
                getCategoryInfo();
            }
            else {
                props.setIsLoading(false);
            }
        }
    }, [publicRoomsChunk])

    useEffect(() => {
        if (publicRoomsChunk && roomBarriers && roomCategories) {
            let roomsInfo = publicRoomsChunk.map((room, index) => {
                let info = {
                    ...room,
                    barrierInfo: roomBarriers[index],
                    categoryName: roomCategories[index]
                }
                if (!roomCategories[index]) {
                    info.categoryName = fakeCategorie[room.name]
                }
                return info;
            })
            setPublicRoomInfo(dispatch, roomsInfo);
            props.setIsLoading(false);
        }
    }, [roomBarriers, roomCategories])

    return (
        props.children
    )
}

export default ContextProvider;