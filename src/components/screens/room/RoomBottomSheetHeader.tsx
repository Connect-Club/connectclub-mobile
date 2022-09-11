import React from 'react'
import {StyleProp, StyleSheet, TextStyle, View} from 'react-native'

import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import TopGradientView from '../../common/TopGradientView'
import AppSearchBar, {AppSearchBarProps} from '../AppSearchBar'

interface Props {
  readonly title: string
  readonly right?: () => React.ReactElement
  readonly showSearch?: boolean
  readonly searchProps?: AppSearchBarProps
  readonly titleStyle?: StyleProp<TextStyle>
}

const RoomBottomSheetHeader: React.FC<Props> = (props) => {
  const {colors} = useTheme()
  return (
    <TopGradientView style={{height: props.showSearch ? ms(120) : ms(80)}}>
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
      {props.showSearch === true && <AppSearchBar {...props.searchProps!} />}
    </TopGradientView>
  )
}

export default RoomBottomSheetHeader

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: ms(8),
    paddingHorizontal: ms(16),
    height: ms(32),
  },

  bottomSheetTitle: {
    fontSize: ms(18),
    lineHeight: ms(24),
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
})
