import React from 'react'
import {StyleProp, StyleSheet, TextStyle, View} from 'react-native'

import {makeTextStyle, useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'

interface Props {
  readonly title: string
  readonly right?: () => React.ReactElement | null
  readonly titleStyle?: StyleProp<TextStyle>
}

const SimpleRoomBottomSheetHeader: React.FC<Props> = (props) => {
  const {colors} = useTheme()
  return (
    <View style={styles.header}>
      <AppText
        style={[
          styles.bottomSheetTitle,
          {color: colors.bodyText},
          props.titleStyle,
        ]}>
        {props.title}
      </AppText>
      {props.right && props.right()}
    </View>
  )
}

export default SimpleRoomBottomSheetHeader

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: ms(8),
    paddingHorizontal: ms(16),
  },

  bottomSheetTitle: {
    ...makeTextStyle(18, 24, 'bold'),
    flex: 1,
    textAlign: 'center',
    width: ms(273),
  },
})
