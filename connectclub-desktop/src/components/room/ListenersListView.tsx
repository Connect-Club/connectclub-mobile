import {observer} from 'mobx-react'
import React, {useCallback} from 'react'
import {FlatList, StyleSheet} from 'react-native'

import {PopupUser} from '../../../../src/components/screens/room/models/jsonModels'
import {UserReaction} from '../../../../src/components/screens/room/models/localModels'

import {ms} from '../../../../src/utils/layout.utils'

import ListenerItemView from './ListenerItemView'

interface Props {
  readonly onUserPress: (user: PopupUser) => void
  readonly listeners: PopupUser[]
  readonly reactions: Map<string, UserReaction>
}

const keyExtractor = (user: PopupUser) => user.id

const ListenersListView: React.FC<Props> = ({
  onUserPress,
  listeners,
  reactions,
}) => {
  const renderItem = useCallback(
    ({item}) => {
      return (
        <ListenerItemView
          listener={item}
          onUserPress={onUserPress}
          reaction={reactions.get(item.id)?.type}
        />
      )
    },
    [onUserPress, reactions],
  )

  return (
    <FlatList<PopupUser>
      style={styles.list}
      contentContainerStyle={styles.container}
      data={listeners}
      renderItem={renderItem}
      numColumns={5}
      windowSize={40}
      initialNumToRender={40}
      keyExtractor={keyExtractor}
    />
  )
}

export default observer(ListenersListView)

const styles = StyleSheet.create({
  list: {
    width: '100%',
  },
  container: {
    paddingBottom: ms(90),
    paddingStart: ms(28),
  },
})
