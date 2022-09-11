import {observer} from 'mobx-react'
import React, {useCallback} from 'react'
import {Linking, StyleSheet, View} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {ActivityCustomModel} from '../../../models'
import {ActivityStore} from '../../../stores/ActivityStore'
import {commonStyles, useTheme} from '../../../theme/appTheme'
import {useOpenUrl} from '../../../utils/deeplink/deeplink.utils'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import Vertical from '../../common/Vertical'
import CreatedAtView from '../activity/CreatedAtView'
import {logJS} from '../room/modules/Logger'

interface Props {
  readonly item: ActivityCustomModel
  readonly store: ActivityStore
  readonly index: number
}

const ActivityCustomView: React.FC<Props> = (p) => {
  const {colors} = useTheme()
  const itemOpacity = p.item.new ? 1 : 0.4
  const openUrl = useOpenUrl()

  const onPress = useCallback(async () => {
    const url = p.item.externalLink
    if (!(await Linking.canOpenURL(url))) {
      logJS('warning', `Unable to open URL: ${url}`)
      return
    }
    openUrl(url)
  }, [openUrl, p.item.externalLink])

  return (
    <View style={[styles.listItem, {opacity: itemOpacity}]}>
      <AppIcon
        type={'icFlatLogo'}
        style={[
          styles.avatar,
          {
            backgroundColor: colors.primaryClickable,
            borderColor: colors.inactiveAccentColor,
          },
        ]}
        tint={colors.floatingBackground}
      />
      <AppTouchableOpacity style={styles.touchableView} onPress={onPress}>
        <Vertical style={commonStyles.flexOne}>
          <AppText style={styles.titleText}>{p.item.title}</AppText>
          <AppText style={styles.bodyText}>{p.item.body}</AppText>
        </Vertical>
        <CreatedAtView style={styles.createdAt} createdAt={p.item.createdAt} />
      </AppTouchableOpacity>
    </View>
  )
}

export default observer(ActivityCustomView)

const styles = StyleSheet.create({
  avatar: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(70),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: ms(1),
  },
  listItem: {
    marginBottom: ms(16),
    paddingBottom: ms(16),
    flexDirection: 'row',
  },
  touchableView: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  titleText: {
    fontSize: ms(12),
    lineHeight: ms(16),
    fontWeight: 'bold',
    marginStart: ms(16),
  },
  bodyText: {
    fontSize: ms(12),
    lineHeight: ms(16),
    marginStart: ms(16),
  },
  createdAt: {
    marginTop: ms(1),
    lineHeight: ms(16),
    paddingStart: ms(4),
    justifyContent: 'center',
  },
})
