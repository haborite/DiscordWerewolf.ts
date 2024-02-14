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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Discord = __importStar(require("discord.js"));
const fs = __importStar(require("fs"));
const argv = __importStar(require("argv"));
const ts_json_validator_1 = require("ts-json-validator");
const JsonType_1 = require("./JsonType");
const GameState_1 = __importDefault(require("./GameState"));
const GameUtils_1 = require("./GameUtils");
const JSON5 = require('json5');
const util = require('util');
argv.option([
    {
        name: 'server_setting',
        short: 's',
        type: 'list,path',
        description: 'Specify the location of your own server configuration file.',
        example: "'-s local_private/my_server_settings.json5'"
    }
]);
const arg = argv.run();
const ServerSetting = loadAndSetServerSetting('./server_settings/default.json5', arg.options["server_setting"]);
// console.log("ServerSetting", ServerSetting)
const SysLangTxt = loadAndSetSysLangTxt("./lang/" + ServerSetting.system_lang + ".json5");
const SysRuleSet = (0, GameUtils_1.loadAndSetSysRuleSet)("./rule_setting_templates/default.json5");
if (SysLangTxt == null) {
    throw new Error('SysLangTxt is Wrong! lang:' + ServerSetting.system_lang);
}
if (SysRuleSet == null) {
    throw new Error('SysRuleSet is Wrong!');
}
const clients = [
    new Discord.Client({ intents: [
            Discord.GatewayIntentBits.GuildMessages,
            Discord.GatewayIntentBits.MessageContent,
            Discord.GatewayIntentBits.GuildMessageReactions,
            Discord.GatewayIntentBits.Guilds
        ] }),
];
const Games = {};
clients[0].on("ready", () => { console.log("Login! ", clients[0].user ? clients[0].user.username : ""); });
// clients[1].on("ready", () => {console.log("Login! ", clients[1].user ? clients[1].user.username : "");});
// const httpServer : HttpServer = new HttpServer(ServerSetting, SysLangTxt);
function loadAndSetSysLangTxt(path, LangTxt) {
    const data = fs.readFileSync(path, 'utf-8');
    const json5 = JSON5.parse(data);
    try {
        const ret = (0, ts_json_validator_1.validate)(JsonType_1.LangTypeFormat, json5);
        if (ret != null)
            LangTxt = ret;
        return ret;
    }
    catch (e) {
        console.log(e);
    }
}
function get_env(str) {
    let res = "";
    if (str.startsWith('$')) {
        str = str.substring(1);
        if (!(str in process.env))
            throw new Error("Env " + str + " doesn't exist!");
        const e = process.env[str];
        if (e == null)
            throw new Error("Env " + str + "doesn't exist!");
        res = e;
    }
    else {
        res = str.substring(0);
    }
    return res;
}
function isValidJsonRuntimeType(runtimeType, obj) {
    switch (runtimeType) {
        case 'null':
            if (obj === null)
                return true;
            break;
        case 'boolean':
        case 'number':
        case 'string':
            if (typeof obj === runtimeType)
                return true;
            break;
        default:
            switch (runtimeType.base) {
                case 'literal':
                    if (obj === runtimeType.value)
                        return true;
                    break;
                case 'optional':
                    if (obj === undefined)
                        return true;
                    if ((0, ts_json_validator_1.isValid)(runtimeType.element, obj))
                        return true;
                    break;
                case "union":
                    if (runtimeType.elements.some((t) => (0, ts_json_validator_1.isValid)(t, obj)))
                        return true;
                    break;
                case "array":
                    if (obj instanceof Array && obj.every((e) => (0, ts_json_validator_1.isValid)(runtimeType.element, e)))
                        return true;
                    break;
                case "tuple":
                    const res = obj instanceof Array &&
                        runtimeType.elements.length === obj.length &&
                        runtimeType.elements.every((typ, i) => (0, ts_json_validator_1.isValid)(typ, obj[i]));
                    if (res)
                        return true;
                    break;
                case "object":
                    if (obj === null || typeof obj !== 'object') {
                    }
                    else if (Object.entries(runtimeType.keyValues).every(([key, typ]) => isValidJsonRuntimeType(typ, obj[key]))) {
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
function loadAndSetServerSetting(default_path, server_setting_files) {
    var files = [default_path];
    if (server_setting_files instanceof Array) {
        for (const f of server_setting_files) {
            if (typeof f !== 'string')
                continue;
            files.push(f);
        }
    }
    let resTmp = new Object();
    for (const path of files) {
        const rawFile = fs.readFileSync(path, 'utf-8');
        const jsonObj = JSON5.parse(rawFile);
        Object.assign(resTmp, jsonObj);
        resTmp = (0, ts_json_validator_1.validate)(JsonType_1.ServerSettingsFormat, resTmp);
        if (resTmp == null) {
            isValidJsonRuntimeType(JsonType_1.ServerSettingsFormat.runtimeType, resTmp);
            throw new Error('ServerSetting is Wrong! File : ' + path);
        }
    }
    let res = (0, ts_json_validator_1.validate)(JsonType_1.ServerSettingsFormat, resTmp);
    if (res == null)
        throw new Error('ServerSetting is Wrong!');
    res.token1 = get_env(res.token1);
    let GMs = [];
    for (const s of res.system_GM) {
        const t = get_env(s).split(' ');
        GMs = GMs.concat(t);
    }
    res.system_GM = GMs;
    return res;
}
function has_room_all_game_channel_support_t(catId, find_name, channels) {
    var ret = null;
    const targetChannel = channels.cache.find(c => (c.parentId == catId && c.name == find_name));
    if (targetChannel == null)
        return null;
    if (!((targetChannel) => targetChannel.type === Discord.ChannelType.GuildText)(targetChannel))
        return null;
    return targetChannel;
}
function has_room_all_game_channel(catId, channels, SrvLangTxt) {
    const aWerewolf = has_room_all_game_channel_support_t(catId, SrvLangTxt['game']["room_Werewolf"], channels);
    if (aWerewolf == null)
        return null;
    const aMason = has_room_all_game_channel_support_t(catId, SrvLangTxt['game']["room_Mason"], channels);
    if (aMason == null)
        return null;
    const aGameLog = has_room_all_game_channel_support_t(catId, SrvLangTxt['game']["room_GameLog"], channels);
    if (aGameLog == null)
        return null;
    const aDebugLog = has_room_all_game_channel_support_t(catId, SrvLangTxt['game']["room_DebugLog"], channels);
    if (aDebugLog == null)
        return null;
    const aLiving = has_room_all_game_channel_support_t(catId, SrvLangTxt['game']["room_Living"], channels);
    if (aLiving == null)
        return null;
    const aDead = has_room_all_game_channel_support_t(catId, SrvLangTxt['game']["room_Dead"], channels);
    if (aDead == null)
        return null;
    const aAudience = has_room_all_game_channel_support_t(catId, SrvLangTxt['game']["room_Audience"], channels);
    if (aAudience == null)
        return null;
    return new GameUtils_1.GameChannels(aMason, aWerewolf, aGameLog, aDebugLog, aLiving, aDead, aAudience);
}
async function make_room(message, category_name, SrvLangTxt) {
    // TODO : 未実装
    const guild = message.guild;
    if (guild == null)
        return;
    message.channel.send(SrvLangTxt.p0.make_room);
    // const category_name = "game2"
    let Mason = null;
    let Werewolf = null;
    let GameLog = null;
    let DebugLog = null;
    let Living = null;
    let Dead = null;
    let Audience = null;
    const cat = await guild.channels.create({ name: category_name, type: Discord.ChannelType.GuildCategory });
    Mason = await guild.channels.create({ name: SrvLangTxt.game.room_Mason, type: Discord.ChannelType.GuildText, parent: cat.id, position: 2 });
    Werewolf = await guild.channels.create({ name: SrvLangTxt.game.room_Werewolf, type: Discord.ChannelType.GuildText, parent: cat.id, position: 3 });
    GameLog = await guild.channels.create({ name: SrvLangTxt.game.room_GameLog, type: Discord.ChannelType.GuildText, parent: cat.id, position: 4 });
    DebugLog = await guild.channels.create({ name: SrvLangTxt.game.room_DebugLog, type: Discord.ChannelType.GuildText, parent: cat.id, position: 5 });
    Living = await guild.channels.create({ name: SrvLangTxt.game.room_Living, type: Discord.ChannelType.GuildText, parent: cat.id, position: 6 });
    Dead = await guild.channels.create({ name: SrvLangTxt.game.room_Dead, type: Discord.ChannelType.GuildText, parent: cat.id, position: 7 });
    Audience = await guild.channels.create({ name: SrvLangTxt.game.room_Audience, type: Discord.ChannelType.GuildText, parent: cat.id, position: 8 });
    return new GameUtils_1.GameChannels(Mason, Werewolf, GameLog, DebugLog, Living, Dead, Audience);
}
async function on_message(bid, message) {
    if (clients[0].user == null || message.author.id == clients[0].user.id)
        return;
    // if (clients[1].user == null || message.author.id == clients[1].user.id) return;
    if (message.content.startsWith('^ping1')) {
        if (bid == 0)
            message.channel.send("pong 1!");
        return;
    }
    if (message.content.startsWith('^ping2')) {
        if (bid == 1)
            message.channel.send("pong 2!");
        return;
    }
    if (message.content.startsWith('^ping')) {
        message.channel.send("pong!");
        return;
    }
    if (bid == 1)
        return;
    // console.log("text > ", message.content);
    const message_channel = message.channel;
    if (SysLangTxt != null && SysRuleSet != null && ('parentId' in message_channel)) {
        const SrvLangTxt = SysLangTxt;
        const SrvRuleSet = SysRuleSet;
        const paID = message_channel.parentId;
        if (paID != null) {
            if (Object.keys(Games).find((v) => v == paID) != null) {
                await Games[paID].command(message);
                return;
            }
            const u = clients[0].user;
            if (message.guild && message.mentions.users.find(mu => mu.id == u.id)) {
                const guild1 = message.guild;
                const ch = has_room_all_game_channel(paID, guild1.channels, SrvLangTxt);
                if (ch != null) {
                    // Games[paID] = new GameState(clients, Games, message.guild, guild2, ch, ch2, paID, httpServer, SrvLangTxt, SrvRuleSet, ServerSetting);
                    Games[paID] = new GameState_1.default(clients, Games, message.guild, ch, paID, SrvLangTxt, SrvRuleSet, ServerSetting);
                    ch.Living.send(SrvLangTxt.p0.rediscovered_room);
                    Games[paID].start_0Unstarted();
                    await Games[paID].command(message);
                    return;
                }
            }
        }
        const cmd_idx = (0, GameUtils_1.isThisCommand)(message.content, SrvLangTxt.sys.cmd_make_room);
        if (cmd_idx >= 0) {
            const u = clients[0].user;
            if (message.mentions.users.find(mu => mu.id == u.id) == null)
                return;
            const guild1_old = message.guild;
            if (guild1_old == null)
                return;
            const sub_string = message.content.substring(SrvLangTxt.sys.cmd_make_room[cmd_idx].length).replace(/ <@[^>]*>/g, '');
            const category_name = sub_string ? sub_string : "game3";
            const ch = await make_room(message, category_name, SrvLangTxt);
            const guild1 = await guild1_old.fetch();
            if (guild1 == null)
                return;
            if (ch == null)
                return;
            const pa = ch.Living.parentId;
            if (pa == null)
                return;
            // Games[pa] = new GameState(clients, Games, guild1, guild2, ch, ch2, pa, httpServer, SrvLangTxt, SrvRuleSet, ServerSetting);
            Games[pa] = new GameState_1.default(clients, Games, guild1, ch, pa, SrvLangTxt, SrvRuleSet, ServerSetting);
            Games[pa].updateRoomsRW();
            ch.Living.send("<@!" + message.author.id + "> done!");
            Games[pa].start_0Unstarted();
            return;
        }
        if ((0, GameUtils_1.isThisCommand)(message.content, SrvLangTxt.sys.cmd_delete_room) >= 0) {
            try {
                const pa = message_channel.parentId;
                if (pa == null)
                    return;
                const category = clients[0].channels.cache.get(pa);
                if (category) {
                    const manager = category.children;
                    manager.cache.forEach((ch) => { ch.delete(); });
                    category.delete();
                }
                console.log('Channels and category deleted successfully.');
            }
            catch (error) {
                console.log('Error deleting channels and category:', error);
            }
        }
    }
}
clients[0].on("messageCreate", async (message) => await on_message(0, message));
clients[0].on('interactionCreate', async (interaction) => {
    if (clients[0].user == null)
        return;
    if (!interaction.isButton())
        return;
    // TODO
    const pid = Object.keys(Games).find(key => {
        if (Games[key].guild.id != interaction.guildId)
            return false;
        if (Games[key].channels.Living.id == interaction.channelId)
            return true;
        if (Games[key].channels.Werewolf.id == interaction.channelId)
            return true;
        return Object.keys(Games[key].members).find(uid => {
            const uch = Games[key].members[uid].uchannel;
            if (uch == null)
                return false;
            return (uch.id == interaction.channelId);
        });
    });
    if (pid == null)
        return;
    await Games[pid].interactCommand(interaction);
});
const token1 = ServerSetting.token1;
clients[0].login(token1);
//# sourceMappingURL=index.js.map