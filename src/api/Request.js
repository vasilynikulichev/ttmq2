import {requestSuccessStatus} from '../constants';

export default class Request {
    async request(url, params = {}) {
        try {
            const response = await fetch(url, params);

            if (response.status !== requestSuccessStatus) {
                return null;
            }

            return {
                data: await response.json(),
                status: response.status,
            };
        } catch (error) {
            console.error(error);

            return null;
        }
    }
}
