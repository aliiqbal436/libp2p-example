import { createLibp2p } from "libp2p";
import { bootstrap } from "@libp2p/bootstrap";
import { tcp } from "@libp2p/tcp";
import { mplex } from "@libp2p/mplex";
import { yamux } from "@chainsafe/libp2p-yamux";
import { noise } from "@chainsafe/libp2p-noise";
import { createEd25519PeerId } from "@libp2p/peer-id-factory";
import { peerIdFromKeys } from "@libp2p/peer-id";
import { kadDHT } from "@libp2p/kad-dht";
import fs from "fs";
import { multiaddr } from '@multiformats/multiaddr'
if (!fs.existsSync("config.json")) {
  const peerId = await createEd25519PeerId();
  const peerIdObject = {
    id: peerId.toString(),
    privateKey: peerId.privateKey,
    publicKey: peerId.publicKey,
  };

  const peerIdJson = JSON.stringify(peerIdObject, null, 2);
  fs.writeFileSync("config.json", peerIdJson);
}

const peerIdConfig = fs.readFileSync("config.json", "utf8");
const peerIdObject = JSON.parse(peerIdConfig);
// console.log('peerIdKeys ====', Buffer.from(peerIdObject.publicKey.data));

const peerIdKeys = await peerIdFromKeys(
  Buffer.from(peerIdObject.publicKey.data),
  Buffer.from(peerIdObject.privateKey.data)
);
console.log("peerIdKeys ====", peerIdKeys);
const node = await createLibp2p({
  peerId: peerIdKeys,
  addresses: {
    // To signal the addresses we want to be available, we use
    // the multiaddr format, a self describable address
    listen: ["/ip4/0.0.0.0/tcp/4001"],
  },
  transports: [tcp()],
  streamMuxers: [yamux(), mplex()],
  connectionEncryption: [noise()],
  dht: kadDHT(),
  peerDiscovery: [
    bootstrap({
      list: [
        "/ip4/46.101.133.110/tcp/4001/p2p/12D3KooWKXDA5q8YwJFR18puFv3TA1pRATg4VP6nWFfo7zTEPe5t",
      ],
    }),
  ],
});

node.addEventListener("peer:connect", (evt) => {
  console.log("Connection established to:", evt.detail); // Emitted when a new connection has been created
  console.log("peers ---", node.getPeers())
});

node.addEventListener("peer:discovery", (evt) => {
  // No need to dial, autoDial is on
  console.log("Discovered:", evt.detail.id.toString());
});
// await node.dial(multiaddr("/ip4/46.101.133.110/tcp/4001/p2p/12D3KooWKXDA5q8YwJFR18puFv3TA1pRATg4VP6nWFfo7zTEPe5t"));
// await node.start();
console.log('mutl ===', node.getMultiaddrs())

// const bootstrapAddress = multiaddr('/ip4/182.191.70.215/tcp/4001/p2p/12D3KooWEiUjPkRtEJ2tfkRSH7eYKvCPdCf64FFLSN1C9ce6rXoj');
// await node.dial(bootstrapAddress);
// console.log('Connected to the bootstrap node.');
// /ip4/182.191.70.215/tcp/4001/p2p/12D3KooWEiUjPkRtEJ2tfkRSH7eYKvCPdCf64FFLSN1C9ce6rXoj
// node.start();
// await node.peerStore.forEach((peer) => console.log(peer));
