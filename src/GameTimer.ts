import {Phase, Role} from "./GameState"
import GameState from "./GameState"
import {current_unix_time, format} from "./GameUtils"

// Game timer worker of the game.
export function gameTimer3(
    obj : GameState, 
    alert_times : number[], 
) {

    console.log("start game timer");
    const gid = obj.gameId;

    obj.stopped_time = 0;
    let alert_times_map = alert_times.map(
        (atime) => (atime < obj.target_time - current_unix_time()) ? true : false
    );
    let waiting = true;

    const timer2 = setInterval(() => {

        const now_unix_time = current_unix_time();

        if (obj.stopTimerRequest) {
            console.log("Timer is stopping.");
            obj.stopped_time = current_unix_time() - now_unix_time;     
            return;
        }
        obj.target_time = obj.target_time + obj.stopped_time;
        obj.stopped_time = 0;
        const remTime = obj.target_time - now_unix_time;
        if (remTime <= 0) {
            waiting = false;
        }

        if (!obj.is_skipped) {
            for (const idx in alert_times) {
                if (!alert_times_map[idx]) {
                    continue
                }
                const atime = alert_times[idx]
                if (remTime <= atime) {
                    const text = format(
                        obj.langTxt.sys.remaining_time,
                        {time : obj.getTimeFormatFromSec(atime)}
                    );
                    if (obj.phase == Phase.p3_FirstNight) {
                        obj.channels.Werewolf.send(text);
                    } else if (obj.phase == Phase.p5_Vote) {
                        obj.broadcastLivingUserChannel(text);
                    } else if (obj.phase == Phase.p6_Night) {
                        obj.channels.Werewolf.send(text);
                        for(const uid in obj.members){
                            if (!obj.members[uid].isLiving) continue;
                            const uch = obj.members[uid].uchannel;
                            if (uch == null) continue;
                            const role = obj.members[uid].role;
                            switch (role) {
                                case Role.Seer:
                                case Role.Knight:
                                    uch.send(text);
                            }
                        }
                    }
                    obj.channels.Living.send(text);
                    alert_times_map[idx] = false;
                }
            }
        }

        obj.isTimerProgress = true;
        console.log(now_unix_time);

        if (waiting === false) {
            clearTimeout(timer2);
            console.log("timer finished!");
            obj.channels.Living.send(obj.langTxt.sys.time_is_up);
            obj.isTimerProgress = false;
            if (gid === obj.gameId) {
                obj.is_skipped = false;
                obj.next_phase();
            }
        }

    }, 1000);

}
