import { generateToken } from "../utils/generateToken";
import { SignalClient } from "./SignalClient";
import SimplePeer from "simple-peer";

(async () => {
  const room = generateToken();

  ["A", "B", "C"].forEach(async (name) => {
    const connections = new Map<string, SimplePeer.Instance>();

    console.info(`${name}: starting...`);
    const signalClient = new SignalClient(room, name);
    await signalClient.addToRoom();

    signalClient.getOtherClientIdsInRoom().then((clientIds) => {
      console.info(`${name}: found other client-ids`, clientIds);

      for (const peerClientId of clientIds) {
        if (connections.has(peerClientId)) {
          continue;
        }

        const conn = new SimplePeer({ initiator: true });
        connections.set(peerClientId, conn);

        conn.on("signal", (data) => {
          console.info(`${name}: posting offer to `, peerClientId);
          signalClient.postOffer(peerClientId, data);
        });

        // TODO
        conn.on("connect", () => {
          console.info(`${name}: connected to `, peerClientId);
        });
      }
    });

    // const ownOffer = await rtcClient.host();

    // signalClient.getPeerOffers().then(async (offers) => {
    //   for (const { offerId, offer } of offers) {
    //     console.info(`${name}: accepting offer from ${offer.name}`);
    //     const peerClient = new RtcClient();
    //     signalClient.answerPeerOffer(offerId, await peerClient.acceptOffer(offer.offer));
    //   }
    // });

    // await signalClient.postOffer(ownOffer);

    // setInterval(async () => {
    //   console.info(`${name}: checking for answers`);
    //   const answers = await signalClient.getAnswers();
    //   console.info(answers);
    // }, 1000);
  });
})();
