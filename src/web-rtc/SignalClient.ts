import { generateToken } from "../utils/generateToken";
import { RtcAnswer, RtcOffer } from "./types";

const ROOMS_SERVICE_URL = "/api/rooms";
const OFFERS_SERVICE_URL = "/api/offers";

export class SignalClient {
  private clientId = generateToken();
  private storedOfferInfo: { ownerToken: string; offerId: string } | undefined;

  constructor(private roomId: string, private name: string) {}

  async postOffer(offer: RTCSessionDescriptionInit) {
    if (this.storedOfferInfo !== undefined) {
      throw new Error("TODO");
    }

    const req: RtcOffer = {
      clientId: this.clientId,
      name: this.name,
      offer: offer,
    };
    const response = await fetch(`${ROOMS_SERVICE_URL}/${this.roomId}`, {
      method: "POST",
      body: JSON.stringify(req),
    });
    this.storedOfferInfo = await response.json();
  }

  async getPeerOffers(): Promise<{ offerId: string; offer: RtcOffer }[]> {
    const response = await fetch(`${ROOMS_SERVICE_URL}/${this.roomId}`, {
      method: "GET",
    });
    const offersByOfferId: Record<string, RtcOffer> = await response.json();
    return Object.keys(offersByOfferId)
      .map((offerId) => ({
        offerId,
        offer: offersByOfferId[offerId],
      }))
      .filter(({ offer }) => offer.clientId !== this.clientId);
  }

  async answerPeerOffer(peerOfferId: string, answer: RTCSessionDescriptionInit) {
    const req: RtcAnswer = {
      clientId: this.clientId,
      name: this.name,
      answer,
    };
    await fetch(`${OFFERS_SERVICE_URL}/${peerOfferId}/answers`, {
      method: "POST",
      body: JSON.stringify(req),
    });
  }

  async renewOffer() {
    if (this.storedOfferInfo === undefined) {
      throw new Error("Attempted to renew before posting offer");
    }

    await fetch(`${OFFERS_SERVICE_URL}/${this.storedOfferInfo.offerId}/renew`, {
      method: "PUT",
      headers: {
        "x-gridunlock-owner-token": this.storedOfferInfo.ownerToken,
      },
    });
  }

  async getAnswers() {
    if (this.storedOfferInfo === undefined) {
      throw new Error("Attempted to get answers before posting offer");
    }

    const response = await fetch(`${OFFERS_SERVICE_URL}/${this.storedOfferInfo.offerId}/answers`, {
      method: "GET",
      headers: {
        "x-gridunlock-owner-token": this.storedOfferInfo.ownerToken,
      },
    });
    const answers: RtcAnswer[] = await response.json();
    return answers;
  }
}
