import React from 'react'
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native'

import AppText from '../../../components/common/AppText'
import AppTouchableOpacity from '../../../components/common/AppTouchableOpacity'
import {commonStyles, makeTextStyle, useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'

type Props = {
  action: () => void
  buttonText: string
  title: string
  style?: StyleProp<ViewStyle>
}

const EditClubSections: React.FC<Props> = ({
  action,
  buttonText,
  title,
  style,
}) => {
  const {colors} = useTheme()

  return (
    <View style={[styles.container, style]}>
      <AppText style={[styles.title, {color: colors.thirdBlack}]}>
        {title.toUpperCase()}
      </AppText>
      <View
        style={[
          commonStyles.alignCenter,
          styles.wrapper,
          {borderColor: colors.sectionBorder},
        ]}>
        <AppTouchableOpacity
          style={[
            styles.buttonContainer,
            {backgroundColor: colors.sectionButton},
          ]}
          onPress={action}>
          <AppText style={styles.buttonText}>{buttonText}</AppText>
        </AppTouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: ms(34),
  },
  wrapper: {
    paddingVertical: ms(16),
    borderStyle: 'dashed',
    borderWidth: ms(1.5),
    borderRadius: ms(8),
  },
  title: {
    ...makeTextStyle(ms(11), ms(14.3), 'bold'),
    marginBottom: ms(16),
  },
  buttonContainer: {
    paddingHorizontal: ms(24),
    paddingVertical: ms(10),
    borderRadius: ms(100),
  },
  buttonText: {
    ...makeTextStyle(ms(15), ms(18), '600'),
  },
})

export default EditClubSections
