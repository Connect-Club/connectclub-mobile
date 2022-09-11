import {observer} from 'mobx-react'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {Linking, StyleSheet} from 'react-native'

import {analytics} from '../../../Analytics'
import AppIcon from '../../../assets/AppIcon'
import {ActivityModel} from '../../../models'
import {storage} from '../../../storage'
import {ActivityStore} from '../../../stores/ActivityStore'
import {MyCountersStore} from '../../../stores/MyCountersStore'
import {commonStyles, useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import Horizontal from '../../common/Horizontal'
import PrimaryButton from '../../common/PrimaryButton'
import Spacer from '../../common/Spacer'
import Vertical from '../../common/Vertical'
import CreatedAtView from './CreatedAtView'

interface Props {
  readonly item: ActivityModel
  readonly activityStore: ActivityStore
  readonly countersStore: MyCountersStore
}

const ActivityJoinDiscordListItem: React.FC<Props> = (props) => {
  const {t} = useTranslation()
  const {colors} = useTheme()
  const itemOpacity = props.item.new ? 1 : 0.4

  const onNavigateToDiscordPress = () => {
    const url = props.countersStore.counters.joinDiscordLink
    if (!url) return
    analytics.sendEvent('activity_join_discord_click')
    Linking.openURL(url)
    storage.setDiscordBannerHidden()
    props.activityStore.deleteActivity(props.item.id)
  }

  const onSkipPress = () => {
    props.activityStore.deleteActivity(props.item.id)
  }

  return (
    <AppTouchableOpacity
      style={styles.listItem}
      accessibilityLabel={'activityJoinDiscord'}
      onPress={onNavigateToDiscordPress}>
      <Horizontal>
        <AppIcon
          style={[styles.avatar, {opacity: itemOpacity}]}
          type={'icDiscord34'}
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
          <Horizontal style={commonStyles.flexOne}>
            <PrimaryButton
              onPress={onSkipPress}
              title={t('ignoreButton')}
              textStyle={[styles.buttonText, {color: colors.accentPrimary}]}
              style={[styles.button, {backgroundColor: colors.accentSecondary}]}
            />
            <Spacer horizontal={16} />
            <PrimaryButton
              onPress={onNavigateToDiscordPress}
              title={t('activityJoinDiscord')}
              textStyle={styles.buttonText}
              style={[styles.buttonAccept]}
            />
          </Horizontal>
        </Vertical>

        <CreatedAtView
          style={{opacity: itemOpacity}}
          createdAt={props.item.createdAt}
        />
      </Horizontal>
    </AppTouchableOpacity>
  )
}

export default observer(ActivityJoinDiscordListItem)

const styles = StyleSheet.create({
  listItem: {
    marginTop: ms(32),
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

  button: {
    minWidth: undefined,
    height: ms(28),
    marginTop: ms(16),
  },

  buttonAccept: {
    minWidth: undefined,
    paddingHorizontal: ms(32),
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
})
