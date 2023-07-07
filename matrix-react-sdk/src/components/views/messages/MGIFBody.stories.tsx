import { _t } from '../../../languageHandler';
import { GiphyFetch } from '@giphy/js-fetch-api'
import { IGif } from '@giphy/js-types';

export default {
    title: 'MGIFBody',
  };

export const MGIFBody = async () => {
    const gf = new GiphyFetch('F1aglZGQRVhG47vVNNvOjxMjS6Tct3zZ')

    const fetchGifs = async (gifId: string): Promise<IGif> => {
        try {
            const result = await gf.gif(gifId);
            return result.data;
        } catch (err){
            console.log('Error fetching GIF: ' + gifId)
        }
    }

    let data;
    data = await fetchGifs('fpXxIjftmkk9y');

    data = await fetchGifs('hello');
}