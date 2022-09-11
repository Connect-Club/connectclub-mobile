import {observer} from 'mobx-react'
import React from 'react'
import {ActivityIndicator, StyleSheet} from 'react-native'

import {useTheme} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'

type Props = {
  visible?: boolean
}

const ListLoadMoreIndicator: React.FC<Props> = (props) => {
  const {colors} = useTheme()

  if (!props.visible) return null

  return (
    <ActivityIndicator
      style={styles.loader}
      animating={true}
      size={'small'}
      color={colors.accentPrimary}
    />
  )
}

const styles = StyleSheet.create({
  loader: {
    paddingVertical: ms(8),
    justifyContent: 'center',
  },
})

export default observer(ListLoadMoreIndicator)
