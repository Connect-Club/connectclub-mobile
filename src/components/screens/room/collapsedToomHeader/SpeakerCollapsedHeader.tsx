import React, {memo} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {useTheme} from '../../../../theme/appTheme'
import {ms} from '../../../../utils/layout.utils'
import AppText from '../../../common/AppText'
import AppTouchableOpacity from '../../../common/AppTouchableOpacity'
import Horizontal from '../../../common/Horizontal'
import LeaveButton from '../LeaveButton'

interface Props {
  onLeavePress: () => void
  onReturnPress: () => void
}

const SpeakerCollapsedHeader: React.FC<Props> = (props) => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  return (
    <Horizontal style={styles.contentContainer}>
      <View style={styles.leaveButtonContainer}>
        <LeaveButton onPress={props.onLeavePress} />
      </View>
      <AppTouchableOpacity
        style={[
          styles.returnBackButton,
          {backgroundColor: colors.floatingBackground},
        ]}
        shouldVibrateOnClick
        onPress={props.onReturnPress}>
        <AppText
          style={[styles.returnBackButtonText, {color: colors.bodyText}]}>
          {t('backToTheRoomButton')}
        </AppText>
      </AppTouchableOpacity>
    </Horizontal>
  )
}

export default memo(SpeakerCollapsedHeader)

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    height: ms(48 + 24),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leaveButtonContainer: {
    width: ms(48 + 32),
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  returnBackButton: {
    height: ms(48),
    minWidth: ms(158),
    borderRadius: ms(160),
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: ms(16),
  },
  returnBackButtonText: {
    fontSize: ms(15),
    lineHeight: ms(18),
    fontWeight: 'bold',
    paddingHorizontal: ms(16),
  },
})
