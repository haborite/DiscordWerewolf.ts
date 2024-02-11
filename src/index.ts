import * as Discord from "discord.js";
import * as fs from "fs"
import * as argv from "argv"
import {isValid, JsonRuntimeType, validate} from 'ts-json-validator';
import {LangTypeFormat, LangType, RuleType, ServerSettingsFormat} from "./JsonType";
import GameState from "./GameState"
import {GameChannels, isThisCommand, loadAndSetSysRuleSet} from "./GameUtils"
// import {HttpServer} from "./HttpServer"
const JSON5 = require('json5');
const util = require('util');


argv.option([
    {
        name:  'server_setting',
        short: 's',
        type: 'list,path',
        description :'Specify the location of your own server configuration file.',
        example: "'-s local_private/my_server_settings.json5'"
    }
]);
const arg = argv.run();


const ServerSetting = loadAndSetServerSetting('./server_settings/default.json5', arg.options["server_setting"]);
// console.log("ServerSetting", ServerSetting)

const SysLangTxt = loadAndSetSysLangTxt("./lang/" + ServerSetting.system_lang + ".json5");
const SysRuleSet = loadAndSetSysRuleSet("./rule_setting_templates/default.json5");

if (SysLangTxt    == null) { throw new Error('SysLangTxt is Wrong! lang:' + ServerSetting.system_lang);}
if (SysRuleSet    == null) { throw new Error('SysRuleSet is Wrong!');}

const clients = [
    new Discord.Client({ intents: [
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildMessageReactions,
        Discord.GatewayIntentBits.GuildVoiceStates,
        Discord.GatewayIntentBits.Guilds
    ] }), 
];

const Games: { [key: string]: GameState; } = {};


clients[0].on("ready", () => {console.log("Login! ", clients[0].user ? clients[0].user.username : "");});
// clients[1].on("ready", () => {console.log("Login! ", clients[1].user ? clients[1].user.username : "");});

// const httpServer : HttpServer = new HttpServer(ServerSetting, SysLangTxt);

function loadAndSetSysLangTxt(path : string, LangTxt ?: LangType){
    const data = fs.readFileSync(path, 'utf-8');
    const json5 = JSON5.parse(data);
    try {
        const ret = validate(LangTypeFormat, json5);
        if(ret != null) LangTxt = ret;
        return ret;
    } catch (e) {
        console.log(e);
    }
}


function get_env(str : string){
    let res = "";
    if(str.startsWith('$')){
        str = str.substring(1);
        if(!(str in process.env)) throw new Error("Env " + str + " doesn't exist!");
        const e = process.env[str];
        if(e == null) throw new Error("Env " + str + "doesn't exist!");
        res = e;
    } else {
        res = str.substring(1)
    }
    return res;
}

function isValidJsonRuntimeType(runtimeType: JsonRuntimeType, obj: any): boolean {
    switch (runtimeType) {
    case 'null':
        if(obj === null) return true;
        break;
    case 'boolean':
    case 'number':
    case 'string':
        if(typeof obj === runtimeType) return true;
        break;
    default:
        switch (runtimeType.base) {
        case 'literal':
            if(obj === runtimeType.value) return true;
            break;
        case 'optional':
            if(obj === undefined) return true;
            if(isValid(runtimeType.element, obj)) return true;
            break;
        case "union":
            if(runtimeType.elements.some((t) => isValid(t, obj))) return true;
            break;
        case "array":
            if(obj instanceof Array && obj.every((e) => isValid(runtimeType.element, e))) return true;
            break;
        case "tuple":
            const res = obj instanceof Array &&
                runtimeType.elements.length === obj.length &&
                runtimeType.elements.every((typ, i) => isValid(typ, obj[i]));
            if(res) return true;
            break;
        case "object":
            if (obj === null || typeof obj !== 'object') {
            } else if(Object.entries(runtimeType.keyValues).every(([key, typ]) => isValidJsonRuntimeType(typ, obj[key]))){
                return true;
            }
            break;
        }
    }
    console.error("runtimeType :", runtimeType);
    console.error("obj type    :", typeof obj);
    console.error("obj         :", obj);
    throw new Error("Json Type parse error!!");
}


function loadAndSetServerSetting(default_path : string, server_setting_files : any){
    var files : string[] = [default_path];
    if(server_setting_files instanceof Array){
        for(const f of server_setting_files){
            if(typeof f !== 'string') continue;
            files.push(f);
        }
    }
    let resTmp : any = new Object();
    for(const path of files){
        const rawFile = fs.readFileSync(path, 'utf-8');
        const jsonObj = JSON5.parse(rawFile);
        Object.assign(resTmp, jsonObj);
        resTmp = validate(ServerSettingsFormat, resTmp);
        if (resTmp == null) { 
            isValidJsonRuntimeType(ServerSettingsFormat.runtimeType, resTmp);
            throw new Error('ServerSetting is Wrong! File : ' + path);
        }
    }
    let res = validate(ServerSettingsFormat, resTmp);
    if (res == null) throw new Error('ServerSetting is Wrong!');
    res.token1 = get_env(res.token1);
    // res.token2 = get_env(res.token2);
    // res.http.addr = get_env(res.http.addr);
    // res.http.ip        = get_env(res.http.ip);
    // res.http.http_port = get_env(res.http.http_port);
    let GMs : string[] = [];
    for(const s of res.system_GM){
        const t = get_env(s).split(' ');
        GMs = GMs.concat(t);
    }
    res.system_GM = GMs;
    return res;
}

function has_room_all_game_channel_support_t(
    catId : string, 
    find_name : string, 
    channels : Discord.GuildChannelManager) : Discord.TextChannel | null{
    var ret : Discord.TextChannel | null  = null;
    const targetChannel = channels.cache.find(c => (c.parentId == catId && c.name == find_name));
    if(targetChannel == null) return null;
    if (!((targetChannel): targetChannel is Discord.TextChannel => targetChannel.type === Discord.ChannelType.GuildText)(targetChannel)) return null;
    return targetChannel;
}
function has_room_all_game_channel_support_v(
    catId : string, 
    find_name : string, 
    channels : Discord.GuildChannelManager) : Discord.VoiceChannel | null{
    var ret : Discord.VoiceChannel | null  = null;
    const targetChannel = channels.cache.find(c => (c.parentId == catId && c.name == find_name));
    if(targetChannel == null) return null;
    if (!((targetChannel): targetChannel is Discord.VoiceChannel => targetChannel.type === Discord.ChannelType.GuildVoice)(targetChannel)) return null;
    return targetChannel;
}

function has_room_all_game_channel(catId : string, channels : Discord.GuildChannelManager, SrvLangTxt : LangType) : GameChannels | null{
    const aLivingVoice = has_room_all_game_channel_support_v(catId, SrvLangTxt['game']["room_LivingVoice"], channels); if(aLivingVoice == null) return null;
    const aDeadVoice   = has_room_all_game_channel_support_v(catId, SrvLangTxt['game']["room_DeadVoice"]  , channels); if(aDeadVoice   == null) return null;
    const aWerewolf    = has_room_all_game_channel_support_t(catId, SrvLangTxt['game']["room_Werewolf"]   , channels); if(aWerewolf    == null) return null;
    const aMason       = has_room_all_game_channel_support_t(catId, SrvLangTxt['game']["room_Mason"]      , channels); if(aMason       == null) return null;
    const aGameLog     = has_room_all_game_channel_support_t(catId, SrvLangTxt['game']["room_GameLog"]    , channels); if(aGameLog     == null) return null;
    const aDebugLog    = has_room_all_game_channel_support_t(catId, SrvLangTxt['game']["room_DebugLog"]   , channels); if(aDebugLog    == null) return null;
    const aLiving      = has_room_all_game_channel_support_t(catId, SrvLangTxt['game']["room_Living"]     , channels); if(aLiving      == null) return null;
    const aDead        = has_room_all_game_channel_support_t(catId, SrvLangTxt['game']["room_Dead"]       , channels); if(aDead        == null) return null;
    return new GameChannels(
        aMason,
        aWerewolf,
        aGameLog,
        aDebugLog,
        aLiving,
        aLivingVoice,
        aDead,
        aDeadVoice
    );
}


async function make_room(message: Discord.Message, category_name: string, SrvLangTxt: LangType){
    // TODO : 未実装
    const guild = message.guild;
    if(guild == null) return;

    message.channel.send(SrvLangTxt.p0.make_room)
    // const category_name = "game2"
    let Mason       : Discord.TextChannel  | null = null;
    let Werewolf    : Discord.TextChannel  | null = null;
    let GameLog     : Discord.TextChannel  | null = null;
    let DebugLog    : Discord.TextChannel  | null = null;
    let Living      : Discord.TextChannel  | null = null;
    let LivingVoice : Discord.VoiceChannel | null = null;
    let Dead        : Discord.TextChannel  | null = null;
    let DeadVoice   : Discord.VoiceChannel | null = null;

    const cat = await guild.channels.create({name: category_name, type : Discord.ChannelType.GuildCategory});
    Mason       = await guild.channels.create({name: SrvLangTxt.game.room_Mason, type : Discord.ChannelType.GuildText,  parent : cat.id, position : 1});
    Werewolf    = await guild.channels.create({name: SrvLangTxt.game.room_Werewolf, type : Discord.ChannelType.GuildText,  parent : cat.id, position : 2});
    GameLog     = await guild.channels.create({name: SrvLangTxt.game.room_GameLog, type : Discord.ChannelType.GuildText,  parent : cat.id, position : 3});
    DebugLog    = await guild.channels.create({name: SrvLangTxt.game.room_DebugLog, type : Discord.ChannelType.GuildText,  parent : cat.id, position : 4});
    Living      = await guild.channels.create({name: SrvLangTxt.game.room_Living, type : Discord.ChannelType.GuildText,  parent : cat.id, position : 5});
    LivingVoice = await guild.channels.create({name: SrvLangTxt.game.room_LivingVoice, type : Discord.ChannelType.GuildVoice, parent: cat.id, position : 6});
    Dead        = await guild.channels.create({name: SrvLangTxt.game.room_Dead, type : Discord.ChannelType.GuildText,  parent : cat.id, position : 7});
    DeadVoice   = await guild.channels.create({name: SrvLangTxt.game.room_DeadVoice, type : Discord.ChannelType.GuildVoice, parent: cat.id, position : 8});
    return new GameChannels(
        Mason,
        Werewolf,
        GameLog,
        DebugLog,
        Living,
        LivingVoice,
        Dead,
        DeadVoice
    );
}


async function on_message(bid : number, message : Discord.Message){
    if (clients[0].user == null || message.author.id == clients[0].user.id) return;
    // if (clients[1].user == null || message.author.id == clients[1].user.id) return;
    if (message.content.startsWith('^ping1')) {
        if(bid == 0) message.channel.send("pong 1!");
        return;
    }
    if (message.content.startsWith('^ping2')) {
        if(bid == 1) message.channel.send("pong 2!");
        return;
    }
    if (message.content.startsWith('^ping')) {
        message.channel.send("pong!"); return;
    }
    if(bid == 1) return;
    // console.log("text > ", message.content);
    
    const message_channel = message.channel;

    if(SysLangTxt != null && SysRuleSet != null && ('parentId' in message_channel)){
        const SrvLangTxt : LangType = SysLangTxt;
        const SrvRuleSet : RuleType = SysRuleSet;
        const paID = message_channel.parentId;

        if(paID != null){
            if(Object.keys(Games).find((v : string ) => v == paID) != null){
                await Games[paID].command(message);
                return;
            }
            const u = clients[0].user;
            if(message.guild && message.mentions.users.find(mu => mu.id == u.id)){
                const guild1 = message.guild;
                const ch = has_room_all_game_channel(paID, guild1.channels, SrvLangTxt)
                if(ch != null){  
                    // Games[paID] = new GameState(clients, Games, message.guild, guild2, ch, ch2, paID, httpServer, SrvLangTxt, SrvRuleSet, ServerSetting);
                    Games[paID] = new GameState(clients, Games, message.guild, ch, paID, SrvLangTxt, SrvRuleSet, ServerSetting);
                    ch.Living.send(SrvLangTxt.p0.rediscovered_room)
                    Games[paID].start_0Unstarted();
                    await Games[paID].command(message);
                    return
                }
            }
        }

        const cmd_idx = isThisCommand(message.content, SrvLangTxt.sys.cmd_make_room);
        if (cmd_idx >= 0) {
            const u = clients[0].user;
            if(message.mentions.users.find(mu => mu.id == u.id) == null) return;
            const guild1_old = message.guild;
            if (guild1_old == null) return;
            
            const sub_string = message.content.substring(SrvLangTxt.sys.cmd_make_room[cmd_idx].length).replace(/ <@[^>]*>/g, '');
            const category_name = sub_string ? sub_string : "game3";  
            const ch = await make_room(message, category_name, SrvLangTxt);
            const guild1 = await guild1_old.fetch();
            if(guild1 == null) return;
            if(ch == null) return;
            const pa = ch.Living.parentId;
            if(pa == null) return;
            // Games[pa] = new GameState(clients, Games, guild1, guild2, ch, ch2, pa, httpServer, SrvLangTxt, SrvRuleSet, ServerSetting);
            Games[pa] = new GameState(clients, Games, guild1, ch, pa, SrvLangTxt, SrvRuleSet, ServerSetting);
            Games[pa].updateRoomsRW();
            ch.Living.send("<@!" + message.author.id + "> done!");
            Games[pa].start_0Unstarted();
            return
        }

        if (isThisCommand(message.content, SrvLangTxt.sys.cmd_delete_room) >= 0) {
            try {
                const pa = message_channel.parentId;
                if(pa == null) return;
                const category = clients[0].channels.cache.get(pa) as Discord.CategoryChannel;
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
}


clients[0].on("messageCreate", async message => await on_message(0, message));

clients[0].on('interactionCreate', async (interaction) => {
    if (clients[0].user == null) return;
    if (!interaction.isButton()) return;

    // TODO
    const pid = Object.keys(Games).find( key => {
        if (Games[key].guild.id != interaction.guildId) return false;
        if (Games[key].channels.Living.id == interaction.channelId) return true;
        if (Games[key].channels.Werewolf.id == interaction.channelId) return true;
        return Object.keys(Games[key].members).find( uid => {
            const uch = Games[key].members[uid].uchannel;
            if (uch == null) return false;
            return (uch.id == interaction.channelId);
        });
    });
    if (pid == null) return;
    await Games[pid].interactCommand(interaction);
});

const token1 = ServerSetting.token1;
clients[0].login(token1)