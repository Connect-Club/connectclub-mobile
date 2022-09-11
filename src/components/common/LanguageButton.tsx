import React, {memo, useCallback, useMemo} from 'react'
import {StyleProp, StyleSheet, ViewStyle} from 'react-native'

import AppIcon from '../../assets/AppIcon'
import {LanguageModel} from '../../models'
import {commonStyles, useTheme} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import AppText from './AppText'
import AppTouchableOpacity from './AppTouchableOpacity'
import Horizontal from './Horizontal'

interface Props {
  readonly title: string
  readonly style?: StyleProp<ViewStyle>
  readonly languages?: LanguageModel | Array<LanguageModel>
  readonly onPress: (lang?: LanguageModel) => void
}

const LanguageButton: React.FC<Props> = (props) => {
  const {colors} = useTheme()

  const currentLanguages = useMemo(() => {
    return props.languages === undefined || Array.isArray(props.languages)
      ? props.languages
      : [props.languages]
  }, [props.languages])

  const onPress = useCallback(() => {
    props.onPress(currentLanguages?.[0])
  }, [currentLanguages, props])

  return (
    <AppTouchableOpacity
      style={[
        styles.clickable,
        {backgroundColor: colors.floatingBackground},
        props.style,
      ]}
      onPress={onPress}>
      <AppText style={[styles.text, {color: colors.bodyText}]}>
        {props.title}
      </AppText>
      {currentLanguages && currentLanguages.length > 1 && (
        <Horizontal style={commonStyles.alignCenter}>
          <AppText style={[styles.text, {color: colors.secondaryBodyText}]}>
            {currentLanguages.length}
          </AppText>
          <AppIcon type={'icArrowRight'} />
        </Horizontal>
      )}
      {currentLanguages && currentLanguages?.length === 1 && (
        <AppText style={[styles.text, {color: colors.secondaryBodyText}]}>
          {currentLanguages[0]!.name}
        </AppText>
      )}
    </AppTouchableOpacity>
  )
}

const styles = StyleSheet.create({
  clickable: {
    flexDirection: 'row',
    borderRadius: ms(8),
    marginHorizontal: ms(16),
    marginTop: ms(24),
    height: ms(56),
    paddingHorizontal: ms(16),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: {
    fontSize: ms(17),
    lineHeight: ms(25),
  },
})

export default memo(LanguageButton)
