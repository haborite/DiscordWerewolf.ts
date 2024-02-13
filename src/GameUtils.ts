import * as Discord from "discord.js";
import * as fs from "fs"
import {validate, JsonRuntimeType} from 'ts-json-validator';
import {RuleTypeFormat, RuleType} from "./JsonType";
var JSON5 = require('json5');
import * as path from 'path';


export class GameChannels {
    
    Mason       : Discord.TextChannel;
    Werewolf    : Discord.TextChannel;
    GameLog     : Discord.TextChannel;
    DebugLog    : Discord.TextChannel;
    Living      : Discord.TextChannel;
    Dead        : Discord.TextChannel;

    constructor(
        aMason       : Discord.TextChannel,
        aWerewolf    : Discord.TextChannel,
        aGameLog     : Discord.TextChannel,
        aDebugLog    : Discord.TextChannel,
        aLiving      : Discord.TextChannel,
        aDead        : Discord.TextChannel,
    ) {
        this.Mason        = aMason;
        this.Werewolf     = aWerewolf;
        this.GameLog      = aGameLog;
        this.DebugLog     = aDebugLog;
        this.Living       = aLiving;
        this.Dead         = aDead;
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

export async function loadAttachedJson5(
    attachments: Discord.Collection<string, Discord.Attachment>
) {
    const attachmentURL = attachments.first()?.url;
    if (attachmentURL) {
        if (path.extname(attachmentURL).replace(/\?.*/, '') === '.json5') {
            try {
                const res = await fetch(attachmentURL);
                if (!res.ok) {
                    console.log(`HTTP error! Status: ${res.status}`);
                    return 
                }
                const txt = await res.text();
                const json5_content = JSON5.parse(txt);
                const ret = validate(RuleTypeFormat, json5_content);
                return ret         
            } catch (error) {
                console.error('Error parsing JSON5 file:', error);
                return
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



