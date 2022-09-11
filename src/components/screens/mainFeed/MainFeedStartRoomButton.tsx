import {observer} from 'mobx-react'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {Platform, StyleSheet} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {commonStyles, useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import BottomGradientView from '../../common/BottomGradientView'
import Horizontal from '../../common/Horizontal'
import PrimaryButton from '../../common/PrimaryButton'
import {presentIntercom} from '../../webSafeImports/webSafeImports'

interface Props {
  readonly height: number
  readonly onPress: () => void
}

const MainFeedStartRoomButton: React.FC<Props> = ({height, onPress}) => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  const supportButtonBackground = {backgroundColor: colors.actionButton}

  return (
    <BottomGradientView height={height}>
      <Horizontal
        style={[
          styles.container,
          commonStyles.flexCenter,
          Platform.select({
            web: {
              borderTopWidth: 1,
              borderTopColor: colors.separator,
              paddingVertical: 24,
            },
          }),
        ]}>
        <PrimaryButton
          style={commonStyles.wizardButton}
          accessibilityLabel={'mainFeedStartRoomButton'}
          title={t('startRoomButton')}
          onPress={onPress}
        />
        <AppTouchableOpacity
          style={[styles.supportButton, supportButtonBackground]}
          onPress={presentIntercom}>
          <AppIcon type={'icInfo'} />
        </AppTouchableOpacity>
      </Horizontal>
    </BottomGradientView>
  )
}

export default observer(MainFeedStartRoomButton)

const styles = StyleSheet.create({
  container: {width: '100%'},
  supportButton: {
    position: 'absolute',
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
    right: ms(16),
    width: ms(48),
    height: ms(48),
    borderRadius: ms(24),
  },
})
