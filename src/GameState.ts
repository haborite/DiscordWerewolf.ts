import * as Discord from "discord.js";
import {GameChannels, format, isThisCommand, assertUnreachable, shuffle, loadAndSetSysRuleSet, updateHashValueWithFormat} from "./GameUtils"
import * as Util from "./GameUtils"
import {LangType, RuleType, RolesStr, SeerPriestType, ServerSettingsType, RuleTypeFormat} from "./JsonType";

export const Phase = {
    p0_UnStarted   : '0.UnStarted',
    p1_Wanted      : '1.Wanted',
    p2_Preparation : '2.Preparation',
    p3_FirstNight  : '3.FirstNight',
    p4_Daytime     : '4.Daytime',
    p5_Vote        : '5.Vote',
    p6_Night       : '6.Night',
    p7_GameEnd     : '7.GameEnd',
} as const;
type Phase = typeof Phase[keyof typeof Phase];

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
type Role = keyof typeof RolesStr.tsType;


const TeamNames = stringToEnum([
    'Good',
    'Evil',
    'Other'
]);
type TeamNames = keyof typeof TeamNames;

const WISHROLENUM = 3;

function getDefaultTeams(r : Role){
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
            assertUnreachable(r);
    }
}

function SightResult(r : Role){
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
            assertUnreachable(r);
    }
}

const my_sleep = (msec: number) => new Promise(resolve => setTimeout(resolve, msec));

function current_unix_time(): number {
    return Math.round(Date.now() / 1000)
}

function hhmmss_str(unix_time_str: number): string {
    return "<t:" + unix_time_str + ":T>"
}

function date_str(unix_time_str: number): string {
    return "<t:" + unix_time_str + ":D>"
}

function stringToEnum<T extends string>(o: T[]): {[K in T]: K} {
    return o.reduce((accumulator, currentValue) => {
      accumulator[currentValue] = currentValue;
      return accumulator;
    }, Object.create(null));
}

function getUserMentionStrFromId(uid: string){
    return "<@!" + uid + ">"
}

function getUserMentionStr(user: Discord.User){
    return "<@!" + user.id + ">"
}

function getNicknameFromMes(message : Discord.Message){
    return (message.member != null && message.member.nickname != null ? message.member.nickname : message.author.displayName);
}

function getNicknameFromMem(mem : Discord.GuildMember){
    return (mem.nickname != null ? mem.nickname : mem.user.displayName);
}

class GameMember {
    user            : Discord.User;
    member          : Discord.GuildMember | null;
    uchannel        : Discord.TextChannel | null = null;
    role            : Role | null = null;
    wishRole        : { [key: string]: number; }  = Object.create(null);
    allowWolfRoom   : boolean     = false;
    allowMasonRoom  : boolean     = false;
    actionLog       : [string, TeamNames][] = [];
    isLiving        : boolean  = true;
    deadReason      : KickReason = KickReason.Living;
    alpStr          : string   = "";
    validVoteID     : string[] = [];
    voteTo          : string   = "";
    livingDays      : number   = -1;
    avatar          : string;
    nickname        : string;
    roleCmdInvokeNum:number    = 0;
    constructor(m : Discord.GuildMember) {
        this.user = m.user;
        this.member = m;
        this.nickname = getNicknameFromMem(m);
        const ava = m.user.displayAvatarURL();
        this.avatar = ((ava == null) ? "" : ava);
        this.reset();
    }
    reset() {
        this.role = null;
        this.wishRole    = Object.create(null);
        this.allowWolfRoom = false;
        this.allowMasonRoom = false;
        this.actionLog = [];
        this.isLiving = true;
        this.deadReason = KickReason.Living
        this.alpStr   = "";
        this.validVoteID = [];
        this.voteTo = ""
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

const Admin_dny: bigint[] = [];

const RW_alw = [
    Discord.PermissionsBitField.Flags.ViewChannel,
    Discord.PermissionsBitField.Flags.Connect,
    Discord.PermissionsBitField.Flags.AddReactions,
    Discord.PermissionsBitField.Flags.SendMessages,
    Discord.PermissionsBitField.Flags.Speak,
];
const RW_dny: bigint[] = [];
    
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

const NoAccess_alw: bigint[] = [];

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

const enum Perm {NoAccess, ReadOnly, ViewOnly, RW, Admin}
function addPerm(id : string, p : Perm, perms : Discord.OverwriteResolvable[]){
    switch(p){
        case Perm.NoAccess: perms.push({id: id, allow: NoAccess_alw, deny:  NoAccess_dny}); return;
        case Perm.ViewOnly: perms.push({id: id, allow: ViewOnly_alw, deny:  ViewOnly_dny}); return;
        case Perm.ReadOnly: perms.push({id: id, allow: ReadOnly_alw, deny:  ReadOnly_dny}); return;
        case Perm.RW:       perms.push({id: id, allow: RW_alw,       deny:  RW_dny      }); return;
        case Perm.Admin:    perms.push({id: id, allow: Admin_alw,    deny:  Admin_dny   }); return;
        default: assertUnreachable(p);
    }
}

enum InteractType {
    Accept,
    WishRole,
    Vote,
    Knight,
    Seer,
    Werewolf,
    Dictator,
    CutTime,
}

export enum KickReason {
    Vote,
    Werewolf,
    Living,
}


export default class GameState {
    clients      : Discord.Client[];
    guild        : Discord.Guild;
    srvSetting   : ServerSettingsType;
    langTxt      : LangType;
    ruleSetting  : RuleType;
    upperGames   : { [key: string]: GameState};
    parentID     : string;
    channels     : GameChannels;
    phase        : Phase;
    gameId       : number;
    GM           : { [key: string]: Discord.GuildMember | null; } = Object.create(null);
    developer    : { [key: string]: Discord.GuildMember | null; } = Object.create(null);
    defaultRoles : { [key: string]: number; }  = Object.create(null);
    possibleFirstVictimRoles : { [key: string]: boolean; }  = Object.create(null);
    playingRoles : { [key: string]: number; }  = Object.create(null);
    possibleRoles: { [key: string]: number; }  = Object.create(null);
    emoText      : { [key: string]: string; }  = Object.create(null);
    roleText     : { [key: string]: string; }  = Object.create(null);
    members     : { [key: string]: GameMember; }  = Object.create(null);
    reqMemberNum : number = 0;
    interactControllers : { [key: string]: Discord.Message; }[] = [];
    reactedMember : { [key: string]: number; }  = Object.create(null);
    cutTimeMember : { [key: string]: number; }  = Object.create(null);
    p2CanForceStartGame : boolean;
    remTime         : number;
    daytimeStartTime: number = 0;
    stopTimerRequest: boolean;
    isTimerProgress : boolean;
    dayNumber       : number;
    killNext        : [string, number][];
    voteNum         : number;
    runoffNum       : number;
    lastExecuted    : string;
    wolfVote        : string;
    wolfValidTo     : string[];
    wolfValidFrom   : string[];
    wolfLog         : string[];
    dictatorVoteMode: string = "";
    timerList       : NodeJS.Timeout[];
    magicnumber     : number;

    // Game construction method
    constructor(
        clients : Discord.Client[], 
        upperGames : {[key: string]: GameState}, 
        guild : Discord.Guild, 
        ch : GameChannels, 
        parentID : string, 
        srvLangTxt : LangType, 
        srvRuleSetting : RuleType, 
        srvSetting : ServerSettingsType
    ) {
        this.clients     = clients;
        this.upperGames  = upperGames;
        this.guild       = guild;
        this.loadLang(srvLangTxt);
        this.langTxt     = srvLangTxt;
        this.ruleSetting = srvRuleSetting;
        this.srvSetting  = srvSetting;
        this.channels    = ch;
        this.parentID    = parentID;
        this.gameId      = -1;
        this.p2CanForceStartGame = false;
        this.remTime     = -1;
        this.stopTimerRequest  = false;
        this.isTimerProgress   = false;
        this.dayNumber   = -1;
        this.killNext    = [];
        this.voteNum     = 0;
        this.runoffNum   = 0;
        this.lastExecuted  = "";
        this.wolfVote      = "";
        this.wolfValidTo   = [];
        this.wolfValidFrom = [];
        this.wolfLog       = [];
        this.timerList   = [];
        this.magicnumber = 0;
        this.reset()
        this.setRoles2(this.ruleSetting)
        this.phase       = Phase.p0_UnStarted;
        for(const idx in srvSetting.system_GM){
            this.GM[srvSetting.system_GM[idx]] = null;
        }
    }

    // Language loading method
    loadLang(srvLangTxt : LangType){
        this.langTxt     = srvLangTxt;
        this.emoText  = srvLangTxt.emo  as {[key: string]: string};
        this.roleText = srvLangTxt.role as {[key: string]: string};
    }
    
    // Reset game method
    reset() {
        for (let timer of this.timerList) {
            clearTimeout(timer);
        }
        this.timerList = [];
        this.phase = Phase.p0_UnStarted
        for (const uid in this.members) {
            this.members[uid].reset();
        }
        this.resetReactedMember();
        this.gameId = Math.floor(Math.random() * 0x40000000);
        this.interactControllers = [];
        this.p2CanForceStartGame = false;
        this.remTime     = -1;
        this.stopTimerRequest = false;
        this.isTimerProgress  = false;
        this.dayNumber       = -1;
        this.killNext        = [];
        this.lastExecuted = "";
        this.wolfVote      = "";
        this.wolfValidTo   = [];
        this.wolfValidFrom = [];
        this.wolfLog       = [];
        this.dictatorVoteMode = "";
        for(let key in InteractType){
            this.interactControllers.push(Object.create(null));
        }
        this.phase       = Phase.p0_UnStarted;
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
    sendWarn(ch : Discord.TextChannel, title : string, desc : string){
        ch.send({embeds: [{
            title: title,
            description : desc,
            color: this.langTxt.sys.system_warn_color,
            author: {name: "Warn!", icon_url: "https://twemoji.maxcdn.com/2/72x72/26a0.png"},
        }]});
    }

    // Send error message
    sendErr(ch : Discord.TextChannel, title : string, desc : string){
        ch.send({embeds: [{
            title: title,
            description : desc,
            color: this.langTxt.sys.system_err_color,
            author: {name: "Error!", icon_url: "https://twemoji.maxcdn.com/2/72x72/1f6ab.png"},
        }]});
    }

    // Send the member list to the given channel
    sendMemberList(ch : Discord.TextChannel) {
        const current_num = Object.keys(this.members).length;
        let   text : string = "";

        Object.keys(this.members).forEach((key, idx) => {
            text += this.members[key].nickname + "\n";
        });
        ch.send({embeds: [{
            title: format(this.langTxt.sys.Current_join_member_num, {num : current_num, max : this.reqMemberNum}),
            description : text,
            color: this.langTxt.sys.system_color,
        }]});
    }

    // Set roles from the rule setting
    setRoles2(r : RuleType): boolean {
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
                defaultRoles["Seer"]  = count;
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
                defaultRoles["Knight"] = count
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
            return true
        } else {
            console.log("Too much first victim");
            this.sendErr(
                this.channels.Living,
                "",
                format(
                    this.langTxt.sys.too_much_first_victim,
                    {req: r.first_victim_count, given: possible_first_victim_count}
                )
            );
            return false
        }
    }

    // Add a given role 
    addRole(r : Role, num : number = 1) {
        console.log("addRole", r, num)
        if(r in this.defaultRoles){
            this.defaultRoles[r] += num;
        } else {
            this.defaultRoles[r] = num;
        }
        this.reqMemberNum += num;
    }

    // Send summary message of the current rule 
    sendRuleSummary(tch: Discord.TextChannel) {
        let team     : {[key: string]: string} = Object.create(null);
        let team_cnt : {[key: string]: number} = Object.create(null);
        let all_cnt = 0;
        for(const key in TeamNames){
            team[key] = "";
            team_cnt[key] = 0;
        }
        for(const r in this.defaultRoles){
            const t = getDefaultTeams(r as Role);
            const first_victim_txt = "  (" + this.langTxt.rule.first_victim.txt + this.langTxt.rule.first_victim[this.possibleFirstVictimRoles[r] ? "yes" : "no"] + ")" + "\n"
            team[t] += this.emoText[r] + this.roleText[r] + " : " + this.defaultRoles[r] + first_victim_txt;
            team_cnt[t] += this.defaultRoles[r];
            all_cnt += this.defaultRoles[r];
        }

        let rules_txt = "";
        rules_txt += this.langTxt.rule.first_victim_count.txt + ": " + this.ruleSetting.first_victim_count + "\n";
        if(this.defaultRoles[Role.Seer]) {
            rules_txt += this.langTxt.rule.first_sight.txt + ":" + this.langTxt.rule.first_sight[this.ruleSetting.first_sight] + "\n";
        }
        if(this.defaultRoles[Role.Knight]) {
            rules_txt += this.langTxt.rule.continuous_guard.txt + ":" + this.langTxt.rule.continuous_guard[this.ruleSetting.continuous_guard ? "yes" : "no"] + "\n";
        }
        {
            rules_txt += this.langTxt.rule.vote_place.txt + ":" + this.langTxt.rule.vote_place[this.ruleSetting.vote.place] + "\n";
            rules_txt += this.langTxt.rule.vote_num.txt   + ": " + String(this.ruleSetting.vote.revote_num + 1) + "\n";
            rules_txt += this.langTxt.rule.vote_even.txt  + ":" + this.langTxt.rule.vote_even[this.ruleSetting.vote.when_even] + "\n";
        }

        let timetable_txt = "";
        timetable_txt += this.langTxt.timetable.day_length.txt + ": " + this.getTimeFormatFromSec(this.ruleSetting.day.length) + "\n";
        timetable_txt += this.langTxt.timetable.night_length.txt + ": " + this.getTimeFormatFromSec(this.ruleSetting.night.length) + "\n";
        timetable_txt += this.langTxt.timetable.votetime_length.txt + ": " + this.getTimeFormatFromSec(this.ruleSetting.vote.length) + "\n";

        let fields : Discord.EmbedField[] = [];

        if(team[TeamNames.Good] != "") { fields.push({
            name : this.langTxt.team_name.Good + "  " +
            format(this.langTxt.sys.Current_role_breakdown_sum, {num : team_cnt[TeamNames.Good]}),
            value: team[TeamNames.Good], inline : true});
        }
        if(team[TeamNames.Evil] != "") { fields.push({
            name : this.langTxt.team_name.Evil + "  " +
            format(this.langTxt.sys.Current_role_breakdown_sum, {num : team_cnt[TeamNames.Evil]}),
            value: team[TeamNames.Evil], inline : true});
        }
        if(team[TeamNames.Other] != "") { fields.push({
            name : this.langTxt.team_name.Other + "  " +
            format(this.langTxt.sys.Current_role_breakdown_sum, {num : team_cnt[TeamNames.Other]}),
            value: team[TeamNames.Other], inline : true});
        }
        fields.push({
            name : this.langTxt.rule.title,
            value: rules_txt, inline : false
        });
        fields.push({
            name: this.langTxt.timetable.title,
            value: timetable_txt, inline: false 
        });
        const all_cnt_txt = format(this.langTxt.sys.Current_role_breakdown_sum, {num : all_cnt});
        const plyr_cnt_txt = format(this.langTxt.sys.Current_player_sum, {num : all_cnt - this.ruleSetting.first_victim_count});
        tch.send({embeds: [{
            title: this.langTxt.sys.Current_role_breakdown,
            description : all_cnt_txt + plyr_cnt_txt,
            color: this.langTxt.sys.system_color,
            fields : fields,
        }]});
    }

    // Set a rule by string 
    changeRule(rulesStr : string) {
        const delimiters = [':', '='];
        let res = "";
        let changed = false;
        for(let rule of rulesStr.split('\n')){
            rule = rule.trim();
            let dpos = rule.length;
            for(const d of delimiters) {
                const v = rule.indexOf(d);
                if(v >= 1) dpos = Math.min(dpos, v);
            }
            if (dpos >= rule.length) {const v = rule.indexOf(' ');   if(v >= 1) dpos = v;}
            if (dpos >= rule.length) {const v = rule.indexOf(' \t'); if(v >= 1) dpos = v;}
            if (dpos >= rule.length) continue;
            const attribute = rule.substring(0, dpos).trim();
            const value     = rule.substring(dpos+1, rule.length).trim();
            if(attribute.length == 0 || value.length == 0) continue;
            console.log("attribute : ", attribute);
            console.log("value     : ", value);
            const r = updateHashValueWithFormat(attribute, value, RuleTypeFormat.runtimeType, this.ruleSetting);
            changed = changed || r;
            if(!r) {
                res += "Failed to set the value. attribute : " + attribute + " value : " + value + "\n";
            }
        }
        if(res != ""){
            this.channels.Living.send(res);
        }
        if(changed) {
            this.sendRuleSummary(this.channels.Living);
        }
        console.log(this.ruleSetting);
    }

    // Phase 0 start
    async start_0Unstarted() {
        console.log("Phase 0: Unstarted");
        this.phase = Phase.p0_UnStarted;
        this.sendRuleSummary(this.channels.Living);
    }

    // Phase 1 start
    async start_1Wanted() {
        console.log("Phase 1: Recruitment");
        this.phase = Phase.p1_Wanted;
        this.updateRoomsRW();
        this.sendRuleSummary(this.channels.Living);

        // Create join button
        const join_button = Util.make_button("join", this.langTxt.p1.cmd_join[0], {style : "green", emoji: this.langTxt.role_uni.Werewolf});
        const sent_message = await this.channels.Living.send({
            content: this.langTxt.p0.start_recruiting,
            components: [ new Discord.ActionRowBuilder<Discord.ButtonBuilder>().addComponents(join_button) ]
        });
        this.interactControllers[InteractType.Accept][sent_message.id] = sent_message;
        
        this.updateWantedEmb(null);
    }

    // Update authentications of the rooms
    updateRoomsRW() {
        if(this.guild == null) return this.err();
        let permGMonly      : Discord.OverwriteResolvable[] = [{id: this.guild.id, allow: NoAccess_alw, deny: NoAccess_dny}];
        let permReadOnly    : Discord.OverwriteResolvable[] = [{id: this.guild.id, allow: ReadOnly_alw, deny: NoAccess_dny}];
        // const cu1 = this.clients[0].user;
        if (this.guild.members.me != null) {
            addPerm(this.guild.members.me.id, Perm.Admin, permGMonly);
            addPerm(this.guild.members.me.id, Perm.Admin, permReadOnly);
        }

        this.channels.DebugLog.permissionOverwrites.set(permGMonly);
        this.channels.GameLog.permissionOverwrites.set(permReadOnly); // or permReadOnly

        let permLiving      : Discord.OverwriteResolvable[] = [];
        let permDead        : Discord.OverwriteResolvable[] = [];
        let permWerewolf    : Discord.OverwriteResolvable[] = [];
        let permMason       : Discord.OverwriteResolvable[] = [];
        let permIndividual  : Discord.OverwriteResolvable[] = [];
        let permAudience    : Discord.OverwriteResolvable[] = [];

        switch (this.phase) {
            case Phase.p0_UnStarted:
            case Phase.p1_Wanted:
                // for @everyone
                addPerm(this.guild.id, Perm.RW      , permLiving   );
                addPerm(this.guild.id, Perm.ReadOnly, permDead     );
                addPerm(this.guild.id, Perm.NoAccess, permWerewolf );
                addPerm(this.guild.id, Perm.NoAccess, permMason    );
                addPerm(this.guild.id, Perm.RW      , permAudience );
                break;
            case Phase.p2_Preparation:
                // for @everyone(Guest)
                addPerm(this.guild.id, Perm.NoAccess, permMason    );
                addPerm(this.guild.id, Perm.NoAccess, permWerewolf );
                addPerm(this.guild.id, Perm.ReadOnly, permLiving   );
                addPerm(this.guild.id, Perm.NoAccess, permDead     );
                addPerm(this.guild.id, Perm.RW      , permAudience );
                addPerm(this.guild.id, Perm.NoAccess, permIndividual);
                for (const uid in this.members) {
                    addPerm(uid, Perm.NoAccess, permAudience);
                    addPerm(uid, Perm.RW,       permLiving);
                    addPerm(uid, Perm.NoAccess, permDead);
                    if (this.members[uid].allowWolfRoom) {
                        addPerm(uid, Perm.ReadOnly, permWerewolf);
                    } else {
                        addPerm(uid, Perm.NoAccess, permWerewolf);
                    }
                    if (this.members[uid].allowMasonRoom) {
                        addPerm(uid, Perm.ReadOnly, permMason);
                    } else {
                        addPerm(uid, Perm.NoAccess, permMason);
                    }
                }
                break;
            case Phase.p3_FirstNight:
                // for @everyone(Guest)
                addPerm(this.guild.id, Perm.NoAccess, permMason    );
                addPerm(this.guild.id, Perm.NoAccess, permWerewolf );
                addPerm(this.guild.id, Perm.ReadOnly, permLiving   );
                addPerm(this.guild.id, Perm.NoAccess, permDead     );
                addPerm(this.guild.id, Perm.RW      , permAudience );
                addPerm(this.guild.id, Perm.NoAccess, permIndividual);
                for(const uid in this.members) {
                    addPerm(uid, Perm.NoAccess, permAudience);
                    addPerm(uid, Perm.ReadOnly, permLiving);
                    addPerm(uid, Perm.NoAccess, permDead);
                    if (this.members[uid].allowWolfRoom) {
                        addPerm(uid, Perm.RW,       permWerewolf);
                    } else {
                        addPerm(uid, Perm.NoAccess, permWerewolf);
                    }
                    if (this.members[uid].allowMasonRoom) {
                        addPerm(uid, Perm.RW,       permMason);
                    } else {
                        addPerm(uid, Perm.NoAccess, permMason);
                    }
                }
                break;
            case Phase.p4_Daytime:
                // for @everyone(Guest)
                addPerm(this.guild.id, Perm.NoAccess, permMason    );
                addPerm(this.guild.id, Perm.NoAccess, permWerewolf );
                addPerm(this.guild.id, Perm.ReadOnly, permLiving   );
                addPerm(this.guild.id, Perm.NoAccess, permDead     );
                addPerm(this.guild.id, Perm.RW      , permAudience );
                addPerm(this.guild.id, Perm.NoAccess, permIndividual);
                for(const uid in this.members) {
                    addPerm(uid, Perm.NoAccess, permAudience);
                    if(this.members[uid].isLiving) {
                        addPerm(uid, Perm.RW,       permLiving);
                        addPerm(uid, Perm.NoAccess, permDead);
                    } else {
                        addPerm(uid, Perm.ReadOnly, permLiving);
                        addPerm(uid, Perm.RW,       permDead);
                        addPerm(uid, Perm.ReadOnly, permIndividual);
                        addPerm(uid, Perm.ReadOnly, permAudience);
                        addPerm(uid, Perm.ReadOnly, permWerewolf);
                        addPerm(uid, Perm.ReadOnly, permMason);
                    }
                    if (this.members[uid].allowWolfRoom) {
                        const enableDaytimeWolfRoom = true;
                        if (enableDaytimeWolfRoom && this.members[uid].isLiving) {
                            addPerm(uid, Perm.RW,       permWerewolf);
                        } else {
                            addPerm(uid, Perm.ReadOnly, permWerewolf);
                        }
                    } else {
                        addPerm(uid, Perm.NoAccess, permWerewolf);
                    }
                    if (this.members[uid].allowMasonRoom) {
                        const enableDaytimeMasonRoom = true;
                        if (enableDaytimeMasonRoom && this.members[uid].isLiving) {
                            addPerm(uid, Perm.RW,       permMason);
                        } else {
                            addPerm(uid, Perm.ReadOnly, permMason);
                        }
                    } else {
                        addPerm(uid, Perm.NoAccess, permMason);
                    }
                }
                break;
            case Phase.p5_Vote:
                // for @everyone(Guest)
                addPerm(this.guild.id, Perm.NoAccess, permMason    );
                addPerm(this.guild.id, Perm.NoAccess, permWerewolf );
                addPerm(this.guild.id, Perm.ReadOnly, permLiving   );
                addPerm(this.guild.id, Perm.NoAccess, permDead     );
                addPerm(this.guild.id, Perm.RW      , permAudience );
                addPerm(this.guild.id, Perm.NoAccess, permIndividual);
                for(const uid in this.members) {
                    addPerm(uid, Perm.NoAccess, permAudience);
                    if(this.members[uid].isLiving) {
                        if(this.ruleSetting.vote.talk){
                            addPerm(uid, Perm.RW,       permLiving);
                        }else{
                            addPerm(uid, Perm.ReadOnly, permLiving);
                        }
                        addPerm(uid, Perm.NoAccess, permDead       );
                    } else {
                        addPerm(uid, Perm.ReadOnly, permLiving);
                        addPerm(uid, Perm.RW,       permDead);
                        addPerm(uid, Perm.ReadOnly, permIndividual);
                        addPerm(uid, Perm.ReadOnly, permAudience);
                        addPerm(uid, Perm.ReadOnly, permWerewolf);
                        addPerm(uid, Perm.ReadOnly, permMason);
                    }
                    if (this.members[uid].allowWolfRoom) {
                        if(this.members[uid].isLiving) {
                            addPerm(uid, Perm.ReadOnly, permWerewolf);
                        } else {
                            addPerm(uid, Perm.ReadOnly, permWerewolf);
                        }
                    } else {
                        addPerm(uid, Perm.NoAccess, permWerewolf);
                    }
                    if (this.members[uid].allowMasonRoom) {
                        if(this.members[uid].isLiving) {
                            addPerm(uid, Perm.ReadOnly, permMason);
                        } else {
                            addPerm(uid, Perm.ReadOnly, permMason);
                        }
                    } else {
                        addPerm(uid, Perm.NoAccess, permMason);
                    }
                }
                break;
            case Phase.p6_Night:
                // for @everyone(Guest)
                addPerm(this.guild.id, Perm.NoAccess, permMason    );
                addPerm(this.guild.id, Perm.NoAccess, permWerewolf );
                addPerm(this.guild.id, Perm.ReadOnly, permLiving   );
                addPerm(this.guild.id, Perm.NoAccess, permDead     );
                addPerm(this.guild.id, Perm.RW      , permAudience );
                addPerm(this.guild.id, Perm.NoAccess, permIndividual);
                for(const uid in this.members) {
                    addPerm(uid, Perm.NoAccess, permAudience);
                    if(this.members[uid].isLiving) {
                        addPerm(uid, Perm.ReadOnly, permLiving);
                        addPerm(uid, Perm.NoAccess, permDead       );
                    } else {
                        addPerm(uid, Perm.ReadOnly, permLiving);
                        addPerm(uid, Perm.RW,       permDead);
                        addPerm(uid, Perm.ReadOnly, permIndividual);
                        addPerm(uid, Perm.ReadOnly, permAudience);
                        addPerm(uid, Perm.ReadOnly, permWerewolf);
                        addPerm(uid, Perm.ReadOnly, permMason);
                    }
                    if (this.members[uid].allowWolfRoom){
                        if(this.members[uid].isLiving) {
                            addPerm(uid, Perm.RW,       permWerewolf);
                        } else {
                            addPerm(uid, Perm.ReadOnly, permWerewolf);
                        }
                    } else {
                        addPerm(uid, Perm.NoAccess, permWerewolf);
                    }
                    if(this.members[uid].allowMasonRoom){
                        if(this.members[uid].isLiving) {
                            addPerm(uid, Perm.RW,       permMason);
                        } else {
                            addPerm(uid, Perm.ReadOnly, permMason);
                        }
                    } else {
                        addPerm(uid, Perm.NoAccess, permMason);
                    }
                }
                break;
            case Phase.p7_GameEnd:
                // for @everyone(Guest)
                addPerm(this.guild.id, Perm.RW, permMason);
                addPerm(this.guild.id, Perm.RW, permWerewolf);
                addPerm(this.guild.id, Perm.RW, permLiving);
                addPerm(this.guild.id, Perm.RW, permDead);
                addPerm(this.guild.id, Perm.RW, permIndividual);
                addPerm(this.guild.id, Perm.RW, permAudience );
                break;
            default:
                assertUnreachable(this.phase);
        }
        if (this.guild.members.me != null) {
            addPerm(this.guild.members.me.id, Perm.Admin, permLiving);
            addPerm(this.guild.members.me.id, Perm.Admin, permDead);
            addPerm(this.guild.members.me.id, Perm.Admin, permWerewolf);
            addPerm(this.guild.members.me.id, Perm.Admin, permMason);
            addPerm(this.guild.members.me.id, Perm.Admin, permIndividual);
            addPerm(this.guild.members.me.id, Perm.Admin, permAudience);
        }
        this.channels.Living.permissionOverwrites.set(permLiving);
        this.channels.Dead.permissionOverwrites.set(permDead);
        this.channels.Werewolf.permissionOverwrites.set(permWerewolf);
        this.channels.Mason.permissionOverwrites.set(permMason);
        this.channels.Audience.permissionOverwrites.set(permAudience);

        for (const uid in this.members) {
            const _permIndividual = structuredClone(permIndividual);
            addPerm(uid, Perm.RW, _permIndividual);
            const uch = this.members[uid].uchannel;
            if (uch != null) {
                uch.permissionOverwrites.set(_permIndividual);
            }
        }

        for(const uid in this.members) {
            const m_old = this.members[uid].member;
            if(m_old == null) continue;
            m_old.fetch().then(m => {
            });
        }
    }    
    
    // Clear all joined members
    resetReactedMember() {
        this.reactedMember = Object.create(null);
    }

    // Send sight result from Seers or Priests
    sendFP_Result(uid : string, uch : Discord.TextChannel, tid : string | null, LangFP : SeerPriestType, icon : string) {
        if(tid == null || tid == ""){
            uch.send(LangFP.no_result);
        } else{
            const tRole = this.members[tid].role;
            if(tRole == null) return this.err();
            const team = SightResult(tRole);

            let sameTeamRole = "";
            Object.keys(this.defaultRoles).forEach(r => {
                const role = r as Role
                if (SightResult(role) == team) {
                    sameTeamRole += this.emoText[role] + this.roleText[role] + "\n";
                }
            })
            this.members[uid].actionLog.push([tid, team]);
            let actionLog = "";
            this.members[uid].actionLog.forEach(p => {
                const icon = ((p[1] == TeamNames.Evil) ? this.langTxt.emo.Werewolf : this.langTxt.emo.Villager);
                actionLog += icon + " " + this.members[p[0]].nickname + "\n";
            });

            const aname = format(LangFP.result_title, {user:this.members[tid].nickname});

            if(team == TeamNames.Evil){
                uch.send({embeds: [{
                    author      : {name : aname, icon_url: icon},
                    color       : this.langTxt.team_color[team],
                    thumbnail   : {url: this.members[tid].user.displayAvatarURL()},
                    title       : format(LangFP.is_wolf, {user : this.members[tid].nickname, emo : this.langTxt.emo.Werewolf}),
                    fields      : [{name : LangFP.same_team_role, value : sameTeamRole, inline : true},
                                   {name : LangFP.log,    value : actionLog, inline : true}]
                }]});
            } else {
                uch.send({embeds: [{
                    author      : {name : aname, icon_url: icon},
                    color       : this.langTxt.team_color[team],
                    thumbnail   : {url: this.members[tid].user.displayAvatarURL()},
                    title       : format(LangFP.no_wolf, {user : this.members[tid].nickname, emo : this.langTxt.emo.Villager}),
                    fields      : [{name : LangFP.same_team_role, value : sameTeamRole, inline : true},
                        {name : LangFP.log,    value : actionLog, inline : true}]
                }]});
            }
        }
    }

    // Get mm:ss format from sec
    getTimeFormatFromSec(t : number){
        const m = Math.floor(t / 60);
        const s = Math.floor(t - m * 60);
        if(m == 0){
            return format(this.langTxt.sys.time_formatS, {sec : s});
        }
        if(s == 0){
            return format(this.langTxt.sys.time_formatM, {min : m});
        }
        return format(this.langTxt.sys.time_formatMS, {sec : s, min : m});
    }
    
    // Remove a player from the game and check gameEnd condition
    async kickMember(uid : string, reason : KickReason) {

        // Kill a player
        this.members[uid].isLiving = false;
        this.members[uid].livingDays = this.dayNumber;
        this.channels.Dead.send({embeds: [{
            title: format(this.langTxt.sys.welcome_dead, {user : this.members[uid].nickname}),
            color: this.langTxt.sys.system_color,
        }]});  
        
        // Check gameEnd condition
        let humanNum = 0;
        let wolfNum = 0;
        this.members[uid].deadReason = reason;
        for (let id in this.members) {
            if(!this.members[id].isLiving) continue;
            const r = this.members[id].role;
            if(r == null) return this.err();
            if(r == Role.Werewolf) {
                wolfNum += 1;
            } else {
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
    broadcastLivingUserChannel(mess : string | Discord.EmbedBuilder) {
        for(const uid in this.members){
            if(!this.members[uid].isLiving) continue;
            const uch = this.members[uid].uchannel;
            if(uch == null) continue;
            if (typeof mess === "string") {
                uch.send(mess);
            } else {
                uch.send({embeds: [mess]});
            }
        }
    }

    // Stop the game timer
    stopTimer(ch : Discord.TextChannel) {
        if(this.isTimerProgress){
            this.stopTimerRequest = true;
            this.channels.Living.send({embeds: [{
                title: format(this.langTxt.sys.stop_timer, {time : this.getTimeFormatFromSec(this.remTime), cmd : this.langTxt.sys.cmd_resume_timer[0]}),
                color: this.langTxt.sys.system_color,
            }]});
        } else {
            ch.send(this.langTxt.sys.no_timer);
        }
    }

    // Resume the game timer 
    resumeTimer(ch : Discord.TextChannel) {
        if(this.isTimerProgress){
            this.stopTimerRequest = false;
            this.channels.Living.send({embeds: [{
                title: format(this.langTxt.sys.restart_timer, {time : this.getTimeFormatFromSec(this.remTime)}),
                color: this.langTxt.sys.system_color,
            }]});
        } else {
            ch.send(this.langTxt.sys.no_timer);
        }
    }

    // Update player recruitment status
    updateWantedEmb(mes : Discord.Message | null) {
        let message : Discord.Message | null
        if (mes != null) {
            message = mes;
        } else {
            let keys = Object.keys(this.interactControllers[InteractType.Accept]);
            if (keys.length == 0) return;
            if (keys.length >= 2) { 
                this.err();
                return;
            }
            message = this.interactControllers[InteractType.Accept][keys[0]];
        }
        const current_num = Object.keys(this.members).length;
        let   text : string = "";
        Object.keys(this.members).forEach((key, idx) => {
            text += this.members[key].nickname + "\n";
        });
        message.edit({embeds: [{
            title: format(this.langTxt.sys.Current_join_member_num, {num : current_num, max : this.reqMemberNum}),
            description : text,
            color: this.langTxt.sys.system_color,
        }]});
    }

    // Intraction for pressing join button
    async joinMemberInteract(interaction : Discord.ButtonInteraction, mes : Discord.Message) {
        let send_text : string = "";
        let ng = false;
        if (interaction.member == null)  return;
        if (typeof interaction.member.permissions === "string") {
            console.error("interaction.member.permissions type err", interaction.member.permissions);
            return;
        }
        if (interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)){
            this.sendErr(
                this.channels.Living,
                "",
                format(this.langTxt.p1.err_join_admin, {user_m : getUserMentionStr(interaction.user), cmd : this.langTxt.p1.cmd_join_force[0]}));
            ng = true;
        }
        if(!ng){
            const member = await this.guild.members.fetch(interaction.user.id)
            if(interaction.user.id in this.members){
                send_text += format(this.langTxt.p1.already_in, {user : getNicknameFromMem(member), leave : this.langTxt.p1.cmd_leave[0]});
            } else {
                this.members[interaction.user.id] = new GameMember(member);
                send_text += format(this.langTxt.p1.welcome, {user : getNicknameFromMem(member)});
            }
            interaction.reply({
                content: send_text,
                ephemeral: true
            });
            this.updateWantedEmb(mes);
        } else {
            interaction.update({}); // do nothing
        }
        const current_num = Object.keys(this.members).length;
        if(current_num == this.reqMemberNum){
            let send_text2 = format(this.langTxt.p1.member_full, {cmd : this.langTxt.p1.cmd_start[0]});
            this.channels.Living.send(send_text2);
        }
    }

    // Add a entry player to GameState.members and send a notification
    addEntrant(message : Discord.Message, force = false) {
        let send_text : string = "";
        let ng = false;
        if (message.member == null) return;
        if (message.member != null && message.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)){
            if(force){
                this.sendWarn(
                    this.channels.Living,
                    "",
                    format(this.langTxt.p1.warn_join_admin, {user_m : getUserMentionStr(message.author)}));
            } else {
                this.sendErr(
                    this.channels.Living,
                    "",
                    format(this.langTxt.p1.err_join_admin, {user_m : getUserMentionStr(message.author), cmd : this.langTxt.p1.cmd_join_force[0]})
                );
                ng = true;
            }
        }
        if(!ng){
            if(message.author.id in this.members){
                send_text += format(this.langTxt.p1.already_in, {user : getNicknameFromMes(message), leave : this.langTxt.p1.cmd_leave[0]});
            } else {
                this.members[message.author.id] = new GameMember(message.member);
                send_text += format(this.langTxt.p1.welcome, {user : getNicknameFromMes(message)});
            }
        }
        const current_num = Object.keys(this.members).length;
        send_text += "\n" + format(this.langTxt.p1.current_count, {num : current_num, all : this.reqMemberNum});
        if(current_num == this.reqMemberNum){
            send_text += "\n" + format(this.langTxt.p1.member_full, {cmd : this.langTxt.p1.cmd_start[0]});
        }
        this.channels.Living.send(send_text);
        this.updateWantedEmb(null);
    }
    
    // Accept declines from a entrant, remove him/her from GameState.members, and send a notification
    acceptDecline(message : Discord.Message){
        let send_text : string = "";
        if(message.author.id in this.members){
            delete this.members[message.author.id];
            send_text += format(this.langTxt.p1.see_you, {user : getNicknameFromMes(message)});
        }else{
            send_text += format(this.langTxt.p1.no_join, {user : getNicknameFromMes(message), member_list : this.langTxt.sys.cmd_member_list[0]});
        }
        const current_num = Object.keys(this.members).length;
        send_text += "\n" + format(this.langTxt.p1.current_count, {num : current_num, all : this.reqMemberNum});
        if(current_num == this.reqMemberNum){
            send_text += "\n" + format(this.langTxt.p1.member_full, {cmd : this.langTxt.p1.cmd_start[0]});
        }
        this.channels.Living.send(send_text);
        this.updateWantedEmb(null);
    }

    // Remove a entry player from GameState.members and send a notification
    removeEntrant(message : Discord.Message){
        let send_text : string = "";
        if(message.mentions.members == null) return;
        for(const mem of message.mentions.members){
            const uid = mem[0];
            if(uid in this.members){
                delete this.members[uid];
                send_text += format(this.langTxt.p1.see_you, {user : getNicknameFromMem(mem[1])});
            }else{
                send_text += format(this.langTxt.p1.no_join, {user : getNicknameFromMem(mem[1]), member_list : this.langTxt.sys.cmd_member_list[0]});
            }
            send_text += "\n";
        }
        const current_num = Object.keys(this.members).length;
        send_text += "\n" + format(this.langTxt.p1.current_count, {num : current_num, all : this.reqMemberNum});
        if(current_num == this.reqMemberNum){
            send_text += "\n" + format(this.langTxt.p1.member_full, {cmd : this.langTxt.p1.cmd_start[0]});
        }
        this.channels.Living.send(send_text);
        this.updateWantedEmb(null);
    }

    // Check player count requirement and prepare the game if met || return recruitment status if not met 
    async tryPreparingGame(message : Discord.Message, idx : number){

        // Check player count requirement
        const current_num = Object.keys(this.members).length;
        if(current_num < this.reqMemberNum){
            this.channels.Living.send(format(this.langTxt.p1.member_not_enough, {num : current_num, rem : this.reqMemberNum- current_num}));
            return;            
        }
        if(current_num > this.reqMemberNum){
            this.channels.Living.send(format(this.langTxt.p1.member_over, {num : current_num, over : current_num - this.reqMemberNum}));
            return;            
        }

        // gameTimer(this.gameId, this, Phase.p2_Preparation, [], dummy_gamePreparation);
        const scheduled_datetime_str = message.content.substring(this.langTxt.p1.cmd_start[idx].length).trim();
        console.log(scheduled_datetime_str);
        let scheduled_unixtime = 0;
        const scheduled_datetime = new Date(scheduled_datetime_str);
        console.log(scheduled_datetime);
        if (isNaN(scheduled_datetime.getTime())) {
            console.log("not converted to datetime");
            if (scheduled_datetime_str === "") {
                await this.gamePreparation(message);
            }
            return
        }
        scheduled_unixtime = Math.round(scheduled_datetime.getTime() / 1000);
        const role_assign_unixtime = scheduled_unixtime + this.ruleSetting.wish_role_time;
        const role_assign_datetime = new Date(role_assign_unixtime * 1000);
        const daytime_start_unixtime = role_assign_unixtime + this.ruleSetting.first_night.first_night_time;
        const daytime_start_datetime = new Date(daytime_start_unixtime * 1000);
        const wish_start_datetime_desc = format(
            this.langTxt.sys.wish_start_datetime_desc, 
            {datetime: scheduled_datetime.toLocaleString("ja-JP")}
        );
        const role_assign_datetime_desc = format(
            this.langTxt.sys.role_assign_datetime_desc, 
            {datetime: role_assign_datetime.toLocaleString("ja-JP")}
        );
        const daytime_start_datetime_desc = format(
            this.langTxt.sys.daytime_start_datetime_desc, 
            {datetime: daytime_start_datetime.toLocaleString("ja-JP")}
        );
        let schedule_desc = role_assign_datetime_desc + "\n" + daytime_start_datetime_desc;
        if (this.ruleSetting.wish_role_time > 0) {
            schedule_desc = wish_start_datetime_desc + "\n" + schedule_desc;
        }
        this.channels.Living.send({embeds: [{
            title       : this.langTxt.sys.scheduled_start,
            description : schedule_desc,
            color       : this.langTxt.sys.system_color,
        }]});
        // const target_unix_time = current_unix_time() + 60;
        if (scheduled_unixtime === 0) {
            return
        }
        console.log(scheduled_unixtime);
        let waiting = true;
        let go_next = false;
        const current_mn = 0 + this.magicnumber;
        while (waiting) {
            const now = current_unix_time();
            if (now >= scheduled_unixtime) {
                waiting = false;
                go_next = true;
            }
            if (current_mn != this.magicnumber) {
                waiting = false;
                go_next = false;
            }
            console.log(now);
            await my_sleep(1000);
        }
        if (go_next) {
            await this.gamePreparation(message);
        } else {
            this.channels.Living.send({embeds: [{
                title       : "cancel",
                description : "開始がキャンセルされました",
                color       : this.langTxt.sys.system_color,
            }]});
        }
    }

    // Reset the game and start recruiting players again
    async nextGame() {
        this.reset();
        await this.start_1Wanted();
        this.sendMemberList(this.channels.Living);
        const current_num = Object.keys(this.members).length;
        let send_text = format(this.langTxt.p1.current_count, {num : current_num, all : this.reqMemberNum});
        if(current_num == this.reqMemberNum){
            send_text += "\n" + format(this.langTxt.p1.member_full, {cmd : this.langTxt.p1.cmd_start[0]});
        }
        this.channels.Living.send(send_text);
        for(const mid in this.members){
            this.members[mid].isLiving = true;
        }
    }

    // Phase.p2_Preparation
    async gamePreparation(message : Discord.Message) {
        this.phase = Phase.p2_Preparation;
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

        if(this.ruleSetting.wish_role_time <= 0){
            console.log("this.ruleSetting.wish_role_time <= 0");
            await this.gamePreparation2();
        } else {
            console.log("this.ruleSetting.wish_role_time > 0");

            // Initialize interactControllers of wishRole
            this.interactControllers[InteractType.WishRole] = Object.create(null);

            // Send a message about wishRole at living ch
            this.channels.Living.send({embeds: [{
                title       : format(this.langTxt.p2.wish_role_preparations, {sec : this.ruleSetting.wish_role_time}),
                description : this.langTxt.p2.wish_role_desc2 + "\n" + format(this.langTxt.p2.wish_role_desc3, {n : this.ruleSetting.wish_role_rand_weight}),
                color       : this.langTxt.sys.system_color,
            }]});
            
            // Create wishRoleButton
            let rolesTxt = "";
            for (const r in this.defaultRoles) {
                if(this.defaultRoles[r] <= 0) continue;
                rolesTxt += this.langTxt.role_uni[r as Role] + " " + this.langTxt.role[r as Role] + "\n";
            }
            const embed = new Discord.EmbedBuilder({
                title       : format(this.langTxt.p2.wish_role_desc1, {sec : this.ruleSetting.wish_role_time}),
                description : this.langTxt.p2.wish_role_desc2 + "\n\n" + rolesTxt,
                color       : this.langTxt.sys.system_color,
            });
            for (const uid in this.members) {
                this.members[uid].wishRole = Object.create(null);
                for (const r in this.defaultRoles) {
                    if(this.defaultRoles[r] <= 0) continue;
                    this.members[uid].wishRole[r] = Math.ceil(WISHROLENUM / 2);
                }
                const uch = this.members[uid].uchannel;
                if (uch  == null) continue;

                const buttons_arr : Discord.ActionRowBuilder<Discord.ButtonBuilder>[] = [];
                for (const r in this.defaultRoles) {
                    buttons_arr.push(this.makeWishRoleButtons(uid, r as Role));
                }
                const components_arr: Discord.ActionRowBuilder<Discord.ButtonBuilder>[][] = Util.arrange_components(buttons_arr);
                for (let i = 0; i < components_arr.length; ++i) {
                    let sent_message;
                    if (i == 0) {
                        sent_message = await uch.send({embeds: [embed], components : components_arr[i]});
                    } else {
                        sent_message = await uch.send({components : components_arr[i]});
                    }
                    this.interactControllers[InteractType.WishRole][sent_message.id] = sent_message;
                }
            }
            this.remTime = this.ruleSetting.wish_role_time;
            console.log(`remTime: ${this.remTime}`);
            console.log(`this: ${this}`);
            console.log(`phase: ${this.phase}`);
            gameTimer(this.gameId, this, Phase.p2_Preparation, [], dummy_gamePreparation2);
        }
    }

    // Create role wish buttons
    makeWishRoleButtons(uid : string, r : Role) {
        const col = new Discord.ActionRowBuilder<Discord.ButtonBuilder>();
        const runi = this.langTxt.role_uni[r];
        const now = this.members[uid].wishRole[r];
        for(let i = 1; i <= WISHROLENUM; ++i) {
            if (i == now) {
                col.addComponents(
                    Util.make_button(
                        i + "_" + r, this.langTxt.role[r as Role] + runi,
                        {style : "green", emoji : this.langTxt.react.num[i]}
                    )
                );
            } else {
                col.addComponents(
                    Util.make_button(
                        i + "_" + r, runi,
                        {style : "black", emoji : this.langTxt.react.num[i]}
                    )
                );
            }
        }
        return col
    }

    // Update value of the role wish button
    wishRoleCheck(interaction : Discord.ButtonInteraction){
        type AorB = Discord.ActionRowBuilder<Discord.ButtonBuilder> | Discord.ActionRow<Discord.MessageActionRowComponent>;
        const value = parseInt(interaction.customId[0]);
        if (value < 1 || value > WISHROLENUM) return;
        const roleStr = interaction.customId.substring(2);
        const roleName= Object.keys(this.defaultRoles).find(role => role == roleStr) as Role | null;
        if(roleName == null) return;
        
        this.members[interaction.user.id].wishRole[roleName] = value;
        if (interaction.message.type != Discord.MessageType.Default ) return;

        const components = interaction.message.components;
        const new_components: AorB[] = [];
        const new_buttons = this.makeWishRoleButtons(interaction.user.id, roleName);
        for (let i = 0; i < components.length; ++i) {
            if (components[i].components[0].customId === "1_" + roleStr) {
                new_components[i] = new_buttons;
            } else {
                new_components[i] = components[i];
            }
        }
        interaction.update({components : new_components});
    }

    // http://www.prefield.com/algorithm/math/hungarian.html
    hungarian(mat : number[][]) {
        const n = mat.length;
        const inf = 1e9;
        let fx =  new Array<number>(n).fill(inf);
        let fy =  new Array<number>(n).fill(0);
        let x =  new Array<number>(n).fill(-1);
        let y =  new Array<number>(n).fill(-1);
        for (let i = 0; i < n; ++i) {
            for (let j = 0; j < n; ++j) {
                fx[i] = Math.max(fx[i], mat[i][j]);
            }
        }
        for (let i = 0; i < n; ) {
            let t =  new Array<number>(n).fill(-1);
            let s =  new Array<number>(n+1).fill(i);
            let q = 0;
            for (let p = 0; p <= q && x[i] < 0; ++p) {
                for (let k = s[p], j = 0; j < n && x[i] < 0; ++j) {
                    if (fx[k] + fy[j] != mat[k][j] || t[j] >= 0) continue;
                    s[++q] = y[j];
                    t[j] = k;
                    if (s[q] >= 0) continue;
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
                        if (t[j] >= 0) continue;
                        d = Math.min(d, fx[s[k]] + fy[j] - mat[s[k]][j]);
                    }
                }
                for (let j = 0; j < n; ++j) {
                    fy[j] += (t[j] < 0 ? 0 : d);
                }
                for (let k = 0; k <= q; ++k) {
                    fx[s[k]] -= d;
                }
            } else {
                ++i;
            }
        }
        return x;
    }

    // Remove first victims, assign roles, prepare common rooms, send messages, start the first night
    async gamePreparation2() {

        console.log("gamePreparation2");

        const enable_confirmation = ((this.ruleSetting.wish_role_time <= 0) && (this.ruleSetting.confirmation_sec > 0));

        // Remove first victims
        let possible_victims_as_roles = [];
        for(const r in this.defaultRoles){
            if (this.possibleFirstVictimRoles[r]) {
                for(let i = 0; i < this.defaultRoles[r]; ++i){
                    possible_victims_as_roles.push(r);
                }
            } else {
                this.playingRoles[r] = this.defaultRoles[r];
            }
        }
        possible_victims_as_roles = shuffle(possible_victims_as_roles);
        // const first_victims_as_roles = possible_victims_as_roles.slice(0, this.ruleSetting.first_victim_count);
        const survivors_as_roles = possible_victims_as_roles.slice(this.ruleSetting.first_victim_count);

        for (const r of survivors_as_roles) {
            if (r in this.playingRoles) {
                this.playingRoles[r] += 1;
            } else {
                this.playingRoles[r] = 1;
            }
        }
        console.log("this.playingRoles:");
        console.log(this.playingRoles);

        // Assign roles
        let role_arr : Role[] = [];
        if (this.ruleSetting.wish_role_time <= 0) {
            console.log("this.ruleSetting.wish_role_time <= 0");
            for(const r in this.playingRoles){
                for(let i = 0; i < this.playingRoles[r]; ++i){
                    role_arr.push(r as Role);
                }
            }
            role_arr = shuffle(role_arr);
        } else {
            console.log("this.ruleSetting.wish_role_time > 0");            
            let roles : Role[] = [];
            for (const r in this.playingRoles) {
                for (let i = 0; i < this.playingRoles[r]; ++i) {
                    roles.push(r as Role);
                }
            }
            console.log("roles before shuffle:");
            console.log(roles);
            roles = shuffle(roles);
            console.log("roles after shuffle:");
            console.log(roles);

            this.interactControllers[InteractType.WishRole] = Object.create(null);
            const members = shuffle(Object.keys(this.members));
            console.log("members:");
            console.log(members);
            const scale = 100000;
            let mat : number[][] = new Array<number[]>(members.length);
            for(let i = 0; i < members.length; ++i){
                mat[i] = [];
                const uid = members[i];
                for(let j = 0; j < roles.length; ++j){
                    const r = roles[j];
                    const score =
                        Math.floor(Math.random() * this.ruleSetting.wish_role_rand_weight * scale)
                        + scale * this.members[uid].wishRole[r];
                    mat[i].push(score);
                }
            }
            
            const res = this.hungarian(mat);
            Object.keys(this.members).forEach((uid, idx)=>{
                for(let i = 0; i < members.length; ++i){
                    if(uid == members[i]){
                        role_arr[idx] = roles[res[i]];
                    }
                }
            });
        }

        // Prepare werewolf room
        let WerewolfRoomField : Discord.EmbedField = {name : this.langTxt.p2.mate_names_title, value : "", inline : true};
        let WerewolfNames     = "";

        // Prepare mason room
        let MasonRoomField : Discord.EmbedField = {name : this.langTxt.p2.mate_names_title, value : "", inline : true};
        let MasonNames     = "";

        // Assign players to werewolf or mason rooms
        Object.keys(this.members).forEach((uid, i)=>{
            const r = role_arr[i];
            this.members[uid].role = r;
            const allowWolfRoom = (r == Role.Werewolf || r == Role.Communicatable);
            const allowMasonRoom = (r == Role.Mason);
            this.members[uid].alpStr = this.langTxt.react.alp[i];
            this.members[uid].allowWolfRoom = allowWolfRoom;
            this.members[uid].allowMasonRoom = allowMasonRoom;
            if (allowWolfRoom) {
                WerewolfRoomField.value += this.members[uid].nickname + " (" + this.langTxt.role[r]+ ")\n";
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
            if(!this.members[id].isLiving) continue;
            const r = this.members[id].role;
            if(r == null) return this.err();
            if(r == Role.Werewolf) {
                wolfNum += 1;
            } else {
                humanNum += 1;
            }
        }
        if (humanNum <= wolfNum) {
            this.gameEnd(TeamNames.Evil);
            return
        }
        if (wolfNum == 0) {
            this.gameEnd(TeamNames.Good);
            return
        }

        this.resetReactedMember();
        this.p2CanForceStartGame = false;
        
        const werewolf_role_str = Role.Werewolf;
        const werewolf_team = getDefaultTeams(werewolf_role_str);
        const werewolf_embed = new Discord.EmbedBuilder({
            title       : format(this.langTxt.werewolf.start_room_title, {names : WerewolfNames}),
            description : this.langTxt.role_descs[werewolf_role_str],
            color       : this.langTxt.team_color[werewolf_team],
            thumbnail   : {url: this.langTxt.role_img[werewolf_role_str]},
            fields      : [WerewolfRoomField],
        });
        { // for Werewolf
            this.channels.Werewolf.send({embeds: [werewolf_embed]});
        }

        const mason_role_str = Role.Mason;
        const mason_team = getDefaultTeams(werewolf_role_str);
        const mason_embed = new Discord.EmbedBuilder({
            title       : format(this.langTxt.mason.start_room_title, {names : MasonNames}),
            description : this.langTxt.role_descs[mason_role_str],
            color       : this.langTxt.team_color[mason_team],
            thumbnail   : {url: this.langTxt.role_img[mason_role_str]},
            fields      : [MasonRoomField],
        });
        { // for Mason
            this.channels.Mason.send({embeds: [mason_embed]});
        }

        Object.keys(this.members).forEach(async uid => {
            if (!(uid in this.members)) return this.err();
            const uch = this.members[uid].uchannel;
            if (uch == null) return this.err();

            const role_str = this.members[uid].role;
            if (role_str == null) return this.err();
            const team = getDefaultTeams(role_str);
            let fields : Discord.EmbedField[] = [];
            if (this.members[uid].allowWolfRoom) {
                fields.push(WerewolfRoomField);
            }
            if (this.members[uid].role == Role.Mason) {
                fields.push(MasonRoomField);
            }
            const embed = new Discord.EmbedBuilder({
                title       : format(this.langTxt.p2.announce_role, {role : this.langTxt.role[role_str], team : this.langTxt.team_name[team]}),
                description : this.langTxt.role_descs[role_str],
                color       : this.langTxt.team_color[team],
                thumbnail   : {url: this.langTxt.role_img[role_str]},
                fields      : fields,
                author      : {name: this.members[uid].nickname, iconURL: this.members[uid].user.displayAvatarURL()},
            });
            uch.send({embeds: [embed]});
            
            if (this.members[uid].role == Role.Fanatic) {
                uch.send({embeds: [werewolf_embed]});
            }
            if (enable_confirmation) {
                const sent_message = await uch.send({
                    content : getUserMentionStr(this.members[uid].user) + " " + this.langTxt.p2.announce_next,
                    components : [new Discord.ActionRowBuilder<Discord.ButtonBuilder>().addComponents(Util.make_button("accept", this.langTxt.react.o, {style : "black"}))]
                });
                this.interactControllers[InteractType.Accept][sent_message.id] = sent_message;
            }
        });
        if (enable_confirmation) {
            this.channels.Living.send({embeds:[{
                title       : format(this.langTxt.p2.done_preparations, {sec : this.ruleSetting.confirmation_sec}),
                color       : this.langTxt.sys.system_color,
            }]});
            this.timerList.push(setTimeout(this.checkAcceptTimeout, this.ruleSetting.confirmation_sec *1000, this.gameId, this));
        } else {
            this.startFirstNight();
        }
    }

    // Get user channel name
    getUserChannelName(uname : string){
        return format(this.langTxt.sys.user_room_name, {user : uname})
            .toLowerCase()
            .replace(/[\s\(\)\{\}\\\/\[\]\*\+\.\?\^\$\|!"#%&'=~`<>@[;:,]/g, '');
    }

    // Search user channel, if not found, create user channel
    async searchUserChannel(message : Discord.Message){
        if(message.guild == null) return this.err();

        const keys = Object.keys(this.members);
        await Promise.all(keys.map(async uid => {
            if(message.guild == null) return this.err();
            if(!(uid in this.members)) return;
            const user = this.members[uid].user;
            const ch_name = this.getUserChannelName(this.members[uid].nickname);

            let perm : Discord.OverwriteResolvable[] = [];
            perm.push({id: message.guild.id, allow: NoAccess_alw, deny: NoAccess_dny});
            message.guild.members.cache.forEach(m => {
                if (this.clients[0].user != null && m.id === this.clients[0].user.id) {
                    perm.push({id: m.id, allow: Admin_alw, deny: Admin_dny});
                } else if (m.id === uid){
                    perm.push({id: m.id, allow: RW_alw, deny: RW_dny});
                }
            });
            const guild = message.guild;
            let user_ch = guild.channels.cache.find(c => {
                return c.name == ch_name && c.type === Discord.ChannelType.GuildText && c.parentId == this.parentID;
            }) as Discord.TextChannel | null;
            if(user_ch != null){
                console.log("Found ", user.username, " channnel", user_ch.id);
                user_ch.permissionOverwrites.set(perm);
            } else {
                user_ch = await message.guild.channels.create<Discord.ChannelType.GuildText>(
                    {
                        name : ch_name,
                        parent : this.parentID,
                        type : Discord.ChannelType.GuildText,
                        position : 1,
                        permissionOverwrites: perm
                    }
                );
                console.log("New ", user.username, " channnel", user_ch.id);
            }
            if(user_ch == null) return this.err();
            this.members[uid].uchannel  = user_ch;
        }));
        return true;
    }

    // 
    preparationAccept(uid : string, interaction : Discord.ButtonInteraction | null){
        console.log("[EMIT] preparationAccept");
        if(Object.keys(this.members).find(k => k == uid) == null) return;
        if(Object.keys(this.reactedMember).find(u => u == uid) != null){
            if (interaction != null) {
                interaction.reply(this.langTxt.p2.already_ac);
            } else {
                const uch = this.members[uid].uchannel;
                if (uch) uch.send(this.langTxt.p2.already_ac);
            }
            return;
        }
        if (interaction != null) {
            interaction.reply(format(this.langTxt.p2.new_accept, {user : this.members[uid].nickname}));
        } else {
            const uch = this.members[uid].uchannel;
            if (uch) uch.send(format(this.langTxt.p2.new_accept, {user : this.members[uid].nickname}));
        }
        this.reactedMember[uid] = 1;
        if(Object.keys(this.reactedMember).length == Object.keys(this.members).length){
            this.channels.Living.send(this.langTxt.p2.all_accept);
            this.startFirstNight();
        }
    }


    checkAcceptTimeout(gid : number, obj : GameState){
        if(gid != obj.gameId) return;
        if(obj.phase != Phase.p2_Preparation) return;
        let non_ac_users = "";
        Object.keys(obj.members).forEach(uid =>{
            if(Object.keys(obj.reactedMember).find(u => u == uid) == null){
                non_ac_users += getUserMentionStrFromId(uid)+ " ";
            }
        })
        obj.channels.Living.send(format(obj.langTxt.p2.incomplete_ac, {users:non_ac_users, cmd:obj.langTxt.p2.cmd_start_force[0]}));
        obj.p2CanForceStartGame = true;
    }


    forceStartGame(){
        if(this.p2CanForceStartGame){
            this.p2CanForceStartGame = false;
            this.channels.Living.send(this.langTxt.p2.force_start);
            this.startFirstNight();
        }else{
            this.channels.Living.send(format(this.langTxt.p2.cant_force_start, {sec : this.ruleSetting.confirmation_sec}));
        }
    }

    // Phase.p3_FirstNight
    startFirstNight() {
        this.phase = Phase.p3_FirstNight;
        this.remTime = this.ruleSetting.first_night.first_night_time;
        this.updateRoomsRW();
        this.interactControllers[InteractType.Accept] = Object.create(null);
        for(let my_id in this.members){
            const uch = this.members[my_id].uchannel;
            if(uch == null) return this.err();
            if(this.members[my_id].role == Role.Seer){
                if(this.ruleSetting.first_sight === 'no_sight'){
                    uch.send(getUserMentionStrFromId(my_id) + this.langTxt.p3.no_sight);
                }else if(this.ruleSetting.first_sight === 'random'){
                    let ulist : string[] = Object.keys(this.members).filter( tid =>{
                        return tid != my_id;
                    })
                    uch.send(getUserMentionStrFromId(my_id) + this.langTxt.p3.random_sight);
                    if(ulist.length == 0){
                        this.sendFP_Result(my_id, uch, null, this.langTxt.seer, this.langTxt.role_img.Seer);
                    } else{
                        this.sendFP_Result(my_id, uch, ulist[Math.floor(Math.random()*ulist.length)], this.langTxt.seer, this.langTxt.role_img.Seer);
                    }
                }else if(this.ruleSetting.first_sight === 'random_white'){
                    let ulist : string[] = Object.keys(this.members).filter( tid =>{
                        if(tid == my_id) return false;
                        const tRole = this.members[tid].role;
                        if(tRole == null) return this.err();
                        return SightResult(tRole) != TeamNames.Evil;
                    })
                    uch.send(getUserMentionStrFromId(my_id) + this.langTxt.p3.random_white_sight);
                    if(ulist.length == 0){
                        this.sendFP_Result(my_id, uch, null, this.langTxt.seer, this.langTxt.role_img.Seer);
                    } else{
                        this.sendFP_Result(my_id, uch, ulist[Math.floor(Math.random()*ulist.length)], this.langTxt.seer, this.langTxt.role_img.Seer);
                    }
                }else{
                    assertUnreachable(this.ruleSetting.first_sight);
                }
            }
        }
        
        this.killNext = [];
        for (let step = 0; step < this.ruleSetting.first_victim_count; step++) {
            this.killNext.push(["0", 0]);
        }
        
        this.channels.Living.send({embeds:[{
            title: format(
                this.langTxt.p3.length_of_the_first_night,
                {
                    time: this.getTimeFormatFromSec(this.remTime),
                    date: date_str(current_unix_time() + this.remTime),
                    hhmmss: hhmmss_str(current_unix_time() + this.remTime),
                }
            ),
            color: this.langTxt.sys.system_color,
        }]});
        // this.httpGameState.updatePhase(this.langTxt.p3.phase_name);
        this.stopTimerRequest = false;
        gameTimer(this.gameId, this, Phase.p3_FirstNight, this.ruleSetting.first_night.alert_times, dummy_startP4Daytime);
    }

    // Phase.p4_Daytime
    async startP4_Daytime(){
        this.phase = Phase.p4_Daytime;
        this.dayNumber += 1;
        this.updateRoomsRW();
        let living     : string = "";
        let living_num : number = 0;
        for (const uid in this.members) {
            this.members[uid].validVoteID = [];
            if(this.members[uid].isLiving){
                living += this.members[uid].nickname + "\n";
                living_num += 1;
            }
        }
        
        if (this.killNext.length == 1) {
            const p = this.killNext[0];
            const uid = p[0];
            const uname = this.members[uid] ? this.members[uid].nickname : this.langTxt.p4.anonymous_name;            
            const thumb = this.members[uid] ? this.members[uid].user.displayAvatarURL() : "" ;
            const embed = new Discord.EmbedBuilder({
                author    : {name: format(this.langTxt.p4.day_number, {n : this.dayNumber})},
                title     : format(this.langTxt.p4.killed_morning, {user : uname}),
                color     : this.langTxt.sys.killed_color,
                thumbnail : {url: thumb},
                fields    : [{name : format(this.langTxt.p4.living_and_num, {n : living_num}), value: living, inline : true}]
            });
            this.channels.Living.send({embeds: [embed]});
            this.channels.GameLog.send({embeds: [embed]});
        } else if (this.killNext.length === 0) {
            const embed = new Discord.EmbedBuilder({
                author    : {name: format(this.langTxt.p4.day_number, {n : this.dayNumber})},
                title     : this.langTxt.p4.no_killed_morning,
                color     : this.langTxt.sys.no_killed_color,
                fields    : [{name : format(this.langTxt.p4.living_and_num, {n : living_num}), value: living, inline : true}]
            });
            this.channels.Living.send({embeds: [embed]});
            this.channels.GameLog.send({embeds: [embed]});
        } else {
            const players = this.killNext;
            const uids = players.map((player) => player[0]);
            const unames = uids.map((uid, idx) => {
                if (this.members[uid]) {
                    return this.members[uid].nickname
                } else {
                    return this.langTxt.p4.anonymous_name + (idx + 1)
                }
            });
            const title_txt: string = unames.reduce(
                (acc: string, val: string) => acc + format(this.langTxt.p4.killed_morning, {user : val}) + "\n",
                "",
            );
            const embed = new Discord.EmbedBuilder({
                author    : {name: format(this.langTxt.p4.day_number, {n : this.dayNumber})},
                title     : title_txt,
                color     : this.langTxt.sys.killed_color,
                // thumbnail : {},
                fields    : [{name : format(this.langTxt.p4.living_and_num, {n : living_num}), value: living, inline : true}]
            });
            this.channels.Living.send({embeds: [embed]});
            this.channels.GameLog.send({embeds: [embed]});
        }
        this.killNext    = [];

        if(this.defaultRoles[Role.Baker] > 0){
            if(Object.keys(this.members).some(uid => this.members[uid].isLiving && this.members[uid].role == Role.Baker)){
                const bread = this.langTxt.baker.repertoire[Math.floor(Math.random() * this.langTxt.baker.repertoire.length)];
                const embed = new Discord.EmbedBuilder({
                    author    : {name: this.langTxt.role.Baker, iconURL: this.langTxt.role_img.Baker},
                    title     : format(this.langTxt.baker.deliver, {bread : bread}),
                    color     : this.langTxt.team_color.Good,
                });
                this.channels.Living.send({embeds: [embed]});
            } else if(Object.keys(this.members).some(uid => this.members[uid].livingDays == this.dayNumber-1 && this.members[uid].role == Role.Baker)){
                const embed = new Discord.EmbedBuilder({
                    author    : {name: this.langTxt.role.Baker, iconURL: this.langTxt.role_img.Baker},
                    title     : this.langTxt.baker.killed,
                    color     : this.langTxt.sys.killed_color,
                });
                this.channels.Living.send({embeds: [embed]});
            }
        }

        this.remTime = Math.max(0, this.ruleSetting.day.length - this.ruleSetting.day.reduction_time * (this.dayNumber - 1));
        this.channels.Living.send({embeds:[{
            title: format(
                this.langTxt.p4.length_of_the_day,
                {
                    time : this.getTimeFormatFromSec(this.remTime),
                    date: date_str(current_unix_time() + this.remTime),
                    hhmmss: hhmmss_str(current_unix_time() + this.remTime),
                }
            ),
            color: this.langTxt.sys.system_color,
        }]});
        this.daytimeStartTime = Date.now();
        await this.makeDictatorController();
        this.voteNum     = 0;
        this.runoffNum   = 0;
        this.stopTimerRequest = false;

        for (let my_id in this.members) {
            if (!this.members[my_id].isLiving) continue;
            const uch = this.members[my_id].uchannel;
            if (uch == null) return this.err();
            const component = new Discord.ActionRowBuilder<Discord.ButtonBuilder>().addComponents(
                Util.make_button(
                    "cut_time", 
                    this.langTxt.p4.cut_time_label, 
                    {style : "red"}
                )
            );
            const sent_message = await uch.send(
                {
                    content: this.langTxt.sys.cuttime_desc,
                    components: [component]
                }
            );
            this.interactControllers[InteractType.CutTime][sent_message.id] = sent_message;
        }
        
        gameTimer(this.gameId, this, Phase.p4_Daytime, this.ruleSetting.day.alert_times, dummy_startP5Vote);

    }

    async makeDictatorController(){
        if(this.defaultRoles[Role.Dictator] <= 0) return;
        this.interactControllers[InteractType.Dictator] = Object.create(null);

        this.dictatorVoteMode = "";
        for(const uid in this.members){
            if(!this.members[uid].isLiving) continue;
            if(this.members[uid].role != Role.Dictator) continue;
            if(this.members[uid].roleCmdInvokeNum > 0) continue;
            const uch  = this.members[uid].uchannel;
            if(uch == null) continue;
            const embed= new Discord.EmbedBuilder({
                author      : {name: this.langTxt.dictator.button_title, iconURL: this.langTxt.role_img.Dictator},
                title       : this.langTxt.dictator.button_desc,
                color       : this.langTxt.sys.killed_color,
            });
            const components: Discord.ActionRowBuilder<Discord.ButtonBuilder>[] = [
                new Discord.ActionRowBuilder<Discord.ButtonBuilder>()
                    .addComponents(
                        Util.make_button(
                            "dictator",
                            this.langTxt.dictator.uni,
                            {style : "red"}
                        )
                    ) as Discord.ActionRowBuilder<Discord.ButtonBuilder>
            ];

            const sent_message = await uch.send({embeds:[embed], components:components});
            this.interactControllers[InteractType.Dictator][sent_message.id] = sent_message;
        }
    }

    async dictatorCheck(interaction : Discord.ButtonInteraction) {
        const uch  = this.members[interaction.user.id].uchannel;
        if(uch == null) return;
        this.members[interaction.user.id].roleCmdInvokeNum++;
        const embed= new Discord.EmbedBuilder({
            author      : {name: this.langTxt.role.Dictator, iconURL: this.langTxt.role_img.Dictator},
            title       : this.langTxt.dictator.exercise,
            color       : this.langTxt.sys.killed_color,
        });
        for(const uid in this.members){
            if(!this.members[uid].isLiving) continue;
            const uch = this.members[uid].uchannel;
            if(uch == null) continue;
            uch.send({embeds:[embed]});
        }
        this.channels.Living.send({embeds:[embed]});
        this.dictatorVoteMode = interaction.user.id;
        await this.startP5_Vote();
    }

    // Phase.p5_Vote. Do not use "this." in the function
    async startP5_Vote(){
        //! no use "this."
        if(this.voteNum === 0){
            this.channels.Living.send({embeds:[{
                title: format(
                    this.langTxt.p5.end_daytime,
                    {
                        time : this.getTimeFormatFromSec(this.ruleSetting.vote.length),
                        date: date_str(current_unix_time() + this.ruleSetting.vote.length),
                        hhmmss: hhmmss_str(current_unix_time() + this.ruleSetting.vote.length),
                    }),
                color: this.langTxt.sys.system_color,
            }]});
        }

        this.interactControllers[InteractType.Dictator] = Object.create(null);
        this.cutTimeMember = Object.create(null);
        this.phase = Phase.p5_Vote;
        this.updateRoomsRW();

        for(const uid in this.members){
            if(!this.members[uid].isLiving) continue;
            const uch = this.members[uid].uchannel;
            if(uch == null) return this.err();
            this.members[uid].voteTo = "";
            if(this.dictatorVoteMode != "" && this.dictatorVoteMode != uid) continue;
            
            for(const tid in this.members){
                if(tid == uid) continue;
                if(!this.members[tid].isLiving) continue;
                this.members[uid].validVoteID.push(tid);
            }
        }
        {
            const ti = (this.voteNum == 0 ? "" : format(this.langTxt.p5.revote_times, {m : this.voteNum+1}));

            let buttons : Discord.ButtonBuilder[] = [];
            for(const tid in this.members){
                if(!this.members[tid].isLiving) continue;
                buttons.push(Util.make_button(tid, this.members[tid].nickname, {style : "black"}));
            }
            const components = Util.arrange_buttons(buttons);
            const embed = new Discord.EmbedBuilder({
                title       : format(this.langTxt.p5.vote_title, {n : this.dayNumber, time : ti}),
                color       : this.langTxt.sys.system_color,
            });
            const sent_message = await this.channels.Living.send({
                embeds: [embed],
                components: components
            });
            this.interactControllers[InteractType.Vote][sent_message.id] = sent_message;
        }
        this.remTime = this.ruleSetting.vote.length;
        this.stopTimerRequest = false;
        gameTimer(this.gameId, this, Phase.p5_Vote, this.ruleSetting.vote.alert_times, dummy_voteTimeup);
    }
    
    async voteTimeup(){
        this.interactControllers[InteractType.Vote] = Object.create(null);
    
        let cnt : {[key: string]: number} = Object.create(null);
        for(const uid in this.members){ 
            cnt[uid] = 0;
        }
        let max_cnt = 0;
        let max_uid : string[] = [];
        for(const uid in this.members){ 
            if(!this.members[uid].isLiving) continue;
            if(this.members[uid].voteTo == "") continue;
            const n = cnt[this.members[uid].voteTo] + 1;
            cnt[this.members[uid].voteTo] = n;
            if(max_cnt < n){
                max_cnt = n;
            }
        }
        let living_num = 0;
        for(const uid in this.members){ 
            if(!this.members[uid].isLiving) continue;
            living_num += 1;
            const n = cnt[uid];
            if(n == max_cnt){
                max_uid.push(uid);
            }
        }
    
        const open = (this.ruleSetting.vote.place == 'realtime_anonym_open' || 
                      this.ruleSetting.vote.place == 'after_open' ||
                      this.ruleSetting.vote.place == 'realtime_open');
    
        let desc : string = "";
        if(this.ruleSetting.vote.place == 'no_open'){
            desc = this.langTxt.p5.after_no_open;
        } else {
            let data : [number, string, string][] = []; // cnt, to, from
            for(const uid in this.members){ 
                if(!this.members[uid].isLiving) continue;
                data.push([cnt[uid], this.members[uid].voteTo, uid]);
            }
            data.sort();
            for(let i = data.length - 1; i >= 0; --i){
                if(!open){
                    desc += format(this.langTxt.p5.after_open_anonym, {from:this.members[data[i][2]].nickname, n:data[i][0]}) + "\n";
                }else if(data[i][1] == ""){
                    desc += format(this.langTxt.p5.after_open_format_n, {from:this.members[data[i][2]].nickname, n:data[i][0]}) + "\n";
                } else {
                    const to = this.members[data[i][1]].nickname;
                    desc += format(this.langTxt.p5.after_open_format, {from:this.members[data[i][2]].nickname, to:to, n:data[i][0]}) + "\n";
                }
            }
        }
        for(const uid in this.members){ 
            this.members[uid].voteTo = "";
        }
    
        const isLastVote = this.voteNum === this.ruleSetting.vote.revote_num;
    
        const ti = (this.voteNum == 0 ? "" : format(this.langTxt.p5.revote_times, {m : this.voteNum+1}));
        if (max_uid.length === 1 || (isLastVote && this.ruleSetting.vote.when_even == "random")) {
            const eid = max_uid[Math.floor(Math.random() * max_uid.length)];
            const embed = new Discord.EmbedBuilder({
                title: format(this.langTxt.p5.executed, {n: this.dayNumber, user : this.members[eid].nickname, time:ti}),
                description : desc,
                thumbnail   : {url: this.members[eid].user.displayAvatarURL()},
                color : this.langTxt.sys.killed_color,
                footer : {text: format(this.langTxt.p5.living_num, {n : living_num-1})},
            });
            this.channels.Living.send({embeds:[embed]});
            this.channels.GameLog.send({embeds:[embed]});
            this.lastExecuted = eid;
            await this.kickMember(eid, KickReason.Vote);
        } else if(isLastVote) {
            const embed = new Discord.EmbedBuilder({
                title: format(this.langTxt.p5.final_even, {n: this.dayNumber, time:ti}),
                description : desc,
                color : this.langTxt.sys.no_killed_color,
                footer : {text: format(this.langTxt.p5.living_num, {n : living_num})},
            });
            this.channels.Living.send({embeds:[embed]});
            this.channels.GameLog.send({embeds:[embed]});
            this.lastExecuted = "";
            await this.startP6_Night();
        } else {
            const embed = new Discord.EmbedBuilder({
                title: format(this.langTxt.p5.revote, {n: this.dayNumber, time:ti}),
                description : desc,
                color : this.langTxt.sys.system_color,
            });
            this.channels.Living.send({embeds:[embed]});
            this.channels.GameLog.send({embeds:[embed]});
            this.voteNum += 1;
            await this.startP5_Vote();
        }
    }

    createVoteEmbed(from: Discord.EmbedAuthorOptions, text : string, uid : string) {
        return new Discord.EmbedBuilder()
            .setAuthor(from)
            .setTitle(format(text, {user: this.members[uid].nickname}))
            .setThumbnail(this.members[uid].avatar)
            .setColor(this.langTxt.sys.system_color)
    }
    
    voteCheckInteract(interaction : Discord.ButtonInteraction){
        const uid = interaction.user.id;
        const tid = interaction.customId;
        if(tid == null) return;
        const uch = this.members[uid].uchannel;
        if(uch == null) return this.err();

        const realtime = 
            this.ruleSetting.vote.place == 'realtime_open' ||
            this.ruleSetting.vote.place == 'realtime_anonym' ||
            this.ruleSetting.vote.place == 'realtime_anonym_open';

        if(this.members[uid].validVoteID.find(i => i == tid) == null) {
            interaction.reply( {content : this.langTxt.p5.no_selfvote, ephemeral : true});
            return;
        }
        const change = this.members[uid].voteTo != "";
        const author: Discord.EmbedAuthorOptions = {
            name : this.members[uid].nickname,
            iconURL : this.members[uid].avatar
        };
        if(realtime && change){
            interaction.reply({
                embeds:[this.createVoteEmbed(author, this.langTxt.p5.no_revoting, this.members[uid].voteTo)],
                ephemeral: true
            });
            return;
        }
        const tName = this.members[tid].nickname;
        if(this.members[uid].voteTo == tid){
            interaction.reply({
                embeds:[this.createVoteEmbed(author, this.langTxt.p5.already_vote, tid)],
                ephemeral: true
            });
            return;
        }
        this.members[uid].voteTo = tid;
        if(!realtime){
            if(change){
                interaction.reply({
                    embeds:[this.createVoteEmbed(author, this.langTxt.p5.vote_change, tid)],
                    ephemeral: true
                });
            }else{
                interaction.reply({
                    embeds:[this.createVoteEmbed(author, this.langTxt.p5.vote_accept, tid)],
                    ephemeral: true
                });
            }
        } else if(this.ruleSetting.vote.place == 'realtime_open') {
            interaction.reply({
                embeds:[this.createVoteEmbed(author, this.langTxt.p5.vote_accept_1, tid)],
                ephemeral: false
            });
            this.channels.Living.send(format(this.langTxt.p5.vote_format, {to : tName, from : this.members[uid].nickname}));
        } else {
            interaction.reply({
                embeds:[this.createVoteEmbed(author, this.langTxt.p5.vote_accept_1, tid)],
                ephemeral: false
            });
            this.channels.Living.send(format(this.langTxt.p5.vote_anonym_format, {to : tName}));
        }
    }

    // Phase.p6_Night
    async startP6_Night(){
        this.phase = Phase.p6_Night;
        this.remTime = this.ruleSetting.night.length;
        this.updateRoomsRW();

        const nightComingMessage = format(
            this.langTxt.p6.start,
            {
                time : this.getTimeFormatFromSec(this.remTime),
                date: date_str(current_unix_time() + this.remTime),
                hhmmss: hhmmss_str(current_unix_time() + this.remTime),
            }
        );
        const nightComingEmbed = {embeds:[new Discord.EmbedBuilder({
            title       : nightComingMessage,
            color       : this.langTxt.sys.system_color,
        })]};
        this.channels.Living.send(nightComingEmbed);
        this.cutTimeMember = Object.create(null);
        for(let my_id in this.members){
            this.members[my_id].voteTo = "";
            if(!this.members[my_id].isLiving) continue;
            const uch = this.members[my_id].uchannel;
            if(uch == null) return this.err();
            const role = this.members[my_id].role;

            if(role == Role.Priest){
                uch.send(getUserMentionStrFromId(my_id) + nightComingMessage);
                this.sendFP_Result(my_id, uch, this.lastExecuted, this.langTxt.priest, this.langTxt.role_img.Priest);
            }else if(role == Role.Knight){
                uch.send(getUserMentionStrFromId(my_id) + nightComingMessage);
                this.interactControllers[InteractType.Knight] = Object.create(null);
                this.members[my_id].validVoteID = [];
                let lastGuard = "";
                if(!this.ruleSetting.continuous_guard && this.members[my_id].actionLog.length > 0){
                    lastGuard = this.members[my_id].actionLog.slice(-1)[0][0];
                }
                let buttons    : Discord.ButtonBuilder[] = [];
                for(const tid in this.members){
                    if(tid == my_id) continue;
                    if(tid == lastGuard) continue;
                    if(!this.members[tid].isLiving) continue;
                    this.members[my_id].validVoteID.push(tid);
                    buttons.push(Util.make_button(tid, this.members[tid].nickname, {style : "blue"}));
                }
                const embed = new Discord.EmbedBuilder({
                    author      : {name: this.langTxt.role[role], iconURL: this.langTxt.role_img[role]},
                    title       : this.langTxt.knight.title,
                    color       : this.langTxt.team_color[getDefaultTeams(role)],
                });
                const sent_message = await uch.send({
                    embeds: [embed],
                    components: Util.arrange_buttons(buttons)
                })
                this.interactControllers[InteractType.Knight][sent_message.id] = sent_message;
            } else if(role == Role.Seer){
                uch.send(getUserMentionStrFromId(my_id) + nightComingMessage);
                this.interactControllers[InteractType.Seer] = Object.create(null);
                this.members[my_id].validVoteID = [];
                let buttons    : Discord.ButtonBuilder[] = [];
                for(const tid in this.members){
                    if(tid == my_id) continue;
                    if(!this.members[tid].isLiving) continue;
                    if(this.members[my_id].actionLog.find(p => p[0] == tid) != null) continue;
                    this.members[my_id].validVoteID.push(tid);
                    buttons.push(Util.make_button(tid, this.members[tid].nickname, {style : "blue"}));
                }
                if(this.members[my_id].validVoteID.length == 0){
                    this.sendFP_Result(my_id, uch, null, this.langTxt.seer, this.langTxt.role_img.Seer);
                } else {
                    const embed = new Discord.EmbedBuilder({
                        author      : {name: this.langTxt.role[role], iconURL: this.langTxt.role_img[role]},
                        title       : this.langTxt.seer.title,
                        color       : this.langTxt.team_color[getDefaultTeams(role)],
                    });
                    if(this.members[my_id].validVoteID.length == 1){
                        uch.send({embeds: [embed]});
                        this.sendFP_Result(my_id, uch, this.members[my_id].validVoteID[0], this.langTxt.seer, this.langTxt.role_img.Seer);
                        this.members[my_id].validVoteID = [];
                    }else{
                        const sent_message = await uch.send({
                            embeds: [embed],
                            components: Util.arrange_buttons(buttons)
                        })
                        this.interactControllers[InteractType.Seer][sent_message.id] = sent_message;
                    }
                }
            } else if(this.members[my_id].allowWolfRoom){
            } else {
                uch.send(nightComingEmbed);
            }
        }
        { // for Werewolf
            this.interactControllers[InteractType.Werewolf] = Object.create(null);
            const role = Role.Werewolf;
            this.wolfValidTo   = [];
            this.wolfValidFrom = [];
            this.wolfVote = "";
            let buttons    : Discord.ButtonBuilder[] = [];
            for(const tid in this.members){
                if(!this.members[tid].isLiving) continue;
                if(this.members[tid].role == Role.Werewolf) continue;
                this.wolfValidTo.push(tid);
                buttons.push(Util.make_button(tid, this.members[tid].nickname, {style : "blue"}));
            }
            const embed = new Discord.EmbedBuilder({
                author      : {name: this.langTxt.role[role], iconURL: this.langTxt.role_img[role]},
                title       : this.langTxt.werewolf.title,
                color       : this.langTxt.team_color[getDefaultTeams(role)],
            });
            const sent_message = await this.channels.Werewolf.send({
                embeds: [embed],
                components: Util.arrange_buttons(buttons)
            });
            this.interactControllers[InteractType.Werewolf][sent_message.id] = sent_message;
            let werewolfsMention = "";
            for(const tid in this.members){
                if(!this.members[tid].isLiving) continue;
                if(!this.members[tid].allowWolfRoom) continue;
                werewolfsMention += getUserMentionStrFromId(tid);
            }
            this.channels.Werewolf.send(werewolfsMention + nightComingMessage);
            for(let my_id in this.members){
                if(!this.members[my_id].isLiving) continue;
                if(this.members[my_id].role == Role.Werewolf) {
                    this.wolfValidFrom.push(my_id);
                }
            }
        }
        this.stopTimerRequest = false;
        gameTimer(this.gameId, this, Phase.p6_Night, this.ruleSetting.night.alert_times, dummy_nightFinish);
    }

    nightKnightCheck(interaction : Discord.ButtonInteraction) {
        const tid = Object.keys(this.members).find(mid => mid == interaction.customId);
        if(tid == null) return;
        const uid = interaction.user.id;
        const uch = this.members[uid].uchannel;
        if(uch == null) return this.err();
        if(this.members[uid].validVoteID.find(i => i == tid)){
            const change = this.members[uid].voteTo != "";
            const role = Role.Knight;
            const author: Discord.EmbedAuthorOptions = {
                name: this.langTxt.role[role],
                iconURL: this.langTxt.role_img[role]
            };
            if(this.members[uid].voteTo == tid){
                interaction.reply({embeds:[this.createVoteEmbed(author, this.langTxt.knight.already, tid)]});
                return;
            }
            this.members[uid].voteTo = tid;
            if(change){
                interaction.reply({embeds:[this.createVoteEmbed(author, this.langTxt.knight.change, tid)]});
            }else{
                interaction.reply({embeds:[this.createVoteEmbed(author, this.langTxt.knight.accept, tid)]});
            }
        }
    }

    nightSeerCheck(interaction : Discord.ButtonInteraction) {
        const tid = Object.keys(this.members).find(mid => mid == interaction.customId);
        if(tid == null) return;
        const uid = interaction.user.id;
        const uch = this.members[uid].uchannel;
        if(uch == null) return this.err();

        if(this.members[uid].voteTo != "") return;
        if(this.members[uid].validVoteID.find(i => i == tid)){
            this.members[uid].voteTo = tid;
            this.members[uid].validVoteID = [];
            interaction.update({});
            this.sendFP_Result(uid, uch, tid, this.langTxt.seer, this.langTxt.role_img.Seer);
        }
    }

    nightWerewolfCheck(interaction : Discord.ButtonInteraction) {
        const uid = interaction.user.id;
        if(this.wolfValidFrom.find(i => i == interaction.user.id) == null) return;
        const tid = Object.keys(this.members).find(mid => mid == interaction.customId);
        if(tid == null) return;

        if(this.wolfValidTo.find(id => id == tid) == null) return;
        const change = this.wolfVote != "";
        const author: Discord.EmbedAuthorOptions = {
            name: this.members[interaction.user.id].nickname,
            iconURL: this.langTxt.role_img[Role.Werewolf]
        };
        if(this.wolfVote == tid){
            interaction.reply({embeds : [this.createVoteEmbed(author, this.langTxt.werewolf.already, tid)]});
            return;
        }
        this.wolfVote = tid;
        if(change){
            interaction.reply({embeds:[this.createVoteEmbed(author, this.langTxt.werewolf.change, tid)]});
        }else{
            interaction.reply({embeds:[this.createVoteEmbed(author, this.langTxt.werewolf.accept, tid)]});
        }
    }

    cutTimeCheck(interaction : Discord.ButtonInteraction) {
        const uid = interaction.user.id;
        const uch = this.members[uid].uchannel;
        if(uch == null) return this.err();
        if (interaction.customId != "cut_time") return;
        const isAdd = true; // TODO
        const liveNum =  Object.keys(this.members).reduce((acc, value) => { return acc + (this.members[value].isLiving?1:0);}, 0);
        const reqRule = this.ruleSetting.day.skip_vote_rule;
        const req = (reqRule == "majority") ? (liveNum + 1) / 2 | 0 : liveNum;
        if (!isAdd) {
            delete this.cutTimeMember[uid];
            const now = Object.keys(this.cutTimeMember).length;
            const txt = format(this.langTxt.p4.cut_time_cancel, {now : now, req : req});
            interaction.reply(txt);
            this.channels.Living.send(txt);
        } else {
            this.cutTimeMember[uid] = 1;
            const now = Object.keys(this.cutTimeMember).length;
            const txt = format(this.langTxt.p4.cut_time_accept, {now : now, req : req});
            interaction.reply(txt);
            this.channels.Living.send(txt);
            if (now >= req) {
                const updated_remTime = Math.min(12, this.remTime)
                this.channels.Living.send(format(this.langTxt.p4.cut_time_approved, {cut_time: updated_remTime}));
                this.remTime = updated_remTime;
            }
        }
    }

    async nightFinish(){
        this.interactControllers[InteractType.Knight]   = Object.create(null);
        this.interactControllers[InteractType.Seer]     = Object.create(null);
        this.interactControllers[InteractType.Werewolf] = Object.create(null);
        this.interactControllers[InteractType.CutTime] = Object.create(null);

        let Guarded : string[] = [];
        for(const uid in this.members){
            if(this.members[uid].role != Role.Knight) continue;
            if(!this.members[uid].isLiving) continue;
            this.members[uid].actionLog.push([this.members[uid].voteTo, TeamNames.Other]);
            if(this.members[uid].voteTo == "") {
                const uch = this.members[uid].uchannel;
                if(uch == null) return this.err();
                uch.send(this.langTxt.knight.no_select);
                continue;
            }
            Guarded.push(this.members[uid].voteTo);
        }
        Object.keys(this.members);
        this.killNext = [];

        if(this.wolfVote == ""){
            if(this.wolfValidTo.length == 0) this.err();
            this.wolfVote = this.wolfValidTo[Math.floor(Math.random() * this.wolfValidTo.length)];
            this.channels.Werewolf.send(format(this.langTxt.werewolf.no_select, {user: this.members[this.wolfVote].nickname}));
        }

        this.wolfLog.push(this.wolfVote);
        if (Guarded.find(id => id == this.wolfVote) == null) {
            this.killNext.push([this.wolfVote, 0]);
            await this.kickMember(this.wolfVote, KickReason.Werewolf);
            if(this.phase != Phase.p6_Night) return;
        }
        await this.startP4_Daytime();
    }

    // Phase.p7_GameEnd
    gameEnd(winTeam : TeamNames){
        this.phase = Phase.p7_GameEnd;
        
        let dlist : [string, string][] = [];
        for(const uid in this.members){
            if(!this.members[uid].isLiving){
                // dlist.push([uid, this.channels.LivingVoice.id]);
            }
        }
        this.updateRoomsRW();
        let list : [boolean, number, string][] = []; // win, liveDay, username

        let fieldsSeer   : Discord.EmbedField[] = [];
        let fieldsPriest : Discord.EmbedField[] = [];
        let fieldsKnight : Discord.EmbedField[] = [];
        let wolfNames = "";
        for(const uid in this.members){
            const role = this.members[uid].role;
            if(role == null) return this.err();
            const team = getDefaultTeams(role);
            const isWin = team == winTeam;
            list.push([
                isWin,
                this.members[uid].livingDays < 0 ? -114514 : -this.members[uid].livingDays,
                format(this.langTxt.p7.result_format, {
                    emo : this.langTxt.emo[role],
                    role : this.langTxt.role[role],
                    team : this.langTxt.team_name[team],
                    name : this.members[uid].nickname
                })
            ]);
            if(role == Role.Werewolf){
                wolfNames += this.members[uid].nickname;
            }
            if(role == Role.Seer || role == Role.Priest){
                let dat = "";
                for(let i in this.members[uid].actionLog){
                    let a = this.members[uid].actionLog[i][0];
                    let b = this.members[uid].actionLog[i][1];
                    if(a == ""){
                        dat += this.langTxt.sys.no_result + "\n";
                    }else{
                        dat += this.langTxt.team_emo[b] + this.members[a].nickname + "\n";
                    }
                }
                if(dat == "") dat = this.langTxt.sys.no_result;
                if(role == Role.Seer){
                    fieldsSeer.push({value : dat, inline : true,
                        name : format(this.langTxt.p7.log, {emo : this.langTxt.emo[role], role : this.langTxt.role[role], name : this.members[uid].nickname})
                    });
                } else {
                    fieldsPriest.push({value : dat, inline : true,
                        name : format(this.langTxt.p7.log, {emo : this.langTxt.emo[role], role : this.langTxt.role[role], name : this.members[uid].nickname})
                    });
                }
            }
            if(role == Role.Knight){
                let dat = "";
                for(let i in this.members[uid].actionLog){
                    let a = this.members[uid].actionLog[i][0];
                    if(a == ""){
                        dat += this.langTxt.sys.no_result +"\n";
                    }else{
                        dat += this.members[a].nickname + "\n";
                    }
                }
                if(dat == "") dat = this.langTxt.sys.no_result;
                fieldsKnight.push({value : dat, inline : true,
                    name : format(this.langTxt.p7.log, {emo : this.langTxt.emo[role], role : this.langTxt.role[role], name : this.members[uid].nickname})
                });
            }
        }
        let fields : Discord.EmbedField[] = [];
        {
            let dat = "";
            for(let i in this.wolfLog){
                const a = this.wolfLog[i] == "" ? this.langTxt.sys.no_result : this.members[this.wolfLog[i]].nickname;
                dat += a + "\n";
            }
            if(dat == "") dat = this.langTxt.sys.no_result;
            fields.push({value : dat, inline : true,
                name : format(this.langTxt.p7.log, {emo : this.langTxt.emo.Werewolf, role : this.langTxt.role.Werewolf, name : wolfNames})
            });
        }
        for(const i in fieldsKnight) {fields.push(fieldsKnight[i]);}
        for(const i in fieldsSeer)   {fields.push(fieldsSeer[i]);}
        for(const i in fieldsPriest) {fields.push(fieldsPriest[i]);}

        list = list.sort();
        let desc = this.langTxt.p7.win + "\n";
        let winFlag = true;
        for(let i = list.length-1; i >= 0; --i){
            if(winFlag == true && list[i][0] == false){
                desc += "\n" + this.langTxt.p7.lose + "\n"; 
                winFlag = false;
            }
            desc += list[i][2] + "\n";
        }
        desc += "\n\n";
        const embed = new Discord.EmbedBuilder({
            author      : {name: this.langTxt.p7.title, iconURL: this.langTxt.team_img[winTeam]},
            title       : format(this.langTxt.p7.main, {team : this.langTxt.team_name[winTeam]}),
            thumbnail   : {url: this.langTxt.team_img[winTeam]},
            description : desc,
            color       : this.langTxt.team_color[winTeam],
            fields      : fields,
        });
        this.channels.Living.send({embeds: [embed]});
        this.channels.GameLog.send({embeds: [embed]});

        let MentionText = "";
        for(const mid in this.members){
            MentionText += getUserMentionStrFromId(mid) + " ";
        }

        this.remTime = this.ruleSetting.after_game.length;
        MentionText += "\n" + format(this.langTxt.p7.continue, {time : this.getTimeFormatFromSec(this.remTime), cmd : this.langTxt.p7.cmd_continue[0], brk : this.langTxt.p7.cmd_breakup[0]});
        this.channels.Living.send(MentionText);
        
        this.remTime = this.ruleSetting.after_game.length;
        this.stopTimerRequest = false;
        gameTimer(this.gameId, this, Phase.p7_GameEnd, this.ruleSetting.after_game.alert_times, dummy_gameEndFinish);
    }

    gameEndFinish() {
        this.destroy();
    }


    needGmPerm(ch : Discord.TextChannel){
        let fields : Discord.EmbedField[] = [];
        {
            let dat = "";
            for(let uid in this.GM){
                const u = this.GM[uid];
                dat += (u == null ? uid : getNicknameFromMem(u)) + "\n";
            }
            if(dat == "") dat = "(None)"
            fields.push({name : this.langTxt.sys.sys_GM_list_title, value : dat, inline:true});
        }
        {
            let dat = "";
            for(let uid in this.developer){
                const u = this.GM[uid];
                dat += (u == null ? uid : getNicknameFromMem(u)) + "\n";
            }
            if(dat == "") dat = "(None)"
            fields.push({name : this.langTxt.sys.sys_Dev_list_title, value : dat, inline:true});
        }
        ch.send({embeds: [{
            title: this.langTxt.sys.sys_need_GM_perm,
            color: this.langTxt.sys.system_err_color,
            author: {name: "Error!", icon_url: "https://twemoji.maxcdn.com/2/72x72/1f6ab.png"},
            fields : fields,
        }]});
    }
    
    needDevPerm(ch : Discord.TextChannel) {
        let fields : Discord.EmbedField[] = [];
        {
            let dat = "";
            for(let uid in this.developer){
                const u = this.GM[uid];
                dat += (u == null ? uid : getNicknameFromMem(u)) + "\n";
            }
            if(dat == "") dat = "(None)"
            fields.push({name : this.langTxt.sys.sys_Dev_list_title, value : dat, inline : true});
        }
        ch.send({embeds: [{
            title: this.langTxt.sys.sys_need_Dev_perm,
            color: this.langTxt.sys.system_err_color,
            author: {name: "Error!", icon_url: "https://twemoji.maxcdn.com/2/72x72/1f6ab.png"},
            fields : fields,
        }]});
    }

    reloadDefaultRule() {
        const SysRuleSet = loadAndSetSysRuleSet("./rule_setting_templates/");
        if(SysRuleSet == null){
        } else {
            this.ruleSetting = SysRuleSet;
            this.setRoles2(SysRuleSet);
            this.sendRuleSummary(this.channels.Living);
        }
    }

    loadRuleFromStr(text: string) {
        console.log("LOAD RULE");
        console.log(text);
        const ret = Util.ParseRuleStr(text);
        if (ret[0] === "success") {
            try {
                const rule = ret[1] as RuleType;
                if (!this.setRoles2(rule)) {
                    return
                }
                this.ruleSetting = rule;
            } catch (e: unknown) {
                let set_rules_error = "";
                if (e instanceof Error) {
                    console.log('Cannot set rules: ', e.message);
                    set_rules_error += e.message;
                } else {
                    console.log('Cannot set rules.');
                }
                this.sendErr(
                    this.channels.Living,
                    "",
                    format(this.langTxt.sys.set_rules_error, {error: set_rules_error}),
                );
                return
            }
            this.interactControllers[InteractType.Accept] = {};
            this.start_1Wanted();
            console.log(ret);             
        } else {
            this.sendErr(
                this.channels.Living,
                "",
                format(this.langTxt.sys.rule_format_error, {error: ret[0]}),
            );
        }
    }

    async interactCommand(interaction : Discord.ButtonInteraction){

        console.log("interactCommand");

        if(this.phase == Phase.p1_Wanted){
            const mes_id = Object.keys(this.interactControllers[InteractType.Accept]).find(v => v == interaction.message.id);
            if (mes_id == null) return;
            const mes = this.interactControllers[InteractType.Accept][mes_id];
            await this.joinMemberInteract(interaction, mes);
            return;
        }

        const uid = Object.keys(this.members).find(k => k == interaction.user.id);
        if(uid == null) return;
        if(!this.members[uid].isLiving) return;
        const uch = this.members[uid].uchannel;
        if(uch == null) return;

        for(let i = 0; i < this.interactControllers.length; i++) {
            if(Object.keys(this.interactControllers[i]).find(v => v == interaction.message.id) == null) continue;
            if(i == InteractType.Accept){
                if(this.phase == Phase.p2_Preparation){
                    if(interaction.channelId != uch.id) return;
                    this.preparationAccept(uid, interaction);
                    return;
                }
            }
            if(i == InteractType.WishRole){
                console.log("i == InteractType.WishRole");
                if(this.phase == Phase.p2_Preparation) {
                    if(interaction.channelId != uch.id) return;
                    this.wishRoleCheck(interaction);
                }
            }
            if(i == InteractType.Vote){
                if(this.phase == Phase.p5_Vote){
                    if(this.members[uid].validVoteID.length == 0) return;
                    this.voteCheckInteract(interaction);
                    return;
                }
                return;
            }
            if(i == InteractType.Knight){
                if(this.phase == Phase.p6_Night) {
                    if(interaction.channelId != uch.id) return;
                    this.nightKnightCheck(interaction);
                    return;
                }
            }
            if(i == InteractType.Seer){
                if(this.phase == Phase.p6_Night) {
                    if(interaction.channelId != uch.id) return;
                    this.nightSeerCheck(interaction);
                    return;
                }
            }
            if(i == InteractType.Werewolf){
                if(this.phase == Phase.p6_Night) {
                    if(interaction.channelId != this.channels.Werewolf.id) return;
                    this.nightWerewolfCheck(interaction);
                }
            }
            if(i == InteractType.CutTime){
                if(this.phase == Phase.p4_Daytime) {
                    if(interaction.channelId != uch.id) return;
                    await this.cutTimeCheck(interaction);
                }
            }
            if(i == InteractType.Dictator){
                if(this.phase == Phase.p4_Daytime) {
                    if(interaction.channelId != uch.id) return;
                    await this.dictatorCheck(interaction);
                }
            }
        }
    }

    async command(message : Discord.Message){

        if (message.content.startsWith('phase')) {
            message.channel.send(this.phase); return;
        }

        const isDeveloper = (message.author.id in this.developer);
        const isGM        = isDeveloper || (message.author.id in this.GM);

        // Cancel command
        if (isThisCommand(message.content, this.langTxt.sys.cmd_cancel) >=0) {
            this.magicnumber += 1;
            return
        }

        // Sys: Cotinue command
        if (isThisCommand(message.content, this.langTxt.p7.cmd_continue) >= 0) {
            await this.nextGame();
            return
        }

        // Sys: Reload command
        if (isThisCommand(message.content, this.langTxt.sys.cmd_reload_rule) >= 0) {
            if (isGM) {
                this.reloadDefaultRule();
            } else if (message.channel.type == Discord.ChannelType.GuildText) {
                this.needGmPerm(message.channel);
            }
            return
        }

        // Sys: Stop timer command
        if (isThisCommand(message.content, this.langTxt.sys.cmd_stop_timer) >= 0) {
            const ch = message.channel;
            if(ch.type == Discord.ChannelType.GuildText) {
                if (isGM) {
                    this.stopTimer(ch);
                } else {
                    this.needGmPerm(ch);
                }
            }
            return
        }

        // Sys: Restart timer command
        if (isThisCommand(message.content, this.langTxt.sys.cmd_resume_timer) >= 0) {
            const ch = message.channel;
            if (ch.type == Discord.ChannelType.GuildText) {
                if (isGM) {
                    this.resumeTimer(ch);
                } else {
                    this.needGmPerm(ch); 
                }
            }
        }

        // Sys: Member list command
        if (isThisCommand(message.content, this.langTxt.sys.cmd_member_list) >= 0) {
            const ch = message.channel;
            if(ch.type == Discord.ChannelType.GuildText) {
                this.sendMemberList(ch);
            }
            return
        }

        // Sys: Update perameter command
        if (isThisCommand(message.content, this.langTxt.sys.cmd_update_perm) >= 0) {
            this.updateRoomsRW()
            return
        }

        // Phase 0 or 1:
        if ((this.phase == Phase.p0_UnStarted) || (this.phase == Phase.p1_Wanted)) {
            // Load uploaded JSON setting file
            const attachments = message.attachments;
            if (attachments.size > 0) {
                if (this.phase == Phase.p0_UnStarted || this.phase == Phase.p1_Wanted) {
                    const text = await Util.getTextFromAttachedJson5(attachments);
                    if (text) {
                        this.loadRuleFromStr(text);
                    }
                }
                return
            }
            // Load JSON text setting message
            const text = message.content.trim();
            if (text.startsWith("{")) {
                this.loadRuleFromStr(text);
                return
            }
            // Delete room
            if (isThisCommand(message.content, this.langTxt.p0.cmd_delete_room) >= 0) {
                // TODO: clear前に各chのvisibility変更
                this.channels.clear_category(this.clients[0], this.parentID);
                return
            }
        }

        // Phase0: Unstarted commands
        if (this.phase == Phase.p0_UnStarted ) {
            // Start game
            if (isThisCommand(message.content, this.langTxt.p0.cmd_start) >= 0) {
                this.start_1Wanted();
                return
            }
            return
        }

        // Phase1: Recruitment commands
        if (this.phase == Phase.p1_Wanted) {

            // Change rule
            let idx = 0;
            idx = isThisCommand(message.content, this.langTxt.sys.cmd_change_rule);
            if (idx >= 0) {
                if (message.channel.type == Discord.ChannelType.GuildText) {
                    this.changeRule(message.content.substring(this.langTxt.sys.cmd_change_rule[idx].length));
                }
            }
            
            // Force join
            if (isThisCommand(message.content, this.langTxt.p1.cmd_join_force) >= 0) {
                this.addEntrant(message, true);
                return
            }

            // Join
            if (isThisCommand(message.content, this.langTxt.p1.cmd_join) >= 0) {
                this.addEntrant(message);
                return
            }

            // Leave
            if (isThisCommand(message.content, this.langTxt.p1.cmd_leave) >= 0) {
                this.acceptDecline(message);
                return
            }

            // Kick
            if (isThisCommand(message.content, this.langTxt.p1.cmd_kick) >= 0) {
                this.removeEntrant(message);
                return
            }

            // Start
            let idx2 = 0;
            idx2 = isThisCommand(message.content, this.langTxt.p1.cmd_start);
            if (idx2 >= 0) {
                await this.tryPreparingGame(message, idx2);
                return
            }

            return
        }

        // Phase 2: preparation commands
        if (this.phase == Phase.p2_Preparation) {

            // 
            if (Object.keys(this.members).find(k => k == message.author.id) != null) {
                const uch = this.members[message.author.id].uchannel;
                if(uch != null && message.channel.id == uch.id){
                    this.preparationAccept(message.author.id, null);
                }
            }
            if (message.channel.id == this.channels.Living.id) {
                if(isThisCommand(message.content, this.langTxt.p2.cmd_start_force) >= 0){
                    this.forceStartGame();
                    return;
                }
            }
            return
        }

        if (this.phase == Phase.p7_GameEnd) {
            if (isThisCommand(message.content, this.langTxt.p7.cmd_breakup) >= 0) {
                this.gameEndFinish();
                return
            }
        }

    }

    // Improved game timer of the game.
    async gameTimer2(
        length : number,
        alert_times : number[], 
    ) {

        let alert_times_map = alert_times.map((atime) => (atime < length) ? true : false);
        let stopped_time = 0;
        let now_unix_time = current_unix_time()
        let scheduled_unixtime = now_unix_time + length;
        let waiting = true;
        while (waiting) {

            if (this.stopTimerRequest) {
                console.log("Timer is stopping.");
                stopped_time = current_unix_time() - now_unix_time;     
                return;
            }
            scheduled_unixtime = scheduled_unixtime + stopped_time;
            stopped_time = 0;
            now_unix_time = current_unix_time();
            if (now_unix_time >= scheduled_unixtime) {
                waiting = false;
            }

            for (const idx in alert_times) {
                if (!alert_times_map[idx]) {
                    continue
                }
                const atime = alert_times[idx]
                if (now_unix_time >= scheduled_unixtime - atime) {
                    const text = format(
                        this.langTxt.sys.remaining_time,
                        {time : this.getTimeFormatFromSec(atime)}
                    );
                    if (this.phase == Phase.p3_FirstNight) {
                        this.channels.Werewolf.send(text);
                    } else if (this.phase == Phase.p5_Vote) {
                        this.broadcastLivingUserChannel(text);
                    } else if (this.phase == Phase.p6_Night) {
                        this.channels.Werewolf.send(text);
                        for(const uid in this.members){
                            if (!this.members[uid].isLiving) continue;
                            const uch = this.members[uid].uchannel;
                            if (uch == null) continue;
                            const role = this.members[uid].role;
                            switch (role) {
                                case Role.Seer:
                                case Role.Knight:
                                    uch.send(text);
                            }
                        }
                    }
                    this.channels.Living.send(text);
                    alert_times_map[idx] = false;
                }
            }
            this.isTimerProgress = true;
            console.log(now_unix_time);
            await my_sleep(1000);
        }
        
        console.log("timer finished!");
        this.channels.Living.send(this.langTxt.sys.time_is_up);
        this.isTimerProgress = false;
    }

}

// Game timer of the game. Do not use "this." in the function.
function gameTimer(
    gid : number, 
    obj : GameState, 
    tPhase : Phase, 
    alert_times : number[], 
    func : (gid : number, obj : GameState) => unknown,
    callFromTimer : boolean = false
) {
    //! no use "this."
    console.log(obj.remTime);

    if (gid != obj.gameId) {
        console.log(`gid: ${gid} != obj.gameId: ${obj.gameId}`);
        return
    };
    if (obj.phase != tPhase) {
        console.log(`obj.phase: ${obj.phase} != tPhase: ${tPhase}`);
        return
    };
    obj.isTimerProgress = true;
    if (obj.stopTimerRequest) {
        console.log("Receive external timer stop request.");
        obj.timerList.push(setTimeout(gameTimer, 1000, gid, obj, tPhase, alert_times, func, true));
        return;
    }
    
    if(alert_times.find(v => v === obj.remTime) != null) {
        
        console.log("alert_times.find(v => v === obj.remTime) != null");
        
        const text = format(obj.langTxt.sys.remaining_time, {time : obj.getTimeFormatFromSec(obj.remTime)});

        if(obj.phase == Phase.p3_FirstNight){
            console.log("obj.phase == Phase.p3_FirstNight");
            obj.channels.Werewolf.send(text);

        } else if(obj.phase == Phase.p5_Vote) {
            console.log("obj.phase == Phase.p5_Vote");
            obj.broadcastLivingUserChannel(text);

        } else if(obj.phase == Phase.p6_Night) {
            console.log("obj.phase == Phase.p6_Night");
            obj.channels.Werewolf.send(text);
            for(const uid in obj.members){
                if(!obj.members[uid].isLiving) continue;
                const uch = obj.members[uid].uchannel;
                if(uch == null) continue;
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
    } else {
        obj.remTime -= 1;
        obj.timerList.push(setTimeout(gameTimer, 1000, gid, obj, tPhase, alert_times, func, true));
    }
}

////////////////////////////////////////////
// dummys
////////////////////////////////////////////

/*
async function dummy_gamePreparation(gid : number, obj : GameState) {
    console.log("function dummy_gamePreparation");
    if (gid != obj.gameId) {
        console.log("something wrong.");
        console.log(`gid: ${gid} != obj.gameId: ${obj.gameId}`);
        return
    } else {
        console.log(`gid: ${gid} == obj.gameId: ${obj.gameId}`);
        await obj.gamePreparation();
    };
}
*/

async function dummy_gamePreparation2(gid : number, obj : GameState) {
    if (gid != obj.gameId) {
        console.log(`gid: ${gid} != obj.gameId: ${obj.gameId}`);
        return
    } else {
        console.log(`gid: ${gid} == obj.gameId: ${obj.gameId}`);
        await obj.gamePreparation2();
    };
}

async function dummy_startP4Daytime(gid : number, obj : GameState) {
    if(gid != obj.gameId) return;
    await obj.startP4_Daytime();
}

async function dummy_startP5Vote(gid : number, obj : GameState) {
    if(gid != obj.gameId) return;
    await obj.startP5_Vote();
}
async function dummy_voteTimeup(gid : number, obj : GameState) {
    if(gid != obj.gameId) return;
    obj.voteTimeup();
}
async function dummy_nightFinish(gid : number, obj : GameState) {
    await obj.nightFinish();
}

async function dummy_gameEndFinish(gid : number, obj : GameState) {
    obj.gameEndFinish();
}
