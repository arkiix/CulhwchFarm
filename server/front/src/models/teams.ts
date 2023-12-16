export interface ITeam {
    team_id: number;
    team_name: string; 
    team_ip: string;
}

export interface IGetTeams {
    status: string;
    teams: ITeam[];
}

export interface IDeleteTeams {
    status: string;
}

export interface IAddTeam {
    status: string;
    teams: ITeam[];
}

export interface IGenerateTeams {
    status: string;
}

export interface IGenerateTeamsData {
    name_template: string,
    ip_template: string,
    start_num: number,
    count_teams: number
}

export interface IAddTeamData {
    team_name: string,
    team_ip: string
}