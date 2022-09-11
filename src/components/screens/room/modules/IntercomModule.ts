import {NativeModules} from 'react-native'

export const intercomLoginUser = (username: string) => {
  NativeModules.IntercomModule.loginUser(username)
}

export const intercomLogoutUser = () => {
  NativeModules.IntercomModule.logoutUser()
}

export const presentIntercom = () => {
  NativeModules.IntercomModule.presentIntercom()
}

export const presentIntercomCarousel = () => {
  NativeModules.IntercomModule.presentIntercomCarousel()
}

export const setIntercomLauncherVisible = (isVisible: boolean) => {
  NativeModules.IntercomModule.setLauncherVisibility(isVisible)
}

export const intercomRegisterUnidentifiedUser = () => {
  NativeModules.IntercomModule.registerUnidentifiedUser()
}

class IntercomController {
  private revealTimerId: number | undefined
  private dismissTimerId: number | undefined

  requestDismissIntercomLauncher = () => {
    if (this.revealTimerId) {
      clearTimeout(this.revealTimerId)
    }
    this.dismissTimerId = setTimeout(() => {
      setIntercomLauncherVisible(false)
    }, 200)
  }

  requestRevealIntercomLauncher = () => {
    if (this.dismissTimerId) {
      clearTimeout(this.dismissTimerId)
    }
    this.revealTimerId = setTimeout(() => {
      setIntercomLauncherVisible(true)
    }, 200)
  }
}

export const intercomController = new IntercomController()
