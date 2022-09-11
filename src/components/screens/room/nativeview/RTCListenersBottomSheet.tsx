import React from 'react'
import {requireNativeComponent, ViewProps} from 'react-native'

import {BottomSheetUserEvent} from '../../../../models'

interface RTCListenersBottomSheetProps {
  readonly onUserTap: (event: BottomSheetUserEvent) => void
  readonly minSheetHeight: number
  readonly middleSheetHeight: number
  readonly emojiIcons: Record<string, string>
  readonly specialGuestBadgeIcon: string
  readonly specialModeratorBadgeIcon: string
  readonly badgedGuestBadgeIcon: string
  readonly newbieBadgeIcon: string
}

const RTCListenersBottomSheet = requireNativeComponent<
  typeof ListenersBottomSheet
>('RNCRoomListeners')

type ListenerProps = ViewProps & RTCListenersBottomSheetProps

const ListenersBottomSheet: React.FC<ListenerProps> = (props) => {
  return (
    <RTCListenersBottomSheet
      {...props}
      // @ts-ignore
      onUserTap={props.onUserTap}
    />
  )
}

export default ListenersBottomSheet
