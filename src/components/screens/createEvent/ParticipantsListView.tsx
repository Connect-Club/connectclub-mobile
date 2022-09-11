import React, {useCallback} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {UserModel} from '../../../models'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {profileFullName} from '../../../utils/userHelper'
import AppText from '../../common/AppText'
import Horizontal from '../../common/Horizontal'
import Vertical from '../../common/Vertical'
import {alert} from '../../webSafeImports/webSafeImports'
import ParticipantListItem from './ParticipantListItem'

interface Props {
  readonly ownerId: string
  readonly removeTextKey: string
  readonly participants: Array<UserModel>
  readonly removeParticipant?: (model: UserModel) => void
}

const ParticipantsListView: React.FC<Props> = ({
  ownerId,
  removeTextKey,
  participants,
  removeParticipant,
}) => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  const separator = {backgroundColor: colors.separator}

  const onGuestPress = useCallback(
    (user: UserModel) => {
      if (user.id === ownerId) return
      if (!removeParticipant) return
      const fullName = profileFullName(user.name, user.surname)
      alert(
        t(removeTextKey, {name: fullName}),
        t('createEventRemoveHostDialogDescription', {name: fullName}),
        [
          {text: t('cancelButton'), style: 'cancel'},
          {
            text: t('removeButton'),
            style: 'destructive',
            onPress: () => removeParticipant(user),
          },
        ],
      )
    },
    [participants],
  )

  return (
    <Vertical style={styles.withContainer}>
      {participants?.map((s, index) => (
        <View key={s.id} style={styles.itemContainer}>
          {index === 0 && (
            <Horizontal style={styles.header} key={s.id}>
              <AppText style={[styles.withText, {color: colors.bodyText}]}>
                {t('createEventCreateWith')}
              </AppText>
              <ParticipantListItem
                onPress={onGuestPress}
                user={s}
                style={styles.firstItem}
                isRemovable={s.id !== ownerId}
              />
            </Horizontal>
          )}
          {index !== 0 && (
            <ParticipantListItem
              onPress={onGuestPress}
              key={s.id}
              user={s}
              style={styles.item}
              isRemovable={s.id !== ownerId && !!removeParticipant}
            />
          )}
          <View style={[styles.separator, separator]} />
        </View>
      ))}
    </Vertical>
  )
}

export default ParticipantsListView

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    height: ms(56),
  },
  withContainer: {
    flex: 1,
    paddingHorizontal: ms(16),
  },
  itemContainer: {
    width: '100%',
    justifyContent: 'center',
  },
  firstItem: {
    position: 'absolute',
    paddingStart: ms(48),
  },
  separator: {height: ms(1)},
  withText: {fontSize: ms(17)},
  item: {paddingStart: ms(48)},
})
