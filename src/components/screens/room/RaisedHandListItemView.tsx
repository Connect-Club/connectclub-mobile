import React, {useCallback} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleProp, StyleSheet, ViewStyle} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {UserModel} from '../../../models'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import RoomBottomSheetUserListItem from './RoomBottomSheetUserListItem'

interface Props {
  readonly user: UserModel
  readonly style?: StyleProp<ViewStyle>
  readonly callToStage: () => void
}

const RaisedHandListItemView: React.FC<Props> = ({user, callToStage}) => {
  const {t} = useTranslation()
  const {colors} = useTheme()

  const right = useCallback(() => {
    return (
      <AppTouchableOpacity
        style={[styles.addButton, {backgroundColor: colors.accentPrimary}]}
        onPress={callToStage}
        activeOpacity={0.8}>
        <AppIcon type={'icPlus'} />
        <AppText style={[styles.stageButton, {color: colors.textPrimary}]}>
          {t('sceneButton')}
        </AppText>
      </AppTouchableOpacity>
    )
  }, [])

  return <RoomBottomSheetUserListItem user={user} right={right} />
}

export default RaisedHandListItemView

const styles = StyleSheet.create({
  addButton: {
    paddingHorizontal: ms(8),
    height: ms(28),
    borderRadius: ms(28 / 2),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  id: {
    position: 'absolute',
    top: 0,
    color: 'white',
    backgroundColor: 'black',
    fontSize: ms(8),
  },
  stageButton: {
    fontSize: ms(12),
    lineHeight: ms(18),
  },
})
