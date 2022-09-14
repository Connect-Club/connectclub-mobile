import React, {useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View, ViewStyle} from 'react-native'

import {api} from '../../../../src/api/api'

import BaseInlineBottomSheet, {
  AppBottomSheet,
} from '../../../../src/components/BaseInlineBottomSheet'
import AppText from '../../../../src/components/common/AppText'
import AppTouchableOpacity from '../../../../src/components/common/AppTouchableOpacity'
import PrimaryButton from '../../../../src/components/common/PrimaryButton'
import {RoomObject} from '../../../../src/components/screens/room/models/jsonModels'
import {convertRealRoomObjectToLocal} from '../../../../src/components/screens/room/models/mappers'

import {delay} from '../../../../src/utils/date.utils'
import {ms} from '../../../../src/utils/layout.utils'
import {shareScreenLinkDialog} from '../../../../src/utils/sms.utils'
import {tabletContainerWidthLimit} from '../../../../src/utils/tablet.consts'
import {toastHelper} from '../../../../src/utils/ToastHelper'

import {useTheme} from '../../../../src/theme/appTheme'

interface Props {
  readonly settings: RoomObject
  readonly roomId: string
  readonly widthMultiplier: number
  readonly heightMultiplier: number
  readonly allowToShare: boolean
  readonly mediaStream: MediaStream | null
}

const ShareScreenRoomObjectWeb: React.FC<Props> = ({
  settings,
  roomId,
  widthMultiplier,
  mediaStream,
  allowToShare,
}) => {
  const {t} = useTranslation()
  const {colors} = useTheme()
  const shareBottomSheetRef = useRef<AppBottomSheet>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  if (
    mediaStream &&
    videoRef.current &&
    !(videoRef.current! as any).srcObject
  ) {
    ;(videoRef.current! as any).srcObject = mediaStream
  }

  const onSharePress = async () => {
    shareBottomSheetRef.current?.dismiss()

    const response = await api.createShareDesktopLink(roomId)
    if (response.error) return toastHelper.error(response.error)
    await delay(500)

    shareScreenLinkDialog(response.data.link)
  }

  const obj = convertRealRoomObjectToLocal(settings, widthMultiplier)

  const style: ViewStyle = {
    position: 'absolute',
    top: obj.y ?? 0,
    left: obj.x ?? 0,
    width: obj.width ?? 100,
    height: obj.height ?? 100,
    overflow: 'hidden',
    justifyContent: 'center',
  }

  return (
    <>
      <View style={style}>
        {mediaStream && (
          <video
            ref={videoRef}
            autoPlay={true}
            playsInline={true}
            controls={false}
          />
        )}

        {!mediaStream && allowToShare && (
          <AppTouchableOpacity
            onPress={() => shareBottomSheetRef.current?.present()}
            style={styles.tapToShareButton}>
            <AppText style={{color: colors.textPrimary}}>
              {t('tapToShare')}
            </AppText>
          </AppTouchableOpacity>
        )}
      </View>

      <BaseInlineBottomSheet ref={shareBottomSheetRef}>
        <View>
          <AppText style={[styles.bottomSheetTitle, {color: colors.bodyText}]}>
            {t('howToScreenShare')}
          </AppText>
          <AppText
            style={[styles.bottomSheetText, {color: colors.secondaryBodyText}]}>
            {t('shareScreenInstructions')}
          </AppText>

          <PrimaryButton
            onPress={onSharePress}
            style={[
              styles.button,
              {
                backgroundColor: colors.accentSecondary,
                marginBottom: ms(12),
              },
            ]}
            textStyle={[styles.buttonText, {color: colors.accentPrimary}]}
            title={t('getShareLink')}
          />
        </View>
      </BaseInlineBottomSheet>
    </>
  )
}

export default ShareScreenRoomObjectWeb

const styles = StyleSheet.create({
  tapToShareButton: {
    fontSize: ms(24),
    borderRadius: ms(24),
    paddingHorizontal: ms(16),
    paddingVertical: ms(8),
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  sheet: {
    width: '100%',
    maxWidth: ms(tabletContainerWidthLimit),
    alignSelf: 'center',
  },

  text: {
    fontSize: ms(15),
    fontWeight: 'bold',
  },

  bottomSheetTitle: {
    fontSize: ms(18),
    fontWeight: '600',
    marginTop: ms(8),
    marginHorizontal: ms(32),
    textAlign: 'center',
  },

  bottomSheetText: {
    fontSize: ms(17),
    marginHorizontal: ms(32),
    marginTop: ms(21),
  },

  button: {
    height: ms(42),
    minHeight: undefined,
    marginHorizontal: ms(32),
    marginTop: ms(21),
  },

  buttonText: {
    fontSize: ms(15),
  },
})
