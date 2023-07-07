import React, { createRef } from 'react';

import { _t } from '../../../languageHandler';
import MatrixClientContext from "../../../contexts/MatrixClientContext";
import { replaceableComponent } from "../../../utils/replaceableComponent";
import { IBodyProps } from "./IBodyProps";
import { GiphyFetch } from '@giphy/js-fetch-api'
import { IGif } from '@giphy/js-types';

interface IState {
    gifLoaded: boolean;
    gifError: boolean;
    gifImage: IGif;
}

const gf = new GiphyFetch('F1aglZGQRVhG47vVNNvOjxMjS6Tct3zZ')

@replaceableComponent("views.messages.MGIFBody")
export default class MGIFBody extends React.Component<IBodyProps, IState> {
    static contextType = MatrixClientContext;

    constructor(props: IBodyProps) {
        super(props);

        this.state = {
            gifLoaded: false,
            gifError: false,
            gifImage: null
        };
    }

    componentDidMount() {
        if(!this.state.gifLoaded){
            try {
                this.fetchGifs()
                this.setState({ gifLoaded: true })
            } catch {
                console.log('Something went wrong while fetching GIF.')
            }
        }
    }

    protected extractGifId(msgBody: string): string {
        return msgBody.replace('<gif>', '').replace('</gif>', '')
    }

    protected fetchGifs = async () => {
        const mxEvent = this.props.mxEvent;
        const content = mxEvent.getContent();
        const gifId = this.extractGifId(content.body);
        try {
            const { data } = await gf.gif(gifId);
            this.setState({ gifImage: data })
        } catch {
            this.setState({ gifError: true })
        }
    }

    render() {
        if (!this.state.gifImage){
            return <span className="mx_MImageBody">
            <div>
                { this.props.actionBar }
                { this.props.giftsRow }
            </div>
            { this.state.gifError ? '' :
                <div className="mx_MImageBody_thumbnail_container" style={{ maxWidth: '300px' }}>
                    <div style={{ paddingBottom: '70%' }}></div>
                    <div>
                       { 'Loading GIF..' }
                    </div>
                </div>
            }
            </span>
        }

        let maxWidth = this.state.gifImage ? Math.min(this.state.gifImage.images.original.width, 450) : 300;
        let maxHeight = this.state.gifImage ? this.state.gifImage.images.original.height : 100;
        return <span className="mx_MImageBody">
            <div>
                { this.props.actionBar }
                { this.props.giftsRow }
            </div>
            { this.state.gifError ? '' :
                <div className="mx_MImageBody_thumbnail_container" style={{ maxWidth: maxWidth + 'px', maxHeight: maxHeight + 'px' }}>
                    <div style={{ paddingBottom: ((100 * this.state.gifImage.images.original.height / maxWidth) + '%') }}></div>
                    <div>
                        <img className="mx_MImageBody_thumbnail" src={ this.state.gifImage.images.original.url } alt="image.png" style={{maxWidth: maxWidth + 'px'}} />
                    </div>
                </div>
            }
        </span>
    }
}