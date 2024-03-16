import { makeAutoObservable } from 'mobx';
import SettingsService from '../api/settingsService';
import FlagsService from '../api/flagsService';
import { IParamValues, IProtocol, IValidator, IProtocolParam, ISettings } from '../models/settings';

export default class AuthStore {
    protocols = [] as IProtocol[];
    validators = [] as IValidator[];
    settings = {} as ISettings;
    protocolParams = [] as IProtocolParam[];
    updateSettingsLoading = false;

    constructor() {
        makeAutoObservable(this, {}, {'autoBind': true});
    }

    setUpdateSettingsLoading(value: boolean) {
        this.updateSettingsLoading = value;
    };

    setProtocols(protocols: IProtocol[]) {
        this.protocols = protocols;
    }

    setValidators(validators: IValidator[]) {
        this.validators = validators;
    }
    
    setSettings(settings: ISettings) {
        this.settings = settings;
    }

    setProtocolParams(protocolParams: IProtocolParam[]) {
        this.protocolParams = protocolParams;
    }

    setValidatorsSettings(validatorsSettings: IValidator[]) {
        this.validators = validatorsSettings;
    }

    async getProtocols() {
        try {
            const response = await SettingsService.get_protocols();
            
            if (response.data.status === 'ok') {
                this.setProtocols(response.data.protocols);
            };
        } catch (error: any) {
            throw error.response;
        }
    }

    async getValidators() {
        try {
            const response = await SettingsService.get_validators();
            
            if (response.data.status === 'ok') {
                this.setValidators(response.data.validators);
            };
        } catch (error: any) {
            throw error.response;
        }
    }

    async getSettings() {
        try {
            const response = await SettingsService.get_settings();
            
            if (response.data.status === 'ok') {
                this.setSettings(response.data.settings);
            };
        } catch (error: any) {
            throw error.response;
        }
        this.getProtocolParams();
    }

    async getProtocolParams() {
        try {
            const response = await SettingsService.get_protocols_params(this.settings.system_protocol_id);
            
            if (response.data.status === 'ok') {
                this.setProtocolParams(response.data.params);
            };
        } catch (error: any) {
            throw error.response;
        }
    }

    async updateSettings() {
        this.setUpdateSettingsLoading(true);
        
        let paramValues = {} as IParamValues;
        for (let param of this.protocolParams) {
            paramValues[param.protocol_param_id] = param.protocol_param_value;
        }
        
        try {
            await SettingsService.update_settings(this.settings, paramValues, this.validators);
        } catch (error: any) {
            throw error.response;
        } finally {
            this.setUpdateSettingsLoading(false);
        }
    }
}