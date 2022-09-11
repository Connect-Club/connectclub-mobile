import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import {observer} from 'mobx-react-lite'
import React, {useCallback, useEffect, useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {Keyboard, StyleProp, StyleSheet, TextStyle, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import {ms} from 'react-native-size-matters'

import {analytics} from '../Analytics'
import {hideLoading, showLoading} from '../appEventEmitter'
import AppIcon from '../assets/AppIcon'
import AppNavigationHeader from '../components/common/AppNavigationHeader'
import AppSwitchButton from '../components/common/AppSwitchButton'
import AppText from '../components/common/AppText'
import AppTextInput from '../components/common/AppTextInput'
import AppTouchableOpacity from '../components/common/AppTouchableOpacity'
import {clearWindowFocus} from '../components/common/DecorConfigModule'
import FlexSpace from '../components/common/FlexSpace'
import Horizontal from '../components/common/Horizontal'
import Spacer from '../components/common/Spacer'
import EditClubAvatarView from '../components/screens/createClub/EditClubAvatarView'
import NavigationIconButton from '../components/screens/mainFeed/NavigationIconButton'
import NavigationTextButton from '../components/screens/mainFeed/NavigationTextButton'
import {logJS} from '../components/screens/room/modules/Logger'
import {
  alert,
  KeyboardSpacer,
  MenuTextInput,
} from '../components/webSafeImports/webSafeImports'
import {ClubModel} from '../models'
import {storage} from '../storage'
import EditClubSettingsStore from '../stores/EditClubSettingsStore'
import {commonStyles, makeTextStyle, useTheme} from '../theme/appTheme'
import {useBottomSafeArea} from '../utils/safeArea.utils'
import {processTextLink} from '../utils/textedit.utils'
import {toastHelper} from '../utils/ToastHelper'
import {useViewModel} from '../utils/useViewModel'

const inputLimit = 900

interface ScreenProps {
  club: ClubModel
  canGoBack?: boolean
}

type ScreenRouteProp = RouteProp<{Screen: ScreenProps}, 'Screen'>

const EditClubSettingScreen: React.FC = () => {
  const {t} = useTranslation()
  const {colors} = useTheme()
  const navigation = useNavigation()
  const {params} = useRoute<ScreenRouteProp>()
  const store = useViewModel(() => new EditClubSettingsStore())
  const inputRef = useRef<typeof MenuTextInput>(null)
  const inset = useBottomSafeArea()
  const canGoBack = params.canGoBack ?? navigation.canGoBack()
  const consentDiscardChanges = useRef(false)

  if (!params.club) throw 'Club model is not specified'
  if (!store.isInitialized) {
    store.init(params.club)
  }

  useEffect(() => {
    if (store.error) {
      toastHelper.error('somethingWentWrong')
    }
  }, [store.error])

  useEffect(() => {
    if (store.isInProgress) {
      showLoading()
    } else {
      hideLoading()
    }
  }, [store.isInProgress])

  const performClose = useCallback(() => {
    consentDiscardChanges.current = true
    if (canGoBack) {
      logJS('debug', 'EditClubSettingScreen', 'go back')
      navigation.goBack()
    } else {
      logJS('debug', 'EditClubSettingScreen', 'navigate to user profile')
      navigation.navigate('ProfileScreen', {userId: storage.currentUser?.id})
    }
  }, [canGoBack, navigation])

  const onClose = useCallback(() => {
    analytics.sendEvent('edit_club_setting_close_button_click')
    hideKeyboard()
    if (!store.isChanged) return performClose()

    alert(t('discardChanges') + '?', t('saveAlertText'), [
      {
        style: 'destructive',
        text: t('discardChanges'),
        onPress: () => {
          analytics.sendEvent('edit_club_setting_discard_changes_click')
          performClose()
        },
      },
      {style: 'cancel', text: t('keepEditing')},
    ])
  }, [performClose, store.isChanged, t])

  useEffect(() => {
    return navigation.addListener('beforeRemove', (e) => {
      if (!consentDiscardChanges.current) {
        onClose()
        e.preventDefault()
      }
    })
  }, [navigation, onClose])

  const inputTextStyles = {
    backgroundColor: colors.skeletonDisabled,
    color: colors.secondaryBodyText,
  }
  const colorStyle = {
    color: colors.thirdBlack,
  }
  const backgroundColorStyles = {backgroundColor: colors.skeleton}

  const hideKeyboard = () => {
    clearWindowFocus()
    Keyboard.dismiss()
    //@ts-ignore
    inputRef.current?.setNativeProps({
      shouldDismissKeyboard: true,
    })
  }
  const onSavePress = async () => {
    analytics.sendEvent('edit_club_setting_save_button_click')
    hideKeyboard()
    await store.updateClubInfo()
    if (!store.error) {
      performClose()
    }
  }
  const onInterestsChange = () => {
    analytics.sendEvent('edit_club_setting_select_interests_button_click')

    navigation.navigate('SelectClubInterestsScreen', {
      clubId: params.club.id,
      isModal: true,
      isEditAllowed: false,
      preselectedIds: store.selectedInterestIds,
    })
  }
  const onPublic = (enabled: boolean) => {
    analytics.sendEvent('edit_club_setting_set_public_switcher_click')
    store.onUpdatePublic(!enabled)
    return true
  }

  const counterTextStyle: StyleProp<TextStyle> = {
    color: colors.secondaryBodyText,
    paddingEnd: ms(3),
  }

  const description =
    store.inputDescription.length > 0
      ? store.inputDescription
      : params.club.description

  // @ts-ignore
  return (
    <>
      <AppNavigationHeader
        title={t('clubSettings')}
        headerLeft={
          <NavigationIconButton
            icon={canGoBack ? 'icNavigationBack' : 'icNavigationClose'}
            onPress={onClose}
          />
        }
        headerRight={
          <NavigationTextButton onPress={onSavePress} title={t('saveButton')} />
        }
      />
      <ScrollView style={styles.root}>
        <Horizontal style={commonStyles.alignCenter}>
          <EditClubAvatarView
            oldAvatar={store.clubAvatar}
            setAvatar={store.updateClubAvatar}
          />
          <Spacer horizontal={ms(12)} />

          <AppText style={[styles.description, colorStyle]}>
            {t('avatarDescription')}
          </AppText>
        </Horizontal>
        <Spacer vertical={ms(24)} />

        <AppTextInput
          value={store.clubTitle}
          editable={false}
          style={[styles.textInput, inputTextStyles]}
        />
        <Spacer vertical={ms(12)} />

        <AppText style={[styles.description, colorStyle]}>
          {t('lockedInputDescription')}
        </AppText>
        <Spacer vertical={ms(24)} />

        <View>
          <MenuTextInput
            ref={inputRef}
            style={[
              styles.descriptionInput,
              backgroundColorStyles,
              {color: colors.bodyText},
            ]}
            indentRight={ms(78)}
            onChangeText={store.onDescriptionChange}
            onLinkText={(link, location) =>
              processTextLink(
                t,
                store.inputDescription,
                link,
                location,
                store.onDescriptionChange,
              )
            }
            maxLength={inputLimit}
            value={description}
            placeholder={t('createEventDescriptionInputPlaceholder')}
            multiline
          />
          <Horizontal style={styles.inputContainer}>
            <AppText
              style={[
                styles.counter,
                colorStyle,
              ]}>{`${store.inputDescription.length}/${inputLimit}`}</AppText>
          </Horizontal>
        </View>
        <Spacer vertical={ms(12)} />

        <AppText style={[styles.description, colorStyle]}>
          {t('inputDescription')}
        </AppText>
        <Spacer vertical={ms(24)} />

        <AppTouchableOpacity
          onPress={onInterestsChange}
          style={[backgroundColorStyles, styles.button]}>
          <Horizontal style={[commonStyles.alignCenter, styles.buttonContent]}>
            <AppText style={styles.buttonText}>{t('clubInterest')}</AppText>
            <FlexSpace />
            {store.selectedInterestIds.length > 0 && (
              <AppText style={[styles.buttonText, counterTextStyle]}>
                {store.selectedInterestIds.length}
              </AppText>
            )}
            <AppIcon style={styles.buttonIcon} type='icArrowRight' />
          </Horizontal>
        </AppTouchableOpacity>
        <Spacer vertical={ms(12)} />

        <AppText style={[styles.description, colorStyle]}>
          {t('interestsDescription')}
        </AppText>
        <Spacer vertical={ms(24)} />

        <AppSwitchButton
          title={t('startRoomPublic')}
          initialState={store.isPublic}
          disabled={!store.isPublicToggleEnabled}
          onSwitch={onPublic}
        />
        <Spacer vertical={ms(12)} />

        <AppText style={[styles.description, colorStyle]}>
          {t('publicSwitcherDescription')}
        </AppText>
        <Spacer vertical={ms(8)} />
        <Horizontal style={commonStyles.alignCenter}>
          <View style={[styles.point, {backgroundColor: colors.thirdBlack}]} />
          <AppText style={[styles.description, colorStyle]}>
            {t('publicSwitcherDescriptionFirstPoint')}
          </AppText>
        </Horizontal>
        <Horizontal style={commonStyles.alignCenter}>
          <View style={[styles.point, {backgroundColor: colors.thirdBlack}]} />
          <AppText style={[styles.description, colorStyle]}>
            {t('publicSwitcherDescriptionSecondPoint')}
          </AppText>
        </Horizontal>
        <Spacer vertical={inset + ms(36)} />
        <KeyboardSpacer />
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: ms(16),
    paddingTop: ms(12),
  },
  description: {
    ...makeTextStyle(ms(12), ms(16)),
    textAlign: 'left',
  },
  headerRight: {
    marginRight: ms(10),
  },
  textInput: {
    ...makeTextStyle(ms(17), ms(26)),
    paddingBottom: ms(10),
    paddingLeft: ms(12),
    height: ms(48),
  },
  inputContainer: {
    alignItems: 'center',
    position: 'absolute',
    right: ms(16),
    top: ms(10),
  },
  title: {
    ...makeTextStyle(ms(18), ms(24), '600'),
  },
  button: {
    height: ms(56),
    borderRadius: ms(8),
    justifyContent: 'space-around',
    paddingHorizontal: ms(16),
  },
  buttonContent: {
    justifyContent: 'space-between',
  },
  buttonText: {
    ...makeTextStyle(ms(17), ms(25)),
  },
  buttonIcon: {
    marginTop: ms(2),
  },
  counter: {
    ...makeTextStyle(ms(12), ms(24)),
  },
  descriptionInput: {
    paddingVertical: ms(10),
    height: ms(176),
    paddingLeft: ms(16),
    paddingRight: ms(78),
    borderRadius: ms(8),
    position: 'relative',
    ...makeTextStyle(ms(17), ms(26)),
  },
  point: {
    width: ms(4),
    height: ms(4),
    borderRadius: ms(100),
    marginHorizontal: ms(6),
  },
})

export default observer(EditClubSettingScreen)
