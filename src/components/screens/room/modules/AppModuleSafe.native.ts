import {NativeModules} from 'react-native'

const {AppModule} = NativeModules
export const setDjMode = (enabled: boolean) => {
  AppModule.setDjMode(enabled)
}
