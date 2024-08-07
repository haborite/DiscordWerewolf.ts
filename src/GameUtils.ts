import * as Discord from "discord.js";
import * as fs from "fs"
import {validate, JsonRuntimeType} from 'ts-json-validator';
import {RuleTypeFormat, RuleType} from "./JsonType";
var JSON5 = require('json5');
import * as path from 'path';


export class GameChannels {
    
    Mason       : Discord.TextChannel;
    Werewolf    : Discord.TextChannel;
    // Vote        : Discord.TextChannel;
    DebugLog    : Discord.TextChannel;
    Living      : Discord.TextChannel;
    Dead        : Discord.TextChannel;
    Audience    : Discord.TextChannel;

    constructor(
        aMason       : Discord.TextChannel,
        aWerewolf    : Discord.TextChannel,
        // aVote        : Discord.TextChannel,
        aDebugLog    : Discord.TextChannel,
        aLiving      : Discord.TextChannel,
        aDead        : Discord.TextChannel,
        aAudience    : Discord.TextChannel,
    ) {
        this.Mason        = aMason;
        this.Werewolf     = aWerewolf;
        // this.Vote         = aVote;
        this.DebugLog     = aDebugLog;
        this.Living       = aLiving;
        this.Dead         = aDead;
        this.Audience     = aAudience;
    }

    clear_category(client: Discord.Client, parentID: string) {
        try {
            const category = client.channels.cache.get(parentID) as Discord.CategoryChannel;
            if (category) {
                const manager = category.children;
                manager.cache.forEach((ch) => { ch.delete(); });
                category.delete();
            }
            console.log('Channels and category deleted successfully.');
        } catch (error) {
            console.log('Error deleting channels and category:', error);
        }
    }
}

export function current_unix_time(): number {
    return Math.round(Date.now() / 1000)
}

export function format(msg: string, obj: any): string {
    return msg.replace(/\{(\w+)\}/g, (m, k) => {  // m="{id}", k="id"
        return obj[k];
    });
}

export function isThisCommand(content : string, list:string[]){
    return list.findIndex(cmd => content.startsWith(cmd));
}

export function assertUnreachable(x: never): never {
    throw new Error("Didn't expect to get here");
}

export function shuffle<T>(array: T[]) {
    const out = Array.from(array);
    for (let i = out.length - 1; i > 0; i--) {
        const r = Math.floor(Math.random() * (i + 1));
        const tmp = out[i];
        out[i] = out[r];
        out[r] = tmp;
    }
    return out;
}

export async function getTextFromAttachedJson5(
    attachments: Discord.Collection<string, Discord.Attachment>
) {
    const attachmentURL = attachments.first()?.url;
    if (attachmentURL) {
        const extname = path.extname(attachmentURL).replace(/\?.*/, '');
        if (extname === '.json5' || extname === '.txt') {
            try {
                const res = await fetch(attachmentURL);
                if (!res.ok) {
                    console.log(`HTTP error! Status: ${res.status}`);
                    return ""
                }
                const txt = await res.text();
                return txt        
            } catch (error) {
                console.error('Error in reading the file:', error);
                return ""
            }
        }
    }
}

export function loadAndSetSysRuleSet(path : string, RuleSet ?: RuleType){
    const data = fs.readFileSync(path, 'utf-8');
    const json5 = JSON5.parse(data);
    try {
        const ret = validate(RuleTypeFormat, json5);
        if (ret != null) {
            RuleSet = ret;
        }
        return ret;
    } catch (e) {
        console.log(e);
    }
}

export function ParseRuleStr(txt : string) {
    let json5_content;
    try {
        json5_content = JSON5.parse(txt);
    } catch (e: unknown) {
        if (e instanceof Error) {
            console.log('This is not a JSON5-formated text: ', e.message);
            return [e.message, undefined]
        } else {
            console.log('This is not a JSON5-formated text.');
            return ['This is not a JSON5-formated text.', undefined]
        }
    }
    try {
        const ret = validate(RuleTypeFormat, json5_content);
        return ["success", ret]
    } catch (e: unknown) {
        if (e instanceof Error) {
            console.log('Invalid rule format: ', e.message);
            return [e.message, undefined]
        } else {
            console.log('Invalid rule format.');
            return ['Invalid rule format.', undefined]
        }
    }
}

export function make_button(id : string, label : string, opt : {
    emoji? : string,
    style? : Discord.ButtonStyle | "blue" | "green" | "black" | "red",
})  {
    const res = new Discord.ButtonBuilder().setCustomId(id).setLabel(label);
    if (opt.emoji) res.setEmoji(opt.emoji);
    if (opt.style) {
        if (opt.style == Discord.ButtonStyle.Primary   || opt.style == "blue")  res.setStyle(Discord.ButtonStyle.Primary);
        if (opt.style == Discord.ButtonStyle.Success   || opt.style == "green") res.setStyle(Discord.ButtonStyle.Success);
        if (opt.style == Discord.ButtonStyle.Secondary || opt.style == "black") res.setStyle(Discord.ButtonStyle.Secondary);
        if (opt.style == Discord.ButtonStyle.Danger    || opt.style == "red")   res.setStyle(Discord.ButtonStyle.Danger);
        if (opt.style == Discord.ButtonStyle.Link) res.setStyle(Discord.ButtonStyle.Link);
    }
    return res
}

export function arrange_buttons(buttons : Discord.ButtonBuilder[]) {
    const rows = Math.ceil(buttons.length / 5);
    const components : Discord.ActionRowBuilder<Discord.ButtonBuilder>[] = [];
    for (let i = 0; i < rows; ++i) {
        components[i] = new Discord.ActionRowBuilder<Discord.ButtonBuilder>();
    }
    for (let i = 0; i < buttons.length; ++i) {
        components[i % rows].addComponents(buttons[i]);
    }
    return components
}

export function arrange_components(c : Discord.ActionRowBuilder<Discord.ButtonBuilder>[]) {
    const res : Discord.ActionRowBuilder<Discord.ButtonBuilder>[][] = [];
    for (let i = 0; i < c.length; ++i) {
        const j = Math.floor(i / 5);
        if (i % 5 == 0) res[j] = [];
        res[j].push(c[i]);
    }
    return res
}

export function updateHashValueWithFormat(attribute : string, value : any, runtimeType : JsonRuntimeType, hash : any) : boolean {
    const delimiters = ['/', '\\', '.'];
    switch (runtimeType) {
        case 'null':
        case 'boolean':
        case 'number':
        case 'string':
            return false;
        default:
            if(runtimeType.base == "object") {
                let dpos = attribute.length;
                for(const d of delimiters) {
                    const v = attribute.indexOf(d);
                    if(v >= 1) dpos = Math.min(dpos, v);
                }
                const attr = attribute.substring(0, dpos);
                if(!(attr in runtimeType.keyValues)) return false;
                if(!(attr in hash)) return false;
                
                const chT = runtimeType.keyValues[attr];
                if(chT == 'null'){
                } else if(chT == 'boolean'){
                    value = value.toLowerCase();
                    const Trues  = ['on', 'yes', 'y', 'true', 't', '1'];
                    const Falses = ['off', 'no', 'n', 'false', 'f', '0'];
                    if(Trues.indexOf(value) >= 0){
                        hash[attr] = true; return true;
                    }
                    if(Falses.indexOf(value) >= 0) {
                        hash[attr] = false; return true;
                    }
                    return false;
                } else if(chT == 'number'){
                    const v = parseInt(value);
                    if(v.toString() == value){
                        hash[attr] = v; return true;
                    }
                } else if(chT == 'string'){
                    hash[attr] = value;
                    return true;
                } else if(chT.base == 'union') {
                    for(let doLower = 0; doLower <= 1; ++doLower){
                        for(const elem of chT.elements){
                            if(elem == 'null' || elem == 'boolean' || elem == 'number' || elem == 'string'){
                            } else if(elem.base == 'literal') {
                               if((doLower == 0 && elem.value == value) || 
                                  (doLower == 1 && elem.value.toLowerCase() == value.toLowerCase())
                               ){
                                    hash[attr] = elem.value;
                                    return true;
                               }
                            }
                        }
                    }
                } else if(chT.base == 'optional') {
                    if(chT.element == 'string'){
                        hash[attr] = value;
                        return true;
                    } else if(chT.element == 'number'){
                        const v = parseInt(value);
                        if(v.toString() == value){
                            hash[attr] = v;
                            return true;
                        }
                    }
                } else if(chT.base == 'object') {
                    if(dpos != attribute.length){
                        return updateHashValueWithFormat(attribute.substring(dpos+1, attribute.length), value, chT, hash[attr]);
                    }
                }
                return false;
            }
    }
    return false;
}

export function hhmmss_str(unix_time_str: number): string {
    return "<t:" + unix_time_str + ":T>"
}

export function date_str(unix_time_str: number): string {
    return "<t:" + unix_time_str + ":D>"
}

export function stringToEnum<T extends string>(o: T[]): {[K in T]: K} {
    return o.reduce((accumulator, currentValue) => {
      accumulator[currentValue] = currentValue;
      return accumulator;
    }, Object.create(null));
}

export function getUserMentionStrFromId(uid: string){
    return "<@!" + uid + ">"
}

export function getUserMentionStr(user: Discord.User){
    return "<@!" + user.id + ">"
}

export function getNicknameFromMes(message : Discord.Message){
    return (message.member != null && message.member.nickname != null ? message.member.nickname : message.author.displayName);
}

export function getNicknameFromMem(mem : Discord.GuildMember){
    return (mem.nickname != null ? mem.nickname : mem.user.displayName);
}
