import api from '../http';
import { AxiosResponse } from 'axios';

export default class ClientService {
    static async get_client() {
        await api.get(
            'client',
            {
                params: {
                    'url': window.location.protocol + '//' + window.location.host
                }
            }
        ).then (r => {
            const type = r.headers['content-type'];
            const blob = new Blob([r.data], {type: type});
            
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'start_sploit.py';
            link.click();
        });
    };
};
