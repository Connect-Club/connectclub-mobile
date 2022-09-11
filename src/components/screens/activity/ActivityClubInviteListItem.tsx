import {observer} from 'mobx-react'
import React from 'react'

import {goToClub} from '../../../appEventEmitter'
import {ActivityClubRequestModel} from '../../../models'
import ClickableActivityView from './ClickableActivityView'

interface Props {
  readonly item: ActivityClubRequestModel
  readonly accessibilityLabel?: string
}

const ActivityClubInviteListItem: React.FC<Props> = (props) => {
  const onPress = () => {
    if (!props.item.clubId) return
    goToClub({clubId: props.item.clubId})
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

export default observer(ActivityClubInviteListItem)
