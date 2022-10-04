import { sign } from "crypto";
import * as ReactDOM from "react-dom";
import { Root } from "./components/Root";
import { RtcClient } from "./web-rtc/RtcClient";
import { SignalClient } from "./web-rtc/SignalClient";

ReactDOM.render(<Root />, document.getElementById("content"));

(async () => {
  const room = "bob";

  ["A", "B", "C"].forEach(async (name) => {
    console.info(`${name}: starting...`);
    const signalClient = new SignalClient(room, name);
    await signalClient.addToRoom();

    signalClient.getOtherClientIdsInRoom().then((clientIds) => {
      console.info(`${name}: found other client-ids`, clientIds);
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
