import api from '../http';
import { AxiosResponse } from 'axios';
import { IAuthResponse } from '../models/auth'

export default class AuthService {
    static async login(password: string): Promise<AxiosResponse<IAuthResponse>> {
        return await api.post<IAuthResponse>(
            'auth/login', 
            {
                'password': password
            }
        );
    }
}
