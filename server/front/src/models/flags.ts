export interface IFlag {
    flag: string;
    sploit_name: string; 
    sploit_id: number; 
    team_name: string; 
    create_dt: string;
    status_name: string;
    response: string;
}

export interface IFlagsInfo {
    total_flags: number;
    accepted: number;
    queued: number;
    rejected: number;
    skipped: number;
    latest_flags: number;
    exploits: number;
    rounds_info: number[];
}

export interface IGetFlags {
    status: string;
    flags: IFlag[];
}

export interface ISploit {
    sploit_id: number;
    sploit_name: string;
}

export interface IGetSploits {
    status: string;
    sploits: ISploit[];
}

export interface ISubmitFlag {
    status: string;
    flags: IFlag[];
}

export interface IGetFlagsInfo {
    status: string;
    info: IFlagsInfo;
}