import React, {useMemo} from 'react'
import {
  Image,
  ImageStyle,
  Platform,
  StyleProp,
  StyleSheet,
  View,
} from 'react-native'

interface Props {
  readonly isAdmin: boolean
  readonly isMediaIconsVisible: boolean
  readonly isAudioEnabled: boolean
  readonly isVideoEnabled: boolean
  readonly parentSize: number
  readonly absoluteSize?: number
  readonly scale: number
}

const UserIcons: React.FC<Props> = (props) => {
  const {
    isAdmin,
    isAudioEnabled,
    isVideoEnabled,
    isMediaIconsVisible,
    parentSize,
    absoluteSize,
    scale,
  } = props

  const toClosestEven = (value: number): number => 2 * Math.round(value / 2)
  const size = toClosestEven(absoluteSize ?? parentSize * scale)
  const spaceSize = toClosestEven(size * 0.3)

  const style: StyleProp<ImageStyle> = useMemo(
    () => ({
      width: size,
      height: size,
      marginVertical: spaceSize,
    }),
    [size],
  )

  const backgroundStyle: StyleProp<ImageStyle> = useMemo(
    () => [
      styles.background,
      {
        borderRadius: size,
        paddingHorizontal: spaceSize,
      },
    ],
    [size],
  )

  return (
    <View style={styles.container}>
      {isAdmin && (
        <View style={[backgroundStyle, {marginBottom: spaceSize}]}>
          <Image
            source={require('../assets/img/ic_avatar_crown.png')}
            style={style}
          />
        </View>
      )}

      {isMediaIconsVisible && (
        <View style={[styles.videoAudioTogglesContainer, backgroundStyle]}>
          {!isVideoEnabled && (
            <Image
              source={require('../assets/img/ic_stage_cam_off_web.png')}
              style={style}
            />
          )}
          {!isAudioEnabled && (
            <Image
              source={require('../assets/img/ic_stage_mic_off_web.png')}
              style={style}
            />
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: -14,
    height: '100%',
    justifyContent: 'space-between',
    ...Platform.select({
      web: {
        pointerEvents: 'none',
      },
    }),
  },
  background: {
    backgroundColor: 'white',
  },
  videoAudioTogglesContainer: {
    marginTop: 'auto',
  },
})

export default React.memo(UserIcons)
