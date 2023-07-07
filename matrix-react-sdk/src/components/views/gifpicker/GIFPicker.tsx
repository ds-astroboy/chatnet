import React from 'react';

import { _t } from '../../../languageHandler';
import AutoHideScrollbar from "../../structures/AutoHideScrollbar";
import Search from "./Search";
import { replaceableComponent } from "../../../utils/replaceableComponent";

import { Grid } from '@giphy/react-components'
import { GiphyFetch } from '@giphy/js-fetch-api'
import { IGif } from '@giphy/js-types';

// use @giphy/js-fetch-api to fetch gifs, instantiate with your api key
const gf = new GiphyFetch('F1aglZGQRVhG47vVNNvOjxMjS6Tct3zZ')

let typing_timer;
const typing_freeze = 1000; // The duration passed after last input from user in GIF's search, so we can
                            // start searching for GIFs, while also not doing it with every character written.

interface IProps {
    onChoose(unicode: string): boolean;
    onSelectGIF(gif: IGif, e: React.SyntheticEvent): void;
}

interface IState {
    filter: string;
    search: string;
    scrollTop: number;
    viewportHeight: number;
}

@replaceableComponent("views.emojipicker.GIFPicker")
class GIFPicker extends React.Component<IProps, IState> {
    private bodyRef = React.createRef<HTMLDivElement>();

    constructor(props) {
        super(props);

        this.state = {
            filter: "",
            search: "",
            scrollTop: 0,
            viewportHeight: 280
        };
    }

    private onScroll = () => {
        const body = this.bodyRef.current;
        this.setState({
            scrollTop: body.scrollTop,
            viewportHeight: body.clientHeight,
        });
    };

    private onChangeFilter = (filter: string) => {
        clearTimeout(typing_timer);
        filter = filter.toLowerCase(); // filter is case insensitive stored lower-case
        this.setState({ filter });
        typing_timer = setTimeout(this.onFreezeTyping, typing_freeze);
    };

    private onFreezeTyping = async () => {
        let filter = this.state.filter;
        this.setState({ search: filter });
    }

    private onEnterFilter = () => {
        const btn = this.bodyRef.current.querySelector<HTMLButtonElement>(".mx_GIFPicker_item");
        if (btn) {
            btn.click();
        }
    };

    render() {
        let fetchGifs;

        let search = this.state.search;
        if (search){
            fetchGifs = (offset: number) => gf.search(search, { offset, limit: 10 })
        } else {
            fetchGifs = (offset: number) => gf.trending({ offset, limit: 10 })
        }

        return (
            <div className="mx_GIFPicker">
                <Search query={this.state.filter} onChange={this.onChangeFilter} onEnter={this.onEnterFilter} />
                <AutoHideScrollbar
                    className="mx_GIFPicker_body"
                    wrappedRef={ref => {
                        // @ts-ignore - AutoHideScrollbar should accept a RefObject or fall back to its own instead
                        this.bodyRef.current = ref;
                    }}
                    onScroll={this.onScroll}
                >
                    <Grid width={340} columns={3} fetchGifs={fetchGifs} key={this.state.search} hideAttribution={true} onGifClick={(gif, e) => {
                        this.props.onSelectGIF(gif, e);
                    }} 
                    />
                </AutoHideScrollbar>
            </div>
        );
    }
}

export default GIFPicker;
