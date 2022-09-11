import {useNavigation} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {useCallback, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {analytics} from '../Analytics'
import AppText from '../components/common/AppText'
import Vertical from '../components/common/Vertical'
import EnterClubNameInput from '../components/screens/createClub/EnterClubNameInput'
import {CreateClubStore} from '../stores/CreateClubStore'
import {makeTextStyle} from '../theme/appTheme'
import {useLogRenderCount} from '../utils/debug.utils'
import {ms} from '../utils/layout.utils'
import {resetTo, runWithLoaderAsync} from '../utils/navigation.utils'
import {toastHelper} from '../utils/ToastHelper'
import {useViewModel} from '../utils/useViewModel'

const CreateClubScreen: React.FC = () => {
  const {t} = useTranslation()
  const navigation = useNavigation()
  const store = useViewModel(() => new CreateClubStore())

  useLogRenderCount('CreateClubScreen')

  const handleOnPress = useCallback(
    async (inputData) => {
      analytics.sendEvent('create_club_input_button_click')

      await runWithLoaderAsync(async () => {
        await store.createNewClub(inputData)
      })

      if (!store.error) {
        navigation.dispatch(
          resetTo('AddPeopleToClubScreen', {
            club: store.club,
            isClubCreation: true,
          }),
        )
      }
    },
    [navigation, store],
  )

  useEffect(() => {
    if (store.error) {
      if (store.error === 'v1.club.title_already_exists') {
        toastHelper.error('errorClubAlreadyExists')
        return
      }
      toastHelper.error('somethingWentWrong')
    }
  }, [store.club, store.error, t])

  return (
    <View>
      <View style={styles.handler} />
      <Vertical style={styles.wrapper}>
        <AppText style={styles.title}>{t('createClubTitle')}</AppText>
        <AppText style={styles.text}>{t('createClubContent')}</AppText>
        <EnterClubNameInput onPress={handleOnPress} disabled={false} />
        <AppText style={styles.subtitle}>{t('createClubSubtitle')}</AppText>
      </Vertical>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: ms(32),
    paddingTop: ms(84),
  },
  handler: {
    height: ms(4),
    width: ms(51),
    backgroundColor: 'black',
    opacity: 0.32,
    alignSelf: 'center',
    top: ms(8),
    position: 'absolute',
  },
  title: {
    ...makeTextStyle(ms(40), ms(48), 'bold'),
    marginBottom: ms(16),
  },
  text: {
    ...makeTextStyle(ms(15), ms(24)),
    marginBottom: ms(40),
  },
  subtitle: {
    ...makeTextStyle(ms(12), ms(16)),
    opacity: 0.32,
    marginTop: ms(16),
  },
})

export default observer(CreateClubScreen)
