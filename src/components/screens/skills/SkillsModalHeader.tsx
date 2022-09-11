import {useNavigation} from '@react-navigation/native'
import React, {memo} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

interface Props {
  readonly title: string
  readonly description?: string
  readonly onClearPress?: () => void
}

const SkillsModalHeader: React.FC<Props> = (p) => {
  const {colors} = useTheme()
  const {t} = useTranslation()
  const navigation = useNavigation()

  return (
    <View style={styles.header}>
      <AppTouchableOpacity onPress={navigation.goBack}>
        <AppText style={[styles.buttonText, {color: colors.primaryClickable}]}>
          {t('cancelButton')}
        </AppText>
      </AppTouchableOpacity>
      <AppText style={[styles.title, {color: colors.bodyText}]}>
        {p.title}
      </AppText>
      {p.onClearPress && (
        <AppTouchableOpacity onPress={p.onClearPress}>
          <AppText
            style={[styles.buttonText, {color: colors.primaryClickable}]}>
            {t('clearButton')}
          </AppText>
        </AppTouchableOpacity>
      )}
    </View>
  )
}

export default memo(SkillsModalHeader)

const styles = StyleSheet.create({
  header: {
    marginTop: ms(17),
    marginBottom: ms(19),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  title: {
    fontWeight: 'bold',
    fontSize: ms(18),
    lineHeight: ms(24),
    textAlign: 'center',
    flex: 1,
    left: 0,
    right: 0,
    position: 'absolute',
    marginHorizontal: ms(70),
  },

  buttonText: {
    alignSelf: 'flex-start',
    fontSize: ms(18),
    lineHeight: ms(24),
    paddingHorizontal: ms(16),
  },
})
