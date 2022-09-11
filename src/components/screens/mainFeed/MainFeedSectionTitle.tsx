import React, {memo} from 'react'
import {StyleSheet, View} from 'react-native'

import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import Horizontal from '../../common/Horizontal'

interface Props {
  readonly title: string
  readonly showGreenCircle?: boolean
}

const MainFeedSectionTitle: React.FC<Props> = ({
  title,
  showGreenCircle = false,
}) => {
  const {colors} = useTheme()

  return (
    <Horizontal style={styles.base}>
      <AppText style={[styles.title, {color: colors.thirdBlack}]}>
        {title}
      </AppText>
      {showGreenCircle && (
        <View
          style={[
            styles.greenCircle,
            {backgroundColor: colors.activeAccentColor},
          ]}
        />
      )}
    </Horizontal>
  )
}

export default memo(MainFeedSectionTitle)

const styles = StyleSheet.create({
  base: {
    marginBottom: ms(16),
  },

  title: {
    fontWeight: '600',
    fontSize: ms(34),
  },

  greenCircle: {
    width: ms(12),
    height: ms(12),
    marginStart: ms(12),
    borderRadius: ms(12) / 2,
    alignSelf: 'center',
    marginTop: ms(4),
  },
})
