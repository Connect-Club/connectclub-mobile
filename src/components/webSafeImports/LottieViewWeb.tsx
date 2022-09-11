import React from 'react'
import {ImageStyle, StyleProp} from 'react-native'

import Lottie from 'react-lottie-player'

interface Props {
  source: any
  autoPlay: boolean
  loop: boolean
  style?: StyleProp<ImageStyle>
}

const LottieViewWeb: React.FC<Props> = ({source, autoPlay, loop}) => {
  return <Lottie loop={loop} animationData={source} play={autoPlay} />
}

export default LottieViewWeb
