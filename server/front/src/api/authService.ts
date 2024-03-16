import api from '../http';
import { AxiosResponse } from 'axios';
import { IDefaultAnswer } from '../models/general';

export default class AuthService {
    static async login(password: string): Promise<AxiosResponse<IDefaultAnswer>> {
        return await api.post<IDefaultAnswer>(
            'auth/login', 
            {
                'password': password
            }
        );
    }
}
