import React from 'react'
import {StyleSheet, View} from 'react-native'

import {analytics} from '../../../Analytics'
import RasterIcon from '../../../assets/RasterIcon'
import {RasterIconType} from '../../../assets/rasterIcons'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import {EmojiType} from './models/jsonModels'

interface Props {
  readonly icon: RasterIconType
  readonly type: EmojiType
  readonly size: number
  readonly onEmojiPress: (type: EmojiType) => void
}

const EmojiListItemView: React.FC<Props> = (props) => {
  const {colors} = useTheme()

  return (
    <AppTouchableOpacity
      style={[
        styles.listItem,
        {
          width: props.size,
          height: props.size,
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
      onPress={() => props.onEmojiPress(props.type)}>
      <View
        style={{
          width: props.size * 0.7,
          height: props.size * 0.7,
          backgroundColor: colors.floatingBackground,
          borderRadius: props.size / 2,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <RasterIcon
          scaleType={'fitCenter'}
          type={props.icon}
          style={{width: ms(32), height: ms(32)}}
        />
      </View>
    </AppTouchableOpacity>
  )
}

export default EmojiListItemView

const styles = StyleSheet.create({
  listItem: {
    alignItems: 'center',
    marginBottom: ms(16),
  },
})
