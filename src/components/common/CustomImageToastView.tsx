import React, {memo, PropsWithChildren} from 'react'
import {Image, StyleSheet, View} from 'react-native'

import {commonStyles, makeTextStyle, useTheme} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import AppText from './AppText'
import Horizontal from './Horizontal'
import Vertical from './Vertical'

export type CustomImageToastProps = {
  toastId: string
  title?: string
  body?: string
  leftImage?: any
  rightImage?: any
}

const CustomImageToastView: React.FC<
  PropsWithChildren<CustomImageToastProps>
> = (p) => {
  const {colors} = useTheme()

  return (
    <View style={styles.base}>
      <Horizontal style={styles.container}>
        {p.leftImage && (
          <Image style={styles.leftImage} source={{uri: p.leftImage}} />
        )}
        <Vertical style={commonStyles.flexOne}>
          {p.title && (
            <AppText style={[styles.title, {color: colors.textPrimary}]}>
              {p.title}
            </AppText>
          )}
          {p.body && (
            <AppText style={[styles.text, {color: colors.textPrimary}]}>
              {p.body}
            </AppText>
          )}
        </Vertical>
        {p.rightImage && (
          <Image style={styles.rightImage} source={{uri: p.rightImage}} />
        )}
      </Horizontal>
      {p.children && p.children}
    </View>
  )
}

export default memo(CustomImageToastView)

const styles = StyleSheet.create({
  base: {
    padding: ms(16),
    flexDirection: 'column',
  },

  container: {
    flexDirection: 'row',
  },

  text: {
    fontSize: ms(15),
  },

  title: {
    ...makeTextStyle(ms(15), ms(15), 'bold'),
  },

  buttonsContainer: {
    marginTop: ms(24),
  },

  leftImage: {
    marginRight: ms(10),
    width: ms(38),
    height: ms(38),
    borderRadius: ms(19),
  },

  rightImage: {
    width: ms(38),
    height: ms(38),
    borderRadius: ms(6),
    marginLeft: ms(10),
  },
})
