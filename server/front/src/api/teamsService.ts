import api from '../http';
import { AxiosResponse } from 'axios';
import { IGetTeams, IDeleteTeams, IAddTeam, IGenerateTeams, IGenerateTeamsData, IAddTeamData } from '../models/teams';

export default class TeamsService {
    static async get_teams(): Promise<AxiosResponse<IGetTeams>> {
        return await api.get<IGetTeams>(
            'teams'
        );
    };

    static async delete_teams(teamId: number | null): Promise<AxiosResponse<IDeleteTeams>> {
        return await api.delete<IDeleteTeams>(
            'teams',
            {
                params: {
                    'team_id': teamId
                }
            }
        );
    };

    static async add_team(data: IAddTeamData): Promise<AxiosResponse<IAddTeam>> {
        return await api.post<IAddTeam>(
            'teams',
            {
                'teams': [
                    {
                        'team_name': data.team_name,
                        'team_ip': data.team_ip
                    }
                ]
            }
        );
    };
    
    static async generate_teams(data: IGenerateTeamsData): Promise<AxiosResponse<IGenerateTeams>> {
        return await api.post<IGenerateTeams>(
            'teams/gen',
            {
                'name_template': data.name_template,
                'ip_template': data.ip_template,
                'start_num': data.start_num,
                'count_teams': data.count_teams
            }
        );
    };
};
