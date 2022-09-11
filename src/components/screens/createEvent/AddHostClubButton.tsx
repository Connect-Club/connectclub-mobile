import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import FlexSpace from '../../common/FlexSpace'
import Horizontal from '../../common/Horizontal'

interface Props {
  readonly onPress: () => void
  readonly selectedClub: string | undefined
}

const AddHostClubButton: React.FC<Props> = (props) => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  return (
    <AppTouchableOpacity onPress={props.onPress}>
      <Horizontal style={styles.addHostContainer}>
        <AppText style={styles.addHostTitle}>
          {t('createEventAddHostClub')}
        </AppText>
        <FlexSpace />
        <AppText
          numberOfLines={1}
          style={[styles.addHostText, {color: colors.secondaryBodyText}]}>
          {props.selectedClub ?? t('createEventNoHostClub')}
        </AppText>
        <AppIcon style={styles.icon} type={'icArrowRight'} />
      </Horizontal>
    </AppTouchableOpacity>
  )
}

export default AddHostClubButton

const styles = StyleSheet.create({
  icon: {
    paddingEnd: ms(8),
  },

  addHostContainer: {
    width: '100%',
    alignItems: 'center',
    paddingStart: ms(16),
    paddingEnd: ms(8),
  },
  addHostTitle: {
    lineHeight: ms(56),
    fontSize: ms(17),
  },
  addHostText: {
    lineHeight: ms(56),
    fontSize: ms(17),
    maxWidth: ms(212),
  },
})
