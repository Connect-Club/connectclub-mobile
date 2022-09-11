import React, {Component} from 'react'
import {PagerViewProps} from 'react-native-pager-view'

import {PagerViewOnPageSelectedEvent} from 'react-native-pager-view/src/types'

// Web version for PagerView
class PagerView extends React.Component<PagerViewProps> {
  private page: number = 0

  setPage(index: number) {
    this.page = index
    // @ts-ignore
    const event: PagerViewOnPageSelectedEvent = {
      nativeEvent: {position: index},
    }
    this.props.onPageSelected?.(event)
    this.forceUpdate()
  }

  setScrollEnabled(enabled: boolean) {}

  render() {
    if (!this.props.children) return null

    return (this.props.children as any)[this.page] as Component
  }
}

export default PagerView
