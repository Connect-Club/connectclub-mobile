import React, {Component} from 'react'
import {Animated, StyleProp, ViewStyle} from 'react-native'

interface Props {
  readonly duration?: number
  readonly delay?: number
  readonly style?: StyleProp<ViewStyle>
  readonly animated?: boolean
}

export class FadeViewOnStart extends Component<Props> {
  state = {
    opacity: new Animated.Value(this.props.animated ? 0 : 1),
  }

  onLoad = () => {
    if (!this.props.animated) return
    Animated.timing(this.state.opacity, {
      toValue: 1,
      delay: this.props.delay,
      duration: this.props.duration ?? 350,
      useNativeDriver: true,
    }).start()
  }

  render() {
    return (
      <Animated.View
        onLayout={this.onLoad}
        {...this.props}
        style={[{opacity: this.state.opacity}, this.props.style]}
        children={this.props.children}
      />
    )
  }
}
