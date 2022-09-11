import React, {createRef, PureComponent} from 'react'
import {
  findNodeHandle,
  requireNativeComponent,
  UIManager,
  ViewProps,
} from 'react-native'

const nativeComponentName = 'ShareDesktopContainerView'
const config = UIManager.getViewManagerConfig(nativeComponentName)
const collapseCommand = config.Commands.collapse

interface NativeProps {
  onShareClick?: () => void
  onStateChange?: (expanded: boolean) => void
  trackId?: string
  isMirror?: boolean
  readonly allowToShare: boolean
}

type RNCRectangleSurfaceVideoViewProps = ViewProps & NativeProps

const RNCRectangleSurfaceVideoView = requireNativeComponent<RNCRectangleSurfaceVideoViewProps>(
  nativeComponentName,
)

class RectangleVideoView extends PureComponent<RNCRectangleSurfaceVideoViewProps> {
  private nodeRef = createRef<any>()

  collapse = () => {
    // @ts-ignore
    const node = findNodeHandle(this.nodeRef.current)
    if (!node) return
    UIManager.dispatchViewManagerCommand(node, collapseCommand, [])
  }

  render() {
    return (
      <RNCRectangleSurfaceVideoView
        {...this.props}
        ref={this.nodeRef}
        onShareClick={this.props.onShareClick}
        onStateChange={(e) => {
          //@ts-ignore
          this.props.onStateChange?.(e.nativeEvent.expanded)
        }}
      />
    )
  }
}

export default RectangleVideoView
