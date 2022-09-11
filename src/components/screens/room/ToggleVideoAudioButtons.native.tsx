import i18n from 'i18next'
import {observer} from 'mobx-react'
import React, {useCallback, useRef} from 'react'
import {
  findNodeHandle,
  Image,
  Platform,
  StyleProp,
  StyleSheet,
  UIManager,
  View,
  ViewStyle,
} from 'react-native'

import {analytics} from '../../../Analytics'
import RasterIcon from '../../../assets/RasterIcon'
import {useTheme} from '../../../theme/appTheme'
import devicePermissionUtils from '../../../utils/device-permission.utils'
import {ms} from '../../../utils/layout.utils'
import UserManager from './jitsi/UserManager'
import ClickableView from './nativeview/RTCClickableView'
import ToggleVideoAudioButtonsNative from './nativeview/RTCToggleVideoAudioButtons'

interface Props {
  readonly userManager: UserManager
  readonly roomId: string | undefined
  readonly eventId: string | undefined
  readonly style?: StyleProp<ViewStyle>
}

const cameraOnIcon = Image.resolveAssetSource(
  require('/src/assets/img/icCamOn.png'),
).uri
const cameraOffIcon = Image.resolveAssetSource(
  require('/src/assets/img/icCamOff.png'),
).uri
const minOnIcon = Image.resolveAssetSource(
  require('/src/assets/img/icMicOn.png'),
).uri
const minOffIcon = Image.resolveAssetSource(
  require('/src/assets/img/icMicOff.png'),
).uri

const config = UIManager.getViewManagerConfig('ToggleVideoAudioButtons')
const toggleVideo = config.Commands.toggleVideo
const toggleAudio = config.Commands.toggleAudio

const ToggleVideoAudioButtons: React.FC<Props> = ({
  style,
  userManager,
  roomId,
  eventId,
}) => {
  const {colors} = useTheme()
  const buttonsRef = useRef<typeof ToggleVideoAudioButtonsNative>(null)

  const onVideoClick = useCallback(async () => {
    if (!buttonsRef.current) return
    if (
      !(await devicePermissionUtils.checkCameraPermissions(i18n.t.bind(i18n)))
    )
      return
    //@ts-ignore
    const node = findNodeHandle(buttonsRef.current)
    UIManager.dispatchViewManagerCommand(node, toggleVideo, [])
    analytics.sendEvent('click_toggle_video_button', {roomId, eventId})
  }, [])

  const onAudioClick = useCallback(async () => {
    if (!buttonsRef.current) return
    if (!(await devicePermissionUtils.checkAudioPermissions(i18n.t.bind(i18n))))
      return
    //@ts-ignore
    const node = findNodeHandle(buttonsRef.current)
    UIManager.dispatchViewManagerCommand(node, toggleAudio, [])
    analytics.sendEvent('click_toggle_audio_button', {roomId, eventId})
  }, [])

  const user = userManager.currentUser
  if (!user) return null

  return (
    <ToggleVideoAudioButtonsNative
      ref={buttonsRef}
      micOnIcon={minOnIcon}
      micOffIcon={minOffIcon}
      cameraOnIcon={cameraOnIcon}
      cameraOffIcon={cameraOffIcon}
      progressColor={colors.secondaryBodyText}
      style={[
        styles.buttonsContainer,
        {backgroundColor: colors.floatingBackground},
        style,
      ]}>
      <ClickableView
        style={styles.button}
        accessibilityLabel={'cameraButton'}
        shouldVibrateOnClick
        onClick={onVideoClick}>
        <RasterIcon type={'icCamOff'} style={styles.iconCamera} />
      </ClickableView>
      <ClickableView
        style={styles.button}
        accessibilityLabel={'microphoneButton'}
        shouldVibrateOnClick
        onClick={onAudioClick}>
        <RasterIcon type={'icMicOff'} style={styles.iconAudio} />
      </ClickableView>
      <View accessibilityLabel={'simple'} />
    </ToggleVideoAudioButtonsNative>
  )
}

export default observer(ToggleVideoAudioButtons)

const styles = StyleSheet.create({
  buttonsContainer: {
    width: ms(96),
    height: ms(48),
    borderRadius: ms(48 / 2),
    marginStart: ms(16),
    flexDirection: 'row',
    zIndex: 100,
  },

  button: {
    width: ms(48),
    height: ms(48),
    paddingHorizontal: ms(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconCamera: {
    position: 'absolute',
    top: 0,
    width: ms(48),
    height: ms(48),
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      android: {transform: [{scale: __DEV__ ? 1 : 0.5}]},
      ios: {transform: [{scale: 0.35}]},
    }),
  },

  iconAudio: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: ms(48),
    height: ms(48),
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      android: {transform: [{scale: __DEV__ ? 1 : 0.5}]},
      ios: {transform: [{scale: 0.35}]},
    }),
  },
})
