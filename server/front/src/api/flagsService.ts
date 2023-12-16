import api from '../http';
import { AxiosResponse } from 'axios';
import { IGetFlags, IGetSploits, ISubmitFlag, IGetFlagsInfo } from '../models/flags';

export default class FlagService {
    static async get_flags(pageNum: number, sploitId: number | null): Promise<AxiosResponse<IGetFlags>> {
        return await api.get<IGetFlags>(
            'flags',
            {
                params: {
                    'page_num': pageNum,
                    'sploit_id': sploitId
                }
            }
        );
    };

    static async get_flags_info(countRounds: number, sploitId: number | null): Promise<AxiosResponse<IGetFlagsInfo>> {
        return await api.get<IGetFlagsInfo>(
            'flags/get_info',
            {
                params: {
                    'count_rounds': countRounds,
                    'sploit_id': sploitId
                }
            }
        );
    };

    static async get_sploits(): Promise<AxiosResponse<IGetSploits>> {
        return await api.get<IGetSploits>(
            'sploits'
        );
    };
    
    static async submit_flag(flag: string): Promise<AxiosResponse<ISubmitFlag>> {
        return await api.post<ISubmitFlag>(
            'flags/manual',
            {
                'flag': flag
            }
        );
    };
};
