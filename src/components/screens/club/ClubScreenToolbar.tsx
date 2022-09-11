import {useNavigation} from '@react-navigation/native'
import React, {memo, useCallback} from 'react'

import {useTheme} from '../../../theme/appTheme'
import AppNavigationHeader from '../../common/AppNavigationHeader'
import Horizontal from '../../common/Horizontal'
import NavigationIconButton from '../mainFeed/NavigationIconButton'

interface Props {
  readonly clubId?: string
  readonly onSharePress: () => void
  readonly onEditPress?: () => void
  readonly onGoBackPress?: () => void
  readonly topInset?: boolean
}
const ClubScreenToolbar: React.FC<Props> = (props) => {
  const {colors} = useTheme()
  const navigation = useNavigation()
  const onGoBackPress = useCallback(() => {
    if (props.onGoBackPress) return props.onGoBackPress()
    navigation.goBack()
  }, [navigation, props])

  const headerLeft = (
    <NavigationIconButton
      accessibilityLabel={'closeButton'}
      icon={'icNavigationClose'}
      tint={colors.accentPrimary}
      onPress={onGoBackPress}
    />
  )
  const headerRight = props.clubId ? (
    <Horizontal>
      {props.onEditPress && (
        <NavigationIconButton
          accessibilityLabel={'editButton'}
          icon={'icPencil'}
          tint={colors.accentPrimary}
          onPress={props.onEditPress}
        />
      )}
      <NavigationIconButton
        accessibilityLabel={'shareButton'}
        icon={'icShare'}
        tint={colors.accentPrimary}
        onPress={props.onSharePress}
      />
    </Horizontal>
  ) : undefined
  return (
    <AppNavigationHeader
      topInset={props.topInset ?? true}
      headerLeft={headerLeft}
      headerRight={headerRight}
    />
  )
}

export default memo(ClubScreenToolbar)
