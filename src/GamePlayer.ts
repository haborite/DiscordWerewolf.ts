/*
import * as Discord from "discord.js";


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
    message_count   : number   = 0;
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
        this.message_count = 0;
    }
}
    */