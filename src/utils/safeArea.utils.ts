import {Dimensions} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

// the value returned does not include the bottom navigation bar, I am not sure why yours does.
let windowH = Dimensions.get('window').height

export const useBottomSafeArea = () => {
  return useSafeAreaInsets().bottom
}

export const getHeightFromPercent = (percent: string) => {
  const percentInt = parseInt(percent.replace('%', ''), 10)
  const height = windowH
  return height - height * ((100 - percentInt) / 100.0)
}
