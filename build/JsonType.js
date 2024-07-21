"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerSettingsFormat = exports.RuleTypeFormat = exports.LangTypeFormat = exports.RolesStr = void 0;
const ts_json_validator_1 = require("ts-json-validator");
// https://github.com/nwtgck/ts-json-validator
// https://qiita.com/nwtgck/items/1cc44b6d445ae1d48957
exports.RolesStr = (0, ts_json_validator_1.obj)({
    Villager: ts_json_validator_1.str,
    Seer: ts_json_validator_1.str,
    Priest: ts_json_validator_1.str,
    Knight: ts_json_validator_1.str,
    Werewolf: ts_json_validator_1.str,
    Traitor: ts_json_validator_1.str,
    Mason: ts_json_validator_1.str,
    Dictator: ts_json_validator_1.str,
    Baker: ts_json_validator_1.str,
    Communicatable: ts_json_validator_1.str,
    Fanatic: ts_json_validator_1.str,
});
const RolesStrs = (0, ts_json_validator_1.obj)({
    Villager: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
    Seer: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
    Priest: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
    Knight: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
    Werewolf: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
    Traitor: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
    Mason: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
    Dictator: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
    Baker: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
    Communicatable: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
    Fanatic: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
});
const RolesOptNum = (0, ts_json_validator_1.obj)({
    Villager: (0, ts_json_validator_1.opt)(ts_json_validator_1.num),
    Seer: (0, ts_json_validator_1.opt)(ts_json_validator_1.num),
    Priest: (0, ts_json_validator_1.opt)(ts_json_validator_1.num),
    Knight: (0, ts_json_validator_1.opt)(ts_json_validator_1.num),
    Werewolf: (0, ts_json_validator_1.opt)(ts_json_validator_1.num),
    Traitor: (0, ts_json_validator_1.opt)(ts_json_validator_1.num),
    Mason: (0, ts_json_validator_1.opt)(ts_json_validator_1.num),
    Dictator: (0, ts_json_validator_1.opt)(ts_json_validator_1.num),
    Baker: (0, ts_json_validator_1.opt)(ts_json_validator_1.num),
    Communicatable: (0, ts_json_validator_1.opt)(ts_json_validator_1.num),
    Fanatic: (0, ts_json_validator_1.opt)(ts_json_validator_1.num),
});
const Roles = (0, ts_json_validator_1.obj)({
    Villager: (0, ts_json_validator_1.opt)((0, ts_json_validator_1.obj)({
        count: ts_json_validator_1.num,
        first_victim: ts_json_validator_1.bool,
    })),
    Seer: (0, ts_json_validator_1.opt)((0, ts_json_validator_1.obj)({
        count: ts_json_validator_1.num,
        first_victim: ts_json_validator_1.bool,
    })),
    Priest: (0, ts_json_validator_1.opt)((0, ts_json_validator_1.obj)({
        count: ts_json_validator_1.num,
        first_victim: ts_json_validator_1.bool,
    })),
    Knight: (0, ts_json_validator_1.opt)((0, ts_json_validator_1.obj)({
        count: ts_json_validator_1.num,
        first_victim: ts_json_validator_1.bool,
    })),
    Traitor: (0, ts_json_validator_1.opt)((0, ts_json_validator_1.obj)({
        count: ts_json_validator_1.num,
        first_victim: ts_json_validator_1.bool,
    })),
    Mason: (0, ts_json_validator_1.opt)((0, ts_json_validator_1.obj)({
        count: ts_json_validator_1.num,
        first_victim: ts_json_validator_1.bool,
    })),
    Werewolf: (0, ts_json_validator_1.opt)((0, ts_json_validator_1.obj)({
        count: ts_json_validator_1.num,
        first_victim: ts_json_validator_1.bool,
    })),
    Dictator: (0, ts_json_validator_1.opt)((0, ts_json_validator_1.obj)({
        count: ts_json_validator_1.num,
        first_victim: ts_json_validator_1.bool,
    })),
    Baker: (0, ts_json_validator_1.opt)((0, ts_json_validator_1.obj)({
        count: ts_json_validator_1.num,
        first_victim: ts_json_validator_1.bool,
    })),
    Communicatable: (0, ts_json_validator_1.opt)((0, ts_json_validator_1.obj)({
        count: ts_json_validator_1.num,
        first_victim: ts_json_validator_1.bool,
    })),
    Fanatic: (0, ts_json_validator_1.opt)((0, ts_json_validator_1.obj)({
        count: ts_json_validator_1.num,
        first_victim: ts_json_validator_1.bool,
    })),
});
const seer_or_priest = (0, ts_json_validator_1.obj)({
    result_title: ts_json_validator_1.str,
    no_result: ts_json_validator_1.str,
    no_wolf: ts_json_validator_1.str,
    is_wolf: ts_json_validator_1.str,
    same_team_role: ts_json_validator_1.str,
    log: ts_json_validator_1.str,
    title: ts_json_validator_1.str,
    list: ts_json_validator_1.str,
});
const userCommand = (0, ts_json_validator_1.obj)({
    cmd: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
    desc: ts_json_validator_1.str,
});
const gmCommand = (0, ts_json_validator_1.obj)({
    cmd: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
    desc: ts_json_validator_1.str,
});
const devCommand = (0, ts_json_validator_1.obj)({
    cmd: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
    desc: ts_json_validator_1.str,
});
exports.LangTypeFormat = (0, ts_json_validator_1.obj)({
    game: (0, ts_json_validator_1.obj)({
        room_Werewolf: ts_json_validator_1.str,
        room_Mason: ts_json_validator_1.str,
        room_Vote: ts_json_validator_1.str,
        room_DebugLog: ts_json_validator_1.str,
        room_Living: ts_json_validator_1.str,
        room_Dead: ts_json_validator_1.str,
        room_Audience: ts_json_validator_1.str,
    }),
    sys: (0, ts_json_validator_1.obj)({
        cmd_make_room: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
        cmd_delete_room: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
        cmd_cancel: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
        cmd_list_GM: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
        cmd_list_Dev: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
        cmd_add_GM: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
        cmd_add_Dev: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
        cmd_rm_GM: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
        cmd_rm_Dev: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
        cmd_role_num: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
        cmd_reload_rule: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
        cmd_member_list: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
        cmd_change_rule: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
        cmd_update_perm: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
        cmd_stop_timer: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
        cmd_resume_timer: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
        cmd_extend_time: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
        cmd_skip_phase: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
        cmd_addtime: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
        sym_err: ts_json_validator_1.str,
        sym_warn: ts_json_validator_1.str,
        sym_info: ts_json_validator_1.str,
        sys_need_GM_perm: ts_json_validator_1.str,
        sys_need_Dev_perm: ts_json_validator_1.str,
        sys_GM_list_title: ts_json_validator_1.str,
        sys_Dev_list_title: ts_json_validator_1.str,
        sys_start_browser: ts_json_validator_1.str,
        system_color: ts_json_validator_1.num,
        system_err_color: ts_json_validator_1.num,
        system_warn_color: ts_json_validator_1.num,
        system_info_color: ts_json_validator_1.num,
        killed_color: ts_json_validator_1.num,
        no_killed_color: ts_json_validator_1.num,
        user_room_name: ts_json_validator_1.str,
        GM_added: ts_json_validator_1.str,
        Dev_added: ts_json_validator_1.str,
        GM_removed: ts_json_validator_1.str,
        Dev_removed: ts_json_validator_1.str,
        Need_at_least_1_GM: ts_json_validator_1.str,
        stop_timer: ts_json_validator_1.str,
        restart_timer: ts_json_validator_1.str,
        no_timer: ts_json_validator_1.str,
        rule_format_error: ts_json_validator_1.str,
        set_role_error: ts_json_validator_1.str,
        set_rules_error: ts_json_validator_1.str,
        too_much_first_victim: ts_json_validator_1.str,
        Current_role_breakdown: ts_json_validator_1.str,
        Current_role_breakdown_sum: ts_json_validator_1.str,
        Current_join_member_num: ts_json_validator_1.str,
        Current_player_sum: ts_json_validator_1.str,
        scheduled_start: ts_json_validator_1.str,
        wish_start_datetime_desc: ts_json_validator_1.str,
        role_assign_datetime_desc: ts_json_validator_1.str,
        daytime_start_datetime_desc: ts_json_validator_1.str,
        night_start_datetime_desc: ts_json_validator_1.str,
        time_formatMS: ts_json_validator_1.str,
        time_formatM: ts_json_validator_1.str,
        time_formatS: ts_json_validator_1.str,
        remaining_time: ts_json_validator_1.str,
        time_is_up: ts_json_validator_1.str,
        dead: ts_json_validator_1.str,
        welcome_dead: ts_json_validator_1.str,
        no_result: ts_json_validator_1.str,
        skip_phase_desc: ts_json_validator_1.str,
    }),
    rule: (0, ts_json_validator_1.obj)({
        title: ts_json_validator_1.str,
        first_victim_count: (0, ts_json_validator_1.obj)({
            txt: ts_json_validator_1.str,
        }),
        first_victim: (0, ts_json_validator_1.obj)({
            txt: ts_json_validator_1.str,
            no: ts_json_validator_1.str,
            yes: ts_json_validator_1.str,
        }),
        first_sight: (0, ts_json_validator_1.obj)({
            txt: ts_json_validator_1.str,
            no_sight: ts_json_validator_1.str,
            random: ts_json_validator_1.str,
            random_white: ts_json_validator_1.str,
        }),
        continuous_guard: (0, ts_json_validator_1.obj)({
            txt: ts_json_validator_1.str,
            no: ts_json_validator_1.str,
            yes: ts_json_validator_1.str,
        }),
        vote_place: (0, ts_json_validator_1.obj)({
            txt: ts_json_validator_1.str,
            realtime_open: ts_json_validator_1.str,
            realtime_anonym: ts_json_validator_1.str,
            realtime_anonym_open: ts_json_validator_1.str,
            after_open: ts_json_validator_1.str,
            after_anonym: ts_json_validator_1.str,
            no_open: ts_json_validator_1.str,
        }),
        vote_num: (0, ts_json_validator_1.obj)({
            txt: ts_json_validator_1.str,
        }),
        vote_even: (0, ts_json_validator_1.obj)({
            txt: ts_json_validator_1.str,
            random: ts_json_validator_1.str,
            no_exec: ts_json_validator_1.str,
        }),
    }),
    timetable: (0, ts_json_validator_1.obj)({
        title: ts_json_validator_1.str,
        day_length: (0, ts_json_validator_1.obj)({
            txt: ts_json_validator_1.str,
        }),
        night_length: (0, ts_json_validator_1.obj)({
            txt: ts_json_validator_1.str,
        }),
        votetime_length: (0, ts_json_validator_1.obj)({
            txt: ts_json_validator_1.str,
        }),
    }),
    role: exports.RolesStr,
    emo: exports.RolesStr,
    role_img: exports.RolesStr,
    role_uni: exports.RolesStr,
    role_descs: exports.RolesStr,
    team_name: (0, ts_json_validator_1.obj)({
        Good: ts_json_validator_1.str,
        Evil: ts_json_validator_1.str,
        Other: ts_json_validator_1.str,
    }),
    team_emo: (0, ts_json_validator_1.obj)({
        Good: ts_json_validator_1.str,
        Evil: ts_json_validator_1.str,
        Other: ts_json_validator_1.str,
        White: ts_json_validator_1.str,
        Black: ts_json_validator_1.str,
        Unknown: ts_json_validator_1.str,
    }),
    team_img: (0, ts_json_validator_1.obj)({
        Good: ts_json_validator_1.str,
        Evil: ts_json_validator_1.str,
        Other: ts_json_validator_1.str,
    }),
    team_color: (0, ts_json_validator_1.obj)({
        Good: ts_json_validator_1.num,
        Evil: ts_json_validator_1.num,
        Other: ts_json_validator_1.num,
    }),
    react: (0, ts_json_validator_1.obj)({
        o: ts_json_validator_1.str,
        x: ts_json_validator_1.str,
        alp: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
        num: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
    }),
    p0: (0, ts_json_validator_1.obj)({
        cmd_start: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
        cmd_delete_room: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
        pong: ts_json_validator_1.str,
        make_room: ts_json_validator_1.str,
        rediscovered_room: ts_json_validator_1.str,
        start_recruiting: ts_json_validator_1.str,
        breakdown_changed: ts_json_validator_1.str,
    }),
    p1: (0, ts_json_validator_1.obj)({
        cmd_join: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
        cmd_leave: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
        cmd_kick: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
        cmd_start: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
        cmd_join_force: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
        phase_name: ts_json_validator_1.str,
        start_p1: ts_json_validator_1.str,
        already_in: ts_json_validator_1.str,
        no_join: ts_json_validator_1.str,
        welcome: ts_json_validator_1.str,
        see_you: ts_json_validator_1.str,
        err_join_admin: ts_json_validator_1.str,
        warn_join_admin: ts_json_validator_1.str,
        current_count: ts_json_validator_1.str,
        member_full: ts_json_validator_1.str,
        member_not_enough: ts_json_validator_1.str,
        member_over: ts_json_validator_1.str,
    }),
    p2: (0, ts_json_validator_1.obj)({
        cmd_start_force: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
        phase_name: ts_json_validator_1.str,
        start_preparations: ts_json_validator_1.str,
        announce_role: ts_json_validator_1.str,
        announce_next: ts_json_validator_1.str,
        done_preparations: ts_json_validator_1.str,
        mate_names_title: ts_json_validator_1.str,
        already_ac: ts_json_validator_1.str,
        new_accept: ts_json_validator_1.str,
        all_accept: ts_json_validator_1.str,
        incomplete_ac: ts_json_validator_1.str,
        cant_force_start: ts_json_validator_1.str,
        force_start: ts_json_validator_1.str,
        wish_role_preparations: ts_json_validator_1.str,
        wish_role_desc1: ts_json_validator_1.str,
        wish_role_desc2: ts_json_validator_1.str,
        wish_role_desc3: ts_json_validator_1.str,
        wish_role_desc_wish: ts_json_validator_1.str,
        wish_role_desc_nowish: ts_json_validator_1.str,
        wish_role_req: ts_json_validator_1.str,
    }),
    p3: (0, ts_json_validator_1.obj)({
        phase_name: ts_json_validator_1.str,
        no_sight: ts_json_validator_1.str,
        random_sight: ts_json_validator_1.str,
        random_white_sight: ts_json_validator_1.str,
        length_of_the_first_night: ts_json_validator_1.str,
    }),
    p4: (0, ts_json_validator_1.obj)({
        phase_name: ts_json_validator_1.str,
        no_killed_morning: ts_json_validator_1.str,
        killed_morning: ts_json_validator_1.str,
        anonymous_name: ts_json_validator_1.str,
        day_number: ts_json_validator_1.str,
        living_and_num: ts_json_validator_1.str,
        length_of_the_day: ts_json_validator_1.str,
        role_list: ts_json_validator_1.str,
        member_list: ts_json_validator_1.str,
        call_time: ts_json_validator_1.str,
        publish_order: ts_json_validator_1.str,
        skip_phase_label: ts_json_validator_1.str,
        skip_phase_title: ts_json_validator_1.str,
        skip_phase_accept: ts_json_validator_1.str,
        skip_phase_cancel: ts_json_validator_1.str,
        skip_phase_approved: ts_json_validator_1.str,
        remainingMessageCount: ts_json_validator_1.str,
        reachedMaxMessageCount: ts_json_validator_1.str,
    }),
    p5: (0, ts_json_validator_1.obj)({
        phase_name: ts_json_validator_1.str,
        end_daytime: ts_json_validator_1.str,
        start_vote: ts_json_validator_1.str,
        vote_title: ts_json_validator_1.str,
        vote_desc: ts_json_validator_1.str,
        vote_list: ts_json_validator_1.str,
        vote_accept: ts_json_validator_1.str,
        vote_accept_1: ts_json_validator_1.str,
        vote_change: ts_json_validator_1.str,
        already_vote: ts_json_validator_1.str,
        no_revoting: ts_json_validator_1.str,
        no_selfvote: ts_json_validator_1.str,
        vote_format: ts_json_validator_1.str,
        vote_anonym_format: ts_json_validator_1.str,
        revote_times: ts_json_validator_1.str,
        executed: ts_json_validator_1.str,
        after_open_title: ts_json_validator_1.str,
        revote: ts_json_validator_1.str,
        final_even: ts_json_validator_1.str,
        after_open_format: ts_json_validator_1.str,
        after_open_format_n: ts_json_validator_1.str,
        after_open_anonym: ts_json_validator_1.str,
        after_no_open: ts_json_validator_1.str,
        living_num: ts_json_validator_1.str,
    }),
    p6: (0, ts_json_validator_1.obj)({
        phase_name: ts_json_validator_1.str,
        start: ts_json_validator_1.str,
        skip_phase_label: ts_json_validator_1.str,
        skip_phase_title: ts_json_validator_1.str,
        skip_phase_accept: ts_json_validator_1.str,
        skip_phase_cancel: ts_json_validator_1.str,
        skip_phase_approved: ts_json_validator_1.str,
    }),
    p7: (0, ts_json_validator_1.obj)({
        cmd_continue: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
        cmd_breakup: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
        phase_name: ts_json_validator_1.str,
        title: ts_json_validator_1.str,
        main: ts_json_validator_1.str,
        win: ts_json_validator_1.str,
        lose: ts_json_validator_1.str,
        result_format: ts_json_validator_1.str,
        log: ts_json_validator_1.str,
        continue: ts_json_validator_1.str,
        breakup: ts_json_validator_1.str,
    }),
    baker: (0, ts_json_validator_1.obj)({
        repertoire: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
        deliver: ts_json_validator_1.str,
        killed: ts_json_validator_1.str,
    }),
    dictator: (0, ts_json_validator_1.obj)({
        uni: ts_json_validator_1.str,
        button_title: ts_json_validator_1.str,
        button_desc: ts_json_validator_1.str,
        exercise: ts_json_validator_1.str,
    }),
    seer: seer_or_priest,
    priest: seer_or_priest,
    knight: (0, ts_json_validator_1.obj)({
        title: ts_json_validator_1.str,
        list: ts_json_validator_1.str,
        already: ts_json_validator_1.str,
        accept: ts_json_validator_1.str,
        change: ts_json_validator_1.str,
        no_select: ts_json_validator_1.str,
    }),
    werewolf: (0, ts_json_validator_1.obj)({
        start_room_title: ts_json_validator_1.str,
        title: ts_json_validator_1.str,
        list: ts_json_validator_1.str,
        already: ts_json_validator_1.str,
        accept: ts_json_validator_1.str,
        change: ts_json_validator_1.str,
        no_select: ts_json_validator_1.str,
    }),
    mason: (0, ts_json_validator_1.obj)({
        start_room_title: ts_json_validator_1.str,
    })
});
exports.RuleTypeFormat = (0, ts_json_validator_1.obj)({
    roles: Roles,
    first_victim_count: ts_json_validator_1.num,
    first_sight: (0, ts_json_validator_1.union)((0, ts_json_validator_1.literal)('no_sight'), (0, ts_json_validator_1.literal)('random'), (0, ts_json_validator_1.literal)('random_white')),
    continuous_guard: ts_json_validator_1.bool,
    confirmation_sec: ts_json_validator_1.num,
    wish_role_rand_weight: ts_json_validator_1.num,
    wish_role_time: ts_json_validator_1.num,
    daily_talk_limit: ts_json_validator_1.num,
    skip_vote_rule: (0, ts_json_validator_1.union)((0, ts_json_validator_1.literal)('all'), (0, ts_json_validator_1.literal)('majority')),
    first_night: (0, ts_json_validator_1.obj)({
        first_night_time: ts_json_validator_1.num,
        alert_times: (0, ts_json_validator_1.arr)(ts_json_validator_1.num),
    }),
    day: (0, ts_json_validator_1.obj)({
        length: ts_json_validator_1.num,
        reduction_time: ts_json_validator_1.num,
        alert_times: (0, ts_json_validator_1.arr)(ts_json_validator_1.num),
    }),
    night: (0, ts_json_validator_1.obj)({
        length: ts_json_validator_1.num,
        alert_times: (0, ts_json_validator_1.arr)(ts_json_validator_1.num),
    }),
    after_game: (0, ts_json_validator_1.obj)({
        length: ts_json_validator_1.num,
        alert_times: (0, ts_json_validator_1.arr)(ts_json_validator_1.num),
    }),
    vote: (0, ts_json_validator_1.obj)({
        length: ts_json_validator_1.num,
        alert_times: (0, ts_json_validator_1.arr)(ts_json_validator_1.num),
        talk: ts_json_validator_1.bool,
        place: (0, ts_json_validator_1.union)((0, ts_json_validator_1.literal)('realtime_open'), (0, ts_json_validator_1.literal)('realtime_anonym'), (0, ts_json_validator_1.literal)('realtime_anonym_open'), (0, ts_json_validator_1.literal)('after_open'), (0, ts_json_validator_1.literal)('after_anonym'), (0, ts_json_validator_1.literal)('no_open')),
        revote_num: ts_json_validator_1.num,
        when_even: (0, ts_json_validator_1.union)((0, ts_json_validator_1.literal)('random'), (0, ts_json_validator_1.literal)('no_exec')),
    }),
});
exports.ServerSettingsFormat = (0, ts_json_validator_1.obj)({
    system_lang: ts_json_validator_1.str,
    token1: ts_json_validator_1.str,
    system_GM: (0, ts_json_validator_1.arr)(ts_json_validator_1.str),
});
//# sourceMappingURL=JsonType.js.map