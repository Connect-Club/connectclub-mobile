/* eslint-disable */
import React, {memo} from 'react'
import deepEqual from 'deep-equal'
import {RasterIconNative} from '../components/webSafeImports/webSafeImports'
import {RasterIconProps} from 'src/assets/rasterIcons'

const RasterIcon: React.FC<RasterIconProps> = (props) => {
  return (
    <RasterIconNative
      accessibilityLabel={props.accessibilityLabel}
      type={props.type}
      style={props.style}
      circle={props.circle}
      paddingHorizontal={props.paddingHorizontal}
      scaleType={props.scaleType}
    />
  )
}
export default memo(RasterIcon, deepEqual)
