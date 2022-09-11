import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {useCallback} from 'react'

import {analytics} from '../Analytics'
import WebModalHeader from '../components/common/WebModalHeader'
import ClubView from '../components/screens/club/ClubView'
import NavigationIconButton from '../components/screens/mainFeed/NavigationIconButton'
import {AppModal} from '../components/webSafeImports/webSafeImports'
import {ClubParams} from '../models'
import {commonStyles, useTheme} from '../theme/appTheme'
import {shareClubDialog} from '../utils/sms.utils'

type Props = ClubParams & {
  readonly withCustomToolbar?: boolean
  readonly disabledLinks?: boolean
  readonly navigationRoot?: string
  readonly isModal?: boolean
  readonly isClubCreation?: boolean
  readonly clubId?: string
  readonly initialScreen?: string
}

export type ScreenRouteProp = RouteProp<{Screen: Props}, 'Screen'>

const ClubScreen: React.FC = () => {
  const {params} = useRoute<ScreenRouteProp>()
  const {colors} = useTheme()
  const navigation = useNavigation()

  const onSharePress = useCallback(() => {
    shareClubDialog(params.clubId, '')
    analytics.sendEvent('club_screen_share_click', {
      clubId: params.clubId,
    })
  }, [params.clubId])

  const onEditInterestsPress = useCallback(() => {
    navigation.navigate('SelectClubInterestsScreen', {
      clubId: params.clubId,
      isModal: params.isModal,
    })
  }, [navigation, params.clubId, params.isModal])

  const Header = (
    <WebModalHeader
      isVisible={!params.withCustomToolbar}
      headerRight={
        <NavigationIconButton
          accessibilityLabel={'shareButton'}
          icon={'icShare'}
          tint={colors.accentPrimary}
          onPress={onSharePress}
        />
      }
    />
  )

  return (
    <AppModal
      navigationRoot={params?.navigationRoot}
      contentStyle={commonStyles.webScrollingContainer}
      isScrolling={false}
      header={Header}>
      <ClubView
        onGoBackPress={navigation.goBack}
        clubId={params.clubId}
        navigationRoot={params.navigationRoot}
        disabledLinks={params.disabledLinks}
        isModal={params.isModal}
        isClubCreation={params.isClubCreation}
        withCustomToolbar={params.withCustomToolbar}
        onEditInterestsPress={onEditInterestsPress}
      />
    </AppModal>
  )
}

export default observer(ClubScreen)
