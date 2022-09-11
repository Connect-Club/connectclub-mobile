import {observer} from 'mobx-react'
import React, {useCallback} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {api} from '../../../api/api'
import {ActivityUserRegisteredModel, UserModel} from '../../../models'
import {ActivityStore} from '../../../stores/ActivityStore'
import {commonStyles, makeTextStyle, useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import Horizontal from '../../common/Horizontal'
import PrimaryButton from '../../common/PrimaryButton'
import Spacer from '../../common/Spacer'
import TouchableAppAvatarView from '../../common/TouchableAppAvatarView'
import Vertical from '../../common/Vertical'
import ConnectButton, {CustomTitles} from '../profileScreen/ConnectButton'
import CreatedAtView from './CreatedAtView'

interface Props {
  readonly item: ActivityUserRegisteredModel
  readonly store: ActivityStore
  readonly index: number
  readonly accessibilityLabel?: string
  readonly withoutButtons?: boolean
  readonly customConnectButtonTitles?: CustomTitles
  readonly onConnectedBack?: (user: UserModel) => void
}

const ActivityUserRegisteredListItem: React.FC<Props> = (props) => {
  const {t} = useTranslation()
  const {colors} = useTheme()

  const user = props.item.relatedUsers[0]
  const itemOpacity = props.item.new ? 1 : 0.4
  const withoutButtons = props.withoutButtons === true

  const onFollowingStateChanged = useCallback(
    async (isFollowing: boolean) => {
      props.store.onFollowingStateChanged(user, isFollowing)
      await api.deleteActivity(props.item.id)
      if (isFollowing) props.onConnectedBack?.(user)
    },
    [user, props],
  )

  return (
    <View style={styles.listItem} accessibilityLabel={props.accessibilityLabel}>
      <Horizontal style={commonStyles.flexOne}>
        <TouchableAppAvatarView
          style={{opacity: itemOpacity}}
          user={user}
          moveOnPressTo={'ProfileScreenModal'}
        />
        <Vertical style={styles.textContainer}>
          <AppText
            style={[
              styles.title,
              {color: colors.bodyText, opacity: itemOpacity},
            ]}>
            {props.item.title}
          </AppText>

          {!withoutButtons && (
            <Horizontal style={commonStyles.flexOne}>
              <PrimaryButton
                title={t('skipButton')}
                textStyle={[styles.buttonText, {color: colors.accentPrimary}]}
                onPress={() => {
                  props.store.deleteActivity(props.item.id)
                }}
                style={[
                  commonStyles.flexOne,
                  styles.button,
                  {backgroundColor: colors.accentSecondary},
                ]}
              />
              <Spacer horizontal={16} />
              <ConnectButton
                style={[commonStyles.flexOne, styles.button]}
                mode={'activity'}
                user={user}
                onFollowingStateChanged={onFollowingStateChanged}
                customTitles={props.customConnectButtonTitles}
              />
            </Horizontal>
          )}
        </Vertical>
        <CreatedAtView
          style={{opacity: itemOpacity}}
          createdAt={props.item.createdAt}
        />
      </Horizontal>
    </View>
  )
}

export default observer(ActivityUserRegisteredListItem)

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
    ...makeTextStyle(12, 16, 'bold'),
  },

  button: {
    position: 'relative',
    minWidth: undefined,
    height: ms(28),
    marginTop: ms(16),
    alignItems: 'center',
    paddingHorizontal: 0,
  },

  buttonText: {
    fontSize: ms(12),
    fontWeight: 'bold',
  },
})
