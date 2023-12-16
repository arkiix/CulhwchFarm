create or replace view v_get_queue_flags
as
select f.flag_id, f.flag
from t_flags f
left join t_flag_submits fs
	on f.flag_id = fs.flag_id
where fs.submit_id is null;


create or replace view v_flags
as
select f.flag,
	f.flag_id,
	coalesce(s.sploit_name, 'unknown')::varchar(100) as sploit_name,
	s.sploit_id,
	coalesce(t.team_name, 'deleted') as team_name,
	to_char(f.create_dt, 'DD.MM HH24:MI:SS') as create_dt,
	coalesce(ss.status_name, 'QUEUED') as status_name,
	coalesce(fs.response, '...') as response
from t_flags f
left join t_teams t
	on f.team_id = t.team_id
left join t_sploits s
	on f.sploit_id = s.sploit_id
left join t_flag_submits fs
	on f.flag_id = fs.flag_id
left join t_submit_statuses ss
	on fs.status_id = ss.status_id;