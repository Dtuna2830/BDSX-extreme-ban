import { NetworkIdentifier } from "bdsx/bds/networkidentifier";
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { BuildPlatform } from "bdsx/common";
import { events } from "bdsx/event";
import * as fs from "fs";

const connectionList = new Map<NetworkIdentifier, string>();

// Dosya adı
const jsonFileName = 'connection_data.json';

// Eğer dosya yoksa oluştur
if (!fs.existsSync(jsonFileName)) {
    fs.writeFileSync(jsonFileName, '{}');
    console.log("Bağlantı veritabanı oluşturuldu");
} else {
    console.log("Bağlantı veritabanı zaten var");
}

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

    console.log(`Connection: ${username}> IP=${ip}, XUID=${xuid}, DeviceID=${deviceid}, ID=${clientid}, PLATFORM=${BuildPlatform[connreq.getDeviceOS()] || "UNKNOWN"}`);

    const data = JSON.parse(fs.readFileSync(jsonFileName, 'utf-8'));
    if (data[username]) {
        data[username] = { ip, xuid, deviceid, clientid, platform: BuildPlatform[connreq.getDeviceOS()] || "UNKNOWN" };
    } else {
        data[username] = { ip, xuid, deviceid, clientid, platform: BuildPlatform[connreq.getDeviceOS()] || "UNKNOWN" };
    }

    fs.writeFileSync(jsonFileName, JSON.stringify(data, null, 2));
    if (username) {
        connectionList.set(networkIdentifier, username);
    }
});
