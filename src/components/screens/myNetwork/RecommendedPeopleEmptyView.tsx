import React, {memo} from 'react'
import {StyleSheet, View} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'

interface Props {
  readonly text: string
}

const RecommendedPeopleEmptyView: React.FC<Props> = (props) => {
  const {colors} = useTheme()

  return (
    <View style={[styles.base, {backgroundColor: colors.systemBackground}]}>
      <AppIcon type={'icCommunity24'} />
      <AppText style={[styles.text, {color: colors.thirdBlack}]}>
        {props.text}
      </AppText>
    </View>
  )
}

export default memo(RecommendedPeopleEmptyView)

const styles = StyleSheet.create({
  base: {
    flex: 1,
    alignSelf: 'center',
    maxWidth: ms(327),
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: ms(13),
    lineHeight: ms(18),
    marginTop: ms(13),
    textAlign: 'center',
  },
  connectButton: {
    marginTop: ms(24),
  },
})
