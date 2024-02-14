"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KickReason = exports.Phase = void 0;
const Discord = __importStar(require("discord.js"));
const GameUtils_1 = require("./GameUtils");
const Util = __importStar(require("./GameUtils"));
const JsonType_1 = require("./JsonType");
exports.Phase = {
    p0_UnStarted: '0.UnStarted',
    p1_Wanted: '1.Wanted',
    p2_Preparation: '2.Preparation',
    p3_FirstNight: '3.FirstNight',
    p4_Daytime: '4.Daytime',
    p5_Vote: '5.Vote',
    p6_Night: '6.Night',
    p7_GameEnd: '7.GameEnd',
};
const Role = stringToEnum([
    'Villager',
    'Seer',
    'Priest',
    'Knight',
    'Werewolf',
    'Traitor',
    'Mason',
    'Dictator',
    'Baker',
    'Communicatable',
    'Fanatic',
]);
const TeamNames = stringToEnum([
    'Good',
    'Evil',
    'Other'
]);
const WISHROLENUM = 3;
function getDefaultTeams(r) {
    switch (r) {
        case Role.Villager:
        case Role.Seer:
        case Role.Priest:
        case Role.Knight:
        case Role.Mason:
        case Role.Dictator:
        case Role.Baker:
            return TeamNames.Good;
        case Role.Werewolf:
        case Role.Traitor:
        case Role.Communicatable:
        case Role.Fanatic:
            return TeamNames.Evil;
        default:
            (0, GameUtils_1.assertUnreachable)(r);
    }
}
function SightResult(r) {
    switch (r) {
        case Role.Villager:
        case Role.Seer:
        case Role.Priest:
        case Role.Knight:
        case Role.Mason:
        case Role.Dictator:
        case Role.Baker:
        case Role.Traitor:
        case Role.Communicatable:
        case Role.Fanatic:
            return TeamNames.Good;
        case Role.Werewolf:
            return TeamNames.Evil;
        default:
            (0, GameUtils_1.assertUnreachable)(r);
    }
}
function stringToEnum(o) {
    return o.reduce((accumulator, currentValue) => {
        accumulator[currentValue] = currentValue;
        return accumulator;
    }, Object.create(null));
}
function getUserMentionStrFromId(uid) {
    return "<@!" + uid + ">";
}
function getUserMentionStr(user) {
    return "<@!" + user.id + ">";
}
function getNicknameFromMes(message) {
    return (message.member != null && message.member.nickname != null ? message.member.nickname : message.author.displayName);
}
function getNicknameFromMem(mem) {
    return (mem.nickname != null ? mem.nickname : mem.user.displayName);
}
class GameMember {
    user;
    member;
    uchannel = null;
    role = null;
    wishRole = Object.create(null);
    allowWolfRoom = false;
    allowMasonRoom = false;
    actionLog = [];
    isLiving = true;
    deadReason = KickReason.Living;
    alpStr = "";
    validVoteID = [];
    voteTo = "";
    livingDays = -1;
    avatar;
    nickname;
    roleCmdInvokeNum = 0;
    constructor(m) {
        this.user = m.user;
        this.member = m;
        this.nickname = getNicknameFromMem(m);
        const ava = m.user.displayAvatarURL();
        this.avatar = ((ava == null) ? "" : ava);
        this.reset();
    }
    reset() {
        this.role = null;
        this.wishRole = Object.create(null);
        this.allowWolfRoom = false;
        this.allowMasonRoom = false;
        this.actionLog = [];
        this.isLiving = true;
        this.deadReason = KickReason.Living;
        this.alpStr = "";
        this.validVoteID = [];
        this.voteTo = "";
        this.livingDays = -1;
        this.roleCmdInvokeNum = 0;
    }
}
const Admin_alw = [
    Discord.PermissionsBitField.Flags.ViewChannel,
    Discord.PermissionsBitField.Flags.Connect,
    Discord.PermissionsBitField.Flags.AddReactions,
    Discord.PermissionsBitField.Flags.SendMessages,
    Discord.PermissionsBitField.Flags.ManageChannels,
    Discord.PermissionsBitField.Flags.Speak,
    Discord.PermissionsBitField.Flags.EmbedLinks,
    Discord.PermissionsBitField.Flags.MuteMembers,
    Discord.PermissionsBitField.Flags.DeafenMembers,
    Discord.PermissionsBitField.Flags.MoveMembers,
];
const Admin_dny = [];
const RW_alw = [
    Discord.PermissionsBitField.Flags.ViewChannel,
    Discord.PermissionsBitField.Flags.Connect,
    Discord.PermissionsBitField.Flags.AddReactions,
    Discord.PermissionsBitField.Flags.SendMessages,
    Discord.PermissionsBitField.Flags.Speak,
];
const RW_dny = [];
const ReadOnly_alw = [
    Discord.PermissionsBitField.Flags.ViewChannel,
    Discord.PermissionsBitField.Flags.Connect,
];
const ReadOnly_dny = [
    Discord.PermissionsBitField.Flags.AddReactions,
    Discord.PermissionsBitField.Flags.SendMessages,
    Discord.PermissionsBitField.Flags.Speak,
    Discord.PermissionsBitField.Flags.ManageThreads,
    Discord.PermissionsBitField.Flags.CreatePublicThreads,
    Discord.PermissionsBitField.Flags.CreatePrivateThreads,
    Discord.PermissionsBitField.Flags.SendMessagesInThreads,
];
const ViewOnly_alw = [
    Discord.PermissionsBitField.Flags.ViewChannel
];
const ViewOnly_dny = [
    Discord.PermissionsBitField.Flags.Connect,
    Discord.PermissionsBitField.Flags.AddReactions,
    Discord.PermissionsBitField.Flags.SendMessages,
    Discord.PermissionsBitField.Flags.Speak,
    Discord.PermissionsBitField.Flags.ManageThreads,
    Discord.PermissionsBitField.Flags.CreatePublicThreads,
    Discord.PermissionsBitField.Flags.CreatePrivateThreads,
    Discord.PermissionsBitField.Flags.SendMessagesInThreads,
];
const NoAccess_alw = [];
const NoAccess_dny = [
    Discord.PermissionsBitField.Flags.ViewChannel,
    Discord.PermissionsBitField.Flags.Connect,
    Discord.PermissionsBitField.Flags.AddReactions,
    Discord.PermissionsBitField.Flags.SendMessages,
    Discord.PermissionsBitField.Flags.Speak,
    Discord.PermissionsBitField.Flags.ManageThreads,
    Discord.PermissionsBitField.Flags.CreatePublicThreads,
    Discord.PermissionsBitField.Flags.CreatePrivateThreads,
    Discord.PermissionsBitField.Flags.SendMessagesInThreads,
];
function addPerm(id, p, perms) {
    switch (p) {
        case 0 /* Perm.NoAccess */:
            perms.push({ id: id, allow: NoAccess_alw, deny: NoAccess_dny });
            return;
        case 2 /* Perm.ViewOnly */:
            perms.push({ id: id, allow: ViewOnly_alw, deny: ViewOnly_dny });
            return;
        case 1 /* Perm.ReadOnly */:
            perms.push({ id: id, allow: ReadOnly_alw, deny: ReadOnly_dny });
            return;
        case 3 /* Perm.RW */:
            perms.push({ id: id, allow: RW_alw, deny: RW_dny });
            return;
        case 4 /* Perm.Admin */:
            perms.push({ id: id, allow: Admin_alw, deny: Admin_dny });
            return;
        default: (0, GameUtils_1.assertUnreachable)(p);
    }
}
var InteractType;
(function (InteractType) {
    InteractType[InteractType["Accept"] = 0] = "Accept";
    InteractType[InteractType["WishRole"] = 1] = "WishRole";
    InteractType[InteractType["Vote"] = 2] = "Vote";
    InteractType[InteractType["Knight"] = 3] = "Knight";
    InteractType[InteractType["Seer"] = 4] = "Seer";
    InteractType[InteractType["Werewolf"] = 5] = "Werewolf";
    InteractType[InteractType["Dictator"] = 6] = "Dictator";
    InteractType[InteractType["CutTime"] = 7] = "CutTime";
})(InteractType || (InteractType = {}));
var KickReason;
(function (KickReason) {
    KickReason[KickReason["Vote"] = 0] = "Vote";
    KickReason[KickReason["Werewolf"] = 1] = "Werewolf";
    KickReason[KickReason["Living"] = 2] = "Living";
})(KickReason || (exports.KickReason = KickReason = {}));
class GameState {
    clients;
    guild;
    srvSetting;
    langTxt;
    ruleSetting;
    upperGames;
    parentID;
    channels;
    phase;
    gameId;
    GM = Object.create(null);
    developer = Object.create(null);
    defaultRoles = Object.create(null);
    possibleFirstVictimRoles = Object.create(null);
    playingRoles = Object.create(null);
    possibleRoles = Object.create(null);
    emoText = Object.create(null);
    roleText = Object.create(null);
    members = Object.create(null);
    reqMemberNum = 0;
    interactControllers = [];
    reactedMember = Object.create(null);
    cutTimeMember = Object.create(null);
    p2CanForceStartGame;
    remTime;
    daytimeStartTime = 0;
    stopTimerRequest;
    isTimerProgress;
    dayNumber;
    killNext;
    voteNum;
    runoffNum;
    lastExecuted;
    wolfVote;
    wolfValidTo;
    wolfValidFrom;
    wolfLog;
    dictatorVoteMode = "";
    timerList;
    // Game construction method
    constructor(clients, upperGames, guild, ch, parentID, srvLangTxt, srvRuleSetting, srvSetting) {
        this.clients = clients;
        this.upperGames = upperGames;
        this.guild = guild;
        this.loadLang(srvLangTxt);
        this.langTxt = srvLangTxt;
        this.ruleSetting = srvRuleSetting;
        this.srvSetting = srvSetting;
        this.channels = ch;
        this.parentID = parentID;
        this.gameId = -1;
        this.p2CanForceStartGame = false;
        this.remTime = -1;
        this.stopTimerRequest = false;
        this.isTimerProgress = false;
        this.dayNumber = -1;
        this.killNext = [];
        this.voteNum = 0;
        this.runoffNum = 0;
        this.lastExecuted = "";
        this.wolfVote = "";
        this.wolfValidTo = [];
        this.wolfValidFrom = [];
        this.wolfLog = [];
        this.timerList = [];
        this.reset();
        this.setRoles2(this.ruleSetting);
        this.phase = exports.Phase.p0_UnStarted;
        for (const idx in srvSetting.system_GM) {
            this.GM[srvSetting.system_GM[idx]] = null;
        }
    }
    // Language loading method
    loadLang(srvLangTxt) {
        this.langTxt = srvLangTxt;
        this.emoText = srvLangTxt.emo;
        this.roleText = srvLangTxt.role;
    }
    // Reset game method
    reset() {
        for (let timer of this.timerList) {
            clearTimeout(timer);
        }
        this.timerList = [];
        this.phase = exports.Phase.p0_UnStarted;
        for (const uid in this.members) {
            this.members[uid].reset();
        }
        this.resetReactedMember();
        this.gameId = Math.floor(Math.random() * 0x40000000);
        this.interactControllers = [];
        this.p2CanForceStartGame = false;
        this.remTime = -1;
        this.stopTimerRequest = false;
        this.isTimerProgress = false;
        this.dayNumber = -1;
        this.killNext = [];
        this.lastExecuted = "";
        this.wolfVote = "";
        this.wolfValidTo = [];
        this.wolfValidFrom = [];
        this.wolfLog = [];
        this.dictatorVoteMode = "";
        for (let key in InteractType) {
            this.interactControllers.push(Object.create(null));
        }
        this.phase = exports.Phase.p0_UnStarted;
    }
    // Destroy game room method
    destroy() {
        this.channels.Living.send(this.langTxt.p7.breakup);
    }
    // Send error message (mainly for debug?)
    err() {
        console.error("An error has occurred.");
        console.trace();
        this.channels.Living.send("An error has occurred...");
    }
    // Send warning message
    sendWarn(ch, title, desc) {
        ch.send({ embeds: [{
                    title: title,
                    description: desc,
                    color: this.langTxt.sys.system_warn_color,
                    author: { name: "Warn!", icon_url: "https://twemoji.maxcdn.com/2/72x72/26a0.png" },
                }] });
    }
    // Send error message
    sendErr(ch, title, desc) {
        ch.send({ embeds: [{
                    title: title,
                    description: desc,
                    color: this.langTxt.sys.system_err_color,
                    author: { name: "Error!", icon_url: "https://twemoji.maxcdn.com/2/72x72/1f6ab.png" },
                }] });
    }
    // Send the member list to the given channel
    sendMemberList(ch) {
        const current_num = Object.keys(this.members).length;
        let text = "";
        Object.keys(this.members).forEach((key, idx) => {
            text += this.members[key].nickname + "\n";
        });
        ch.send({ embeds: [{
                    title: (0, GameUtils_1.format)(this.langTxt.sys.Current_join_member_num, { num: current_num, max: this.reqMemberNum }),
                    description: text,
                    color: this.langTxt.sys.system_color,
                }] });
    }
    // Set roles from the rule setting
    setRoles2(r) {
        let defaultRoles = Object.create(null);
        let possibleFirstVictimRoles = Object.create(null);
        let reqMemberNum = -r.first_victim_count;
        let possible_first_victim_count = 0;
        if (r.roles.Villager) {
            const count = r.roles.Villager.count;
            if (count > 0) {
                defaultRoles["Villager"] = count;
                possibleFirstVictimRoles["Villager"] = r.roles.Villager.first_victim;
                if (r.roles.Villager.first_victim) {
                    possible_first_victim_count += count;
                }
                reqMemberNum += count;
            }
        }
        if (r.roles.Seer) {
            const count = r.roles.Seer.count;
            if (count > 0) {
                defaultRoles["Seer"] = count;
                possibleFirstVictimRoles["Seer"] = r.roles.Seer.first_victim;
                if (r.roles.Seer.first_victim) {
                    possible_first_victim_count += count;
                }
                reqMemberNum += count;
            }
        }
        if (r.roles.Priest) {
            const count = r.roles.Priest.count;
            if (count > 0) {
                defaultRoles["Priest"] = count;
                possibleFirstVictimRoles["Priest"] = r.roles.Priest.first_victim;
                if (r.roles.Priest.first_victim) {
                    possible_first_victim_count += count;
                }
                reqMemberNum += count;
            }
        }
        if (r.roles.Knight) {
            const count = r.roles.Knight.count;
            if (count > 0) {
                defaultRoles["Knight"] = count;
                possibleFirstVictimRoles["Knight"] = r.roles.Knight.first_victim;
                if (r.roles.Knight.first_victim) {
                    possible_first_victim_count += count;
                }
                reqMemberNum += count;
            }
        }
        if (r.roles.Traitor) {
            const count = r.roles.Traitor.count;
            if (count > 0) {
                defaultRoles["Traitor"] = count;
                possibleFirstVictimRoles["Traitor"] = r.roles.Traitor.first_victim;
                if (r.roles.Traitor.first_victim) {
                    possible_first_victim_count += count;
                }
                reqMemberNum += count;
            }
        }
        if (r.roles.Mason) {
            const count = r.roles.Mason.count;
            if (count > 0) {
                defaultRoles["Mason"] = count;
                possibleFirstVictimRoles["Mason"] = r.roles.Mason.first_victim;
                if (r.roles.Mason.first_victim) {
                    possible_first_victim_count += count;
                }
                reqMemberNum += count;
            }
        }
        if (r.roles.Werewolf) {
            const count = r.roles.Werewolf.count;
            if (count > 0) {
                defaultRoles["Werewolf"] = count;
                possibleFirstVictimRoles["Werewolf"] = r.roles.Werewolf.first_victim;
                if (r.roles.Werewolf.first_victim) {
                    possible_first_victim_count += count;
                }
                reqMemberNum += count;
            }
        }
        if (r.roles.Dictator) {
            const count = r.roles.Dictator.count;
            if (count > 0) {
                defaultRoles["Dictator"] = count;
                possibleFirstVictimRoles["Dictator"] = r.roles.Dictator.first_victim;
                if (r.roles.Dictator.first_victim) {
                    possible_first_victim_count += count;
                }
                reqMemberNum += count;
            }
        }
        if (r.roles.Baker) {
            const count = r.roles.Baker.count;
            if (count > 0) {
                defaultRoles["Baker"] = count;
                possibleFirstVictimRoles["Baker"] = r.roles.Baker.first_victim;
                if (r.roles.Baker.first_victim) {
                    possible_first_victim_count += count;
                }
                reqMemberNum += count;
            }
        }
        if (r.roles.Communicatable) {
            const count = r.roles.Communicatable.count;
            if (count > 0) {
                defaultRoles["Communicatable"] = count;
                possibleFirstVictimRoles["Communicatable"] = r.roles.Communicatable.first_victim;
                if (r.roles.Communicatable.first_victim) {
                    possible_first_victim_count += count;
                }
                reqMemberNum += count;
            }
        }
        if (r.roles.Fanatic) {
            const count = r.roles.Fanatic.count;
            if (count > 0) {
                defaultRoles["Fanatic"] = count;
                possibleFirstVictimRoles["Fanatic"] = r.roles.Fanatic.first_victim;
                if (r.roles.Fanatic.first_victim) {
                    possible_first_victim_count += count;
                }
                reqMemberNum += count;
            }
        }
        console.log(this.defaultRoles);
        if (possible_first_victim_count >= r.first_victim_count) {
            this.defaultRoles = defaultRoles;
            this.possibleFirstVictimRoles = possibleFirstVictimRoles;
            this.reqMemberNum = reqMemberNum;
            return true;
        }
        else {
            console.log("Too much first victim");
            this.sendErr(this.channels.Living, "", (0, GameUtils_1.format)(this.langTxt.sys.too_much_first_victim, { req: r.first_victim_count, given: possible_first_victim_count }));
            return false;
        }
    }
    // Add a given role 
    addRole(r, num = 1) {
        console.log("addRole", r, num);
        if (r in this.defaultRoles) {
            this.defaultRoles[r] += num;
        }
        else {
            this.defaultRoles[r] = num;
        }
        this.reqMemberNum += num;
    }
    // Send summary message of the current rule 
    sendRuleSummary(tch) {
        let team = Object.create(null);
        let team_cnt = Object.create(null);
        let all_cnt = 0;
        for (const key in TeamNames) {
            team[key] = "";
            team_cnt[key] = 0;
        }
        for (const r in this.defaultRoles) {
            const t = getDefaultTeams(r);
            const first_victim_txt = "  (" + this.langTxt.rule.first_victim.txt + this.langTxt.rule.first_victim[this.possibleFirstVictimRoles[r] ? "yes" : "no"] + ")" + "\n";
            team[t] += this.emoText[r] + this.roleText[r] + " : " + this.defaultRoles[r] + first_victim_txt;
            team_cnt[t] += this.defaultRoles[r];
            all_cnt += this.defaultRoles[r];
        }
        let rules_txt = "";
        rules_txt += this.langTxt.rule.first_victim_count.txt + ": " + this.ruleSetting.first_victim_count + "\n";
        if (this.defaultRoles[Role.Seer]) {
            rules_txt += this.langTxt.rule.first_sight.txt + ":" + this.langTxt.rule.first_sight[this.ruleSetting.first_sight] + "\n";
        }
        if (this.defaultRoles[Role.Knight]) {
            rules_txt += this.langTxt.rule.continuous_guard.txt + ":" + this.langTxt.rule.continuous_guard[this.ruleSetting.continuous_guard ? "yes" : "no"] + "\n";
        }
        {
            rules_txt += this.langTxt.rule.vote_place.txt + ":" + this.langTxt.rule.vote_place[this.ruleSetting.vote.place] + "\n";
            rules_txt += this.langTxt.rule.vote_num.txt + ": " + String(this.ruleSetting.vote.revote_num + 1) + "\n";
            rules_txt += this.langTxt.rule.vote_even.txt + ":" + this.langTxt.rule.vote_even[this.ruleSetting.vote.when_even] + "\n";
        }
        let timetable_txt = "";
        timetable_txt += this.langTxt.timetable.day_length.txt + ": " + this.getTimeFormatFromSec(this.ruleSetting.day.length) + "\n";
        timetable_txt += this.langTxt.timetable.night_length.txt + ": " + this.getTimeFormatFromSec(this.ruleSetting.night.length) + "\n";
        timetable_txt += this.langTxt.timetable.votetime_length.txt + ": " + this.getTimeFormatFromSec(this.ruleSetting.vote.length) + "\n";
        let fields = [];
        if (team[TeamNames.Good] != "") {
            fields.push({
                name: this.langTxt.team_name.Good + "  " +
                    (0, GameUtils_1.format)(this.langTxt.sys.Current_role_breakdown_sum, { num: team_cnt[TeamNames.Good] }),
                value: team[TeamNames.Good], inline: true
            });
        }
        if (team[TeamNames.Evil] != "") {
            fields.push({
                name: this.langTxt.team_name.Evil + "  " +
                    (0, GameUtils_1.format)(this.langTxt.sys.Current_role_breakdown_sum, { num: team_cnt[TeamNames.Evil] }),
                value: team[TeamNames.Evil], inline: true
            });
        }
        if (team[TeamNames.Other] != "") {
            fields.push({
                name: this.langTxt.team_name.Other + "  " +
                    (0, GameUtils_1.format)(this.langTxt.sys.Current_role_breakdown_sum, { num: team_cnt[TeamNames.Other] }),
                value: team[TeamNames.Other], inline: true
            });
        }
        fields.push({
            name: this.langTxt.rule.title,
            value: rules_txt, inline: false
        });
        fields.push({
            name: this.langTxt.timetable.title,
            value: timetable_txt, inline: false
        });
        const all_cnt_txt = (0, GameUtils_1.format)(this.langTxt.sys.Current_role_breakdown_sum, { num: all_cnt });
        const plyr_cnt_txt = (0, GameUtils_1.format)(this.langTxt.sys.Current_player_sum, { num: all_cnt - this.ruleSetting.first_victim_count });
        tch.send({ embeds: [{
                    title: this.langTxt.sys.Current_role_breakdown,
                    description: all_cnt_txt + plyr_cnt_txt,
                    color: this.langTxt.sys.system_color,
                    fields: fields,
                }] });
    }
    // Set a rule by string 
    changeRule(rulesStr) {
        const delimiters = [':', '='];
        let res = "";
        let changed = false;
        for (let rule of rulesStr.split('\n')) {
            rule = rule.trim();
            let dpos = rule.length;
            for (const d of delimiters) {
                const v = rule.indexOf(d);
                if (v >= 1)
                    dpos = Math.min(dpos, v);
            }
            if (dpos >= rule.length) {
                const v = rule.indexOf(' ');
                if (v >= 1)
                    dpos = v;
            }
            if (dpos >= rule.length) {
                const v = rule.indexOf(' \t');
                if (v >= 1)
                    dpos = v;
            }
            if (dpos >= rule.length)
                continue;
            const attribute = rule.substring(0, dpos).trim();
            const value = rule.substring(dpos + 1, rule.length).trim();
            if (attribute.length == 0 || value.length == 0)
                continue;
            console.log("attribute : ", attribute);
            console.log("value     : ", value);
            const r = (0, GameUtils_1.updateHashValueWithFormat)(attribute, value, JsonType_1.RuleTypeFormat.runtimeType, this.ruleSetting);
            changed = changed || r;
            if (!r) {
                res += "Failed to set the value. attribute : " + attribute + " value : " + value + "\n";
            }
        }
        if (res != "") {
            this.channels.Living.send(res);
        }
        if (changed) {
            this.sendRuleSummary(this.channels.Living);
        }
        console.log(this.ruleSetting);
    }
    // Phase 0 start
    async start_0Unstarted() {
        console.log("Phase 0: Unstarted");
        this.phase = exports.Phase.p0_UnStarted;
        this.sendRuleSummary(this.channels.Living);
    }
    // Phase 1 start
    async start_1Wanted() {
        console.log("Phase 1: Recruitment");
        this.phase = exports.Phase.p1_Wanted;
        this.updateRoomsRW();
        this.sendRuleSummary(this.channels.Living);
        // Create join button
        const join_button = Util.make_button("join", this.langTxt.p1.cmd_join[0], { style: "green", emoji: this.langTxt.role_uni.Werewolf });
        const sent_message = await this.channels.Living.send({
            content: this.langTxt.p0.start_recruiting,
            components: [new Discord.ActionRowBuilder().addComponents(join_button)]
        });
        this.interactControllers[InteractType.Accept][sent_message.id] = sent_message;
        this.updateWantedEmb(null);
    }
    // Update authentications of the rooms
    updateRoomsRW() {
        if (this.guild == null)
            return this.err();
        let permGMonly = [{ id: this.guild.id, allow: NoAccess_alw, deny: NoAccess_dny }];
        let permReadOnly = [{ id: this.guild.id, allow: ReadOnly_alw, deny: NoAccess_dny }];
        // const cu1 = this.clients[0].user;
        if (this.guild.members.me != null) {
            addPerm(this.guild.members.me.id, 4 /* Perm.Admin */, permGMonly);
            addPerm(this.guild.members.me.id, 4 /* Perm.Admin */, permReadOnly);
        }
        this.channels.DebugLog.permissionOverwrites.set(permGMonly);
        this.channels.GameLog.permissionOverwrites.set(permReadOnly); // or permReadOnly
        let permLiving = [];
        let permDead = [];
        let permWerewolf = [];
        let permMason = [];
        let permIndividual = [];
        let permAudience = [];
        switch (this.phase) {
            case exports.Phase.p0_UnStarted:
            case exports.Phase.p1_Wanted:
                // for @everyone
                addPerm(this.guild.id, 3 /* Perm.RW */, permLiving);
                addPerm(this.guild.id, 1 /* Perm.ReadOnly */, permDead);
                addPerm(this.guild.id, 2 /* Perm.ViewOnly */, permWerewolf);
                addPerm(this.guild.id, 2 /* Perm.ViewOnly */, permMason);
                addPerm(this.guild.id, 3 /* Perm.RW */, permAudience);
                break;
            case exports.Phase.p2_Preparation:
                // for @everyone(Guest)
                addPerm(this.guild.id, 0 /* Perm.NoAccess */, permMason);
                addPerm(this.guild.id, 0 /* Perm.NoAccess */, permWerewolf);
                addPerm(this.guild.id, 1 /* Perm.ReadOnly */, permLiving);
                addPerm(this.guild.id, 0 /* Perm.NoAccess */, permDead);
                addPerm(this.guild.id, 3 /* Perm.RW */, permAudience);
                addPerm(this.guild.id, 0 /* Perm.NoAccess */, permIndividual);
                for (const uid in this.members) {
                    addPerm(uid, 0 /* Perm.NoAccess */, permAudience);
                    addPerm(uid, 3 /* Perm.RW */, permLiving);
                    addPerm(uid, 0 /* Perm.NoAccess */, permDead);
                    if (this.members[uid].allowWolfRoom) {
                        addPerm(uid, 1 /* Perm.ReadOnly */, permWerewolf);
                    }
                    else {
                        addPerm(uid, 0 /* Perm.NoAccess */, permWerewolf);
                    }
                    if (this.members[uid].allowMasonRoom) {
                        addPerm(uid, 1 /* Perm.ReadOnly */, permMason);
                    }
                    else {
                        addPerm(uid, 0 /* Perm.NoAccess */, permMason);
                    }
                }
                break;
            case exports.Phase.p3_FirstNight:
                // for @everyone(Guest)
                addPerm(this.guild.id, 0 /* Perm.NoAccess */, permMason);
                addPerm(this.guild.id, 0 /* Perm.NoAccess */, permWerewolf);
                addPerm(this.guild.id, 1 /* Perm.ReadOnly */, permLiving);
                addPerm(this.guild.id, 0 /* Perm.NoAccess */, permDead);
                addPerm(this.guild.id, 3 /* Perm.RW */, permAudience);
                addPerm(this.guild.id, 0 /* Perm.NoAccess */, permIndividual);
                for (const uid in this.members) {
                    addPerm(uid, 0 /* Perm.NoAccess */, permAudience);
                    addPerm(uid, 1 /* Perm.ReadOnly */, permLiving);
                    addPerm(uid, 0 /* Perm.NoAccess */, permDead);
                    if (this.members[uid].allowWolfRoom) {
                        addPerm(uid, 3 /* Perm.RW */, permWerewolf);
                    }
                    else {
                        addPerm(uid, 0 /* Perm.NoAccess */, permWerewolf);
                    }
                    if (this.members[uid].allowMasonRoom) {
                        addPerm(uid, 3 /* Perm.RW */, permMason);
                    }
                    else {
                        addPerm(uid, 0 /* Perm.NoAccess */, permMason);
                    }
                }
                break;
            case exports.Phase.p4_Daytime:
                // for @everyone(Guest)
                addPerm(this.guild.id, 0 /* Perm.NoAccess */, permMason);
                addPerm(this.guild.id, 0 /* Perm.NoAccess */, permWerewolf);
                addPerm(this.guild.id, 1 /* Perm.ReadOnly */, permLiving);
                addPerm(this.guild.id, 0 /* Perm.NoAccess */, permDead);
                addPerm(this.guild.id, 3 /* Perm.RW */, permAudience);
                addPerm(this.guild.id, 0 /* Perm.NoAccess */, permIndividual);
                for (const uid in this.members) {
                    addPerm(uid, 0 /* Perm.NoAccess */, permAudience);
                    if (this.members[uid].isLiving) {
                        addPerm(uid, 3 /* Perm.RW */, permLiving);
                        addPerm(uid, 0 /* Perm.NoAccess */, permDead);
                    }
                    else {
                        addPerm(uid, 1 /* Perm.ReadOnly */, permLiving);
                        addPerm(uid, 3 /* Perm.RW */, permDead);
                        addPerm(uid, 1 /* Perm.ReadOnly */, permIndividual);
                    }
                    if (this.members[uid].allowWolfRoom) {
                        const enableDaytimeWolfRoom = true;
                        if (enableDaytimeWolfRoom && this.members[uid].isLiving) {
                            addPerm(uid, 3 /* Perm.RW */, permWerewolf);
                        }
                        else {
                            addPerm(uid, 1 /* Perm.ReadOnly */, permWerewolf);
                        }
                    }
                    else {
                        addPerm(uid, 0 /* Perm.NoAccess */, permWerewolf);
                    }
                    if (this.members[uid].allowMasonRoom) {
                        const enableDaytimeMasonRoom = true;
                        if (enableDaytimeMasonRoom && this.members[uid].isLiving) {
                            addPerm(uid, 3 /* Perm.RW */, permMason);
                        }
                        else {
                            addPerm(uid, 1 /* Perm.ReadOnly */, permMason);
                        }
                    }
                    else {
                        addPerm(uid, 0 /* Perm.NoAccess */, permMason);
                    }
                }
                break;
            case exports.Phase.p5_Vote:
                // for @everyone(Guest)
                addPerm(this.guild.id, 0 /* Perm.NoAccess */, permMason);
                addPerm(this.guild.id, 0 /* Perm.NoAccess */, permWerewolf);
                addPerm(this.guild.id, 1 /* Perm.ReadOnly */, permLiving);
                addPerm(this.guild.id, 0 /* Perm.NoAccess */, permDead);
                addPerm(this.guild.id, 3 /* Perm.RW */, permAudience);
                addPerm(this.guild.id, 0 /* Perm.NoAccess */, permIndividual);
                for (const uid in this.members) {
                    addPerm(uid, 0 /* Perm.NoAccess */, permAudience);
                    if (this.members[uid].isLiving) {
                        if (this.ruleSetting.vote.talk) {
                            addPerm(uid, 3 /* Perm.RW */, permLiving);
                        }
                        else {
                            addPerm(uid, 1 /* Perm.ReadOnly */, permLiving);
                        }
                        addPerm(uid, 0 /* Perm.NoAccess */, permDead);
                    }
                    else {
                        addPerm(uid, 1 /* Perm.ReadOnly */, permLiving);
                        addPerm(uid, 3 /* Perm.RW */, permDead);
                        addPerm(uid, 1 /* Perm.ReadOnly */, permIndividual);
                    }
                    if (this.members[uid].allowWolfRoom) {
                        if (this.members[uid].isLiving) {
                            addPerm(uid, 1 /* Perm.ReadOnly */, permWerewolf);
                        }
                        else {
                            addPerm(uid, 1 /* Perm.ReadOnly */, permWerewolf);
                        }
                    }
                    else {
                        addPerm(uid, 0 /* Perm.NoAccess */, permWerewolf);
                    }
                    if (this.members[uid].allowMasonRoom) {
                        if (this.members[uid].isLiving) {
                            addPerm(uid, 1 /* Perm.ReadOnly */, permMason);
                        }
                        else {
                            addPerm(uid, 1 /* Perm.ReadOnly */, permMason);
                        }
                    }
                    else {
                        addPerm(uid, 0 /* Perm.NoAccess */, permMason);
                    }
                }
                break;
            case exports.Phase.p6_Night:
                // for @everyone(Guest)
                addPerm(this.guild.id, 0 /* Perm.NoAccess */, permMason);
                addPerm(this.guild.id, 0 /* Perm.NoAccess */, permWerewolf);
                addPerm(this.guild.id, 1 /* Perm.ReadOnly */, permLiving);
                addPerm(this.guild.id, 0 /* Perm.NoAccess */, permDead);
                addPerm(this.guild.id, 3 /* Perm.RW */, permAudience);
                addPerm(this.guild.id, 0 /* Perm.NoAccess */, permIndividual);
                for (const uid in this.members) {
                    addPerm(uid, 0 /* Perm.NoAccess */, permAudience);
                    if (this.members[uid].isLiving) {
                        addPerm(uid, 1 /* Perm.ReadOnly */, permLiving);
                        addPerm(uid, 0 /* Perm.NoAccess */, permDead);
                    }
                    else {
                        addPerm(uid, 1 /* Perm.ReadOnly */, permLiving);
                        addPerm(uid, 3 /* Perm.RW */, permDead);
                        addPerm(uid, 1 /* Perm.ReadOnly */, permIndividual);
                    }
                    if (this.members[uid].allowWolfRoom) {
                        if (this.members[uid].isLiving) {
                            addPerm(uid, 3 /* Perm.RW */, permWerewolf);
                        }
                        else {
                            addPerm(uid, 1 /* Perm.ReadOnly */, permWerewolf);
                        }
                    }
                    else {
                        addPerm(uid, 0 /* Perm.NoAccess */, permWerewolf);
                    }
                    if (this.members[uid].allowMasonRoom) {
                        if (this.members[uid].isLiving) {
                            addPerm(uid, 3 /* Perm.RW */, permMason);
                        }
                        else {
                            addPerm(uid, 1 /* Perm.ReadOnly */, permMason);
                        }
                    }
                    else {
                        addPerm(uid, 0 /* Perm.NoAccess */, permMason);
                    }
                }
                break;
            case exports.Phase.p7_GameEnd:
                // for @everyone(Guest)
                addPerm(this.guild.id, 3 /* Perm.RW */, permMason);
                addPerm(this.guild.id, 3 /* Perm.RW */, permWerewolf);
                addPerm(this.guild.id, 3 /* Perm.RW */, permLiving);
                addPerm(this.guild.id, 3 /* Perm.RW */, permDead);
                addPerm(this.guild.id, 3 /* Perm.RW */, permIndividual);
                addPerm(this.guild.id, 3 /* Perm.RW */, permAudience);
                break;
            default:
                (0, GameUtils_1.assertUnreachable)(this.phase);
        }
        if (this.guild.members.me != null) {
            addPerm(this.guild.members.me.id, 4 /* Perm.Admin */, permLiving);
            addPerm(this.guild.members.me.id, 4 /* Perm.Admin */, permDead);
            addPerm(this.guild.members.me.id, 4 /* Perm.Admin */, permWerewolf);
            addPerm(this.guild.members.me.id, 4 /* Perm.Admin */, permMason);
            addPerm(this.guild.members.me.id, 4 /* Perm.Admin */, permIndividual);
            addPerm(this.guild.members.me.id, 4 /* Perm.Admin */, permAudience);
        }
        this.channels.Living.permissionOverwrites.set(permLiving);
        this.channels.Dead.permissionOverwrites.set(permDead);
        this.channels.Werewolf.permissionOverwrites.set(permWerewolf);
        this.channels.Mason.permissionOverwrites.set(permMason);
        this.channels.Audience.permissionOverwrites.set(permAudience);
        for (const uid in this.members) {
            const _permIndividual = structuredClone(permIndividual);
            addPerm(uid, 3 /* Perm.RW */, _permIndividual);
            const uch = this.members[uid].uchannel;
            if (uch != null) {
                uch.permissionOverwrites.set(_permIndividual);
            }
        }
        // const LiveID = this.channels.LivingVoice.id;
        // const DeadID = this.channels.DeadVoice.id;
        for (const uid in this.members) {
            const m_old = this.members[uid].member;
            if (m_old == null)
                continue;
            m_old.fetch().then(m => {
                // if(m.voice.channel == null) {
                //     m.voice;
                //     return;
                // }
                // let Li = permLivingVoice.findIndex(a => a.id == uid);
                // let Di = permDeadVoice.findIndex(a => a.id == uid);
                // if(Li < 0) Li = permLivingVoice.findIndex(a => a.id == this.guild.id);
                // if(Di < 0) Di = permDeadVoice.findIndex(a => a.id == this.guild.id);
                // if(Li < 0) this.err();
                // if(Di < 0) this.err();
                /*
                if(m.voice.channel.id == LiveID){
                    const allowL = permLivingVoice[Li].allow;
                    if(allowL == RW_alw){
                        m.voice.setMute(false);
                    } else {
                        const allowD = permDeadVoice[Di].allow;
                        if(allowD == null) return;
                        if(allowD == RW_alw){
                            m.voice.setChannel(DeadID);
                            m.voice.setMute(false);
                        } else {
                            m.voice.setMute(true);
                        }
                    }
                } else if(m.voice.channel.id == DeadID){
                    const allowD = permDeadVoice[Di].allow;
                    if(allowD == RW_alw){
                        m.voice.setMute(false);
                    } else  {
                        const allowL = permLivingVoice[Li].allow;
                        if(allowL == null) return;
                        if(allowL == RW_alw){
                            m.voice.setChannel(LiveID);
                            m.voice.setMute(false);
                        } else {
                            m.voice.setMute(true);
                        }
                    }
                } else {
                    m.voice.setMute(false);
                }
                */
            });
        }
        /*
        this.channels.LivingVoice.fetch().then(v => {
            v.members.forEach(m => {
                if(m.id in this.members) return;
                if(cu1 != null && m.id == cu1.id) return;
                const Li = permLivingVoice.findIndex(a => a.id == this.guild.id);
                if(Li < 0) this.err();
                const allowL = permLivingVoice[Li].allow;
                if(allowL == RW_alw){
                    m.voice.setMute(false);
                } else {
                    m.voice.setChannel(LiveID);
                }
            })
        })
        */
        /*
         this.channels.DeadVoice.fetch().then(v => {
             v.members.forEach(m => {
                 if(m.id in this.members) return;
                 if(cu1 != null && m.id == cu1.id) return;
                 const Di = permDeadVoice.findIndex(a => a.id == this.guild.id);
                 if(Di < 0) this.err();
                 const allowD = permDeadVoice[Di].allow;
                 if(allowD == RW_alw){
                     m.voice.setMute(false);
                 } else if(allowD == ReadOnly_alw){
                     m.voice.setMute(false);
                 } else {
                     m.voice.disconnect();
                 }
             })
         })
         */
    }
    // Clear all joined members
    resetReactedMember() {
        this.reactedMember = Object.create(null);
    }
    // Send sight result from Seers or Priests
    sendFP_Result(uid, uch, tid, LangFP, icon) {
        if (tid == null || tid == "") {
            uch.send(LangFP.no_result);
        }
        else {
            const tRole = this.members[tid].role;
            if (tRole == null)
                return this.err();
            const team = SightResult(tRole);
            let sameTeamRole = "";
            Object.keys(this.defaultRoles).forEach(r => {
                const role = r;
                if (SightResult(role) == team) {
                    sameTeamRole += this.emoText[role] + this.roleText[role] + "\n";
                }
            });
            this.members[uid].actionLog.push([tid, team]);
            let actionLog = "";
            this.members[uid].actionLog.forEach(p => {
                const icon = ((p[1] == TeamNames.Evil) ? this.langTxt.emo.Werewolf : this.langTxt.emo.Villager);
                actionLog += icon + " " + this.members[p[0]].nickname + "\n";
            });
            const aname = (0, GameUtils_1.format)(LangFP.result_title, { user: this.members[tid].nickname });
            if (team == TeamNames.Evil) {
                uch.send({ embeds: [{
                            author: { name: aname, icon_url: icon },
                            color: this.langTxt.team_color[team],
                            thumbnail: { url: this.members[tid].user.displayAvatarURL() },
                            title: (0, GameUtils_1.format)(LangFP.is_wolf, { user: this.members[tid].nickname, emo: this.langTxt.emo.Werewolf }),
                            fields: [{ name: LangFP.same_team_role, value: sameTeamRole, inline: true },
                                { name: LangFP.log, value: actionLog, inline: true }]
                        }] });
            }
            else {
                uch.send({ embeds: [{
                            author: { name: aname, icon_url: icon },
                            color: this.langTxt.team_color[team],
                            thumbnail: { url: this.members[tid].user.displayAvatarURL() },
                            title: (0, GameUtils_1.format)(LangFP.no_wolf, { user: this.members[tid].nickname, emo: this.langTxt.emo.Villager }),
                            fields: [{ name: LangFP.same_team_role, value: sameTeamRole, inline: true },
                                { name: LangFP.log, value: actionLog, inline: true }]
                        }] });
            }
        }
    }
    // Get mm:ss format from sec
    getTimeFormatFromSec(t) {
        const m = Math.floor(t / 60);
        const s = Math.floor(t - m * 60);
        if (m == 0) {
            return (0, GameUtils_1.format)(this.langTxt.sys.time_formatS, { sec: s });
        }
        if (s == 0) {
            return (0, GameUtils_1.format)(this.langTxt.sys.time_formatM, { min: m });
        }
        return (0, GameUtils_1.format)(this.langTxt.sys.time_formatMS, { sec: s, min: m });
    }
    // Remove a player from the game and check gameEnd condition
    async kickMember(uid, reason) {
        // Kill a player
        this.members[uid].isLiving = false;
        this.members[uid].livingDays = this.dayNumber;
        this.channels.Dead.send({ embeds: [{
                    title: (0, GameUtils_1.format)(this.langTxt.sys.welcome_dead, { user: this.members[uid].nickname }),
                    color: this.langTxt.sys.system_color,
                }] });
        // Check gameEnd condition
        let humanNum = 0;
        let wolfNum = 0;
        this.members[uid].deadReason = reason;
        for (let id in this.members) {
            if (!this.members[id].isLiving)
                continue;
            const r = this.members[id].role;
            if (r == null)
                return this.err();
            if (r == Role.Werewolf) {
                wolfNum += 1;
            }
            else {
                humanNum += 1;
            }
        }
        if (humanNum <= wolfNum) {
            this.gameEnd(TeamNames.Evil);
            return;
        }
        if (wolfNum == 0) {
            this.gameEnd(TeamNames.Good);
            return;
        }
        this.updateRoomsRW();
        if (reason == KickReason.Vote) {
            await this.startP6_Night();
        }
    }
    // Broadcast a message to all living user channels
    broadcastLivingUserChannel(mess) {
        for (const uid in this.members) {
            if (!this.members[uid].isLiving)
                continue;
            const uch = this.members[uid].uchannel;
            if (uch == null)
                continue;
            if (typeof mess === "string") {
                uch.send(mess);
            }
            else {
                uch.send({ embeds: [mess] });
            }
        }
    }
    // Stop the game timer
    stopTimer(ch) {
        if (this.isTimerProgress) {
            this.stopTimerRequest = true;
            this.channels.Living.send({ embeds: [{
                        title: (0, GameUtils_1.format)(this.langTxt.sys.stop_timer, { time: this.getTimeFormatFromSec(this.remTime), cmd: this.langTxt.sys.cmd_resume_timer[0] }),
                        color: this.langTxt.sys.system_color,
                    }] });
        }
        else {
            ch.send(this.langTxt.sys.no_timer);
        }
    }
    // Resume the game timer 
    resumeTimer(ch) {
        if (this.isTimerProgress) {
            this.stopTimerRequest = false;
            this.channels.Living.send({ embeds: [{
                        title: (0, GameUtils_1.format)(this.langTxt.sys.restart_timer, { time: this.getTimeFormatFromSec(this.remTime) }),
                        color: this.langTxt.sys.system_color,
                    }] });
        }
        else {
            ch.send(this.langTxt.sys.no_timer);
        }
    }
    // Update player recruitment status
    updateWantedEmb(mes) {
        let message;
        if (mes != null) {
            message = mes;
        }
        else {
            let keys = Object.keys(this.interactControllers[InteractType.Accept]);
            if (keys.length == 0)
                return;
            if (keys.length >= 2) {
                this.err();
                return;
            }
            message = this.interactControllers[InteractType.Accept][keys[0]];
        }
        const current_num = Object.keys(this.members).length;
        let text = "";
        Object.keys(this.members).forEach((key, idx) => {
            text += this.members[key].nickname + "\n";
        });
        message.edit({ embeds: [{
                    title: (0, GameUtils_1.format)(this.langTxt.sys.Current_join_member_num, { num: current_num, max: this.reqMemberNum }),
                    description: text,
                    color: this.langTxt.sys.system_color,
                }] });
    }
    // Intraction for pressing join button
    async joinMemberInteract(interaction, mes) {
        let send_text = "";
        let ng = false;
        if (interaction.member == null)
            return;
        if (typeof interaction.member.permissions === "string") {
            console.error("interaction.member.permissions type err", interaction.member.permissions);
            return;
        }
        if (interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) {
            this.sendErr(this.channels.Living, "", (0, GameUtils_1.format)(this.langTxt.p1.err_join_admin, { user_m: getUserMentionStr(interaction.user), cmd: this.langTxt.p1.cmd_join_force[0] }));
            ng = true;
        }
        if (!ng) {
            const member = await this.guild.members.fetch(interaction.user.id);
            if (interaction.user.id in this.members) {
                send_text += (0, GameUtils_1.format)(this.langTxt.p1.already_in, { user: getNicknameFromMem(member), leave: this.langTxt.p1.cmd_leave[0] });
            }
            else {
                this.members[interaction.user.id] = new GameMember(member);
                send_text += (0, GameUtils_1.format)(this.langTxt.p1.welcome, { user: getNicknameFromMem(member) });
            }
            interaction.reply({
                content: send_text,
                ephemeral: true
            });
            this.updateWantedEmb(mes);
        }
        else {
            interaction.update({}); // do nothing
        }
        const current_num = Object.keys(this.members).length;
        if (current_num == this.reqMemberNum) {
            let send_text2 = (0, GameUtils_1.format)(this.langTxt.p1.member_full, { cmd: this.langTxt.p1.cmd_start[0] });
            this.channels.Living.send(send_text2);
        }
    }
    // Add a entry player to GameState.members and send a notification
    addEntrant(message, force = false) {
        let send_text = "";
        let ng = false;
        if (message.member == null)
            return;
        if (message.member != null && message.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) {
            if (force) {
                this.sendWarn(this.channels.Living, "", (0, GameUtils_1.format)(this.langTxt.p1.warn_join_admin, { user_m: getUserMentionStr(message.author) }));
            }
            else {
                this.sendErr(this.channels.Living, "", (0, GameUtils_1.format)(this.langTxt.p1.err_join_admin, { user_m: getUserMentionStr(message.author), cmd: this.langTxt.p1.cmd_join_force[0] }));
                ng = true;
            }
        }
        if (!ng) {
            if (message.author.id in this.members) {
                send_text += (0, GameUtils_1.format)(this.langTxt.p1.already_in, { user: getNicknameFromMes(message), leave: this.langTxt.p1.cmd_leave[0] });
            }
            else {
                this.members[message.author.id] = new GameMember(message.member);
                send_text += (0, GameUtils_1.format)(this.langTxt.p1.welcome, { user: getNicknameFromMes(message) });
            }
        }
        const current_num = Object.keys(this.members).length;
        send_text += "\n" + (0, GameUtils_1.format)(this.langTxt.p1.current_count, { num: current_num, all: this.reqMemberNum });
        if (current_num == this.reqMemberNum) {
            send_text += "\n" + (0, GameUtils_1.format)(this.langTxt.p1.member_full, { cmd: this.langTxt.p1.cmd_start[0] });
        }
        this.channels.Living.send(send_text);
        this.updateWantedEmb(null);
    }
    // Accept declines from a entrant, remove him/her from GameState.members, and send a notification
    acceptDecline(message) {
        let send_text = "";
        if (message.author.id in this.members) {
            delete this.members[message.author.id];
            send_text += (0, GameUtils_1.format)(this.langTxt.p1.see_you, { user: getNicknameFromMes(message) });
        }
        else {
            send_text += (0, GameUtils_1.format)(this.langTxt.p1.no_join, { user: getNicknameFromMes(message), member_list: this.langTxt.sys.cmd_member_list[0] });
        }
        const current_num = Object.keys(this.members).length;
        send_text += "\n" + (0, GameUtils_1.format)(this.langTxt.p1.current_count, { num: current_num, all: this.reqMemberNum });
        if (current_num == this.reqMemberNum) {
            send_text += "\n" + (0, GameUtils_1.format)(this.langTxt.p1.member_full, { cmd: this.langTxt.p1.cmd_start[0] });
        }
        this.channels.Living.send(send_text);
        this.updateWantedEmb(null);
    }
    // Remove a entry player from GameState.members and send a notification
    removeEntrant(message) {
        let send_text = "";
        if (message.mentions.members == null)
            return;
        for (const mem of message.mentions.members) {
            const uid = mem[0];
            if (uid in this.members) {
                delete this.members[uid];
                send_text += (0, GameUtils_1.format)(this.langTxt.p1.see_you, { user: getNicknameFromMem(mem[1]) });
            }
            else {
                send_text += (0, GameUtils_1.format)(this.langTxt.p1.no_join, { user: getNicknameFromMem(mem[1]), member_list: this.langTxt.sys.cmd_member_list[0] });
            }
            send_text += "\n";
        }
        const current_num = Object.keys(this.members).length;
        send_text += "\n" + (0, GameUtils_1.format)(this.langTxt.p1.current_count, { num: current_num, all: this.reqMemberNum });
        if (current_num == this.reqMemberNum) {
            send_text += "\n" + (0, GameUtils_1.format)(this.langTxt.p1.member_full, { cmd: this.langTxt.p1.cmd_start[0] });
        }
        this.channels.Living.send(send_text);
        this.updateWantedEmb(null);
    }
    // Check player count requirement and prepare the game if met || return recruitment status if not met 
    async tryPreparingGame(message) {
        const current_num = Object.keys(this.members).length;
        if (current_num < this.reqMemberNum) {
            this.channels.Living.send((0, GameUtils_1.format)(this.langTxt.p1.member_not_enough, { num: current_num, rem: this.reqMemberNum - current_num }));
            return;
        }
        if (current_num > this.reqMemberNum) {
            this.channels.Living.send((0, GameUtils_1.format)(this.langTxt.p1.member_over, { num: current_num, over: current_num - this.reqMemberNum }));
            return;
        }
        await this.gamePreparation(message);
    }
    // Reset the game and start recruiting players again
    async nextGame() {
        this.reset();
        await this.start_1Wanted();
        this.sendMemberList(this.channels.Living);
        const current_num = Object.keys(this.members).length;
        let send_text = (0, GameUtils_1.format)(this.langTxt.p1.current_count, { num: current_num, all: this.reqMemberNum });
        if (current_num == this.reqMemberNum) {
            send_text += "\n" + (0, GameUtils_1.format)(this.langTxt.p1.member_full, { cmd: this.langTxt.p1.cmd_start[0] });
        }
        this.channels.Living.send(send_text);
        for (const mid in this.members) {
            this.members[mid].isLiving = true;
        }
    }
    // Phase.p2_Preparation
    async gamePreparation(message) {
        this.phase = exports.Phase.p2_Preparation;
        this.dayNumber = 0;
        this.interactControllers[InteractType.Accept] = Object.create(null);
        this.channels.Living.send(this.langTxt.p2.start_preparations);
        this.sendRuleSummary(this.channels.Living);
        this.sendMemberList(this.channels.Living);
        this.sendRuleSummary(this.channels.GameLog);
        this.sendMemberList(this.channels.GameLog);
        this.sendMemberList(this.channels.Dead);
        await this.searchUserChannel(message);
        this.updateRoomsRW();
        if (this.ruleSetting.wish_role_time <= 0) {
            console.log("this.ruleSetting.wish_role_time <= 0");
            await this.gamePreparation2();
        }
        else {
            console.log("this.ruleSetting.wish_role_time > 0");
            // Initialize interactControllers of wishRole
            this.interactControllers[InteractType.WishRole] = Object.create(null);
            // Send a message about wishRole at living ch
            this.channels.Living.send({ embeds: [{
                        title: (0, GameUtils_1.format)(this.langTxt.p2.wish_role_preparations, { sec: this.ruleSetting.wish_role_time }),
                        description: this.langTxt.p2.wish_role_desc2 + "\n" + (0, GameUtils_1.format)(this.langTxt.p2.wish_role_desc3, { n: this.ruleSetting.wish_role_rand_weight }),
                        color: this.langTxt.sys.system_color,
                    }] });
            // Create wishRoleButton
            let rolesTxt = "";
            for (const r in this.defaultRoles) {
                if (this.defaultRoles[r] <= 0)
                    continue;
                rolesTxt += this.langTxt.role_uni[r] + " " + this.langTxt.role[r] + "\n";
            }
            const embed = new Discord.EmbedBuilder({
                title: (0, GameUtils_1.format)(this.langTxt.p2.wish_role_desc1, { sec: this.ruleSetting.wish_role_time }),
                description: this.langTxt.p2.wish_role_desc2 + "\n\n" + rolesTxt,
                color: this.langTxt.sys.system_color,
            });
            for (const uid in this.members) {
                this.members[uid].wishRole = Object.create(null);
                for (const r in this.defaultRoles) {
                    if (this.defaultRoles[r] <= 0)
                        continue;
                    this.members[uid].wishRole[r] = Math.ceil(WISHROLENUM / 2);
                }
                const uch = this.members[uid].uchannel;
                if (uch == null)
                    continue;
                const buttons_arr = [];
                for (const r in this.defaultRoles) {
                    buttons_arr.push(this.makeWishRoleButtons(uid, r));
                }
                const components_arr = Util.arrange_components(buttons_arr);
                for (let i = 0; i < components_arr.length; ++i) {
                    let sent_message;
                    if (i == 0) {
                        sent_message = await uch.send({ embeds: [embed], components: components_arr[i] });
                    }
                    else {
                        sent_message = await uch.send({ components: components_arr[i] });
                    }
                    this.interactControllers[InteractType.WishRole][sent_message.id] = sent_message;
                }
            }
            this.remTime = this.ruleSetting.wish_role_time;
            console.log(`remTime: ${this.remTime}`);
            console.log(`this: ${this}`);
            console.log(`phase: ${this.phase}`);
            gameTimer(this.gameId, this, exports.Phase.p2_Preparation, [], dummy_gamePreparation2);
        }
    }
    // Create role wish buttons
    makeWishRoleButtons(uid, r) {
        const col = new Discord.ActionRowBuilder();
        const runi = this.langTxt.role_uni[r];
        const now = this.members[uid].wishRole[r];
        for (let i = 1; i <= WISHROLENUM; ++i) {
            if (i == now) {
                col.addComponents(Util.make_button(i + "_" + r, this.langTxt.role[r] + runi, { style: "green", emoji: this.langTxt.react.num[i] }));
            }
            else {
                col.addComponents(Util.make_button(i + "_" + r, runi, { style: "black", emoji: this.langTxt.react.num[i] }));
            }
        }
        return col;
    }
    // Update value of the role wish button
    wishRoleCheck(interaction) {
        const value = parseInt(interaction.customId[0]);
        if (value < 1 || value > WISHROLENUM)
            return;
        const roleStr = interaction.customId.substring(2);
        const roleName = Object.keys(this.defaultRoles).find(role => role == roleStr);
        if (roleName == null)
            return;
        this.members[interaction.user.id].wishRole[roleName] = value;
        if (interaction.message.type != Discord.MessageType.Default)
            return;
        const components = interaction.message.components;
        const new_components = [];
        const new_buttons = this.makeWishRoleButtons(interaction.user.id, roleName);
        for (let i = 0; i < components.length; ++i) {
            if (components[i].components[0].customId === "1_" + roleStr) {
                new_components[i] = new_buttons;
            }
            else {
                new_components[i] = components[i];
            }
        }
        interaction.update({ components: new_components });
    }
    // http://www.prefield.com/algorithm/math/hungarian.html
    hungarian(mat) {
        const n = mat.length;
        const inf = 1e9;
        let fx = new Array(n).fill(inf);
        let fy = new Array(n).fill(0);
        let x = new Array(n).fill(-1);
        let y = new Array(n).fill(-1);
        for (let i = 0; i < n; ++i) {
            for (let j = 0; j < n; ++j) {
                fx[i] = Math.max(fx[i], mat[i][j]);
            }
        }
        for (let i = 0; i < n;) {
            let t = new Array(n).fill(-1);
            let s = new Array(n + 1).fill(i);
            let q = 0;
            for (let p = 0; p <= q && x[i] < 0; ++p) {
                for (let k = s[p], j = 0; j < n && x[i] < 0; ++j) {
                    if (fx[k] + fy[j] != mat[k][j] || t[j] >= 0)
                        continue;
                    s[++q] = y[j];
                    t[j] = k;
                    if (s[q] >= 0)
                        continue;
                    for (p = j; p >= 0; j = p) {
                        y[j] = k = t[j];
                        p = x[k];
                        x[k] = j;
                    }
                }
            }
            if (x[i] < 0) {
                let d = inf;
                for (let k = 0; k <= q; ++k) {
                    for (let j = 0; j < n; ++j) {
                        if (t[j] >= 0)
                            continue;
                        d = Math.min(d, fx[s[k]] + fy[j] - mat[s[k]][j]);
                    }
                }
                for (let j = 0; j < n; ++j) {
                    fy[j] += (t[j] < 0 ? 0 : d);
                }
                for (let k = 0; k <= q; ++k) {
                    fx[s[k]] -= d;
                }
            }
            else {
                ++i;
            }
        }
        return x;
    }
    // Remove first victims, assign roles, prepare common rooms, send messages, start the first night
    async gamePreparation2() {
        console.log("gamePreparation2");
        const enable_confirmation = (this.ruleSetting.wish_role_time <= 0);
        console.log(`enable_confirmation: ${enable_confirmation}`);
        // Remove first victims
        let possible_victims_as_roles = [];
        for (const r in this.defaultRoles) {
            if (this.possibleFirstVictimRoles[r]) {
                for (let i = 0; i < this.defaultRoles[r]; ++i) {
                    possible_victims_as_roles.push(r);
                }
            }
            else {
                this.playingRoles[r] = this.defaultRoles[r];
            }
        }
        possible_victims_as_roles = (0, GameUtils_1.shuffle)(possible_victims_as_roles);
        // const first_victims_as_roles = possible_victims_as_roles.slice(0, this.ruleSetting.first_victim_count);
        const survivors_as_roles = possible_victims_as_roles.slice(this.ruleSetting.first_victim_count);
        for (const r of survivors_as_roles) {
            if (r in this.playingRoles) {
                this.playingRoles[r] += 1;
            }
            else {
                this.playingRoles[r] = 1;
            }
        }
        console.log("this.playingRoles:");
        console.log(this.playingRoles);
        // Assign roles
        let role_arr = [];
        if (this.ruleSetting.wish_role_time <= 0) {
            console.log("this.ruleSetting.wish_role_time <= 0");
            for (const r in this.playingRoles) {
                for (let i = 0; i < this.playingRoles[r]; ++i) {
                    role_arr.push(r);
                }
            }
            role_arr = (0, GameUtils_1.shuffle)(role_arr);
        }
        else {
            console.log("this.ruleSetting.wish_role_time > 0");
            let roles = [];
            for (const r in this.playingRoles) {
                for (let i = 0; i < this.playingRoles[r]; ++i) {
                    roles.push(r);
                }
            }
            console.log("roles before shuffle:");
            console.log(roles);
            roles = (0, GameUtils_1.shuffle)(roles);
            console.log("roles after shuffle:");
            console.log(roles);
            this.interactControllers[InteractType.WishRole] = Object.create(null);
            const members = (0, GameUtils_1.shuffle)(Object.keys(this.members));
            console.log("members:");
            console.log(members);
            const scale = 100000;
            let mat = new Array(members.length);
            for (let i = 0; i < members.length; ++i) {
                mat[i] = [];
                const uid = members[i];
                for (let j = 0; j < roles.length; ++j) {
                    const r = roles[j];
                    const score = Math.floor(Math.random() * this.ruleSetting.wish_role_rand_weight * scale)
                        + scale * this.members[uid].wishRole[r];
                    mat[i].push(score);
                }
            }
            const res = this.hungarian(mat);
            Object.keys(this.members).forEach((uid, idx) => {
                for (let i = 0; i < members.length; ++i) {
                    if (uid == members[i]) {
                        role_arr[idx] = roles[res[i]];
                    }
                }
            });
        }
        // Prepare werewolf room
        let WerewolfRoomField = { name: this.langTxt.p2.mate_names_title, value: "", inline: true };
        let WerewolfNames = "";
        // Prepare mason room
        let MasonRoomField = { name: this.langTxt.p2.mate_names_title, value: "", inline: true };
        let MasonNames = "";
        // Assign players to werewolf or mason rooms
        Object.keys(this.members).forEach((uid, i) => {
            const r = role_arr[i];
            this.members[uid].role = r;
            const allowWolfRoom = (r == Role.Werewolf || r == Role.Communicatable);
            const allowMasonRoom = (r == Role.Mason);
            this.members[uid].alpStr = this.langTxt.react.alp[i];
            this.members[uid].allowWolfRoom = allowWolfRoom;
            this.members[uid].allowMasonRoom = allowMasonRoom;
            if (allowWolfRoom) {
                WerewolfRoomField.value += this.members[uid].nickname + " (" + this.langTxt.role[r] + ")\n";
                WerewolfNames += this.members[uid].nickname + " ";
            }
            if (allowMasonRoom) {
                MasonRoomField.value += this.members[uid].nickname + "\n";
                MasonNames += this.members[uid].nickname + " ";
            }
        });
        // Check gameEnd condition
        let humanNum = 0;
        let wolfNum = 0;
        for (let id in this.members) {
            if (!this.members[id].isLiving)
                continue;
            const r = this.members[id].role;
            if (r == null)
                return this.err();
            if (r == Role.Werewolf) {
                wolfNum += 1;
            }
            else {
                humanNum += 1;
            }
        }
        if (humanNum <= wolfNum) {
            this.gameEnd(TeamNames.Evil);
            return;
        }
        if (wolfNum == 0) {
            this.gameEnd(TeamNames.Good);
            return;
        }
        this.resetReactedMember();
        this.p2CanForceStartGame = false;
        const werewolf_role_str = Role.Werewolf;
        const werewolf_team = getDefaultTeams(werewolf_role_str);
        const werewolf_embed = new Discord.EmbedBuilder({
            title: (0, GameUtils_1.format)(this.langTxt.werewolf.start_room_title, { names: WerewolfNames }),
            description: this.langTxt.role_descs[werewolf_role_str],
            color: this.langTxt.team_color[werewolf_team],
            thumbnail: { url: this.langTxt.role_img[werewolf_role_str] },
            fields: [WerewolfRoomField],
        });
        { // for Werewolf
            this.channels.Werewolf.send({ embeds: [werewolf_embed] });
        }
        const mason_role_str = Role.Mason;
        const mason_team = getDefaultTeams(werewolf_role_str);
        const mason_embed = new Discord.EmbedBuilder({
            title: (0, GameUtils_1.format)(this.langTxt.mason.start_room_title, { names: MasonNames }),
            description: this.langTxt.role_descs[mason_role_str],
            color: this.langTxt.team_color[mason_team],
            thumbnail: { url: this.langTxt.role_img[mason_role_str] },
            fields: [MasonRoomField],
        });
        { // for Mason
            this.channels.Mason.send({ embeds: [mason_embed] });
        }
        Object.keys(this.members).forEach(async (uid) => {
            if (!(uid in this.members))
                return this.err();
            const uch = this.members[uid].uchannel;
            if (uch == null)
                return this.err();
            const role_str = this.members[uid].role;
            if (role_str == null)
                return this.err();
            const team = getDefaultTeams(role_str);
            let fields = [];
            if (this.members[uid].allowWolfRoom) {
                fields.push(WerewolfRoomField);
            }
            if (this.members[uid].role == Role.Mason) {
                fields.push(MasonRoomField);
            }
            const embed = new Discord.EmbedBuilder({
                title: (0, GameUtils_1.format)(this.langTxt.p2.announce_role, { role: this.langTxt.role[role_str], team: this.langTxt.team_name[team] }),
                description: this.langTxt.role_descs[role_str],
                color: this.langTxt.team_color[team],
                thumbnail: { url: this.langTxt.role_img[role_str] },
                fields: fields,
                author: { name: this.members[uid].nickname, iconURL: this.members[uid].user.displayAvatarURL() },
            });
            uch.send({ embeds: [embed] });
            if (this.members[uid].role == Role.Fanatic) {
                uch.send({ embeds: [werewolf_embed] });
            }
            if (enable_confirmation) {
                const sent_message = await uch.send({
                    content: getUserMentionStr(this.members[uid].user) + " " + this.langTxt.p2.announce_next,
                    components: [new Discord.ActionRowBuilder().addComponents(Util.make_button("accept", this.langTxt.react.o, { style: "black" }))]
                });
                this.interactControllers[InteractType.Accept][sent_message.id] = sent_message;
            }
        });
        if (enable_confirmation) {
            this.channels.Living.send({ embeds: [{
                        title: (0, GameUtils_1.format)(this.langTxt.p2.done_preparations, { sec: this.ruleSetting.confirmation_sec }),
                        color: this.langTxt.sys.system_color,
                    }] });
            this.timerList.push(setTimeout(this.checkAcceptTimeout, this.ruleSetting.confirmation_sec * 1000, this.gameId, this));
        }
        else {
            this.startFirstNight();
        }
    }
    // Get user channel name
    getUserChannelName(uname) {
        return (0, GameUtils_1.format)(this.langTxt.sys.user_room_name, { user: uname })
            .toLowerCase()
            .replace(/[\s\(\)\{\}\\\/\[\]\*\+\.\?\^\$\|!"#%&'=~`<>@[;:,]/g, '');
    }
    // Search user channel, if not found, create user channel
    async searchUserChannel(message) {
        if (message.guild == null)
            return this.err();
        const keys = Object.keys(this.members);
        await Promise.all(keys.map(async (uid) => {
            if (message.guild == null)
                return this.err();
            if (!(uid in this.members))
                return;
            const user = this.members[uid].user;
            const ch_name = this.getUserChannelName(this.members[uid].nickname);
            let perm = [];
            perm.push({ id: message.guild.id, allow: NoAccess_alw, deny: NoAccess_dny });
            message.guild.members.cache.forEach(m => {
                if (this.clients[0].user != null && m.id === this.clients[0].user.id) {
                    perm.push({ id: m.id, allow: Admin_alw, deny: Admin_dny });
                }
                else if (m.id === uid) {
                    perm.push({ id: m.id, allow: RW_alw, deny: RW_dny });
                }
            });
            const guild = message.guild;
            let user_ch = guild.channels.cache.find(c => {
                return c.name == ch_name && c.type === Discord.ChannelType.GuildText && c.parentId == this.parentID;
            });
            if (user_ch != null) {
                console.log("Found ", user.username, " channnel", user_ch.id);
                user_ch.permissionOverwrites.set(perm);
            }
            else {
                user_ch = await message.guild.channels.create({
                    name: ch_name,
                    parent: this.parentID,
                    type: Discord.ChannelType.GuildText,
                    position: 1,
                    permissionOverwrites: perm
                });
                console.log("New ", user.username, " channnel", user_ch.id);
            }
            if (user_ch == null)
                return this.err();
            this.members[uid].uchannel = user_ch;
        }));
        return true;
    }
    // 
    preparationAccept(uid, interaction) {
        console.log("[EMIT] preparationAccept");
        if (Object.keys(this.members).find(k => k == uid) == null)
            return;
        if (Object.keys(this.reactedMember).find(u => u == uid) != null) {
            if (interaction != null) {
                interaction.reply(this.langTxt.p2.already_ac);
            }
            else {
                const uch = this.members[uid].uchannel;
                if (uch)
                    uch.send(this.langTxt.p2.already_ac);
            }
            return;
        }
        if (interaction != null) {
            interaction.reply((0, GameUtils_1.format)(this.langTxt.p2.new_accept, { user: this.members[uid].nickname }));
        }
        else {
            const uch = this.members[uid].uchannel;
            if (uch)
                uch.send((0, GameUtils_1.format)(this.langTxt.p2.new_accept, { user: this.members[uid].nickname }));
        }
        this.reactedMember[uid] = 1;
        if (Object.keys(this.reactedMember).length == Object.keys(this.members).length) {
            this.channels.Living.send(this.langTxt.p2.all_accept);
            this.startFirstNight();
        }
    }
    checkAcceptTimeout(gid, obj) {
        if (gid != obj.gameId)
            return;
        if (obj.phase != exports.Phase.p2_Preparation)
            return;
        let non_ac_users = "";
        Object.keys(obj.members).forEach(uid => {
            if (Object.keys(obj.reactedMember).find(u => u == uid) == null) {
                non_ac_users += getUserMentionStrFromId(uid) + " ";
            }
        });
        obj.channels.Living.send((0, GameUtils_1.format)(obj.langTxt.p2.incomplete_ac, { users: non_ac_users, cmd: obj.langTxt.p2.cmd_start_force[0] }));
        obj.p2CanForceStartGame = true;
    }
    forceStartGame() {
        if (this.p2CanForceStartGame) {
            this.p2CanForceStartGame = false;
            this.channels.Living.send(this.langTxt.p2.force_start);
            this.startFirstNight();
        }
        else {
            this.channels.Living.send((0, GameUtils_1.format)(this.langTxt.p2.cant_force_start, { sec: this.ruleSetting.confirmation_sec }));
        }
    }
    // Phase.p3_FirstNight
    startFirstNight() {
        this.phase = exports.Phase.p3_FirstNight;
        this.remTime = this.ruleSetting.first_night.first_night_time;
        this.updateRoomsRW();
        this.interactControllers[InteractType.Accept] = Object.create(null);
        for (let my_id in this.members) {
            const uch = this.members[my_id].uchannel;
            if (uch == null)
                return this.err();
            if (this.members[my_id].role == Role.Seer) {
                if (this.ruleSetting.first_sight === 'no_sight') {
                    uch.send(getUserMentionStrFromId(my_id) + this.langTxt.p3.no_sight);
                }
                else if (this.ruleSetting.first_sight === 'random') {
                    let ulist = Object.keys(this.members).filter(tid => {
                        return tid != my_id;
                    });
                    uch.send(getUserMentionStrFromId(my_id) + this.langTxt.p3.random_sight);
                    if (ulist.length == 0) {
                        this.sendFP_Result(my_id, uch, null, this.langTxt.seer, this.langTxt.role_img.Seer);
                    }
                    else {
                        this.sendFP_Result(my_id, uch, ulist[Math.floor(Math.random() * ulist.length)], this.langTxt.seer, this.langTxt.role_img.Seer);
                    }
                }
                else if (this.ruleSetting.first_sight === 'random_white') {
                    let ulist = Object.keys(this.members).filter(tid => {
                        if (tid == my_id)
                            return false;
                        const tRole = this.members[tid].role;
                        if (tRole == null)
                            return this.err();
                        return SightResult(tRole) != TeamNames.Evil;
                    });
                    uch.send(getUserMentionStrFromId(my_id) + this.langTxt.p3.random_white_sight);
                    if (ulist.length == 0) {
                        this.sendFP_Result(my_id, uch, null, this.langTxt.seer, this.langTxt.role_img.Seer);
                    }
                    else {
                        this.sendFP_Result(my_id, uch, ulist[Math.floor(Math.random() * ulist.length)], this.langTxt.seer, this.langTxt.role_img.Seer);
                    }
                }
                else {
                    (0, GameUtils_1.assertUnreachable)(this.ruleSetting.first_sight);
                }
            }
        }
        this.killNext = [];
        for (let step = 0; step < this.ruleSetting.first_victim_count; step++) {
            this.killNext.push(["0", 0]);
        }
        this.channels.Living.send({ embeds: [{
                    title: (0, GameUtils_1.format)(this.langTxt.p3.length_of_the_first_night, { time: this.getTimeFormatFromSec(this.remTime) }),
                    color: this.langTxt.sys.system_color,
                }] });
        // this.httpGameState.updatePhase(this.langTxt.p3.phase_name);
        this.stopTimerRequest = false;
        gameTimer(this.gameId, this, exports.Phase.p3_FirstNight, this.ruleSetting.first_night.alert_times, dummy_startP4Daytime);
    }
    // Phase.p4_Daytime
    async startP4_Daytime() {
        this.phase = exports.Phase.p4_Daytime;
        this.dayNumber += 1;
        this.updateRoomsRW();
        let living = "";
        let living_num = 0;
        for (const uid in this.members) {
            this.members[uid].validVoteID = [];
            if (this.members[uid].isLiving) {
                living += this.members[uid].nickname + "\n";
                living_num += 1;
            }
        }
        if (this.killNext.length == 1) {
            const p = this.killNext[0];
            const uid = p[0];
            const uname = this.members[uid] ? this.members[uid].nickname : this.langTxt.p4.anonymous_name;
            const thumb = this.members[uid] ? this.members[uid].user.displayAvatarURL() : "";
            const embed = new Discord.EmbedBuilder({
                author: { name: (0, GameUtils_1.format)(this.langTxt.p4.day_number, { n: this.dayNumber }) },
                title: (0, GameUtils_1.format)(this.langTxt.p4.killed_morning, { user: uname }),
                color: this.langTxt.sys.killed_color,
                thumbnail: { url: thumb },
                fields: [{ name: (0, GameUtils_1.format)(this.langTxt.p4.living_and_num, { n: living_num }), value: living, inline: true }]
            });
            this.channels.Living.send({ embeds: [embed] });
            this.channels.GameLog.send({ embeds: [embed] });
        }
        else if (this.killNext.length === 0) {
            const embed = new Discord.EmbedBuilder({
                author: { name: (0, GameUtils_1.format)(this.langTxt.p4.day_number, { n: this.dayNumber }) },
                title: this.langTxt.p4.no_killed_morning,
                color: this.langTxt.sys.no_killed_color,
                fields: [{ name: (0, GameUtils_1.format)(this.langTxt.p4.living_and_num, { n: living_num }), value: living, inline: true }]
            });
            this.channels.Living.send({ embeds: [embed] });
            this.channels.GameLog.send({ embeds: [embed] });
        }
        else {
            const players = this.killNext;
            const uids = players.map((player) => player[0]);
            const unames = uids.map((uid, idx) => {
                if (this.members[uid]) {
                    return this.members[uid].nickname;
                }
                else {
                    return this.langTxt.p4.anonymous_name + (idx + 1);
                }
            });
            const title_txt = unames.reduce((acc, val) => acc + (0, GameUtils_1.format)(this.langTxt.p4.killed_morning, { user: val }) + "\n", "");
            const embed = new Discord.EmbedBuilder({
                author: { name: (0, GameUtils_1.format)(this.langTxt.p4.day_number, { n: this.dayNumber }) },
                title: title_txt,
                color: this.langTxt.sys.killed_color,
                // thumbnail : {},
                fields: [{ name: (0, GameUtils_1.format)(this.langTxt.p4.living_and_num, { n: living_num }), value: living, inline: true }]
            });
            this.channels.Living.send({ embeds: [embed] });
            this.channels.GameLog.send({ embeds: [embed] });
        }
        this.killNext = [];
        if (this.defaultRoles[Role.Baker] > 0) {
            if (Object.keys(this.members).some(uid => this.members[uid].isLiving && this.members[uid].role == Role.Baker)) {
                const bread = this.langTxt.baker.repertoire[Math.floor(Math.random() * this.langTxt.baker.repertoire.length)];
                const embed = new Discord.EmbedBuilder({
                    author: { name: this.langTxt.role.Baker, iconURL: this.langTxt.role_img.Baker },
                    title: (0, GameUtils_1.format)(this.langTxt.baker.deliver, { bread: bread }),
                    color: this.langTxt.team_color.Good,
                });
                this.channels.Living.send({ embeds: [embed] });
            }
            else if (Object.keys(this.members).some(uid => this.members[uid].livingDays == this.dayNumber - 1 && this.members[uid].role == Role.Baker)) {
                const embed = new Discord.EmbedBuilder({
                    author: { name: this.langTxt.role.Baker, iconURL: this.langTxt.role_img.Baker },
                    title: this.langTxt.baker.killed,
                    color: this.langTxt.sys.killed_color,
                });
                this.channels.Living.send({ embeds: [embed] });
            }
        }
        this.remTime = Math.max(0, this.ruleSetting.day.length - this.ruleSetting.day.reduction_time * (this.dayNumber - 1));
        this.channels.Living.send({ embeds: [{
                    title: (0, GameUtils_1.format)(this.langTxt.p4.length_of_the_day, { time: this.getTimeFormatFromSec(this.remTime) }),
                    color: this.langTxt.sys.system_color,
                }] });
        this.daytimeStartTime = Date.now();
        await this.makeDictatorController();
        this.voteNum = 0;
        this.runoffNum = 0;
        this.stopTimerRequest = false;
        for (let my_id in this.members) {
            if (!this.members[my_id].isLiving)
                continue;
            const uch = this.members[my_id].uchannel;
            if (uch == null)
                return this.err();
            const component = new Discord.ActionRowBuilder().addComponents(Util.make_button("cut_time", this.langTxt.p4.cut_time_label, { style: "red" }));
            const sent_message = await uch.send({
                content: this.langTxt.sys.cuttime_desc,
                components: [component]
            });
            this.interactControllers[InteractType.CutTime][sent_message.id] = sent_message;
        }
        gameTimer(this.gameId, this, exports.Phase.p4_Daytime, this.ruleSetting.day.alert_times, dummy_startP5Vote);
    }
    async makeDictatorController() {
        if (this.defaultRoles[Role.Dictator] <= 0)
            return;
        this.interactControllers[InteractType.Dictator] = Object.create(null);
        this.dictatorVoteMode = "";
        for (const uid in this.members) {
            if (!this.members[uid].isLiving)
                continue;
            if (this.members[uid].role != Role.Dictator)
                continue;
            if (this.members[uid].roleCmdInvokeNum > 0)
                continue;
            const uch = this.members[uid].uchannel;
            if (uch == null)
                continue;
            const embed = new Discord.EmbedBuilder({
                author: { name: this.langTxt.dictator.button_title, iconURL: this.langTxt.role_img.Dictator },
                title: this.langTxt.dictator.button_desc,
                color: this.langTxt.sys.killed_color,
            });
            const components = [
                new Discord.ActionRowBuilder()
                    .addComponents(Util.make_button("dictator", this.langTxt.dictator.uni, { style: "red" }))
            ];
            const sent_message = await uch.send({ embeds: [embed], components: components });
            this.interactControllers[InteractType.Dictator][sent_message.id] = sent_message;
        }
    }
    async dictatorCheck(interaction) {
        const uch = this.members[interaction.user.id].uchannel;
        if (uch == null)
            return;
        this.members[interaction.user.id].roleCmdInvokeNum++;
        const embed = new Discord.EmbedBuilder({
            author: { name: this.langTxt.role.Dictator, iconURL: this.langTxt.role_img.Dictator },
            title: this.langTxt.dictator.exercise,
            color: this.langTxt.sys.killed_color,
        });
        for (const uid in this.members) {
            if (!this.members[uid].isLiving)
                continue;
            const uch = this.members[uid].uchannel;
            if (uch == null)
                continue;
            uch.send({ embeds: [embed] });
        }
        this.channels.Living.send({ embeds: [embed] });
        this.dictatorVoteMode = interaction.user.id;
        await this.startP5_Vote();
    }
    // Phase.p5_Vote. Do not use "this." in the function
    async startP5_Vote() {
        //! no use "this."
        if (this.voteNum === 0) {
            this.channels.Living.send({ embeds: [{
                        title: (0, GameUtils_1.format)(this.langTxt.p5.end_daytime, { time: this.getTimeFormatFromSec(this.ruleSetting.vote.length) }),
                        color: this.langTxt.sys.system_color,
                    }] });
        }
        this.interactControllers[InteractType.Dictator] = Object.create(null);
        this.cutTimeMember = Object.create(null);
        this.phase = exports.Phase.p5_Vote;
        this.updateRoomsRW();
        for (const uid in this.members) {
            if (!this.members[uid].isLiving)
                continue;
            const uch = this.members[uid].uchannel;
            if (uch == null)
                return this.err();
            this.members[uid].voteTo = "";
            if (this.dictatorVoteMode != "" && this.dictatorVoteMode != uid)
                continue;
            for (const tid in this.members) {
                if (tid == uid)
                    continue;
                if (!this.members[tid].isLiving)
                    continue;
                this.members[uid].validVoteID.push(tid);
            }
        }
        {
            const ti = (this.voteNum == 0 ? "" : (0, GameUtils_1.format)(this.langTxt.p5.revote_times, { m: this.voteNum + 1 }));
            let buttons = [];
            for (const tid in this.members) {
                if (!this.members[tid].isLiving)
                    continue;
                buttons.push(Util.make_button(tid, this.members[tid].nickname, { style: "black" }));
            }
            const components = Util.arrange_buttons(buttons);
            const embed = new Discord.EmbedBuilder({
                title: (0, GameUtils_1.format)(this.langTxt.p5.vote_title, { n: this.dayNumber, time: ti }),
                color: this.langTxt.sys.system_color,
            });
            const sent_message = await this.channels.Living.send({
                embeds: [embed],
                components: components
            });
            this.interactControllers[InteractType.Vote][sent_message.id] = sent_message;
        }
        this.remTime = this.ruleSetting.vote.length;
        this.stopTimerRequest = false;
        gameTimer(this.gameId, this, exports.Phase.p5_Vote, this.ruleSetting.vote.alert_times, dummy_voteTimeup);
    }
    async voteTimeup() {
        this.interactControllers[InteractType.Vote] = Object.create(null);
        let cnt = Object.create(null);
        for (const uid in this.members) {
            cnt[uid] = 0;
        }
        let max_cnt = 0;
        let max_uid = [];
        for (const uid in this.members) {
            if (!this.members[uid].isLiving)
                continue;
            if (this.members[uid].voteTo == "")
                continue;
            const n = cnt[this.members[uid].voteTo] + 1;
            cnt[this.members[uid].voteTo] = n;
            if (max_cnt < n) {
                max_cnt = n;
            }
        }
        let living_num = 0;
        for (const uid in this.members) {
            if (!this.members[uid].isLiving)
                continue;
            living_num += 1;
            const n = cnt[uid];
            if (n == max_cnt) {
                max_uid.push(uid);
            }
        }
        const open = (this.ruleSetting.vote.place == 'realtime_anonym_open' ||
            this.ruleSetting.vote.place == 'after_open' ||
            this.ruleSetting.vote.place == 'realtime_open');
        let desc = "";
        if (this.ruleSetting.vote.place == 'no_open') {
            desc = this.langTxt.p5.after_no_open;
        }
        else {
            let data = []; // cnt, to, from
            for (const uid in this.members) {
                if (!this.members[uid].isLiving)
                    continue;
                data.push([cnt[uid], this.members[uid].voteTo, uid]);
            }
            data.sort();
            for (let i = data.length - 1; i >= 0; --i) {
                if (!open) {
                    desc += (0, GameUtils_1.format)(this.langTxt.p5.after_open_anonym, { from: this.members[data[i][2]].nickname, n: data[i][0] }) + "\n";
                }
                else if (data[i][1] == "") {
                    desc += (0, GameUtils_1.format)(this.langTxt.p5.after_open_format_n, { from: this.members[data[i][2]].nickname, n: data[i][0] }) + "\n";
                }
                else {
                    const to = this.members[data[i][1]].nickname;
                    desc += (0, GameUtils_1.format)(this.langTxt.p5.after_open_format, { from: this.members[data[i][2]].nickname, to: to, n: data[i][0] }) + "\n";
                }
            }
        }
        for (const uid in this.members) {
            this.members[uid].voteTo = "";
        }
        const isLastVote = this.voteNum === this.ruleSetting.vote.revote_num;
        const ti = (this.voteNum == 0 ? "" : (0, GameUtils_1.format)(this.langTxt.p5.revote_times, { m: this.voteNum + 1 }));
        if (max_uid.length === 1 || (isLastVote && this.ruleSetting.vote.when_even == "random")) {
            const eid = max_uid[Math.floor(Math.random() * max_uid.length)];
            const embed = new Discord.EmbedBuilder({
                title: (0, GameUtils_1.format)(this.langTxt.p5.executed, { n: this.dayNumber, user: this.members[eid].nickname, time: ti }),
                description: desc,
                thumbnail: { url: this.members[eid].user.displayAvatarURL() },
                color: this.langTxt.sys.killed_color,
                footer: { text: (0, GameUtils_1.format)(this.langTxt.p5.living_num, { n: living_num - 1 }) },
            });
            this.channels.Living.send({ embeds: [embed] });
            this.channels.GameLog.send({ embeds: [embed] });
            this.lastExecuted = eid;
            await this.kickMember(eid, KickReason.Vote);
        }
        else if (isLastVote) {
            const embed = new Discord.EmbedBuilder({
                title: (0, GameUtils_1.format)(this.langTxt.p5.final_even, { n: this.dayNumber, time: ti }),
                description: desc,
                color: this.langTxt.sys.no_killed_color,
                footer: { text: (0, GameUtils_1.format)(this.langTxt.p5.living_num, { n: living_num }) },
            });
            this.channels.Living.send({ embeds: [embed] });
            this.channels.GameLog.send({ embeds: [embed] });
            this.lastExecuted = "";
            await this.startP6_Night();
        }
        else {
            const embed = new Discord.EmbedBuilder({
                title: (0, GameUtils_1.format)(this.langTxt.p5.revote, { n: this.dayNumber, time: ti }),
                description: desc,
                color: this.langTxt.sys.system_color,
            });
            this.channels.Living.send({ embeds: [embed] });
            this.channels.GameLog.send({ embeds: [embed] });
            this.voteNum += 1;
            await this.startP5_Vote();
        }
    }
    createVoteEmbed(from, text, uid) {
        return new Discord.EmbedBuilder()
            .setAuthor(from)
            .setTitle((0, GameUtils_1.format)(text, { user: this.members[uid].nickname }))
            .setThumbnail(this.members[uid].avatar)
            .setColor(this.langTxt.sys.system_color);
    }
    voteCheckInteract(interaction) {
        const uid = interaction.user.id;
        const tid = interaction.customId;
        if (tid == null)
            return;
        const uch = this.members[uid].uchannel;
        if (uch == null)
            return this.err();
        const realtime = this.ruleSetting.vote.place == 'realtime_open' ||
            this.ruleSetting.vote.place == 'realtime_anonym' ||
            this.ruleSetting.vote.place == 'realtime_anonym_open';
        if (this.members[uid].validVoteID.find(i => i == tid) == null) {
            interaction.reply({ content: this.langTxt.p5.no_selfvote, ephemeral: true });
            return;
        }
        const change = this.members[uid].voteTo != "";
        const author = {
            name: this.members[uid].nickname,
            iconURL: this.members[uid].avatar
        };
        if (realtime && change) {
            interaction.reply({
                embeds: [this.createVoteEmbed(author, this.langTxt.p5.no_revoting, this.members[uid].voteTo)],
                ephemeral: true
            });
            return;
        }
        const tName = this.members[tid].nickname;
        if (this.members[uid].voteTo == tid) {
            interaction.reply({
                embeds: [this.createVoteEmbed(author, this.langTxt.p5.already_vote, tid)],
                ephemeral: true
            });
            return;
        }
        this.members[uid].voteTo = tid;
        if (!realtime) {
            if (change) {
                interaction.reply({
                    embeds: [this.createVoteEmbed(author, this.langTxt.p5.vote_change, tid)],
                    ephemeral: true
                });
            }
            else {
                interaction.reply({
                    embeds: [this.createVoteEmbed(author, this.langTxt.p5.vote_accept, tid)],
                    ephemeral: true
                });
            }
        }
        else if (this.ruleSetting.vote.place == 'realtime_open') {
            interaction.reply({
                embeds: [this.createVoteEmbed(author, this.langTxt.p5.vote_accept_1, tid)],
                ephemeral: false
            });
            this.channels.Living.send((0, GameUtils_1.format)(this.langTxt.p5.vote_format, { to: tName, from: this.members[uid].nickname }));
        }
        else {
            interaction.reply({
                embeds: [this.createVoteEmbed(author, this.langTxt.p5.vote_accept_1, tid)],
                ephemeral: false
            });
            this.channels.Living.send((0, GameUtils_1.format)(this.langTxt.p5.vote_anonym_format, { to: tName }));
        }
    }
    // Phase.p6_Night
    async startP6_Night() {
        this.phase = exports.Phase.p6_Night;
        this.remTime = this.ruleSetting.night.length;
        this.updateRoomsRW();
        const nightComingMessage = (0, GameUtils_1.format)(this.langTxt.p6.start, { time: this.getTimeFormatFromSec(this.remTime) });
        const nightComingEmbed = { embeds: [new Discord.EmbedBuilder({
                    title: nightComingMessage,
                    color: this.langTxt.sys.system_color,
                })] };
        this.channels.Living.send(nightComingEmbed);
        this.cutTimeMember = Object.create(null);
        for (let my_id in this.members) {
            this.members[my_id].voteTo = "";
            if (!this.members[my_id].isLiving)
                continue;
            const uch = this.members[my_id].uchannel;
            if (uch == null)
                return this.err();
            const role = this.members[my_id].role;
            if (role == Role.Priest) {
                uch.send(getUserMentionStrFromId(my_id) + nightComingMessage);
                this.sendFP_Result(my_id, uch, this.lastExecuted, this.langTxt.priest, this.langTxt.role_img.Priest);
            }
            else if (role == Role.Knight) {
                uch.send(getUserMentionStrFromId(my_id) + nightComingMessage);
                this.interactControllers[InteractType.Knight] = Object.create(null);
                this.members[my_id].validVoteID = [];
                let lastGuard = "";
                if (!this.ruleSetting.continuous_guard && this.members[my_id].actionLog.length > 0) {
                    lastGuard = this.members[my_id].actionLog.slice(-1)[0][0];
                }
                let buttons = [];
                for (const tid in this.members) {
                    if (tid == my_id)
                        continue;
                    if (tid == lastGuard)
                        continue;
                    if (!this.members[tid].isLiving)
                        continue;
                    this.members[my_id].validVoteID.push(tid);
                    buttons.push(Util.make_button(tid, this.members[tid].nickname, { style: "blue" }));
                }
                const embed = new Discord.EmbedBuilder({
                    author: { name: this.langTxt.role[role], iconURL: this.langTxt.role_img[role] },
                    title: this.langTxt.knight.title,
                    color: this.langTxt.team_color[getDefaultTeams(role)],
                });
                const sent_message = await uch.send({
                    embeds: [embed],
                    components: Util.arrange_buttons(buttons)
                });
                this.interactControllers[InteractType.Knight][sent_message.id] = sent_message;
            }
            else if (role == Role.Seer) {
                uch.send(getUserMentionStrFromId(my_id) + nightComingMessage);
                this.interactControllers[InteractType.Seer] = Object.create(null);
                this.members[my_id].validVoteID = [];
                let buttons = [];
                for (const tid in this.members) {
                    if (tid == my_id)
                        continue;
                    if (!this.members[tid].isLiving)
                        continue;
                    if (this.members[my_id].actionLog.find(p => p[0] == tid) != null)
                        continue;
                    this.members[my_id].validVoteID.push(tid);
                    buttons.push(Util.make_button(tid, this.members[tid].nickname, { style: "blue" }));
                }
                if (this.members[my_id].validVoteID.length == 0) {
                    this.sendFP_Result(my_id, uch, null, this.langTxt.seer, this.langTxt.role_img.Seer);
                }
                else {
                    const embed = new Discord.EmbedBuilder({
                        author: { name: this.langTxt.role[role], iconURL: this.langTxt.role_img[role] },
                        title: this.langTxt.seer.title,
                        color: this.langTxt.team_color[getDefaultTeams(role)],
                    });
                    if (this.members[my_id].validVoteID.length == 1) {
                        uch.send({ embeds: [embed] });
                        this.sendFP_Result(my_id, uch, this.members[my_id].validVoteID[0], this.langTxt.seer, this.langTxt.role_img.Seer);
                        this.members[my_id].validVoteID = [];
                    }
                    else {
                        const sent_message = await uch.send({
                            embeds: [embed],
                            components: Util.arrange_buttons(buttons)
                        });
                        this.interactControllers[InteractType.Seer][sent_message.id] = sent_message;
                    }
                }
            }
            else if (this.members[my_id].allowWolfRoom) {
            }
            else {
                uch.send(nightComingEmbed);
            }
        }
        { // for Werewolf
            this.interactControllers[InteractType.Werewolf] = Object.create(null);
            const role = Role.Werewolf;
            this.wolfValidTo = [];
            this.wolfValidFrom = [];
            this.wolfVote = "";
            let buttons = [];
            for (const tid in this.members) {
                if (!this.members[tid].isLiving)
                    continue;
                if (this.members[tid].role == Role.Werewolf)
                    continue;
                this.wolfValidTo.push(tid);
                buttons.push(Util.make_button(tid, this.members[tid].nickname, { style: "blue" }));
            }
            const embed = new Discord.EmbedBuilder({
                author: { name: this.langTxt.role[role], iconURL: this.langTxt.role_img[role] },
                title: this.langTxt.werewolf.title,
                color: this.langTxt.team_color[getDefaultTeams(role)],
            });
            const sent_message = await this.channels.Werewolf.send({
                embeds: [embed],
                components: Util.arrange_buttons(buttons)
            });
            this.interactControllers[InteractType.Werewolf][sent_message.id] = sent_message;
            let werewolfsMention = "";
            for (const tid in this.members) {
                if (!this.members[tid].isLiving)
                    continue;
                if (!this.members[tid].allowWolfRoom)
                    continue;
                werewolfsMention += getUserMentionStrFromId(tid);
            }
            this.channels.Werewolf.send(werewolfsMention + nightComingMessage);
            for (let my_id in this.members) {
                if (!this.members[my_id].isLiving)
                    continue;
                if (this.members[my_id].role == Role.Werewolf) {
                    this.wolfValidFrom.push(my_id);
                }
            }
        }
        this.stopTimerRequest = false;
        gameTimer(this.gameId, this, exports.Phase.p6_Night, this.ruleSetting.night.alert_times, dummy_nightFinish);
    }
    nightKnightCheck(interaction) {
        const tid = Object.keys(this.members).find(mid => mid == interaction.customId);
        if (tid == null)
            return;
        const uid = interaction.user.id;
        const uch = this.members[uid].uchannel;
        if (uch == null)
            return this.err();
        if (this.members[uid].validVoteID.find(i => i == tid)) {
            const change = this.members[uid].voteTo != "";
            const role = Role.Knight;
            const author = {
                name: this.langTxt.role[role],
                iconURL: this.langTxt.role_img[role]
            };
            if (this.members[uid].voteTo == tid) {
                interaction.reply({ embeds: [this.createVoteEmbed(author, this.langTxt.knight.already, tid)] });
                return;
            }
            this.members[uid].voteTo = tid;
            if (change) {
                interaction.reply({ embeds: [this.createVoteEmbed(author, this.langTxt.knight.change, tid)] });
            }
            else {
                interaction.reply({ embeds: [this.createVoteEmbed(author, this.langTxt.knight.accept, tid)] });
            }
        }
    }
    nightSeerCheck(interaction) {
        const tid = Object.keys(this.members).find(mid => mid == interaction.customId);
        if (tid == null)
            return;
        const uid = interaction.user.id;
        const uch = this.members[uid].uchannel;
        if (uch == null)
            return this.err();
        if (this.members[uid].voteTo != "")
            return;
        if (this.members[uid].validVoteID.find(i => i == tid)) {
            this.members[uid].voteTo = tid;
            this.members[uid].validVoteID = [];
            interaction.update({});
            this.sendFP_Result(uid, uch, tid, this.langTxt.seer, this.langTxt.role_img.Seer);
        }
    }
    nightWerewolfCheck(interaction) {
        const uid = interaction.user.id;
        if (this.wolfValidFrom.find(i => i == interaction.user.id) == null)
            return;
        const tid = Object.keys(this.members).find(mid => mid == interaction.customId);
        if (tid == null)
            return;
        if (this.wolfValidTo.find(id => id == tid) == null)
            return;
        const change = this.wolfVote != "";
        const author = {
            name: this.members[interaction.user.id].nickname,
            iconURL: this.langTxt.role_img[Role.Werewolf]
        };
        if (this.wolfVote == tid) {
            interaction.reply({ embeds: [this.createVoteEmbed(author, this.langTxt.werewolf.already, tid)] });
            return;
        }
        this.wolfVote = tid;
        if (change) {
            interaction.reply({ embeds: [this.createVoteEmbed(author, this.langTxt.werewolf.change, tid)] });
        }
        else {
            interaction.reply({ embeds: [this.createVoteEmbed(author, this.langTxt.werewolf.accept, tid)] });
        }
    }
    cutTimeCheck(interaction) {
        const uid = interaction.user.id;
        const uch = this.members[uid].uchannel;
        if (uch == null)
            return this.err();
        if (interaction.customId != "cut_time")
            return;
        const isAdd = true; // TODO
        const liveNum = Object.keys(this.members).reduce((acc, value) => { return acc + (this.members[value].isLiving ? 1 : 0); }, 0);
        const reqRule = this.ruleSetting.day.skip_vote_rule;
        const req = (reqRule == "majority") ? (liveNum + 1) / 2 | 0 : liveNum;
        if (!isAdd) {
            delete this.cutTimeMember[uid];
            const now = Object.keys(this.cutTimeMember).length;
            const txt = (0, GameUtils_1.format)(this.langTxt.p4.cut_time_cancel, { now: now, req: req });
            interaction.reply(txt);
            this.channels.Living.send(txt);
        }
        else {
            this.cutTimeMember[uid] = 1;
            const now = Object.keys(this.cutTimeMember).length;
            const txt = (0, GameUtils_1.format)(this.langTxt.p4.cut_time_accept, { now: now, req: req });
            interaction.reply(txt);
            this.channels.Living.send(txt);
            if (now >= req) {
                const updated_remTime = Math.min(12, this.remTime);
                this.channels.Living.send((0, GameUtils_1.format)(this.langTxt.p4.cut_time_approved, { cut_time: updated_remTime }));
                this.remTime = updated_remTime;
            }
        }
    }
    async nightFinish() {
        this.interactControllers[InteractType.Knight] = Object.create(null);
        this.interactControllers[InteractType.Seer] = Object.create(null);
        this.interactControllers[InteractType.Werewolf] = Object.create(null);
        this.interactControllers[InteractType.CutTime] = Object.create(null);
        let Guarded = [];
        for (const uid in this.members) {
            if (this.members[uid].role != Role.Knight)
                continue;
            if (!this.members[uid].isLiving)
                continue;
            this.members[uid].actionLog.push([this.members[uid].voteTo, TeamNames.Other]);
            if (this.members[uid].voteTo == "") {
                const uch = this.members[uid].uchannel;
                if (uch == null)
                    return this.err();
                uch.send(this.langTxt.knight.no_select);
                continue;
            }
            Guarded.push(this.members[uid].voteTo);
        }
        Object.keys(this.members);
        this.killNext = [];
        if (this.wolfVote == "") {
            if (this.wolfValidTo.length == 0)
                this.err();
            this.wolfVote = this.wolfValidTo[Math.floor(Math.random() * this.wolfValidTo.length)];
            this.channels.Werewolf.send((0, GameUtils_1.format)(this.langTxt.werewolf.no_select, { user: this.members[this.wolfVote].nickname }));
        }
        this.wolfLog.push(this.wolfVote);
        if (Guarded.find(id => id == this.wolfVote) == null) {
            this.killNext.push([this.wolfVote, 0]);
            await this.kickMember(this.wolfVote, KickReason.Werewolf);
            if (this.phase != exports.Phase.p6_Night)
                return;
        }
        await this.startP4_Daytime();
    }
    // Phase.p7_GameEnd
    gameEnd(winTeam) {
        this.phase = exports.Phase.p7_GameEnd;
        let dlist = [];
        for (const uid in this.members) {
            if (!this.members[uid].isLiving) {
                // dlist.push([uid, this.channels.LivingVoice.id]);
            }
        }
        this.updateRoomsRW();
        let list = []; // win, liveDay, username
        let fieldsSeer = [];
        let fieldsPriest = [];
        let fieldsKnight = [];
        let wolfNames = "";
        for (const uid in this.members) {
            const role = this.members[uid].role;
            if (role == null)
                return this.err();
            const team = getDefaultTeams(role);
            const isWin = team == winTeam;
            list.push([
                isWin,
                this.members[uid].livingDays < 0 ? -114514 : -this.members[uid].livingDays,
                (0, GameUtils_1.format)(this.langTxt.p7.result_format, {
                    emo: this.langTxt.emo[role],
                    role: this.langTxt.role[role],
                    team: this.langTxt.team_name[team],
                    name: this.members[uid].nickname
                })
            ]);
            if (role == Role.Werewolf) {
                wolfNames += this.members[uid].nickname;
            }
            if (role == Role.Seer || role == Role.Priest) {
                let dat = "";
                for (let i in this.members[uid].actionLog) {
                    let a = this.members[uid].actionLog[i][0];
                    let b = this.members[uid].actionLog[i][1];
                    if (a == "") {
                        dat += this.langTxt.sys.no_result + "\n";
                    }
                    else {
                        dat += this.langTxt.team_emo[b] + this.members[a].nickname + "\n";
                    }
                }
                if (dat == "")
                    dat = this.langTxt.sys.no_result;
                if (role == Role.Seer) {
                    fieldsSeer.push({ value: dat, inline: true,
                        name: (0, GameUtils_1.format)(this.langTxt.p7.log, { emo: this.langTxt.emo[role], role: this.langTxt.role[role], name: this.members[uid].nickname })
                    });
                }
                else {
                    fieldsPriest.push({ value: dat, inline: true,
                        name: (0, GameUtils_1.format)(this.langTxt.p7.log, { emo: this.langTxt.emo[role], role: this.langTxt.role[role], name: this.members[uid].nickname })
                    });
                }
            }
            if (role == Role.Knight) {
                let dat = "";
                for (let i in this.members[uid].actionLog) {
                    let a = this.members[uid].actionLog[i][0];
                    if (a == "") {
                        dat += this.langTxt.sys.no_result + "\n";
                    }
                    else {
                        dat += this.members[a].nickname + "\n";
                    }
                }
                if (dat == "")
                    dat = this.langTxt.sys.no_result;
                fieldsKnight.push({ value: dat, inline: true,
                    name: (0, GameUtils_1.format)(this.langTxt.p7.log, { emo: this.langTxt.emo[role], role: this.langTxt.role[role], name: this.members[uid].nickname })
                });
            }
        }
        let fields = [];
        {
            let dat = "";
            for (let i in this.wolfLog) {
                const a = this.wolfLog[i] == "" ? this.langTxt.sys.no_result : this.members[this.wolfLog[i]].nickname;
                dat += a + "\n";
            }
            if (dat == "")
                dat = this.langTxt.sys.no_result;
            fields.push({ value: dat, inline: true,
                name: (0, GameUtils_1.format)(this.langTxt.p7.log, { emo: this.langTxt.emo.Werewolf, role: this.langTxt.role.Werewolf, name: wolfNames })
            });
        }
        for (const i in fieldsKnight) {
            fields.push(fieldsKnight[i]);
        }
        for (const i in fieldsSeer) {
            fields.push(fieldsSeer[i]);
        }
        for (const i in fieldsPriest) {
            fields.push(fieldsPriest[i]);
        }
        list = list.sort();
        let desc = this.langTxt.p7.win + "\n";
        let winFlag = true;
        for (let i = list.length - 1; i >= 0; --i) {
            if (winFlag == true && list[i][0] == false) {
                desc += "\n" + this.langTxt.p7.lose + "\n";
                winFlag = false;
            }
            desc += list[i][2] + "\n";
        }
        desc += "\n\n";
        const embed = new Discord.EmbedBuilder({
            author: { name: this.langTxt.p7.title, iconURL: this.langTxt.team_img[winTeam] },
            title: (0, GameUtils_1.format)(this.langTxt.p7.main, { team: this.langTxt.team_name[winTeam] }),
            thumbnail: { url: this.langTxt.team_img[winTeam] },
            description: desc,
            color: this.langTxt.team_color[winTeam],
            fields: fields,
        });
        this.channels.Living.send({ embeds: [embed] });
        this.channels.GameLog.send({ embeds: [embed] });
        let MentionText = "";
        for (const mid in this.members) {
            MentionText += getUserMentionStrFromId(mid) + " ";
        }
        this.remTime = this.ruleSetting.after_game.length;
        MentionText += "\n" + (0, GameUtils_1.format)(this.langTxt.p7.continue, { time: this.getTimeFormatFromSec(this.remTime), cmd: this.langTxt.p7.cmd_continue[0], brk: this.langTxt.p7.cmd_breakup[0] });
        this.channels.Living.send(MentionText);
        this.remTime = this.ruleSetting.after_game.length;
        this.stopTimerRequest = false;
        gameTimer(this.gameId, this, exports.Phase.p7_GameEnd, this.ruleSetting.after_game.alert_times, dummy_gameEndFinish);
    }
    gameEndFinish() {
        this.destroy();
    }
    needGmPerm(ch) {
        let fields = [];
        {
            let dat = "";
            for (let uid in this.GM) {
                const u = this.GM[uid];
                dat += (u == null ? uid : getNicknameFromMem(u)) + "\n";
            }
            if (dat == "")
                dat = "(None)";
            fields.push({ name: this.langTxt.sys.sys_GM_list_title, value: dat, inline: true });
        }
        {
            let dat = "";
            for (let uid in this.developer) {
                const u = this.GM[uid];
                dat += (u == null ? uid : getNicknameFromMem(u)) + "\n";
            }
            if (dat == "")
                dat = "(None)";
            fields.push({ name: this.langTxt.sys.sys_Dev_list_title, value: dat, inline: true });
        }
        ch.send({ embeds: [{
                    title: this.langTxt.sys.sys_need_GM_perm,
                    color: this.langTxt.sys.system_err_color,
                    author: { name: "Error!", icon_url: "https://twemoji.maxcdn.com/2/72x72/1f6ab.png" },
                    fields: fields,
                }] });
    }
    needDevPerm(ch) {
        let fields = [];
        {
            let dat = "";
            for (let uid in this.developer) {
                const u = this.GM[uid];
                dat += (u == null ? uid : getNicknameFromMem(u)) + "\n";
            }
            if (dat == "")
                dat = "(None)";
            fields.push({ name: this.langTxt.sys.sys_Dev_list_title, value: dat, inline: true });
        }
        ch.send({ embeds: [{
                    title: this.langTxt.sys.sys_need_Dev_perm,
                    color: this.langTxt.sys.system_err_color,
                    author: { name: "Error!", icon_url: "https://twemoji.maxcdn.com/2/72x72/1f6ab.png" },
                    fields: fields,
                }] });
    }
    reloadDefaultRule() {
        const SysRuleSet = (0, GameUtils_1.loadAndSetSysRuleSet)("./rule_setting_templates/");
        if (SysRuleSet == null) {
        }
        else {
            this.ruleSetting = SysRuleSet;
            this.setRoles2(SysRuleSet);
            this.sendRuleSummary(this.channels.Living);
        }
    }
    loadRuleFromStr(text) {
        console.log("LOAD RULE");
        console.log(text);
        const ret = Util.ParseRuleStr(text);
        if (ret[0] === "success") {
            try {
                const rule = ret[1];
                if (!this.setRoles2(rule)) {
                    return;
                }
                this.ruleSetting = rule;
            }
            catch (e) {
                let set_rules_error = "";
                if (e instanceof Error) {
                    console.log('Cannot set rules: ', e.message);
                    set_rules_error += e.message;
                }
                else {
                    console.log('Cannot set rules.');
                }
                this.sendErr(this.channels.Living, "", (0, GameUtils_1.format)(this.langTxt.sys.set_rules_error, { error: set_rules_error }));
                return;
            }
            this.interactControllers[InteractType.Accept] = {};
            this.start_1Wanted();
            console.log(ret);
        }
        else {
            this.sendErr(this.channels.Living, "", (0, GameUtils_1.format)(this.langTxt.sys.rule_format_error, { error: ret[0] }));
        }
    }
    async interactCommand(interaction) {
        console.log("interactCommand");
        if (this.phase == exports.Phase.p1_Wanted) {
            const mes_id = Object.keys(this.interactControllers[InteractType.Accept]).find(v => v == interaction.message.id);
            if (mes_id == null)
                return;
            const mes = this.interactControllers[InteractType.Accept][mes_id];
            await this.joinMemberInteract(interaction, mes);
            return;
        }
        const uid = Object.keys(this.members).find(k => k == interaction.user.id);
        if (uid == null)
            return;
        if (!this.members[uid].isLiving)
            return;
        const uch = this.members[uid].uchannel;
        if (uch == null)
            return;
        for (let i = 0; i < this.interactControllers.length; i++) {
            if (Object.keys(this.interactControllers[i]).find(v => v == interaction.message.id) == null)
                continue;
            if (i == InteractType.Accept) {
                if (this.phase == exports.Phase.p2_Preparation) {
                    if (interaction.channelId != uch.id)
                        return;
                    this.preparationAccept(uid, interaction);
                    return;
                }
            }
            if (i == InteractType.WishRole) {
                console.log("i == InteractType.WishRole");
                if (this.phase == exports.Phase.p2_Preparation) {
                    if (interaction.channelId != uch.id)
                        return;
                    this.wishRoleCheck(interaction);
                }
            }
            if (i == InteractType.Vote) {
                if (this.phase == exports.Phase.p5_Vote) {
                    if (this.members[uid].validVoteID.length == 0)
                        return;
                    this.voteCheckInteract(interaction);
                    return;
                }
                return;
            }
            if (i == InteractType.Knight) {
                if (this.phase == exports.Phase.p6_Night) {
                    if (interaction.channelId != uch.id)
                        return;
                    this.nightKnightCheck(interaction);
                    return;
                }
            }
            if (i == InteractType.Seer) {
                if (this.phase == exports.Phase.p6_Night) {
                    if (interaction.channelId != uch.id)
                        return;
                    this.nightSeerCheck(interaction);
                    return;
                }
            }
            if (i == InteractType.Werewolf) {
                if (this.phase == exports.Phase.p6_Night) {
                    if (interaction.channelId != this.channels.Werewolf.id)
                        return;
                    this.nightWerewolfCheck(interaction);
                }
            }
            if (i == InteractType.CutTime) {
                if (this.phase == exports.Phase.p4_Daytime) {
                    if (interaction.channelId != uch.id)
                        return;
                    await this.cutTimeCheck(interaction);
                }
            }
            if (i == InteractType.Dictator) {
                if (this.phase == exports.Phase.p4_Daytime) {
                    if (interaction.channelId != uch.id)
                        return;
                    await this.dictatorCheck(interaction);
                }
            }
        }
    }
    async command(message) {
        if (message.content.startsWith('phase')) {
            message.channel.send(this.phase);
            return;
        }
        const isDeveloper = (message.author.id in this.developer);
        const isGM = isDeveloper || (message.author.id in this.GM);
        // Sys: Cotinue command
        if ((0, GameUtils_1.isThisCommand)(message.content, this.langTxt.p7.cmd_continue) >= 0) {
            await this.nextGame();
            return;
        }
        // Sys: Reload command
        if ((0, GameUtils_1.isThisCommand)(message.content, this.langTxt.sys.cmd_reload_rule) >= 0) {
            if (isGM) {
                this.reloadDefaultRule();
            }
            else if (message.channel.type == Discord.ChannelType.GuildText) {
                this.needGmPerm(message.channel);
            }
            return;
        }
        // Sys: Stop timer command
        if ((0, GameUtils_1.isThisCommand)(message.content, this.langTxt.sys.cmd_stop_timer) >= 0) {
            const ch = message.channel;
            if (ch.type == Discord.ChannelType.GuildText) {
                if (isGM) {
                    this.stopTimer(ch);
                }
                else {
                    this.needGmPerm(ch);
                }
            }
            return;
        }
        // Sys: Restart timer command
        if ((0, GameUtils_1.isThisCommand)(message.content, this.langTxt.sys.cmd_resume_timer) >= 0) {
            const ch = message.channel;
            if (ch.type == Discord.ChannelType.GuildText) {
                if (isGM) {
                    this.resumeTimer(ch);
                }
                else {
                    this.needGmPerm(ch);
                }
            }
        }
        // Sys: Member list command
        if ((0, GameUtils_1.isThisCommand)(message.content, this.langTxt.sys.cmd_member_list) >= 0) {
            const ch = message.channel;
            if (ch.type == Discord.ChannelType.GuildText) {
                this.sendMemberList(ch);
            }
            return;
        }
        // Sys: Update perameter command
        if ((0, GameUtils_1.isThisCommand)(message.content, this.langTxt.sys.cmd_update_perm) >= 0) {
            this.updateRoomsRW();
            return;
        }
        // Phase 0 or 1:
        if ((this.phase == exports.Phase.p0_UnStarted) || (this.phase == exports.Phase.p1_Wanted)) {
            // Load uploaded JSON setting file
            const attachments = message.attachments;
            if (attachments.size > 0) {
                if (this.phase == exports.Phase.p0_UnStarted || this.phase == exports.Phase.p1_Wanted) {
                    const text = await Util.getTextFromAttachedJson5(attachments);
                    if (text) {
                        this.loadRuleFromStr(text);
                    }
                }
                return;
            }
            // Load JSON text setting message
            const text = message.content.trim();
            if (text.startsWith("{")) {
                this.loadRuleFromStr(text);
                return;
            }
            // Delete room
            if ((0, GameUtils_1.isThisCommand)(message.content, this.langTxt.p0.cmd_delete_room) >= 0) {
                // TODO: clear前に各chのvisibility変更
                this.channels.clear_category(this.clients[0], this.parentID);
                return;
            }
        }
        // Phase0: Unstarted commands
        if (this.phase == exports.Phase.p0_UnStarted) {
            // Start game
            if ((0, GameUtils_1.isThisCommand)(message.content, this.langTxt.p0.cmd_start) >= 0) {
                this.start_1Wanted();
                return;
            }
            return;
        }
        // Phase1: Recruitment commands
        if (this.phase == exports.Phase.p1_Wanted) {
            // Change rule
            let idx = 0;
            idx = (0, GameUtils_1.isThisCommand)(message.content, this.langTxt.sys.cmd_change_rule);
            if (idx >= 0) {
                if (message.channel.type == Discord.ChannelType.GuildText) {
                    this.changeRule(message.content.substring(this.langTxt.sys.cmd_change_rule[idx].length));
                }
            }
            // Force join
            if ((0, GameUtils_1.isThisCommand)(message.content, this.langTxt.p1.cmd_join_force) >= 0) {
                this.addEntrant(message, true);
                return;
            }
            // Join
            if ((0, GameUtils_1.isThisCommand)(message.content, this.langTxt.p1.cmd_join) >= 0) {
                this.addEntrant(message);
                return;
            }
            // Leave
            if ((0, GameUtils_1.isThisCommand)(message.content, this.langTxt.p1.cmd_leave) >= 0) {
                this.acceptDecline(message);
                return;
            }
            // Kick
            if ((0, GameUtils_1.isThisCommand)(message.content, this.langTxt.p1.cmd_kick) >= 0) {
                this.removeEntrant(message);
                return;
            }
            // Start
            if ((0, GameUtils_1.isThisCommand)(message.content, this.langTxt.p1.cmd_start) >= 0) {
                await this.tryPreparingGame(message);
                return;
            }
            return;
        }
        // Phase 2: preparation commands
        if (this.phase == exports.Phase.p2_Preparation) {
            // 
            if (Object.keys(this.members).find(k => k == message.author.id) != null) {
                const uch = this.members[message.author.id].uchannel;
                if (uch != null && message.channel.id == uch.id) {
                    this.preparationAccept(message.author.id, null);
                }
            }
            if (message.channel.id == this.channels.Living.id) {
                if ((0, GameUtils_1.isThisCommand)(message.content, this.langTxt.p2.cmd_start_force) >= 0) {
                    this.forceStartGame();
                    return;
                }
            }
            return;
        }
        if (this.phase == exports.Phase.p7_GameEnd) {
            if ((0, GameUtils_1.isThisCommand)(message.content, this.langTxt.p7.cmd_breakup) >= 0) {
                this.gameEndFinish();
                return;
            }
        }
    }
}
exports.default = GameState;
// Game timer of the game. Do not use "this." in the function.
function gameTimer(gid, obj, tPhase, alert_times, func, callFromTimer = false) {
    //! no use "this."
    console.log(obj.remTime);
    if (gid != obj.gameId) {
        console.log(`gid: ${gid} != obj.gameId: ${obj.gameId}`);
        return;
    }
    ;
    if (obj.phase != tPhase) {
        console.log(`obj.phase: ${obj.phase} != tPhase: ${tPhase}`);
        return;
    }
    ;
    obj.isTimerProgress = true;
    if (obj.stopTimerRequest) {
        console.log("Receive external timer stop request.");
        obj.timerList.push(setTimeout(gameTimer, 1000, gid, obj, tPhase, alert_times, func, true));
        return;
    }
    if (alert_times.find(v => v === obj.remTime) != null) {
        console.log("alert_times.find(v => v === obj.remTime) != null");
        const text = (0, GameUtils_1.format)(obj.langTxt.sys.remaining_time, { time: obj.getTimeFormatFromSec(obj.remTime) });
        if (obj.phase == exports.Phase.p3_FirstNight) {
            console.log("obj.phase == Phase.p3_FirstNight");
            obj.channels.Werewolf.send(text);
        }
        else if (obj.phase == exports.Phase.p5_Vote) {
            console.log("obj.phase == Phase.p5_Vote");
            obj.broadcastLivingUserChannel(text);
        }
        else if (obj.phase == exports.Phase.p6_Night) {
            console.log("obj.phase == Phase.p6_Night");
            obj.channels.Werewolf.send(text);
            for (const uid in obj.members) {
                if (!obj.members[uid].isLiving)
                    continue;
                const uch = obj.members[uid].uchannel;
                if (uch == null)
                    continue;
                const role = obj.members[uid].role;
                switch (role) {
                    case Role.Seer:
                    case Role.Knight:
                        uch.send(text);
                }
            }
        }
        obj.channels.Living.send(text);
    }
    if (obj.remTime <= 0) {
        console.log("timer finished!");
        obj.channels.Living.send(obj.langTxt.sys.time_is_up);
        obj.isTimerProgress = false;
        func(gid, obj);
    }
    else {
        obj.remTime -= 1;
        obj.timerList.push(setTimeout(gameTimer, 1000, gid, obj, tPhase, alert_times, func, true));
    }
}
////////////////////////////////////////////
// dummys
////////////////////////////////////////////
async function dummy_gamePreparation2(gid, obj) {
    console.log("function dummy_gamePreparation2");
    if (gid != obj.gameId) {
        console.log("something wrong.");
        console.log(`gid: ${gid} != obj.gameId: ${obj.gameId}`);
        return;
    }
    else {
        console.log(`gid: ${gid} == obj.gameId: ${obj.gameId}`);
        await obj.gamePreparation2();
    }
    ;
}
async function dummy_startP4Daytime(gid, obj) {
    if (gid != obj.gameId)
        return;
    await obj.startP4_Daytime();
}
async function dummy_startP5Vote(gid, obj) {
    if (gid != obj.gameId)
        return;
    await obj.startP5_Vote();
}
async function dummy_voteTimeup(gid, obj) {
    if (gid != obj.gameId)
        return;
    obj.voteTimeup();
}
async function dummy_nightFinish(gid, obj) {
    await obj.nightFinish();
}
async function dummy_gameEndFinish(gid, obj) {
    obj.gameEndFinish();
}
//# sourceMappingURL=GameState.js.map