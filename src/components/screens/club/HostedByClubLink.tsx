import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, TextStyle, View} from 'react-native'

import {ClubInfoModel} from '../../../models'
import {makeTextStyle, useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import Horizontal from '../../common/Horizontal'

interface ClubDeeplinkProps {
  readonly club: ClubInfoModel
  readonly textStyle?: TextStyle
  readonly onClubPress?: () => void
}

const HostedByClubLink: React.FC<ClubDeeplinkProps> = (props) => {
  const {colors} = useTheme()
  const {t} = useTranslation()
  const club = props.club

  const LinkComponent = props.onClubPress ? AppTouchableOpacity : View
  const byTextStyle = [styles.byText, props.textStyle ?? {}]

  return (
    <Horizontal style={styles.container}>
      <AppText numberOfLines={1} style={[byTextStyle, {marginEnd: ms(4)}]}>
        {t('clubHostedLabel')}
      </AppText>
      <LinkComponent onPress={props.onClubPress}>
        <AppText
          numberOfLines={1}
          ellipsizeMode={'tail'}
          style={[
            byTextStyle,
            styles.hostText,
            props.onClubPress ? {color: colors.accentPrimary} : {},
          ]}>
          {club.title}
        </AppText>
      </LinkComponent>
    </Horizontal>
  )
}

export default HostedByClubLink

const styles = StyleSheet.create({
  container: {
    height: ms(21),
    marginTop: ms(4),
  },
  byText: {
    ...makeTextStyle(ms(13), ms(16)),
  },
  hostText: {
    fontWeight: 'bold',
    paddingEnd: ms(16),
  },
})
