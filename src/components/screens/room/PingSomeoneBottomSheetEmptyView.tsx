import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import InviteBlockView from '../../common/InviteBlockView'

interface Props {
  readonly onShareRoomPress: (inviteCode?: string) => void
  readonly onCopyRoomLinkPress: (inviteCode?: string) => void
  readonly roomId?: string
  readonly eventId?: string
}

const PingSomeoneBottomSheetEmptyView: React.FC<Props> = ({
  onShareRoomPress,
  onCopyRoomLinkPress,
  roomId,
  eventId,
}) => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  return (
    <View>
      <InviteBlockView
        icon={'icLink'}
        title={t('sendRoomLinkTitle')}
        text={t('sendRoomLinkText')}
        style={styles.inviteBlock}
        onCopyLink={onCopyRoomLinkPress}
        onShareLink={onShareRoomPress}
        accessibilitySuffix={'Ping'}
        roomId={roomId}
        eventId={eventId}
      />
      <View style={styles.emptyView}>
        <AppIcon
          style={styles.emptyViewIcon}
          type={'icCommunity24'}
          tint={colors.thirdBlack}
        />
        <AppText
          style={[styles.emptyViewText, {color: colors.secondaryBodyText}]}>
          {t('inviteFriendToRoomScreenEmptyViewText')}
        </AppText>
      </View>
    </View>
  )
}

export default PingSomeoneBottomSheetEmptyView

const styles = StyleSheet.create({
  emptyView: {
    height: '55%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyViewIcon: {
    marginBottom: ms(40),
  },

  emptyViewText: {
    fontSize: ms(15),
    lineHeight: ms(22),
    textAlign: 'center',
    maxWidth: ms(270),
  },

  inviteBlock: {
    marginTop: ms(24),
    marginHorizontal: ms(16),
    marginBottom: ms(24),
  },
})
