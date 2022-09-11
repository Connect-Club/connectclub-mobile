import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import Horizontal from '../../common/Horizontal'

interface Props {
  readonly onPress: () => void
  readonly title: string
}

const AddHostUserButton: React.FC<Props> = ({onPress, title}) => {
  const {t} = useTranslation()

  return (
    <AppTouchableOpacity onPress={onPress}>
      <Horizontal style={styles.addCoHostContainer}>
        <AppText style={styles.addCoHostText}>{t(title)}</AppText>
        <AppIcon style={styles.icon} type={'icArrowRight'} />
      </Horizontal>
    </AppTouchableOpacity>
  )
}

export default AddHostUserButton

const styles = StyleSheet.create({
  icon: {
    paddingEnd: ms(8),
  },

  addCoHostContainer: {
    alignItems: 'center',
    paddingStart: ms(16),
    paddingEnd: ms(8),
  },

  addCoHostText: {
    lineHeight: ms(56),
    fontSize: ms(17),
    flex: 1,
  },
})
