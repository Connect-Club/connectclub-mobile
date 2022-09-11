import {BottomSheetModal} from '@gorhom/bottom-sheet'
import {observer} from 'mobx-react'
import React, {useEffect, useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {BackHandler, StyleSheet, View, ViewStyle} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import {api} from '../../../api/api'
import {useTheme} from '../../../theme/appTheme'
import {delay} from '../../../utils/date.utils'
import {bottomInset} from '../../../utils/inset.utils'
import {ms} from '../../../utils/layout.utils'
import {shareScreenLinkDialog} from '../../../utils/sms.utils'
import {tabletContainerWidthLimit} from '../../../utils/tablet.consts'
import {toastHelper} from '../../../utils/ToastHelper'
import BaseAutoHeightBottomSheetModal from '../../BaseAutoHeightBottomSheetModal'
import AppText from '../../common/AppText'
import HudView from '../../common/HudView'
import PrimaryButton from '../../common/PrimaryButton'
import Spacer from '../../common/Spacer'
import {RoomManager} from './jitsi/RoomManager'
import UserManager from './jitsi/UserManager'
import {convertRealRoomObjectToLocal} from './models/mappers'
import RectangleVideoView from './nativeview/RectangleVideoView'
import ToggleVideoAudioButtons from './ToggleVideoAudioButtons'

interface Props {
  readonly userManager: UserManager
  readonly roomManager: RoomManager
  readonly allowToShare: boolean
  readonly zIndex: number
}

const ShareScreenRoomObject: React.FC<Props> = ({
  userManager,
  roomManager,
  allowToShare,
  zIndex,
}) => {
  const sheetRef = useRef<BottomSheetModal>(null)
  const {t} = useTranslation()
  const {colors} = useTheme()
  const inset = useSafeAreaInsets()
  const isExpandedRef = useRef(false)
  const videoViewRef = useRef<RectangleVideoView | null>(null)

  const obj = convertRealRoomObjectToLocal(roomManager.shareScreenPosition!)

  const onSharePress = async () => {
    sheetRef.current?.close()
    const id = roomManager.getCurrentRoomId()
    if (!id) return
    const response = await api.createShareDesktopLink(id)
    if (response.error) return toastHelper.error(response.error)
    await delay(500)
    shareScreenLinkDialog(response.data.link)
  }

  useEffect(() => {
    const backListener = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        const isExpanded = isExpandedRef.current
        if (isExpanded) videoViewRef.current?.collapse?.()
        return isExpanded
      },
    )
    return backListener.remove
  }, [])

  const style: ViewStyle = {
    position: 'absolute',
    top: obj.y ?? 0,
    left: obj.x ?? 0,
    width: obj.width ?? 100,
    height: obj.height ?? 100,
    zIndex: zIndex,
    overflow: 'hidden',
  }

  const onShareClick = () => {
    if (!allowToShare) return
    sheetRef.current?.present()
  }

  return (
    <>
      <RectangleVideoView
        ref={videoViewRef}
        allowToShare={allowToShare}
        onShareClick={onShareClick}
        onStateChange={(expanded) => (isExpandedRef.current = expanded)}
        style={style}>
        <HudView>
          <View pointerEvents={'box-none'} style={styles.hudBottomBar}>
            <ToggleVideoAudioButtons
              style={styles.hudAudioVideoSwitcher}
              userManager={userManager}
              roomId={roomManager.getCurrentRoomId()}
              eventId={roomManager.roomEventId}
            />
          </View>
        </HudView>
      </RectangleVideoView>
      <BaseAutoHeightBottomSheetModal ref={sheetRef} isVisible>
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
              marginBottom: bottomInset(inset.bottom),
            },
          ]}
          textStyle={[styles.buttonText]}
          title={t('getShareLink')}
        />
        <Spacer vertical={ms(16)} />
      </BaseAutoHeightBottomSheetModal>
    </>
  )
}

export default observer(ShareScreenRoomObject)

const styles = StyleSheet.create({
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
    fontSize: ms(24),
    fontWeight: 'bold',
    marginTop: ms(32),
    marginHorizontal: ms(32),
    textAlign: 'center',
  },
  bottomSheetText: {
    fontSize: ms(16),
    fontWeight: '400',
    lineHeight: ms(24),
    marginHorizontal: ms(32),
    marginTop: ms(16),
  },
  button: {
    height: ms(42),
    minHeight: undefined,
    marginHorizontal: ms(32),
    marginTop: ms(24),
  },
  buttonText: {
    fontSize: ms(15),
  },
  hudBottomBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    // Dont use #ms() here. Because it is an equivalent of a native value
    paddingBottom: 16,
  },
  hudAudioVideoSwitcher: {
    marginStart: 0,
  },
})
