import React, {memo} from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {
  Participant,
  PopupUser,
} from '../../../../src/components/screens/room/models/jsonModels'
import {UserReaction} from '../../../../src/components/screens/room/models/localModels'

import {ms} from '../../../../src/utils/layout.utils'

import AppIcon, {AppIconType} from '../../../../src/assets/AppIcon'
import {useTheme} from '../../../../src/theme/appTheme'

import ListenersListView from './ListenersListView'

interface Props {
  roomDescription: string
  speakers: Participant[]
  listeners: PopupUser[]
  readonly onUserPress: (user: PopupUser) => void
  readonly reactions: Map<string, UserReaction>
}

const StagePanel: React.FC<Props> = ({
  roomDescription,
  speakers,
  listeners,
  onUserPress,
  reactions,
}) => {
  const {colors} = useTheme()

  const secondaryColor = {color: colors.secondaryBodyText}

  const renderCount = (type: AppIconType, count: number): React.ReactNode => {
    return (
      <View style={styles.count}>
        <AppIcon type={type} tint={colors.secondaryBodyText} />

        <Text style={[styles.listenerText, secondaryColor]}>{count}</Text>
      </View>
    )
  }

  return (
    <>
      <View style={[styles.container]}>
        <View style={[styles.header]}>
          <Text
            numberOfLines={1}
            style={[styles.roomName, {color: colors.bodyText}]}>
            {roomDescription}
          </Text>

          <View style={[styles.counts]}>
            {renderCount('icEventTotalUsers', listeners.length)}
            {renderCount('icEventSpeaker', speakers.length)}
          </View>
        </View>

        <ListenersListView
          listeners={listeners}
          onUserPress={onUserPress}
          reactions={reactions}
        />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    alignItems: 'center',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingEnd: ms(16),
    paddingVertical: ms(16),
    alignSelf: 'flex-end',
  },

  roomName: {
    fontSize: 24,
    lineHeight: 24,
    fontWeight: 'bold',
  },

  counts: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  count: {
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  listenerText: {
    fontSize: 13,
  },
})

export default memo(StagePanel)
