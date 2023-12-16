import api from '../http';
import { AxiosResponse } from 'axios';
import { IGetProtocolParams, IGetProtocols, IGetValidators, IGetSettings, IParamValues, ISettings, IUpdateSettings, IValidator } from '../models/settings';

export default class SettingsService {
    static async get_settings(): Promise<AxiosResponse<IGetSettings>> {
        return await api.get<IGetSettings>(
            'settings'
        );
    };

    static async get_protocols(): Promise<AxiosResponse<IGetProtocols>> {
        return await api.get<IGetProtocols>(
            'settings/protocols'
        );
    };

    static async get_validators(): Promise<AxiosResponse<IGetValidators>> {
        return await api.get<IGetValidators>(
            'settings/validators'
        );
    };

    static async get_protocols_params(protocolId: number): Promise<AxiosResponse<IGetProtocolParams>> {
        return await api.get<IGetProtocolParams>(
            'settings/protocol/params',
            {
                params: {
                    'protocol_id': protocolId
                }
            }
        );
    };

    static async update_settings(settings: ISettings, paramValues: IParamValues, validatorSettings: IValidator[]): Promise<AxiosResponse<IUpdateSettings>> {
        return await api.put<IUpdateSettings>(
            'settings',
            {
                'settings': settings,
                'protocol_param_values': paramValues,
                'validator_settings': validatorSettings
            }
        );
    };
};
