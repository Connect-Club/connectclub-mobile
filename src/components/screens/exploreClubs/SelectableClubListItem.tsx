import React, {memo} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {ClubModel} from '../../../models'
import {commonStyles, useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {shortFromDisplayName} from '../../../utils/userHelper'
import AppAvatar from '../../common/AppAvatar'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import Checked from '../../common/Checked'
import Horizontal from '../../common/Horizontal'
import Vertical from '../../common/Vertical'

interface Props {
  readonly club: ClubModel
  readonly isSelected: boolean
  readonly onCheckSelect: (club: ClubModel) => void
  readonly onClubSelect: (club: ClubModel) => void
}

const SelectableClubListItem: React.FC<Props> = (props) => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  return (
    <AppTouchableOpacity
      style={[
        styles.clickableContainer,
        {backgroundColor: colors.floatingBackground},
      ]}
      onPress={() => props.onClubSelect(props.club)}>
      <View style={styles.base}>
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
          <Horizontal style={{marginTop: ms(4)}}>
            <AppText>{t('whoInvitedInClubLabel')}</AppText>

            <AppAvatar
              size={ms(16)}
              style={styles.ownerAvatar}
              avatar={props.club.owner.avatar}
              shortName={shortFromDisplayName(props.club.owner.displayName)}
            />

            <AppText>{props.club.owner.displayName}</AppText>
          </Horizontal>
        </Vertical>

        <AppTouchableOpacity
          onPress={() => {
            props.onCheckSelect(props.club)
          }}>
          <Checked size={ms(24)} isChecked={props.isSelected} />
        </AppTouchableOpacity>
      </View>
    </AppTouchableOpacity>
  )
}

export default memo(SelectableClubListItem)

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
  },

  content: {
    marginHorizontal: ms(16),
  },
})
