import {observer} from 'mobx-react'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {Image, StyleSheet} from 'react-native'

import {ActivityAskInviteModel} from '../../../models'
import {commonStyles, useTheme} from '../../../theme/appTheme'
import {setSizeForAvatar} from '../../../utils/avatar.utils'
import {ms} from '../../../utils/layout.utils'
import {getUserShortName} from '../../../utils/userHelper'
import AppAvatar from '../../common/AppAvatar'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import Horizontal from '../../common/Horizontal'
import PrimaryButton from '../../common/PrimaryButton'
import Spacer from '../../common/Spacer'
import Vertical from '../../common/Vertical'
import CreatedAtView from './CreatedAtView'

interface Props {
  readonly item: ActivityAskInviteModel
  readonly accessibilityLabel?: string
  readonly acceptText?: string
  readonly onAccept?: (item: ActivityAskInviteModel) => void
  readonly onReject?: (item: ActivityAskInviteModel) => void
  readonly onPress?: (item: ActivityAskInviteModel) => void
  readonly hasButtons?: boolean
}

const ActivityUserAskInviteListItem: React.FC<Props> = (props) => {
  const {t} = useTranslation()
  const {colors} = useTheme()
  const hasButtons = props.hasButtons === undefined || props.hasButtons

  const user = props.item.relatedUsers[0]
  const itemOpacity = props.item.new ? 1 : 0.4

  const onPressInternal = () => {
    props.onPress?.(props.item)
  }

  return (
    <AppTouchableOpacity
      style={styles.listItem}
      accessibilityLabel={props.accessibilityLabel}
      onPress={onPressInternal}>
      <Horizontal>
        <AppAvatar
          style={[styles.avatar, {opacity: itemOpacity}]}
          avatar={user.avatar}
          size={ms(32)}
          shortName={getUserShortName(user)}
        />
        <Vertical style={styles.textContainer}>
          <AppText
            style={[
              styles.title,
              {color: colors.bodyText, opacity: itemOpacity},
            ]}>
            {props.item.head}
          </AppText>
          <AppText
            style={[
              styles.subtitle,
              {color: colors.secondaryBodyText, opacity: itemOpacity},
            ]}>
            {props.item.title}
          </AppText>
          {hasButtons && (
            <Horizontal style={commonStyles.flexOne}>
              <PrimaryButton
                onPress={() => props.onReject?.(props.item)}
                title={t('ignoreButton')}
                textStyle={[styles.buttonText, {color: colors.accentPrimary}]}
                style={[
                  commonStyles.flexOne,
                  styles.button,
                  {backgroundColor: colors.accentSecondary},
                ]}
              />
              <Spacer horizontal={16} />
              <PrimaryButton
                onPress={() => props.onAccept?.(props.item)}
                title={props.acceptText ?? ''}
                textStyle={styles.buttonText}
                style={[commonStyles.flexOne, styles.button]}
              />
            </Horizontal>
          )}
        </Vertical>

        {props.item.secondIcon && (
          <Image
            style={styles.rightImage}
            source={{
              uri: setSizeForAvatar(props.item.secondIcon, 300, 300),
            }}
          />
        )}
        <CreatedAtView
          style={{opacity: itemOpacity}}
          createdAt={props.item.createdAt}
        />
      </Horizontal>
    </AppTouchableOpacity>
  )
}

export default observer(ActivityUserAskInviteListItem)

const styles = StyleSheet.create({
  listItem: {
    marginBottom: ms(16),
    paddingBottom: ms(16),
  },

  textContainer: {
    flex: 1,
    marginLeft: ms(16),
    justifyContent: 'center',
    paddingEnd: ms(8),
  },

  title: {
    fontSize: ms(12),
    fontWeight: 'bold',
  },

  subtitle: {
    flex: 1,
    fontSize: ms(12),
  },

  rejectButton: {
    maxWidth: ms(74),
    minWidth: undefined,
    height: ms(28),
    marginTop: ms(16),
  },

  button: {
    minWidth: undefined,
    height: ms(28),
    marginTop: ms(16),
  },

  buttonText: {
    fontSize: ms(12),
    fontWeight: 'bold',
  },

  avatar: {
    width: ms(32),
    height: ms(32),
  },

  rightImage: {
    width: ms(34),
    height: ms(34),
    borderRadius: ms(6),
    marginLeft: ms(8),
    marginRight: ms(16),
  },
})
