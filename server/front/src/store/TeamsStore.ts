import { makeAutoObservable } from 'mobx';
import TeamsService from '../api/teamsService';
import { IAddTeamData, IGenerateTeamsData, ITeam } from '../models/teams';

export default class AuthStore {
    teams = [] as ITeam[];
    addTeamLoading = false;
    genTeamsLoading = false;

    constructor() {
        makeAutoObservable(this, {}, {'autoBind': true});
    }

    setTeams(teams: ITeam[]) {
        this.teams = teams;
    }

    setGenTeamsLoading(value: boolean) {
        this.genTeamsLoading = value;
    }

    setAddTeamLoading(value: boolean) {
        this.addTeamLoading = value;
    }

    async getTeams() {
        try {
            const response = await TeamsService.get_teams();
            
            if (response.data.status === 'ok') {
                this.setTeams(response.data.teams);
            };
        } catch (error: any) {
            throw error.response;
        }
    }

    async generateTeams(data: IGenerateTeamsData) {
        this.setGenTeamsLoading(true);
        try {
            const response = await TeamsService.generate_teams(data);
            
            if (response.data.status === 'ok') {
                this.getTeams();
            };
        } catch (error: any) {
            throw error.response;
        } finally {
            this.setGenTeamsLoading(false);
        }
    }

    async addTeam(data: IAddTeamData) {
        this.setAddTeamLoading(true);
        try {
            const response = await TeamsService.add_team(data);
            
            if (response.data.status === 'ok') {
                this.teams = this.teams.concat(response.data.teams);
            };
        } catch (error: any) {
            throw error.response;
        } finally {
            this.setAddTeamLoading(false);
        }
    }

    async deleteTeams(teamId: number | null) {
        try {
            const response = await TeamsService.delete_teams(teamId);
            
            if (response.data.status === 'ok') {
                if (teamId) {
                    this.setTeams(this.teams.filter(function(f) { return f.team_id !== teamId }));
                } else {
                    this.getTeams();
                }
            };
        } catch (error: any) {
            throw error.response;
        }
    }
}