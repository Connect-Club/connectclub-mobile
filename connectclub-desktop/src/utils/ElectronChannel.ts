type EventType =
  | 'requestDeeplink'
  | 'receivedDeeplink'
  | 'hide-video'
  | 'restore-video'

type EventArgs = {
  type: EventType
  data: any
}

type ListenerEntry = {
  type: EventType
  listener: (args: any) => void
}

class ElectronChannel {
  private receiverDisposable: (() => void) | undefined
  private listeners: Array<ListenerEntry> = []

  constructor() {}

  private onEvent = (args: any) => {
    const eventArgs = args[0] as EventArgs
    console.log('onEvent', JSON.stringify(eventArgs))
    this.listeners.forEach((entry) => {
      if (entry.type === eventArgs.type) {
        entry.listener(eventArgs.data)
      }
    })
  }

  send(type: EventType, args?: any) {
    window.api.send('fromMain', {type, data: args})
  }

  on(type: EventType, listener: (args: any) => void) {
    if (this.listeners.length === 0) {
      this.receiverDisposable = window.api.receive('toMain', this.onEvent)
    }
    this.listeners.push({type, listener})
    return () => this.off(type, listener)
  }

  off(type: EventType, listener: (args: any) => void) {
    this.listeners = this.listeners.filter(
      (entry) => entry.type !== type && entry.listener === listener,
    )
  }
}

const electronChannel = new ElectronChannel()

export default electronChannel
