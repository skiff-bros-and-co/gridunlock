import SimplePeer from "simple-peer";

export interface RtcOffer {
  clientId: string;
  offer: SimplePeer.SignalData;
  name: string;
}

export interface RtcAnswer {
  clientId: string;
  answer: SimplePeer.SignalData;
  name: string;
}
