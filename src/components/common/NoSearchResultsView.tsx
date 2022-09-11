import React, {memo} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {useTheme} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import AppText from './AppText'

interface Props {
  readonly query: string | null
}

const NoSearchResultsView: React.FC<Props> = ({query}) => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  if (!query?.length) return null

  return (
    <View style={[styles.base, {backgroundColor: colors.systemBackground}]}>
      <AppText
        style={[styles.noResultsText, {color: colors.secondaryBodyText}]}>
        {t('searchNoResults', {search: query ?? ''})}
      </AppText>
    </View>
  )
}

export default memo(NoSearchResultsView)

const styles = StyleSheet.create({
  base: {
    marginTop: '40%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    fontSize: ms(17),
    fontWeight: '500',
    lineHeight: ms(25),
    textAlign: 'center',
    marginHorizontal: ms(32),
  },
})
