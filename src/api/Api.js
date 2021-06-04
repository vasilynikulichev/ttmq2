import {apiUrl} from '../constants';
import Request from './Request';

class Api extends Request{
    async getPrecipitation() {
        return await this.request(`${apiUrl}/precipitation`);
    }

    async getTemperature() {
        return await this.request(`${apiUrl}/temperature`);
    }
}

const api = new Api;

export default api;