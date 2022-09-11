import React, {useEffect, useState} from 'react'
import {StyleSheet} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'

import {DraftType, draftTypes} from '../../../models'
import {delay} from '../../../utils/date.utils'
import {maxWidth} from '../../../utils/layout.utils'
import {waitAnimateWithTiming} from '../../../utils/reanimated.utils'
import AspectImageView from './AspectImageView'

interface Props {
  readonly selected: DraftType
}

const DraftPreviewView: React.FC<Props> = (props) => {
  const opacity = useSharedValue(1)
  const [selected, setSelected] = useState(props.selected)
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  useEffect(() => {
    if (props.selected === selected) return
    const update = async () => {
      await waitAnimateWithTiming(opacity, 0)
      setSelected(props.selected)
      await delay(200)
      await waitAnimateWithTiming(opacity, 1)
    }

    update()
  }, [props.selected, opacity, selected])

  return (
    <Animated.View style={style}>
      <AspectImageView
        source={draftTypes[selected]}
        style={styles.fillParent}
      />
    </Animated.View>
  )
}

export default DraftPreviewView

const styles = StyleSheet.create({
  fillParent: {
    width: '100%',
    alignSelf: 'center',
    maxWidth: maxWidth(),
  },
})
