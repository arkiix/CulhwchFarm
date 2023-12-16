import { makeAutoObservable } from 'mobx';
import AuthService from '../api/authService';

export default class AuthStore {
    isAuth = false;

    constructor() {
        makeAutoObservable(this, {}, {'autoBind': true});
    }

    setAuth(auth: boolean) {
        this.isAuth = auth;
    }

    setAuthorizationData(password: string) {
        localStorage.setItem('authorization', password);
    }

    initAuth() {
        let authorizationData = localStorage.getItem('authorization') as string;
        this.setAuth(Boolean(authorizationData));
    }

    async login(password: string) {
        try {
            const response = await AuthService.login(password);
            
            if (response?.data?.status === 'ok') {
                this.setAuthorizationData(password);
            };
            
            this.initAuth();
        } catch (error: any) {
            throw error.response;
        }
    }

    async logout() {
        localStorage.removeItem('authorization');
        this.initAuth();
    }
}