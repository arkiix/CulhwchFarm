import { makeAutoObservable } from 'mobx';
import FlagsService from '../api/flagsService';
import { IFlag, IFlagsInfo, ISploit } from '../models/flags'

export default class AuthStore {
    flags = [] as IFlag[];
    flagsInfo = {} as IFlagsInfo;
    sploits = [] as ISploit[];
    flagsPageNum = 1;
    sploitId = null as number | null;
    submitFlagLoading = false;
    graph = 1;
    countRounds = 6;

    constructor() {
        makeAutoObservable(this, {}, {'autoBind': true});
    }

    setGraph() {
        this.graph = this.graph + 1;

        if (this.graph > 2)
            this.graph = 1;
    }

    setFlags(flags: IFlag[]) {
        this.flags = flags;
    }

    setSploits(sploits: ISploit[]) {
        this.sploits = sploits;
    }

    setSploitId(sploitId: number | null) {
        this.sploitId = sploitId;
    }

    setFlagsInfo(flagsInfo: IFlagsInfo) {
        this.flagsInfo = flagsInfo;
    }

    setSubmitFlagLoading(value: boolean) {
        this.submitFlagLoading = value;
    }

    async getSploits() {
        try {
            const response = await FlagsService.get_sploits();
            
            if (response.data.status === 'ok') {
                this.setSploits(response.data.sploits);
            };
        } catch (error: any) {
            throw error.response;
        }
    }

    async getFlags() {
        try {
            const requestSploitId = this.sploitId;

            const response = await FlagsService.get_flags(this.flagsPageNum, this.sploitId);
            
            if (response.data.status === 'ok' && requestSploitId === this.sploitId) {  // Comparison of sploitId to prevent race conditions
                this.setFlags(response.data.flags);
            };
        } catch (error: any) {
            throw error.response;
        }
    }
    
    async getFlagsInfo() {
        try {
            const requestSploitId = this.sploitId;

            const response = await FlagsService.get_flags_info(this.countRounds, requestSploitId);
            
            if (response.data.status === 'ok' && requestSploitId === this.sploitId) {  // Comparison of sploitId to prevent race conditions
                this.setFlagsInfo(response.data.info);
            };
        } catch (error: any) {
            throw error.response;
        }
    }
    
    async submitFlag(flag: string) {
        this.setSubmitFlagLoading(true);
        try {
            const response = await FlagsService.submit_flag(flag);
            
            if (response.data.status === 'ok') {
                this.getFlags();
                this.getFlagsInfo();
            };
        } catch (error: any) {
            throw error.response;
        } finally {
            this.setSubmitFlagLoading(false);
        }
    }
}