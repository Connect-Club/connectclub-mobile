import React, {PureComponent} from 'react'
import {FlatList, FlatListProps, LayoutChangeEvent} from 'react-native'

class BaseFlatList<T> extends PureComponent<FlatListProps<T>> {
  ref = React.createRef<FlatList>()
  private _canScroll = false
  private _contentHeight = 0

  get canScroll() {
    return this._canScroll
  }

  private onContentSizeChange = (w: number, h: number) => {
    this._contentHeight = h
    this.props.onContentSizeChange?.(w, h)
  }

  private onLayout = (e: LayoutChangeEvent) => {
    this._canScroll = e.nativeEvent.layout.height < this._contentHeight
    this.props.onLayout?.(e)
  }

  render() {
    if (!this.props.data || this.props.data.length === 0) return null
    const initialNumToRender = this.props.initialNumToRender ?? 20
    const threshold = this.props.onEndReachedThreshold
      ? this.props.onEndReachedThreshold
      : 0.7

    return (
      <FlatList<T>
        {...this.props}
        onContentSizeChange={this.onContentSizeChange}
        onLayout={this.onLayout}
        ref={this.ref}
        initialNumToRender={initialNumToRender}
        onEndReachedThreshold={threshold}
      />
    )
  }
}

export default BaseFlatList
