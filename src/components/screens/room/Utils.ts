import {Dimensions, Platform} from 'react-native'

const getAdaptiveMultiplier = (bgWidth: number): number => {
  const screenWidth =
    Platform.OS === 'web'
      ? Dimensions.get('window').width
      : Dimensions.get('screen').width
  return screenWidth / bgWidth
}

export const screenScale = Dimensions.get('screen').scale

export const pixelRatio = Platform.select({
  ios: 1,
  web: 1,
  android: 1 / screenScale,
  default: 1 / screenScale,
})

const mapObject = <S extends any, R extends any>(
  source: {[key: string]: S},
  converter: (key: string, element: S) => R,
): Array<R> => Object.keys(source).map<R>((key) => converter(key, source[key]))

export {getAdaptiveMultiplier, mapObject}
