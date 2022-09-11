import React from 'react'
import {requireNativeComponent, ViewProps} from 'react-native'

const RNCFloatingReactions = requireNativeComponent<typeof FloatingReactions>(
  'RNCFloatingReactions',
)

const FloatingReactions: React.FC<ViewProps> = (props) => {
  return <RNCFloatingReactions {...props} />
}

export default FloatingReactions
