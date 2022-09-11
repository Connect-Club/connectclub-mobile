import {observer} from 'mobx-react'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {CreateEventStore} from '../../../stores/CreateEventStore'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import InlineInterestsList from './InlineInterestsList'

interface Props {
  readonly store: CreateEventStore
  readonly onPress?: () => void
}

const InlineInterestsSelector: React.FC<Props> = (p) => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  return (
    <View
      style={[
        styles.interestsBlock,
        {backgroundColor: colors.floatingBackground},
      ]}>
      <AppTouchableOpacity
        style={styles.chooseInterestsButton}
        onPress={p.onPress}>
        <AppText style={styles.chooseInterestsButtonText}>
          {t('createEventChoseInterestsButton')}
        </AppText>
        <AppIcon type={'icArrowRight'} />
      </AppTouchableOpacity>
      <InlineInterestsList store={p.store} />
    </View>
  )
}

export default observer(InlineInterestsSelector)

const styles = StyleSheet.create({
  interestsBlock: {
    flexDirection: 'column',
    marginTop: ms(24),
    marginHorizontal: ms(16),
    borderRadius: ms(8),
  },
  chooseInterestsButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: ms(14),
    paddingHorizontal: ms(16),
  },
  chooseInterestsButtonText: {
    fontSize: ms(17),
    lineHeight: ms(25),
  },
})
