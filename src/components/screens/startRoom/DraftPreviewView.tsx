import React, {useEffect, useRef, useState} from 'react'
import {Animated, Easing, ImageBackground, StyleSheet} from 'react-native'

import {DraftType, draftTypes} from '../../../models'
import {delay} from '../../../utils/date.utils'
import {ms} from '../../../utils/layout.utils'

interface Props {
  readonly selected: DraftType
}

const DraftPreviewView: React.FC<Props> = (props) => {
  const opacity = useRef(new Animated.Value(1)).current
  const [selected, setSelected] = useState(props.selected)
  const [source, setSource] = useState(draftTypes[selected])

  const transition = async () => {
    const fadeOut = Animated.timing(opacity, {
      toValue: 0,
      useNativeDriver: false,
      duration: 200,
      easing: Easing.inOut(Easing.cubic),
    })
    const fadeIn = Animated.timing(opacity, {
      toValue: 1,
      useNativeDriver: false,
      delay: 300,
      duration: 200,
      easing: Easing.inOut(Easing.cubic),
    })
    Animated.sequence([fadeOut, fadeIn]).start()
  }

  useEffect(() => {
    if (props.selected === selected) return
    setSelected(props.selected)
    const change = async () => {
      transition()
      await delay(200)
      setSource(draftTypes[props.selected])
    }
    change()
  }, [props.selected, selected])

  return (
    <Animated.View style={[StyleSheet.absoluteFill, {opacity}]}>
      <ImageBackground
        source={source}
        style={[styles.background]}
        imageStyle={styles.image}
      />
    </Animated.View>
  )
}

export default DraftPreviewView

const styles = StyleSheet.create({
  background: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
    height: ms(1200),
    overflow: 'hidden',
  },
})
