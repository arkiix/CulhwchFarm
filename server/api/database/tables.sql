create table t_flags
(
    flag_id serial4 not null,
    flag varchar(1000) not null,
    sploit_id int2 not null,
    team_id int4 not null,
    create_dt timestamp not null default now(),
    constraint pk_flag_id primary key (flag_id),
    constraint un_flag unique (flag)
);


create table t_flag_submits
(
	submit_id serial4 not null,
    flag_id int not null,
    status_id int2 not null,
    response varchar(1024) null,
    constraint un_flag_id unique (flag_id)
);


create table t_submit_statuses
(
    status_id int2 not null,
    status_name varchar(50) not null
);

insert into t_submit_statuses (status_id, status_name)
values (0, 'QUEUED');

insert into t_submit_statuses (status_id, status_name)
values (1, 'SKIPPED');

insert into t_submit_statuses (status_id, status_name)
values (2, 'ACCEPTED');

insert into t_submit_statuses (status_id, status_name)
values (3, 'REJECTED');

analyze t_submit_statuses;


create table t_teams
(
    team_id serial4 not null,
    team_name varchar(100) not null,
    team_ip varchar(50) not null,
    constraint pk_team_id primary key (team_id),
    constraint un_team_ip unique (team_ip)
);

insert into t_teams
values (-1, 'Unknown', '');

analyze t_teams;


create table t_sploits
(
    sploit_id serial2 not null,
    sploit_name varchar(100) not null,
    constraint pk_sploit_id primary key (sploit_id),
    constraint un_sploit_name unique (sploit_name)
);

insert into t_sploits (sploit_id, sploit_name)
values (-1, 'MANUAL');

analyze t_sploits;


create table t_protocols (
	protocol_id serial2,
	protocol_name varchar(100) not null,
	constraint pk_protocol_id primary key (protocol_id),
	constraint un_protocol_name unique (protocol_name)
);


create table t_protocols_params (
	protocol_param_id serial2,
	protocol_id int2 not null,
	protocol_param_name varchar(100) not null,
	protocol_param_value varchar(256),
	constraint pk_protocol_param_id primary key (protocol_param_id)
);


create table t_validators (
	validator_id serial2,
	validator_name varchar(100) not null,
	validator_is_active bool not null default false,
	constraint pk_validator_id primary key (validator_id),
	constraint un_validator_name unique (validator_name)
);


create table t_validators_params (
	validator_param_id serial2,
	validator_id int2 not null,
	validator_param_name varchar(100) not null,
	validator_param_value varchar(256),
	constraint pk_validator_param_id primary key (validator_param_id)
);


create table t_settings (
	regex_flag_format varchar(500),
	system_protocol_id int2,
	submit_flag_limit int,
	submit_period int,
	flag_lifetime int,
	round_length int
);

insert into t_settings (regex_flag_format, system_protocol_id, submit_flag_limit, submit_period, flag_lifetime, round_length)
values ('[A-Z0-9]{31}=', 0, 100, 10, 300, 120);

analyze t_settings;