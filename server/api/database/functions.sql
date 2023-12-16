create or replace function get_round_statistics(
	p_sploit_id int2,
	p_round_length int,
	p_count_rounds int
)
returns int4[]
as $func_body$
declare
	v_round_periods tsrange[];
    v_cnt_round_flags int4[];
begin
	select array_agg(tsrange(round_start, round_start + p_round_length * interval '1 second')) as round_period
	into v_round_periods
	from (
		select generate_series(
		    min(create_dt) - p_count_rounds * p_round_length * interval '1 second',
		    now()::timestamp,
		    p_round_length * interval '1 second'
		) as round_start
		from t_flags
		order by 1 desc
		limit p_count_rounds
	) as t;

	if v_round_periods is not null then
	    select array_agg(cf.cnt)
		into v_cnt_round_flags
		from (
            select sum(cnt) as cnt
            from (
                select count(f.flag_id) as cnt, rp
                from t_flags f
                join unnest(v_round_periods) rp
                    on rp @> f.create_dt
                where (p_sploit_id is not null and f.sploit_id = p_sploit_id) or p_sploit_id is null
                group by rp
                union all
                select 0 as cnt, rp
                from unnest(v_round_periods) rp
            ) ccf
            group by ccf.rp
            order by ccf.rp
		) cf;
	end if;

	return v_cnt_round_flags;
end;
$func_body$
language plpgsql;


create or replace function get_info_flags(
	p_sploit_id int2
)
returns jsonb
as $func_body$
begin
	return (
		select jsonb_object_agg(lower(metrics.metric_name), metrics.value)
		from (
		    select mc.metric_name, sum(mc.value) as value
		    from (
                select 'total_flags' as metric_name, count(*) as value
                from t_flags
                where (p_sploit_id::int2 is not null and sploit_id = p_sploit_id) or p_sploit_id is null
                union all
                select 'total_flags', 0

                union all

                select ss.status_name, count(*)
                from t_flags f
                join t_flag_submits fs
                    on f.flag_id = fs.flag_id
                join t_submit_statuses ss
                    on fs.status_id = ss.status_id
                where (p_sploit_id::int2 is not null and f.sploit_id = p_sploit_id) or p_sploit_id is null
                group by ss.status_id, ss.status_name
                union all
                select 'QUEUED', count(*)
                from t_flags f
                left join t_flag_submits fs
                    on f.flag_id = fs.flag_id
                where ((p_sploit_id::int2 is not null and f.sploit_id = p_sploit_id) or p_sploit_id is null)
                    and fs.flag_id is null
                union all
                select ss.status_name, 0
                from t_submit_statuses ss

                union all

                select 'latest_flags', count(*)
                from t_flags
                where ((p_sploit_id::int2 is not null and sploit_id = p_sploit_id) or p_sploit_id is null)
                    and create_dt > now() - interval '10 minutes'
                union all
                select 'latest_flags', 0

                union all

                select 'exploits', count(*) - 1
                from t_sploits
            ) mc
            group by 1
		) metrics
	);
end;
$func_body$
language plpgsql;


create or replace function fn_init_protocols(
	p_protocols jsonb
)
returns void
as $func_body$
declare
begin
	delete from t_protocols_params
    where protocol_id in (
        select protocol_id
        from t_protocols
        where protocol_name not in (select jsonb_object_keys(p_protocols))
    );

    delete from t_protocols
    where protocol_name not in (select jsonb_object_keys(p_protocols));

    insert into t_protocols (protocol_name)
    select new_protocol_name
    from jsonb_object_keys(p_protocols) new_protocol_name
    left join t_protocols p
        on new_protocol_name = p.protocol_name
    where p.protocol_id is null;

    delete from t_protocols_params pp
    using (
        select
            (select protocol_id from t_protocols where protocol_name = jp.protocol_name) protocol_id,
            array_agg(jp.protocol_param) protocol_params
        from (
            select key protocol_name, jsonb_array_elements_text(value) protocol_param
            from jsonb_each(p_protocols)
        ) jp
        group by 1
    ) p
    where pp.protocol_id = p.protocol_id
        and not protocol_param_name = any(p.protocol_params);

    insert into t_protocols_params (protocol_id, protocol_param_name)
    select p.protocol_id, p.protocol_param_name
    from (
        select
            (select protocol_id from t_protocols where protocol_name = j.key) protocol_id,
            jsonb_array_elements_text(j.value) protocol_param_name
        from jsonb_each(p_protocols) j
    ) p
    left join t_protocols_params t
        on t.protocol_id = p.protocol_id and t.protocol_param_name = p.protocol_param_name
    where t.protocol_param_name is null;
end;
$func_body$
language plpgsql;


create or replace function fn_init_validators(
	p_validators jsonb
)
returns void
as $func_body$
declare
begin
	delete from t_validators_params
    where validator_id in (
        select validator_id
        from t_validators
        where validator_name not in (select jsonb_object_keys(p_validators))
    );

    delete from t_validators
    where validator_name not in (select jsonb_object_keys(p_validators));

    insert into t_validators (validator_name)
    select new_validator_name
    from jsonb_object_keys(p_validators) new_validator_name
    left join t_validators p
        on new_validator_name = p.validator_name
    where p.validator_id is null;

    delete from t_validators_params pp
    using (
        select
            (select validator_id from t_validators where validator_name = jp.validator_name) validator_id,
            array_agg(jp.validator_param) validator_params
        from (
            select key validator_name, jsonb_array_elements_text(value) validator_param
            from jsonb_each(p_validators)
        ) jp
        group by 1
    ) p
    where pp.validator_id = p.validator_id
        and not validator_param_name = any(p.validator_params);

    insert into t_validators_params (validator_id, validator_param_name)
    select p.validator_id, p.validator_param_name
    from (
        select
            (select validator_id from t_validators where validator_name = j.key) validator_id,
            jsonb_array_elements_text(j.value) validator_param_name
        from jsonb_each(p_validators) j
    ) p
    left join t_validators_params t
        on t.validator_id = p.validator_id and t.validator_param_name = p.validator_param_name
    where t.validator_param_name is null;
end;
$func_body$
language plpgsql;