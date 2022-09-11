import React, {memo, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet} from 'react-native'

import {ClubModel, ClubUser} from '../../../models'
import ClubStore from '../../../stores/ClubStore'
import {commonStyles, makeTextStyle, useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {shortFromDisplayName} from '../../../utils/userHelper'
import {useViewModel} from '../../../utils/useViewModel'
import AppAvatar from '../../common/AppAvatar'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import Horizontal from '../../common/Horizontal'
import Vertical from '../../common/Vertical'

interface Props {
  readonly club: ClubModel
  readonly onClubPress: (club: ClubModel) => void
  readonly onOwnerPress: (user: ClubUser) => void
  readonly statusWithIcon?: boolean
  readonly buttonComponent?: React.ReactElement
}

const JoinableClubListItem: React.FC<Props> = (props) => {
  const {colors} = useTheme()
  const {t} = useTranslation()
  const store = useViewModel(() => new ClubStore())

  useEffect(() => {
    store.initializeWithClub(props.club)
  }, [])

  return (
    <AppTouchableOpacity
      style={[
        styles.clickableContainer,
        {backgroundColor: colors.floatingBackground},
      ]}
      onPress={() => props.onClubPress(props.club)}>
      <Horizontal style={styles.base}>
        <AppAvatar
          size={ms(40)}
          style={styles.avatar}
          avatar={props.club.avatar}
          shortName={shortFromDisplayName(props.club.title)}
        />
        <Vertical
          style={[
            styles.content,
            commonStyles.flexOne,
            commonStyles.justifyCenter,
          ]}>
          <AppText
            numberOfLines={1}
            style={[styles.title, {color: colors.bodyText}]}>
            {props.club.title}
          </AppText>
          {!!props.club.description && (
            <AppText
              style={[styles.subtitle, {color: colors.secondaryBodyText}]}
              ellipsizeMode={'tail'}
              numberOfLines={2}>
              {props.club.description}
            </AppText>
          )}
          <AppTouchableOpacity
            onPress={() => props.onOwnerPress(props.club.owner)}>
            <Horizontal style={{marginTop: ms(4)}}>
              <AppText style={styles.plainText}>
                {t('whoInvitedInClubLabel')}
              </AppText>

              <AppAvatar
                size={ms(16)}
                style={styles.ownerAvatar}
                avatar={props.club.owner.avatar}
                shortName={shortFromDisplayName(props.club.owner.displayName)}
              />

              <AppText
                style={[
                  styles.selectableText,
                  {color: colors.primaryClickable},
                ]}>
                {props.club.owner.displayName}
              </AppText>
            </Horizontal>
          </AppTouchableOpacity>
        </Vertical>
        {props.buttonComponent && props.buttonComponent}
      </Horizontal>
    </AppTouchableOpacity>
  )
}

export default memo(JoinableClubListItem)

const styles = StyleSheet.create({
  clickableContainer: {
    marginBottom: ms(8),
    borderRadius: ms(8),
  },

  base: {
    height: ms(88),
    paddingHorizontal: ms(16),
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: ms(40),
    height: ms(40),
  },

  ownerAvatar: {
    width: ms(16),
    height: ms(16),
    marginHorizontal: ms(4),
  },

  title: {
    fontSize: ms(12),
    fontWeight: 'bold',
    lineHeight: ms(16),
  },

  subtitle: {
    width: '100%',
    fontSize: ms(12),
    lineHeight: ms(16),
    maxHeight: ms(32),
  },

  content: {
    marginHorizontal: ms(16),
  },

  joinButton: {
    height: ms(28),
    marginEnd: 0,
    minWidth: ms(78),
  },

  plainText: {
    ...makeTextStyle(ms(12), ms(16), 'normal'),
  },

  buttonText: {
    ...makeTextStyle(ms(12), ms(18), '600'),
  },

  selectableText: {
    ...makeTextStyle(ms(12), ms(16), 'bold'),
  },
})
