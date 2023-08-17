import { NetworkIdentifier } from "bdsx/bds/networkidentifier";
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { BuildPlatform, CANCEL } from "bdsx/common";
import { events } from "bdsx/event";
import * as fs from "fs";
import { ipfilter } from "bdsx/core";
import { DisconnectPacket } from "bdsx/bds/packets";

const connectionList = new Map<NetworkIdentifier, string>();

events.packetAfter(MinecraftPacketIds.Login).on((ptr, networkIdentifier, packetId) => {
    const ip = networkIdentifier.getAddress();
    const connreq = ptr.connreq;
    if (connreq === null) return; // wrong client
    const cert = connreq.getCertificate();
    const deviceid = connreq.getDeviceId();
    if (cert === null) return; // wrong client?
    const clientid = cert.getId();
    const xuid = cert.getXuid();
    const username = cert.getId();


    // Oyuncunun yasaklı listesini kontrol et
    const bannedPlayersFileName = 'banned_players.json';
    if (fs.existsSync(bannedPlayersFileName)) {
        const bannedData = JSON.parse(fs.readFileSync(bannedPlayersFileName, 'utf-8'));
        for (const bannedPlayer in bannedData) {
            if (bannedData[bannedPlayer] && bannedPlayer === username) {
                console.log(`Oyuncu "${username}" yasaklı, oyuna alınmadı.`);
                const izinverme = DisconnectPacket.allocate();
                izinverme.message = "sunucudan sınırsız sürede uzaklaştırıldın";
                izinverme.sendTo(networkIdentifier);
                izinverme.dispose();
            }
        }
    }

    // Oyuncuyu oyuna al
    connectionList.set(networkIdentifier, username);
});

