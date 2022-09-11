import React, {memo} from 'react'
import {StyleSheet} from 'react-native'

import {useTheme} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import {LinearGradient} from '../webSafeImports/webSafeImports'

interface Props {
  readonly height: number
  readonly from?: string
  readonly to?: string
  readonly inverted?: boolean
  readonly nativeID?: string
}

const bottomToTop = [0, 0.3]
const topToBottom = [0.3, 0]
const BottomGradientView: React.FC<Props> = ({
  children,
  height,
  from,
  to,
  inverted,
  nativeID,
}) => {
  const {colors} = useTheme()

  return (
    <LinearGradient
      nativeID={nativeID}
      colors={[to ?? colors.bottomGradient, from ?? colors.systemBackground]}
      // colors={['rgba(179,50,50,0)', 'yellow']}
      locations={inverted ? topToBottom : bottomToTop}
      style={[styles.bottomContainer, {height: height}]}>
      {children}
    </LinearGradient>
  )
}

export default memo(BottomGradientView) as typeof BottomGradientView

const styles = StyleSheet.create({
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    start: 0,
    end: 0,
    alignItems: 'center',
    // todo temporary MOB-838
    paddingTop: ms(24),
  },
})
