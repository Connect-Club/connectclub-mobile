import React, {useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Image, StyleSheet, View} from 'react-native'

import {AnalyticsSender} from '../../../Analytics'
import AppIcon from '../../../assets/AppIcon'
import {storage} from '../../../storage'
import {makeTextStyle, useTheme} from '../../../theme/appTheme'
import {delay} from '../../../utils/date.utils'
import devicePermissionUtils from '../../../utils/device-permission.utils'
import {ms} from '../../../utils/layout.utils'
import {tabletContainerWidthLimit} from '../../../utils/tablet.consts'
import BaseInlineBottomSheet, {
  AppBottomSheet,
} from '../../BaseInlineBottomSheet'
import AppAvatar from '../../common/AppAvatar'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import CommonBottomSheetListView from '../../common/CommonBottomSheetListView'
import Vertical from '../../common/Vertical'
import {cameraUtils} from '../../webSafeImports/webSafeImports'

interface Props {
  readonly showChangeText?: boolean
  readonly showUploadHint?: boolean
  readonly size?: number
  readonly setAvatar?: (avatar: string) => void
  readonly analytics?: AnalyticsSender
  readonly smallUploadIcon?: boolean
}

const UploadAvatarView: React.FC<Props> = ({
  setAvatar,
  size = 160,
  showChangeText = false,
  showUploadHint = false,
  analytics = undefined,
  smallUploadIcon = false,
}) => {
  const {t} = useTranslation()
  const {colors} = useTheme()
  const oldAvatar = storage.currentUser?.avatar ?? undefined
  const [avatar, setLocalAvatar] = useState<string | undefined>(oldAvatar)
  const sheetRef = useRef<AppBottomSheet>(null)

  const changeAvatar = async (id: number) => {
    analytics?.sendEvent('photo_change_click')
    sheetRef.current?.dismiss()
    await delay(500)
    let selectPhoto: string | null = null
    if (id === 1) {
      analytics?.sendEvent('photo_library_click')
      selectPhoto = await cameraUtils.pickImageFromLibrary()
    } else {
      analytics?.sendEvent('photo_camera_click')
      const hasPermission = await devicePermissionUtils.checkHasCameraPermission()
      if (!hasPermission) {
        analytics?.sendEvent('camera_access_open')
        if (!(await devicePermissionUtils.requestCameraPermission(t))) {
          analytics?.sendEvent('camera_access_cancel')
          return
        }
      }
      if (hasPermission) analytics?.sendEvent('camera_access_ok')
      selectPhoto = await cameraUtils.takePhotoFromCamera()
    }
    if (selectPhoto === null) return
    setLocalAvatar(selectPhoto)
    setAvatar?.(selectPhoto)
  }

  const chooseSource = () => {
    sheetRef.current?.present()
  }

  return (
    <>
      <Vertical>
        <AppTouchableOpacity onPress={chooseSource}>
          <View
            style={[
              styles.avatarContainer,
              {
                backgroundColor: colors.accentSecondary,
                width: ms(size),
                height: ms(size),
                borderRadius: ms(size) / 2,
                borderWidth: avatar ? 0 : ms(2),
                borderColor: colors.inactiveAccentColor,
              },
            ]}>
            {!avatar && (
              <AppIcon
                style={[
                  styles.selectPhotoIcon,
                  {transform: [{scale: smallUploadIcon ? 0.4 : 1}]},
                ]}
                type={'icSelectPhoto'}
                tint={colors.accentPrimary}
              />
            )}
            {!!avatar &&
              (avatar.startsWith('https://') ||
                avatar.startsWith('http://')) && (
              <AppAvatar
                shortName={''}
                avatar={avatar}
                style={{width: ms(size), height: ms(size)}}
                size={ms(size)}
              />
            )}

            {!!avatar &&
              !avatar.startsWith('https://') &&
              !avatar.startsWith('http://') && (
              <Image
                source={{uri: avatar}}
                style={{width: ms(size), height: ms(size)}}
              />
            )}
          </View>
          {showChangeText && (
            <AppText
              style={[styles.changePhotoText, {color: colors.accentPrimary}]}>
              {t('pickAvatarChangePhoto')}
            </AppText>
          )}
        </AppTouchableOpacity>
        {showUploadHint && (
          <AppText style={[styles.uploadHint, {color: colors.supportBodyText}]}>
            {t('pickAvatarChangePhotoHint')}
          </AppText>
        )}
      </Vertical>
      <BaseInlineBottomSheet ref={sheetRef} height={ms(56) * 2}>
        <CommonBottomSheetListView
          onPress={(model) => changeAvatar(model.id)}
          items={[
            {id: 1, title: t('pickFromLibrary')},
            {id: 2, title: t('takeAPhoto')},
          ]}
        />
      </BaseInlineBottomSheet>
    </>
  )
}

export default UploadAvatarView

const styles = StyleSheet.create({
  uploadSheet: {
    width: '100%',
    maxWidth: ms(tabletContainerWidthLimit),
    alignSelf: 'center',
  },
  avatarContainer: {
    overflow: 'hidden',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  selectPhotoIcon: {
    position: 'absolute',
    zIndex: 2,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  changePhotoText: {
    fontSize: ms(15),
    fontWeight: '600',
    textAlign: 'center',
    marginTop: ms(34),
    height: ms(28),
    lineHeight: ms(28),
  },
  uploadHint: {
    ...makeTextStyle(16, 24, 'normal'),
    marginTop: ms(16),
    textAlign: 'center',
  },
})
