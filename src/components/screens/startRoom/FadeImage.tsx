import React, {Component} from 'react'
import {Animated, ImageSourcePropType} from 'react-native'

interface Props {
  readonly source: ImageSourcePropType
}

export class FadeImage extends Component<Props> {
  state = {
    opacity: new Animated.Value(0),
  }

  onLoad = () => {
    Animated.timing(this.state.opacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start()
  }

  render() {
    return (
      <Animated.Image
        onLoad={this.onLoad}
        {...this.props}
        style={[
          {
            opacity: this.state.opacity,
          },
          {width: '100%', height: '100%'},
        ]}
      />
    )
  }
}
