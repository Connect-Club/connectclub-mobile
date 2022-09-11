import {observer} from 'mobx-react'
import React, {useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {Image, StyleSheet, View} from 'react-native'

import {AnalyticsSender} from '../../../Analytics'
import AppIcon from '../../../assets/AppIcon'
import {commonStyles, makeTextStyle, useTheme} from '../../../theme/appTheme'
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
  readonly oldAvatar?: string
  readonly setAvatar?: (avatar: string) => void
  readonly analytics?: AnalyticsSender
  readonly smallUploadIcon?: boolean
}

const libraryId = 1
const photoId = 2

const EditClubAvatarView: React.FC<Props> = ({
  setAvatar,
  oldAvatar,
  size = ms(100),
  showChangeText = false,
  showUploadHint = false,
  analytics = undefined,
  smallUploadIcon = true,
}) => {
  const {t} = useTranslation()
  const {colors} = useTheme()
  const sheetRef = useRef<AppBottomSheet>(null)

  const changeAvatar = async (id: number) => {
    analytics?.sendEvent('photo_club_change_click')
    let selectPhoto: string | null = null
    if (id === libraryId) {
      analytics?.sendEvent('photo_club_library_click')
      selectPhoto = await cameraUtils.pickImageFromLibrary()
    } else {
      analytics?.sendEvent('photo_club_camera_click')
      const hasPermission =
        await devicePermissionUtils.checkHasCameraPermission()
      if (!hasPermission) {
        analytics?.sendEvent('camera_club_access_open')
        if (!(await devicePermissionUtils.requestCameraPermission(t))) {
          analytics?.sendEvent('camera_club_access_cancel')
          return
        }
      }
      if (hasPermission) analytics?.sendEvent('camera_club_access_ok')
      selectPhoto = await cameraUtils.takePhotoFromCamera()
    }
    if (selectPhoto === null) return
    setAvatar?.(selectPhoto)
    sheetRef.current?.dismiss()
  }

  const chooseSource = () => {
    sheetRef.current?.present()
  }

  const viewStyles = {
    backgroundColor: colors.accentSecondary,
    width: ms(size),
    height: ms(size),
    borderRadius: ms(size) / 2,
    borderWidth: oldAvatar ? 0 : ms(2),
    borderColor: colors.inactiveAccentColor,
  }
  return (
    <>
      <Vertical>
        <AppTouchableOpacity onPress={chooseSource}>
          <View style={[styles.avatarContainer, viewStyles]}>
            {!oldAvatar && (
              <AppIcon
                style={[
                  styles.selectPhotoIcon,
                  {transform: [{scale: smallUploadIcon ? 0.4 : 1}]},
                ]}
                type={'icSelectPhoto'}
                tint={colors.accentPrimary}
              />
            )}
            {!!oldAvatar && oldAvatar.startsWith('https://') && (
              <View style={commonStyles.flexCenter}>
                <AppAvatar
                  shortName={''}
                  avatar={oldAvatar}
                  style={{width: ms(size), height: ms(size)}}
                  size={ms(size)}
                />
                <AppIcon type={'icPencil'} style={styles.editIcon} />
              </View>
            )}

            {!!oldAvatar && !oldAvatar.startsWith('https://') && (
              <View style={commonStyles.flexCenter}>
                <Image
                  source={{uri: oldAvatar}}
                  style={{width: ms(size), height: ms(size)}}
                />
                <AppIcon type={'icPencil'} style={styles.editIcon} />
              </View>
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
            {id: libraryId, title: t('pickFromLibrary')},
            {id: photoId, title: t('takeAPhoto')},
          ]}
        />
      </BaseInlineBottomSheet>
    </>
  )
}

export default observer(EditClubAvatarView)

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
  editIcon: {
    position: 'absolute',
  },
})
