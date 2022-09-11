import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import {observer} from 'mobx-react'
import moment from 'moment'
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import {useTranslation} from 'react-i18next'
import {
  BackHandler,
  Keyboard,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from 'react-native'

import SelectParticipantsListViewWeb from '../../connectclub-desktop/src/components/SelectParticipansListViewWeb'

import {appEventEmitter, hideUpcomingEventDialog} from '../appEventEmitter'
import BaseInlineBottomSheet, {
  AppBottomSheet,
} from '../components/BaseInlineBottomSheet'
import AppNavigationHeader from '../components/common/AppNavigationHeader'
import AppSwitchButton from '../components/common/AppSwitchButton'
import AppText from '../components/common/AppText'
import ContentLoadingView from '../components/common/ContentLoadingView'
import {clearWindowFocus} from '../components/common/DecorConfigModule'
import LanguageButton from '../components/common/LanguageButton'
import Spacer from '../components/common/Spacer'
import Vertical from '../components/common/Vertical'
import WebModalHeader from '../components/common/WebModalHeader'
import AddHostClubButton from '../components/screens/createEvent/AddHostClubButton'
import AddHostUserButton from '../components/screens/createEvent/AddHostUserButton'
import InlineDatePickerView from '../components/screens/createEvent/InlineDatePickerView'
import ParticipantsListView from '../components/screens/createEvent/ParticipantsListView'
import SelectHostedClubListView from '../components/screens/createEvent/SelectHostedClubListView'
import SelectParticipantsListView from '../components/screens/createEvent/SelectParticipantsListView'
import InlineInterestsSelector from '../components/screens/interests/InlineInterestsSelector'
import NavigationTextButton from '../components/screens/mainFeed/NavigationTextButton'
import {
  alert,
  AppModal,
  KeyboardAwareScrollView,
  MenuTextInput,
} from '../components/webSafeImports/webSafeImports'
import {
  ClubInfoModel,
  EventModel,
  InterestModel,
  LanguageModel,
  UserModel,
} from '../models'
import {CreateEventStore} from '../stores/CreateEventStore'
import InterestsStore from '../stores/InterestsStore'
import UpcomingEventsStore from '../stores/UpcomingEventsStore'
import {commonStyles, makeTextStyle, useTheme} from '../theme/appTheme'
import {baseNavigationScreenOptions} from '../theme/navigationTheme'
import {isNative, isWeb} from '../utils/device.utils'
import {ms} from '../utils/layout.utils'
import {stackScreenConfigs} from '../utils/navigation.utils'
import {useBottomSafeArea} from '../utils/safeArea.utils'
import {processTextLink} from '../utils/textedit.utils'
import {useViewModel} from '../utils/useViewModel'
import {LanguageSelectorScreenProps} from './LanguageSelectorScreen'

const MAX_LETTERS = 500

const Stack = createStackNavigator()

interface CreateEventScreenProps {
  readonly event?: EventModel
  readonly navigationRoot?: string
}

type ScreenRouteProp = RouteProp<{Screen: CreateEventScreenProps}, 'Screen'>

interface LocalCreateEventScreenProps extends CreateEventScreenProps {
  readonly isModal?: boolean
  readonly selectedInterests?: Array<InterestModel>
  readonly selectedLanguage?: LanguageModel
  readonly privateMeetingUser?: UserModel
  selectedDateTs?: number
  selectedTimeTs?: number
  selectedClub?: ClubInfoModel
}
type LocalScreenRouteProp = RouteProp<
  {Screen: LocalCreateEventScreenProps},
  'Screen'
>

const CreateEventScreen: React.FC = () => {
  const {params} = useRoute<ScreenRouteProp>()
  const {colors} = useTheme()
  return (
    <Stack.Navigator
      mode={'modal'}
      screenOptions={baseNavigationScreenOptions(colors)}>
      <Stack.Screen
        name={'LocalCreateEventScreen'}
        getComponent={() =>
          require('./CreateEventScreen').LocalCreateEventScreen
        }
        options={{headerShown: false}}
        initialParams={params}
      />
      {isWeb && (
        <Stack.Screen
          name={'SelectDatePageModal'}
          options={{
            title: '',
            ...stackScreenConfigs,
            headerShown: false,
          }}
          getComponent={() =>
            require('../../connectclub-desktop/src/pages/SelectDatePageModal')
              .default
          }
        />
      )}
      <Stack.Screen
        name={'CommonSelectInterestsScreenModal'}
        getComponent={() =>
          require('./CommonSelectInterestsScreenModal').default
        }
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  )
}

const checkIfCanEditClub = (t: any, store: CreateEventStore): boolean => {
  if (
    store.hostedClub &&
    !store.myClubs.map((club) => club.id).includes(store.hostedClub.id)
  ) {
    alert(
      t('createEventHostClubAlert'),
      t('createEventHostClubMessage', {name: store.hostedClub.title}),
    )
    return false
  }
  return true
}

export const LocalCreateEventScreen: React.FC = observer(() => {
  const {params} = useRoute<LocalScreenRouteProp>()
  const {t} = useTranslation()
  const inset = useBottomSafeArea()
  const navigation = useNavigation()
  const {colors} = useTheme()
  const eventRef = useRef(params?.event)

  const usersModalRef = useRef<AppBottomSheet>(null)
  const speakersModalRef = useRef<AppBottomSheet>(null)
  const clubsModalRef = useRef<AppBottomSheet>(null)
  const modalOpenRef = useRef<boolean>(false)
  const inputRef = useRef<typeof MenuTextInput>(null)
  const scrollRef = useRef<typeof KeyboardAwareScrollView>(null)

  const store = useViewModel(
    () => new CreateEventStore(eventRef.current, params.privateMeetingUser),
  )
  const eventStore = useContext(UpcomingEventsStore)
  const interestsStore = useContext(InterestsStore)

  const separator = {backgroundColor: colors.separator}
  const [isPublishEnabled, setPublishEnabled] = useState(
    !!eventRef.current || store.eventName.length > 0,
  )
  const [isParticipantsPickerVisible, setParticipantsPickerVisible] =
    useState(false)
  const [remaining, setRemaining] = useState(
    Math.max(0, MAX_LETTERS - store.eventDescription.length),
  )

  useEffect(() => {
    interestsStore.resetSelection()
    const interests = eventRef.current?.interests?.filter(
      (interest) => !interest.isLanguage,
    )
    if (interests) {
      interestsStore.addSelected(interests)
      store.setEventInterests(interests)
    }
    store.fetch()
    if (!store.isPrivate) {
      store.fetchFriends()
      store.fetchMyClubs()
    }
    if (params.selectedClub) {
      store.setHostedClub(params.selectedClub)
      store.setForMembersOnly(true)
    }

    const cleaner = BackHandler.addEventListener('hardwareBackPress', () => {
      if (modalOpenRef.current) {
        usersModalRef.current?.dismiss()
        speakersModalRef.current?.dismiss()
        clubsModalRef.current?.dismiss()
        return true
      }
      return false
    })
    return () => cleaner.remove()
  }, [interestsStore, params.selectedClub, store])

  useEffect(() => {
    if (params?.selectedInterests === undefined) return
    store.setEventInterests(params?.selectedInterests ?? [])
    navigation.setOptions({selectedInterests: undefined})
  }, [navigation, params?.selectedInterests, store])

  useEffect(() => {
    const lang = params?.selectedLanguage
    if (!lang) return
    store.setEventLanguage(lang)
    navigation.setOptions({selectedLanguage: undefined})
  }, [navigation, params?.selectedLanguage, store])

  useEffect(() => {
    if (params?.selectedDateTs) {
      store.setDate(moment(params.selectedDateTs).toDate())
    }
  }, [params, store])

  useEffect(() => {
    if (params?.selectedTimeTs) {
      store.setTime(moment(params.selectedTimeTs).toDate())
    }
  }, [params, store])

  const onPublishPress = async () => {
    const isSuccess = await store.createEvent()
    if (!isSuccess) return
    eventStore.refresh()
    clearWindowFocus()
    navigation.goBack()
    appEventEmitter.trigger('refreshMainFeed')
  }

  const onSavePress = async () => {
    const isSuccess = await store.saveEvent()
    if (!isSuccess) return
    eventStore.refresh()
    clearWindowFocus()
    navigation.goBack()
    hideUpcomingEventDialog()
    appEventEmitter.trigger('refreshMainFeed')
  }

  const onChangeDescription = (text: string) => {
    setRemaining(Math.max(0, MAX_LETTERS - text.length))
    store.setDescription(text)
  }

  const isReactTextField = useRef(false)

  //@ts-ignore
  const scrollToInput = (frames) => {
    if (isReactTextField.current) return
    const keyboardHeight = frames.endCoordinates.height
    // @ts-ignore
    scrollRef.current?.scrollToPosition(0, keyboardHeight, true)
  }

  const onSelectDateExternal = useCallback(() => {
    navigation.navigate('SelectDatePageModal', {
      backTo: 'LocalCreateEventScreen',
      currentTs: store.eventDate.getTime(),
      selectorType: 'date',
      navigationRoot: params?.navigationRoot,
    })
  }, [navigation, params?.navigationRoot, store.eventDate])

  const onSelectTimeExternal = useCallback(() => {
    navigation.navigate('SelectDatePageModal', {
      backTo: 'LocalCreateEventScreen',
      currentTs: store.eventTime.getTime(),
      selectorType: 'time',
      navigationRoot: params?.navigationRoot,
    })
  }, [navigation, params?.navigationRoot, store.eventTime])

  const onSelectLangPress = useCallback(
    (lang?: LanguageModel) => {
      const screenProps: LanguageSelectorScreenProps = {
        backScreen: 'LocalCreateEventScreen',
        selection: lang,
        title: t('languageSelectorTitle'),
        navigationRoot: params?.navigationRoot,
      }
      navigation.navigate('LanguageSelectorScreen', screenProps)
    },
    [navigation, params?.navigationRoot, t],
  )

  const onSelectInterestsPress = () => {
    interestsStore.resetSelection()
    interestsStore.addSelected(store.eventInterests.selected)
    const screenProps = {
      isModal: params.isModal,
    }
    navigation.navigate('CommonSelectInterestsScreenModal', screenProps)
  }

  const onModeratorSelected = useCallback(
    (item) => {
      store.setModerator(item)
      usersModalRef.current?.dismiss()
      if (isWeb) setParticipantsPickerVisible(false)
    },
    [store],
  )

  const onSpeakerSelected = useCallback(
    (item) => {
      store.setSpeaker(item)
      speakersModalRef.current?.dismiss()
      if (isWeb) setParticipantsPickerVisible(false)
    },
    [store],
  )

  const onClubSelected = useCallback(
    (item) => {
      clubsModalRef.current?.dismiss()
      store.setHostedClub(item)
    },
    [store],
  )

  const headerLeft = (
    <NavigationTextButton
      onPress={navigation.goBack}
      title={t('cancelButton')}
    />
  )

  const headerRight = (
    <NavigationTextButton
      isEnabled={isPublishEnabled}
      onPress={store.eventId ? onSavePress : onPublishPress}
      title={
        !!store.eventId || store.isPrivate
          ? t('saveButton')
          : t('publishButton')
      }
    />
  )

  const renderHeader = () => {
    return isNative ? (
      <AppNavigationHeader
        topInset={!params.isModal ?? true}
        headerRight={headerRight}
        headerLeft={headerLeft}
        title={store.isPrivate ? t('privateMeetingText') : t('futureEvent')}
      />
    ) : (
      <WebModalHeader
        title={t('createEventTitle')}
        navigationAction={'close'}
        headerRight={headerRight}
      />
    )
  }

  const hideKeyboard = () => {
    clearWindowFocus()
    Keyboard.dismiss()
    //@ts-ignore
    inputRef.current?.setNativeProps({
      shouldDismissKeyboard: true,
    })
  }

  const chooseHostedClub = useCallback(() => {
    if (!checkIfCanEditClub(t, store)) return
    hideKeyboard()
    if (isNative) {
      clubsModalRef.current?.present()
      modalOpenRef.current = true
      return
    }
    setParticipantsPickerVisible(true)
  }, [store, t])

  const canHostWithClub =
    (store.eventId == null && store.myClubs.length > 0) || store.hostedClub

  const renderTokensBlock = () => {
    return (
      <>
        {store.hostedClub && store.hasHostedClubTokens && (
          <Vertical
            style={[
              styles.topContainer,
              {
                backgroundColor: colors.floatingBackground,
                marginTop: ms(24),
              },
            ]}>
            <AppText style={styles.sectionTitle}>
              {t('createEventNftHoldersOnly')}
            </AppText>
            {store.hostedClubTokens!.map((token, index) => {
              return (
                <>
                  <AppSwitchButton
                    initialState={store.isTokenSelected(token.id)}
                    onSwitch={(enabled) => {
                      store.setClubTokenSelected(token.id, !enabled)
                      return true
                    }}
                    title={token.name}
                  />
                  {index !== store.hostedClubTokens!.length - 1 && (
                    <View
                      style={[
                        styles.lineSeparator,
                        {borderBottomColor: colors.separator},
                      ]}
                    />
                  )}
                  {index === store.hostedClubTokens!.length - 1 && (
                    <Spacer vertical={ms(12)} />
                  )}
                </>
              )
            })}
          </Vertical>
        )}
      </>
    )
  }

  return (
    <AppModal animationType={'fade'} transparent={false}>
      <ContentLoadingView
        loading={store.isInProgress}
        error={store.error}
        onRetry={store.fetch}>
        <Vertical
          style={[
            commonStyles.wizardContainer,
            commonStyles.webScrollingContainer,
          ]}>
          {renderHeader()}
          <KeyboardAwareScrollView
            contentContainerStyle={{
              paddingBottom: inset + ms(16),
              paddingTop: ms(8),
            }}
            ref={scrollRef}
            style={commonStyles.flexOne}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps={'never'}
            onKeyboardWillShow={scrollToInput}
            onKeyboardWillHide={() => {
              isReactTextField.current = false
            }}
            keyboardDismissMode={
              Platform.OS === 'android' ? 'on-drag' : 'interactive'
            }>
            <Vertical>
              {isWeb && <Spacer vertical={ms(24)} />}
              <Vertical
                style={[
                  styles.topContainer,
                  {backgroundColor: colors.floatingBackground},
                ]}>
                <TextInput
                  allowFontScaling={false}
                  style={styles.eventNameTextInput}
                  value={store.eventName}
                  onFocus={() => {
                    isReactTextField.current = true
                  }}
                  onChangeText={(text) => {
                    store.setName(text)
                    setPublishEnabled(text.length > 0)
                  }}
                  placeholder={t('createEventEventNameInputPlaceholder')}
                  placeholderTextColor={colors.supportBodyText}
                />

                <View style={[styles.separator, separator]} />

                <ParticipantsListView
                  participants={store.coHosts}
                  removeTextKey={'createEventRemoveModeratorDialogTitle'}
                  ownerId={store.ownerId}
                  removeParticipant={
                    store.isPrivate ? undefined : store.removeModerator
                  }
                />

                {!store.isPrivate && (
                  <AddHostUserButton
                    title={'createEventAddModerator'}
                    onPress={() => {
                      hideKeyboard()
                      if (isNative) {
                        usersModalRef.current?.present()
                        modalOpenRef.current = true
                        return
                      }
                      setParticipantsPickerVisible(true)
                    }}
                  />
                )}
              </Vertical>

              {!store.isPrivate && (
                <Vertical
                  style={[
                    styles.topContainer,
                    {
                      backgroundColor: colors.floatingBackground,
                      marginTop: ms(24),
                    },
                  ]}>
                  <ParticipantsListView
                    participants={store.specialSpeakers}
                    removeTextKey={'createEventRemoveSpeakerDialogTitle'}
                    ownerId={store.ownerId}
                    removeParticipant={store.removeSpeaker}
                  />
                  <AddHostUserButton
                    title={'createEventAddSpeaker'}
                    onPress={() => {
                      hideKeyboard()
                      if (isNative) {
                        speakersModalRef.current?.present()
                        modalOpenRef.current = true
                        return
                      }
                      setParticipantsPickerVisible(true)
                    }}
                  />
                </Vertical>
              )}

              <InlineDatePickerView
                selectedDate={store.eventDate}
                setSelectedDate={store.setDate}
                selectedTime={store.eventTime}
                setSelectedTime={store.setTime}
                onSelectDateExternal={onSelectDateExternal}
                onSelectTimeExternal={onSelectTimeExternal}
              />

              {!store.isPrivate && canHostWithClub && (
                <Vertical
                  style={[
                    styles.topContainer,
                    {
                      backgroundColor: colors.floatingBackground,
                      marginTop: ms(24),
                    },
                  ]}>
                  <AddHostClubButton
                    selectedClub={store.hostedClub?.title}
                    onPress={chooseHostedClub}
                  />
                  {store.hostedClub && (
                    <>
                      <View
                        style={[
                          styles.lineSeparator,
                          {borderBottomColor: colors.separator},
                        ]}
                      />
                      <AppSwitchButton
                        initialState={store.forMembersOnly ?? false}
                        onSwitch={(enabled) => {
                          if (!checkIfCanEditClub(t, store)) return false
                          store.setForMembersOnly(!enabled)
                          return true
                        }}
                        title={t('createEventMembersOnly')}
                      />
                    </>
                  )}
                </Vertical>
              )}

              {renderTokensBlock()}

              <LanguageButton
                title={t('eventLanguageButton')}
                languages={store.selectedLanguage}
                onPress={onSelectLangPress}
              />

              <InlineInterestsSelector
                store={store}
                onPress={onSelectInterestsPress}
              />

              <MenuTextInput
                //@ts-ignore
                ref={inputRef}
                value={store.eventDescription}
                placeholder={t('createEventDescriptionInputPlaceholder')}
                placeholderTextColor={colors.supportBodyText}
                onChangeText={onChangeDescription}
                linkTextColor={colors.primaryClickable}
                maxLength={MAX_LETTERS}
                multiline
                style={styles.descriptionTextInput}
                onLinkText={(link, location) =>
                  processTextLink(
                    t,
                    store.eventDescription,
                    link,
                    location,
                    onChangeDescription,
                  )
                }
              />

              <AppText
                style={[
                  styles.descriptionCounter,
                  {
                    color:
                      remaining > 0 ? colors.supportBodyText : colors.warning,
                  },
                ]}>
                {t('charactersRemaining', {count: remaining})}
              </AppText>
            </Vertical>
          </KeyboardAwareScrollView>
          {isWeb && (
            <SelectParticipantsListViewWeb
              visible={isParticipantsPickerVisible}
              store={store}
              onSelect={onModeratorSelected}
              onClose={() => setParticipantsPickerVisible(false)}
              headerStyle={{title: t('createEventAddModerator')}}
            />
          )}
        </Vertical>
      </ContentLoadingView>
      {isNative && (
        <BaseInlineBottomSheet
          ref={usersModalRef}
          snaps={['90%']}
          onDismiss={() => {
            modalOpenRef.current = false
            store.setSearchMode(false)
          }}>
          <SelectParticipantsListView
            store={store}
            onSelect={onModeratorSelected}
            usersList={store.excludedParticipants}
            title={'createEventAddAModeratorTitle'}
          />
        </BaseInlineBottomSheet>
      )}
      {isNative && (
        <BaseInlineBottomSheet
          ref={speakersModalRef}
          snaps={['90%']}
          onDismiss={() => {
            modalOpenRef.current = false
            store.setSearchMode(false)
          }}>
          <SelectParticipantsListView
            store={store}
            onSelect={onSpeakerSelected}
            usersList={store.excludedParticipants}
            title={'createEventAddASpeakerTitle'}
          />
        </BaseInlineBottomSheet>
      )}
      {isNative && store.myClubs.length > 0 && (
        <BaseInlineBottomSheet
          ref={clubsModalRef}
          snaps={['90%']}
          onDismiss={() => {
            modalOpenRef.current = false
          }}>
          <SelectHostedClubListView store={store} onSelect={onClubSelected} />
        </BaseInlineBottomSheet>
      )}
    </AppModal>
  )
})

export default CreateEventScreen

const styles = StyleSheet.create({
  topContainer: {
    marginHorizontal: ms(16),
    borderRadius: ms(8),
    overflow: 'hidden',
  },

  eventNameTextInput: {
    height: ms(56),
    paddingHorizontal: ms(16),
    fontSize: ms(17),
  },

  separator: {
    height: ms(1),
    marginHorizontal: ms(16),
  },

  descriptionTextInput: {
    maxHeight: ms(145),
    marginHorizontal: ms(16),
    marginTop: ms(32),
    borderRadius: ms(8),
    padding: ms(16),
    paddingTop: ms(10),
    fontSize: ms(17),
    minHeight: ms(132),
    textAlignVertical: 'top',
    ...Platform.select({
      web: {
        backgroundColor: '#FFFFFF',
      },
    }),
  },

  descriptionCounter: {
    margin: ms(16),
    fontSize: ms(13),
    lineHeight: ms(21),
  },

  lineSeparator: {
    borderBottomWidth: ms(1),
    marginHorizontal: ms(16),
  },
  sectionTitle: {
    marginStart: ms(16),
    marginTop: ms(16),
    paddingBottom: ms(10),
    ...makeTextStyle(17, 25, 'bold'),
  },
})
