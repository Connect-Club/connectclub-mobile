import {observer} from 'mobx-react'
import React from 'react'

import {
  ActivityModelType,
  ActivityUserScheduleEventModel,
} from '../../../models'
import {ActivityStore} from '../../../stores/ActivityStore'
import {logJS} from '../room/modules/Logger'
import ClickableActivityView from './ClickableActivityView'

interface Props {
  readonly item: ActivityUserScheduleEventModel
  readonly store: ActivityStore
  readonly index: number
  readonly onPress: (eventId: string) => void
  readonly accessibilityLabel?: string
}

const ActivityUserScheduleEventListItem: React.FC<Props> = (props) => {
  const onPress = () => {
    if (props.item.type === ActivityModelType.privateMeetingCancelled) return
    props.onPress(props.item.eventScheduleId)
  }

  if (props.item.type === ActivityModelType.registeredAsSpeaker) {
    logJS('debug', JSON.stringify(props.item, null, 2))
  }

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

export default observer(ActivityUserScheduleEventListItem)
