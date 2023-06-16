import { createLibp2p } from "libp2p";
import { bootstrap } from "@libp2p/bootstrap";
import { tcp } from "@libp2p/tcp";
import { mplex } from "@libp2p/mplex";
import { yamux } from "@chainsafe/libp2p-yamux";
import { noise } from "@chainsafe/libp2p-noise";
import { createEd25519PeerId } from "@libp2p/peer-id-factory";
import { kadDHT } from '@libp2p/kad-dht'

const peerId = await createEd25519PeerId();
console.log(peerId);

const node = await createLibp2p({
  peerId,
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
        interval: 60e3,
        list: ['/ip4/182.191.70.215/tcp/4001']
        })
    ]
});

node.start();
console.log("node.getPeers() =====", node.getMultiaddrs());
