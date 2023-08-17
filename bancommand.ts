import { ActorCommandSelector, CommandPermissionLevel } from "bdsx/bds/command";
import { command } from "bdsx/command";
import { NetworkIdentifier } from "bdsx/bds/networkidentifier";
import * as fs from "fs";

command.register("ban", "Oyuncuları yasakla", /* Command permission */ CommandPermissionLevel.Operator).overload(
    (param, origin, output) => {
        const targetPlayer = param.target;
        const targetName = targetPlayer.getName();
        const targetNetworkIdentifier = new NetworkIdentifier();

        if (!targetNetworkIdentifier) {
            output.error(`Oyuncu ağı kimliği alınamadı.`);
            return;
        }

        const jsonFileName = 'connection_data.json';
        if (!fs.existsSync(jsonFileName)) {
            output.error(`Veritabanı dosyası bulunamadı.`);
            return;
        }

        const data = JSON.parse(fs.readFileSync(jsonFileName, 'utf-8'));
        if (data[targetName]) {
            const bannedIP = data[targetName].ip;
            const bannedDeviceID = data[targetName].deviceid;
            const clientid = data[targetName].clientid;

            const bannedPlayersFileName = 'banned_players.json';
            const bannedData = fs.existsSync(bannedPlayersFileName)
                ? JSON.parse(fs.readFileSync(bannedPlayersFileName, 'utf-8'))
                : {};

            bannedData[targetName] = { ip: bannedIP, deviceid: bannedDeviceID, clientid, timestamp: Date.now() };
            fs.writeFileSync(bannedPlayersFileName, JSON.stringify(bannedData, null, 2));


            console.log(`Oyuncu "${targetName}" (${bannedIP}, ${bannedDeviceID}, ${clientid}) yasaklandı ve veriler kaydedildi.`);
        } else {
            console.log(`Oyuncu "${targetName}" veritabanında bulunamadı.`);
        }
    },
    {
        target: ActorCommandSelector,
    },
);
