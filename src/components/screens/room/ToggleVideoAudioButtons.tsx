import React from 'react'
import {StyleProp, ViewStyle} from 'react-native'

import UserManager from './jitsi/UserManager'

interface Props {
  readonly userManager: UserManager
  readonly style?: StyleProp<ViewStyle>
  readonly roomId: string | undefined
  readonly eventId: string | undefined
}

const ToggleVideoAudioButtons: React.FC<Props> = () => {
  return null
}

export default ToggleVideoAudioButtons
