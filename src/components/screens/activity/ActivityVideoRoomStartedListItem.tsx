import {observer} from 'mobx-react'
import React from 'react'

import {goToRoom} from '../../../appEventEmitter'
import {ActivityVideoRoomStartedModel} from '../../../models'
import {ActivityStore} from '../../../stores/ActivityStore'
import ClickableActivityView from './ClickableActivityView'

interface Props {
  readonly item: ActivityVideoRoomStartedModel
  readonly store: ActivityStore
  readonly index: number
  readonly accessibilityLabel?: string
}

const ActivityVideoRoomStartedListItem: React.FC<Props> = (props) => {
  const onPress = () =>
    goToRoom({
      room: props.item.roomId,
      pswd: props.item.roomPass,
      eventId: null,
    })

  return (
    <ClickableActivityView
      accessibilityLabel={props.accessibilityLabel}
      head={props.item.head}
      title={props.item.title}
      isNew={props.item.new}
      createdAt={props.item.createdAt}
      relatedUsers={props.item.relatedUsers}
      onPress={onPress}
    />
  )
}

export default observer(ActivityVideoRoomStartedListItem)
