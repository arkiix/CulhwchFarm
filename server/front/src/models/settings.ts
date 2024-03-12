interface IObjectKeys {
    [key: string]: string | number;
}

export interface IProtocolParam {
    protocol_param_id: number;
    protocol_id: number;
    protocol_param_name: string;
    protocol_param_value: string;
}

export interface IProtocol {
	protocol_id: number;
    protocol_name: string;
}

export interface IValidatorParam {
    validator_param_id: number;
    validator_id: number;
    validator_param_name: string;
    validator_param_value: string;
}

export interface IValidator {
	validator_id: number;
    validator_name: string;
    validator_is_active: boolean;
    validator_params: IValidatorParam[];
}

export interface ISettings extends IObjectKeys {
    regex_flag_format: string;
    system_protocol_id: number;
    submit_flag_limit: number;
    submit_period: number;
    flag_lifetime: number;
    round_length: number;
}

export interface IGetSettings {
    status: string;
    settings: ISettings;    
}

export interface IParamValues extends IObjectKeys {
}

export interface IGetProtocolParams {
    status: string;
    params: IProtocolParam[];
}

export interface IGetProtocols {
    status: string;
    protocols: IProtocol[];
}

export interface IGetValidators {
    status: string;
    validators: IValidator[];
}
