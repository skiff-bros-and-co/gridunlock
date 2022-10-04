import { generateToken } from "../utils/generateToken";
import { RtcAnswer, RtcOffer } from "./types";

const ROOMS_SERVICE_URL = "/api/rooms";
const OFFERS_SERVICE_URL = "/api/offers";

export class SignalClient {
  private clientId = generateToken();

  constructor(private roomId: string, private name: string) {}

  async addToRoom() {
    await fetch(`${ROOMS_SERVICE_URL}/${this.roomId}/clients/${this.clientId}`, {
      method: "PUT",
    });
  }

  async getOtherClientIdsInRoom() {
    const response = await fetch(`${ROOMS_SERVICE_URL}/${this.roomId}/clients`, {
      method: "GET",
    });
    const clientIds: string[] = await response.json();
    return clientIds;
  }

  async postOffer(peerClientId: string, offer: RTCSessionDescriptionInit) {
    const req: RtcOffer = {
      clientId: this.clientId,
      name: this.name,
      offer: offer,
    };
    const response = await fetch(`${ROOMS_SERVICE_URL}/${this.roomId}/clients/${peerClientId}/offers`, {
      method: "POST",
      body: JSON.stringify(req),
    });
    const parsed: { ownerToken: string; offerId: string } = await response.json();
    return parsed;
  }

  async getPeerOffers() {
    const response = await fetch(`${ROOMS_SERVICE_URL}/${this.roomId}/clients/${this.clientId}/offers`, {
      method: "GET",
    });
    const offerIds: string[] = await response.json();
    return offerIds;
  }

  async getOffer(offerId: string) {
    const response = await fetch(`${OFFERS_SERVICE_URL}/${offerId}`, {
      method: "GET",
    });
    const offer: RtcOffer = await response.json();
    return offer;
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

  // async renewOffer() {
  //   if (this.storedOfferInfo === undefined) {
  //     throw new Error("Attempted to renew before posting offer");
  //   }

  //   await fetch(`${OFFERS_SERVICE_URL}/${this.storedOfferInfo.offerId}/renew`, {
  //     method: "PUT",
  //     headers: {
  //       "x-gridunlock-owner-token": this.storedOfferInfo.ownerToken,
  //     },
  //   });
  // }

  // async getAnswers() {
  //   if (this.storedOfferInfo === undefined) {
  //     throw new Error("Attempted to get answers before posting offer");
  //   }

  //   const response = await fetch(`${OFFERS_SERVICE_URL}/${this.storedOfferInfo.offerId}/answers`, {
  //     method: "GET",
  //     headers: {
  //       "x-gridunlock-owner-token": this.storedOfferInfo.ownerToken,
  //     },
  //   });
  //   const answers: RtcAnswer[] = await response.json();
  //   return answers;
  // }
}
