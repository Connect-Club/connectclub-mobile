/**
 * Global cnnct variable is initialized in public/index.html when Go WASM is loaded
 */
declare var cnnct: any

export abstract class WSDelegate {
  abstract onMessage(message: string): void
  abstract onReaction(reaction: object): void
  abstract onReconnect(isReconnecting: any): void
  // {userId: string, x: number, y, duration: number}
  abstract onPath(path: any): void
  abstract onNativeState(nativeState: object): void
  abstract onRadarVolume(radarVolume: object): void
  abstract onConnectionState(connectionState: object): void
  abstract onPopupUsers(popupUsers: object): void
  // {mode: string, isFirstConnection: bool}
  abstract onChangeRoomMode(roomMode: object): void
  abstract didWebsocketsConnect(): void
  abstract onParticipantsVisibilityChanged(state: object): void
}

export class WSAdapter {
  private ws: any | null

  initialize(wsDelegate: WSDelegate) {
    this.ws = new cnnct.AppWebsocket({
      wsDelegate,
      //change zeros to correct values if simulcast implemented
      fullResCircleDiameterInch: 0,
      viewportWidthInch: 0,
    })
  }

  connect(opts: any) {
    return this.ws?.connect(opts)
  }

  sendPath(toCoords: any) {
    return this.ws?.sendPath(toCoords)
  }

  sendMessage(message: any) {
    return this.ws?.sendMessage({
      message: JSON.stringify(message),
    })
  }

  sendState(state: any) {
    return this.ws?.sendState(state)
  }

  removeReaction(objReaction: any) {
    return this.ws?.removeReaction(objReaction)
  }

  disconnect() {
    return this.ws?.disconnect()
  }
}
