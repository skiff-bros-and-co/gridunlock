export interface RtcOffer {
  clientId: string;
  offer: RTCSessionDescriptionInit;
  name: string;
}

export interface RtcAnswer {
  clientId: string;
  answer: RTCSessionDescriptionInit;
  name: string;
}
