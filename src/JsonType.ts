import {nul, bool, num, str, literal, opt, arr, tuple, obj, union, TsType, validatingParse} from 'ts-json-validator';

// https://github.com/nwtgck/ts-json-validator
// https://qiita.com/nwtgck/items/1cc44b6d445ae1d48957

export const RolesStr = obj({
    Villager       : str,
    Seer           : str,
    Priest         : str,
    Knight         : str,
    Werewolf       : str,
    Traitor        : str,
    Mason          : str,
    Dictator       : str,
    Baker          : str,
    Communicatable : str,
    Fanatic        : str,
});
export type RolesStrType = TsType<typeof RolesStr>;
const RolesStrs = obj({
    Villager       : arr(str),
    Seer           : arr(str),
    Priest         : arr(str),
    Knight         : arr(str),
    Werewolf       : arr(str),
    Traitor        : arr(str),
    Mason          : arr(str),
    Dictator       : arr(str),
    Baker          : arr(str),
    Communicatable : arr(str),
    Fanatic        : arr(str),
});
const RolesOptNum = obj({
    Villager       : opt(num),
    Seer           : opt(num),
    Priest         : opt(num),
    Knight         : opt(num),
    Werewolf       : opt(num),
    Traitor        : opt(num),
    Mason          : opt(num),
    Dictator       : opt(num),
    Baker          : opt(num),
    Communicatable : opt(num),
    Fanatic        : opt(num),
});

const Roles = obj({

    Villager: opt(obj({
        count: num,
        first_victim: bool,
    })),
    
    Seer: opt(obj({
        count: num,
        first_victim: bool,
    })),
    
    Priest: opt(obj({
        count: num,
        first_victim: bool,
    })),
    
    Knight: opt(obj({
        count: num,
        first_victim: bool,
    })),
    
    Traitor: opt(obj({
        count: num,
        first_victim: bool,
    })),
    
    Mason: opt(obj({
        count: num,
        first_victim: bool,
    })),

    Werewolf: opt(obj({
        count: num,
        first_victim: bool,
    })),

    Dictator: opt(obj({
        count: num,
        first_victim: bool,
    })),
    
    Baker: opt(obj({
        count: num,
        first_victim: bool,
    })),
    
    Communicatable: opt(obj({
        count: num,
        first_victim: bool,
    })),
    
    Fanatic: opt(obj({
        count: num,
        first_victim: bool,
    })),
    
});

const seer_or_priest = obj({
    result_title   : str,
    no_result      : str,
    no_wolf        : str,
    is_wolf        : str,
    same_team_role : str,
    log            : str,
    title          : str,
    list           : str,
});
export type SeerPriestType = TsType<typeof seer_or_priest>;

const userCommand = obj({
    cmd        : arr(str),
    desc       : str,
});
const gmCommand = obj({
    cmd        : arr(str),
    desc       : str,
});
const devCommand = obj({
    cmd        : arr(str),
    desc       : str,
});
export type UserCommandType = TsType<typeof userCommand>;
export type GmCommandType   = TsType<typeof gmCommand>;
export type DevCommandType  = TsType<typeof devCommand>;


export const LangTypeFormat = obj({
    game
    :obj({
        room_Werewolf    : str,
        room_Mason       : str,
        room_Vote        : str,
        room_DebugLog    : str,
        room_Living      : str,
        room_Dead        : str,
        room_Audience    : str,
    }),

    sys
    :obj({
        cmd_make_room    : arr(str),
        cmd_delete_room  : arr(str),
        cmd_cancel       : arr(str),
        cmd_list_GM      : arr(str),
        cmd_list_Dev     : arr(str),
        cmd_add_GM       : arr(str),
        cmd_add_Dev      : arr(str),
        cmd_rm_GM        : arr(str),
        cmd_rm_Dev       : arr(str),
        cmd_role_num     : arr(str),
        cmd_reload_rule  : arr(str),
        cmd_member_list  : arr(str),
        cmd_change_rule  : arr(str),

        cmd_update_perm  : arr(str),
        cmd_stop_timer   : arr(str),
        cmd_resume_timer : arr(str),
        cmd_extend_time  : arr(str),
        cmd_skip_phase   : arr(str),
        cmd_addtime      : arr(str),

        sym_err       : str,
        sym_warn      : str, 
        sym_info      : str, 

        sys_need_GM_perm   : str,
        sys_need_Dev_perm  : str,
        sys_GM_list_title  : str,
        sys_Dev_list_title : str,
        sys_start_browser  : str,

        system_color      : num,
        system_err_color  : num,
        system_warn_color : num,
        system_info_color : num,

        killed_color     : num,
        no_killed_color  : num,

        user_room_name : str,
        
        GM_added    : str,
        Dev_added   : str,
        GM_removed  : str,
        Dev_removed : str,
        Need_at_least_1_GM  : str,

        stop_timer     : str,
        restart_timer  : str,
        no_timer       : str,

        rule_format_error : str,
        set_role_error    : str,
        set_rules_error   : str,
        too_much_first_victim : str,

        Current_role_breakdown       : str,
        Current_role_breakdown_sum   : str,
        Current_join_member_num      : str,
        Current_player_sum           : str,

        scheduled_start             : str,
        wish_start_datetime_desc    : str,
        role_assign_datetime_desc   : str,
        daytime_start_datetime_desc : str,
        night_start_datetime_desc   : str,

        time_formatMS     : str,
        time_formatM      : str,
        time_formatS      : str,
        remaining_time    : str,
        time_is_up        : str,

        dead         : str,
        welcome_dead : str,
        no_result    : str,

        skip_phase_desc : str,
    }),
    rule : obj({
        title : str,
        first_victim_count: obj({
            txt           : str,
        }),
        first_victim : obj({
            txt : str,
            no  : str,
            yes : str,
        }),
        first_sight : obj({
            txt           : str,
            no_sight    : str,
            random        : str,
            random_white  : str,
        }),
        continuous_guard : obj({
            txt : str,
            no  : str,
            yes : str,
        }),
        vote_place : obj({
            txt                  : str,
            realtime_open        : str,
            realtime_anonym      : str,
            realtime_anonym_open : str,
            after_open           : str,
            after_anonym         : str,
            no_open              : str,
        }),

        vote_num : obj({
            txt                  : str,
        }),

        vote_even : obj({
            txt                  : str,
            random               : str,
            no_exec              : str,
        }),
    }),
    timetable : obj({
        title: str,
        day_length: obj({
            txt: str,
        }),
        night_length: obj({
            txt: str,
        }),
        votetime_length: obj({
            txt: str,
        }),
    }),

    role     : RolesStr,
    emo      : RolesStr,
    role_img : RolesStr,
    role_uni : RolesStr,
    role_descs : RolesStr,

    team_name
    :obj({
        Good  : str,
        Evil  : str,
        Other : str,
    }),
    team_emo
    :obj({
        Good    : str,
        Evil    : str,
        Other   : str,
        White   : str,
        Black   : str,
        Unknown : str,
    }),
    team_img
    :obj({
        Good  : str,
        Evil  : str,
        Other : str,
    }),
    team_color
    :obj({
        Good  : num,
        Evil  : num,
        Other : num,
    }),

    react
    :obj({
        o   : str,
        x   : str,
        alp : arr(str),
        num : arr(str),
    }),

    p0
    :obj({
        cmd_start         : arr(str),
        cmd_delete_room   : arr(str),

        pong              : str,
        make_room         : str,
        rediscovered_room : str,
        start_recruiting  : str,

        breakdown_changed : str,
    }),

    p1
    :obj({
        cmd_join  : arr(str),
        cmd_leave : arr(str),
        cmd_kick : arr(str),
        cmd_start : arr(str),
        cmd_join_force  : arr(str),

        
        phase_name        : str,
        start_p1          : str,
        already_in        : str,
        no_join           : str,
        welcome           : str,
        see_you           : str,
        err_join_admin    : str,
        warn_join_admin   : str,

        current_count     : str,
        member_full       : str,
        member_not_enough : str,
        member_over       : str,
    }),
    
    p2
    :obj({
        cmd_start_force  : arr(str),
        
        phase_name       : str,
        start_preparations : str,
        announce_role      : str,
        announce_next      : str,
        done_preparations  : str,

        mate_names_title   : str,

        already_ac         : str,
        new_accept         : str,
        all_accept         : str,

        incomplete_ac      : str,
        cant_force_start   : str,
        force_start        : str,

        wish_role_preparations : str,
        wish_role_desc1        : str,
        wish_role_desc2        : str,
        wish_role_desc3        : str,
        wish_role_desc_wish    : str,
        wish_role_desc_nowish  : str,
        wish_role_req          : str,
    }),
    
    p3
    :obj({
        phase_name                : str,
        no_sight                : str,
        random_sight            : str,
        random_white_sight      : str,
        length_of_the_first_night : str,
    }),

    p4
    :obj({
        phase_name           : str,
        no_killed_morning    : str,
        killed_morning       : str,
        anonymous_name       : str,
        day_number           : str,
        living_and_num       : str,
        length_of_the_day    : str,

        role_list               : str,
        member_list             : str,
        call_time               : str,
        publish_order           : str,

        skip_phase_label          : str,
        skip_phase_title          : str,
        skip_phase_accept         : str,
        skip_phase_cancel         : str,
        skip_phase_approved       : str,

        remainingMessageCount  : str,
        reachedMaxMessageCount : str,
    }),

    p5
    :obj({
        phase_name    : str,
        end_daytime   : str,
        start_vote    : str,
        vote_title    : str,
        vote_desc     : str,
        vote_list     : str,
        
        vote_accept   : str,
        vote_accept_1 : str,
        vote_change   : str,
        already_vote  : str,
        no_revoting   : str,
        no_selfvote   : str,
        
        vote_format        : str,
        vote_anonym_format : str,
        
        revote_times       : str,
        executed           : str,
        after_open_title   : str,
        revote             : str,
        final_even         : str,
        after_open_format  : str,
        after_open_format_n: str,
        after_open_anonym  : str,
        after_no_open      : str,
        living_num         : str,
    }),

    p6
    :obj({
        phase_name    : str,
        start : str,

        skip_phase_label          : str,
        skip_phase_title          : str,
        skip_phase_accept         : str,
        skip_phase_cancel         : str,
        skip_phase_approved       : str,
    }),

    p7
    :obj({
        cmd_continue  : arr(str),
        cmd_breakup   : arr(str),
        phase_name    : str,
        title         : str,
        main          : str,
        win           : str,
        lose          : str,
        result_format : str,
        log           : str,
        continue      : str,
        breakup       : str,
    }),

    baker
    :obj({
        repertoire : arr(str),
        deliver    : str,
        killed     : str,
    }),

    dictator 
    :obj({
        uni          : str,
        button_title : str,
        button_desc  : str,
        exercise     : str,
    }),

    seer    : seer_or_priest,
    priest  : seer_or_priest,

    knight
    :obj({
        title      : str,
        list       : str,
        already    : str,
        accept     : str,
        change     : str,
        no_select  : str,
    }),
    
    werewolf
    :obj({
        start_room_title : str,
        title            : str,
        list             : str,
        already          : str,
        accept           : str,
        change           : str,
        no_select        : str,
    }),

    mason
    :obj({
        start_room_title : str,        
    })
});
export type LangType = TsType<typeof LangTypeFormat>;


export const RuleTypeFormat = obj({

    roles: Roles,

    first_victim_count: num,

    first_sight: union(
        literal('no_sight' as const),
        literal('random' as const),
        literal('random_white' as const),
    ),

    continuous_guard : bool,
    confirmation_sec : num,

    wish_role_rand_weight : num,
    wish_role_time        : num,

    daily_talk_limit      : num,

    skip_vote_rule : union(
        literal('all' as const),
        literal('majority' as const),
    ),

    first_night: obj({
        first_night_time : num,
        alert_times      : arr(num),
    }),

    day: obj({
        length         : num,
        reduction_time : num,
        alert_times    : arr(num),
    }),
    
    night: obj({
        length           : num,
        alert_times      : arr(num),
    }),

    after_game: obj({
        length           : num,
        alert_times      : arr(num),
    }),

    vote
    :obj({
        length         : num,
        alert_times    : arr(num),
        talk : bool,
        place: union(
            literal('realtime_open' as const),
            literal('realtime_anonym' as const),
            literal('realtime_anonym_open' as const),
            literal('after_open' as const),
            literal('after_anonym' as const),
            literal('no_open' as const),
        ),
        revote_num : num,
        when_even: union(
            literal('random' as const),
            literal('no_exec' as const),
        ),
    }),
});
export type RuleType = TsType<typeof RuleTypeFormat>;


export const ServerSettingsFormat = obj({

    system_lang     : str,
    token1          : str,
    system_GM       : arr(str),

});
export type ServerSettingsType = TsType<typeof ServerSettingsFormat>;
