import {observer} from 'mobx-react'
import React, {useCallback} from 'react'
import {StyleSheet, View} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {LanguageModel} from '../../../models'
import LanguageSelectorStore from '../../../stores/LanguageSelectorStore'
import {useTheme} from '../../../theme/appTheme'
import {isWeb} from '../../../utils/device.utils'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

interface Props {
  readonly item: LanguageModel
  readonly store: LanguageSelectorStore
  readonly onSelect: (item: LanguageModel) => void
}

const LanguageSelectorItem: React.FC<Props> = ({item, store, onSelect}) => {
  const {colors} = useTheme()
  const onPress = useCallback(() => onSelect(item), [onSelect, item])
  const isSelected = store.isSelected(item.id)

  return (
    <AppTouchableOpacity
      style={styles.clickable}
      onPress={onPress}
      accessibilityLabel={`lang_${item.name}`}>
      <View
        style={[styles.textWrapper, {borderColor: colors.inactiveAccentColor}]}>
        <AppText style={styles.text}>{item.name}</AppText>
      </View>
      {isSelected && (
        <AppIcon style={styles.checkIcon} type={'icCheck24Primary'} />
      )}
    </AppTouchableOpacity>
  )
}

const styles = StyleSheet.create({
  clickable: {
    flexDirection: 'row',
    paddingHorizontal: isWeb ? ms(32) : ms(16),
    height: ms(56),
  },
  textWrapper: {
    width: '100%',
    borderBottomWidth: ms(1),
  },
  text: {
    width: '100%',
    fontSize: ms(17),
    lineHeight: ms(56),
  },
  checkIcon: {
    position: 'absolute',
    right: ms(16),
    height: '100%',
    justifyContent: 'center',
  },
})

export default observer(LanguageSelectorItem)
