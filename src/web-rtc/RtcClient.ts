const RTC_CONFIGURATION: RTCConfiguration = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

export class RtcClient {
  private connection = new RTCPeerConnection(RTC_CONFIGURATION);
  private channel = this.connection.createDataChannel("data", { negotiated: true, id: 1 });

  public async host() {
    const offer = await this.connection.createOffer({
      offerToReceiveAudio: false,
      offerToReceiveVideo: false,
    });
    await this.connection.setLocalDescription(offer);
    return offer;
  }

  public async acceptOffer(offer: RTCSessionDescriptionInit) {
    await this.connection.setRemoteDescription(offer);

    const answer = await this.connection.createAnswer();
    await this.connection.setLocalDescription(answer);
    return answer;
  }

  public async acceptAnswer(answer: RTCSessionDescriptionInit) {
    await this.connection.setRemoteDescription(answer);
  }
}
