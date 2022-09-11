import React, {useState} from 'react'
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native'

import Vertical from '../../components/common/Vertical'
import {commonStyles} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import {useBottomSafeArea} from '../../utils/safeArea.utils'
import {KeyboardAwareScrollView} from '../webSafeImports/webSafeImports'

interface Props {
  readonly style?: StyleProp<ViewStyle>
  readonly contentStyle?: StyleProp<ViewStyle>
}

const BaseWelcomeLayout: React.FC<Props> = ({
  children,
  style,
  contentStyle,
}) => {
  const inset = useBottomSafeArea()
  const [paddingBottom, setPaddingBottom] = useState(0)

  return (
    <View style={[styles.base, style]}>
      <KeyboardAwareScrollView
        keyboardDismissMode={'on-drag'}
        enableOnAndroid={false}
        keyboardShouldPersistTaps={'handled'}
        showsVerticalScrollIndicator={false}
        onKeyboardDidShow={(f: any) => {
          setPaddingBottom(f?.endCoordinates?.height ?? 0)
        }}
        onKeyboardDidHide={() => setPaddingBottom(0)}
        style={commonStyles.fullHeight}
        contentContainerStyle={[
          styles.content,
          {paddingBottom: inset + 16},
          contentStyle,
        ]}>
        <Vertical
          style={{
            width: '100%',
            alignItems: 'center',
            flex: 1,
          }}>
          {/*@ts-ignore*/}
          {children[0]}

          <View style={{marginBottom: paddingBottom + 16, width: '100%'}}>
            {/*@ts-ignore*/}
            {children[1]}
          </View>
        </Vertical>
      </KeyboardAwareScrollView>
    </View>
  )
}

export default BaseWelcomeLayout

const styles = StyleSheet.create({
  base: {
    height: '100%',
  },

  content: {
    paddingTop: ms(100),
    height: '100%',
  },
})
