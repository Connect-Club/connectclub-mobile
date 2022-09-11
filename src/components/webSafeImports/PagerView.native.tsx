import React, {forwardRef} from 'react'
import {
  default as PagerViewNative,
  PagerViewProps,
} from 'react-native-pager-view'

const PagerView: React.FC<PagerViewProps> = forwardRef<
  PagerViewNative,
  PagerViewProps
>((props, ref) => {
  return (
    <PagerViewNative ref={ref} {...props}>
      {props.children}
    </PagerViewNative>
  )
})

export default PagerView
