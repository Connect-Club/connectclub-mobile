/* eslint-disable */
import React, {memo} from 'react'
import {StyleProp, View, ViewStyle} from 'react-native'
import deepEqual from 'deep-equal'
import BannerFestival from './icons/bannerFestival.svg'
import FestivalCheckIn from './icons/festivalCheckIn.svg'
import FestivalName from './icons/festivalName.svg'
import FestivalSmallCheckIn from './icons/festivalSmallCheckIn.svg'
import IcAdd from './icons/icAdd.svg'
import IcAdd16 from './icons/icAdd16.svg'
import IcAddEvent from './icons/icAddEvent.svg'
import IcAddPeople from './icons/icAddPeople.svg'
import IcAddToCal from './icons/icAddToCal.svg'
import IcArrowDown from './icons/icArrowDown.svg'
import IcArrowRight from './icons/icArrowRight.svg'
import IcArrowRightOpaque from './icons/icArrowRightOpaque.svg'
import IcAvailableForChat from './icons/icAvailableForChat.svg'
import IcAvailableForChatOnline from './icons/icAvailableForChatOnline.svg'
import IcBadConnection from './icons/icBadConnection.svg'
import IcBucket24 from './icons/icBucket24.svg'
import IcCalendar from './icons/icCalendar.svg'
import IcCalendarBig from './icons/icCalendarBig.svg'
import IcCamOff from './icons/icCamOff.svg'
import IcCamOn from './icons/icCamOn.svg'
import IcChangeAvatar from './icons/icChangeAvatar.svg'
import IcCheck from './icons/icCheck.svg'
import IcCheck24 from './icons/icCheck24.svg'
import IcCheck24Primary from './icons/icCheck24Primary.svg'
import IcCheckTwo from './icons/icCheckTwo.svg'
import IcCirclePlus from './icons/icCirclePlus.svg'
import IcClear from './icons/icClear.svg'
import IcClose from './icons/icClose.svg'
import IcClosedLock from './icons/icClosedLock.svg'
import IcClosedLock16 from './icons/icClosedLock16.svg'
import IcCommunity24 from './icons/icCommunity24.svg'
import IcConnectLogo from './icons/icConnectLogo.svg'
import IcConnectStatusConnected from './icons/icConnectStatusConnected.svg'
import IcConnectStatusIRequested from './icons/icConnectStatusIRequested.svg'
import IcConnectStatusNotConnected from './icons/icConnectStatusNotConnected.svg'
import IcConnectStatusTheyRequested from './icons/icConnectStatusTheyRequested.svg'
import IcCopy from './icons/icCopy.svg'
import IcCopyButton from './icons/icCopyButton.svg'
import IcCopyToBuffer from './icons/icCopyToBuffer.svg'
import IcCreateClub from './icons/icCreateClub.svg'
import IcCrown from './icons/icCrown.svg'
import IcCrown24 from './icons/icCrown24.svg'
import IcCrownFilled24 from './icons/icCrownFilled24.svg'
import IcDiscord24 from './icons/icDiscord24.svg'
import IcDiscord34 from './icons/icDiscord34.svg'
import IcEmoji from './icons/icEmoji.svg'
import IcEmptyClubs from './icons/icEmptyClubs.svg'
import IcEmptyExplore from './icons/icEmptyExplore.svg'
import IcEmptyMainFeedCalendar from './icons/icEmptyMainFeedCalendar.svg'
import IcEvent from './icons/icEvent.svg'
import IcEventInfo from './icons/icEventInfo.svg'
import IcEventSpeaker from './icons/icEventSpeaker.svg'
import IcEventTotalUsers from './icons/icEventTotalUsers.svg'
import IcExplore from './icons/icExplore.svg'
import IcExternalLink from './icons/icExternalLink.svg'
import IcFestival from './icons/icFestival.svg'
import IcFlatLogo from './icons/icFlatLogo.svg'
import IcFullArrowRight from './icons/icFullArrowRight.svg'
import IcHasInvites from './icons/icHasInvites.svg'
import IcInfo from './icons/icInfo.svg'
import IcInstagram from './icons/icInstagram.svg'
import IcInvite from './icons/icInvite.svg'
import IcInvited from './icons/icInvited.svg'
import IcLeave from './icons/icLeave.svg'
import IcLink from './icons/icLink.svg'
import IcLinkedin from './icons/icLinkedin.svg'
import IcLock from './icons/icLock.svg'
import IcLock16 from './icons/icLock16.svg'
import IcLockCompact from './icons/icLockCompact.svg'
import IcMailWithStars from './icons/icMailWithStars.svg'
import IcMegafonOff from './icons/icMegafonOff.svg'
import IcMegafonOn from './icons/icMegafonOn.svg'
import IcMicOff from './icons/icMicOff.svg'
import IcMicOn from './icons/icMicOn.svg'
import IcModerator from './icons/icModerator.svg'
import IcNavigationBack from './icons/icNavigationBack.svg'
import IcNavigationClose from './icons/icNavigationClose.svg'
import IcNavigationClose16 from './icons/icNavigationClose16.svg'
import IcNetworkingSelectedRoom from './icons/icNetworkingSelectedRoom.svg'
import IcNetworkingUnselectedRoom from './icons/icNetworkingUnselectedRoom.svg'
import IcNewbieTag from './icons/icNewbieTag.svg'
import IcOpenedHands from './icons/icOpenedHands.svg'
import IcOpenedLock from './icons/icOpenedLock.svg'
import IcPencil from './icons/icPencil.svg'
import IcPersons from './icons/icPersons.svg'
import IcPersons40 from './icons/icPersons40.svg'
import IcPlus from './icons/icPlus.svg'
import IcPressTag from './icons/icPressTag.svg'
import IcPublicSelectedRoom from './icons/icPublicSelectedRoom.svg'
import IcPublicUnselectedRoom from './icons/icPublicUnselectedRoom.svg'
import IcRaiseHand from './icons/icRaiseHand.svg'
import IcRaisedHand from './icons/icRaisedHand.svg'
import IcRaisedHandSmall from './icons/icRaisedHandSmall.svg'
import IcRing from './icons/icRing.svg'
import IcRingSubscribed from './icons/icRingSubscribed.svg'
import IcRoomLoading from './icons/icRoomLoading.svg'
import IcSearch from './icons/icSearch.svg'
import IcSearch24 from './icons/icSearch24.svg'
import IcSearchWithStars from './icons/icSearchWithStars.svg'
import IcSelectPhoto from './icons/icSelectPhoto.svg'
import IcSelfie from './icons/icSelfie.svg'
import IcSettings from './icons/icSettings.svg'
import IcShare from './icons/icShare.svg'
import IcSpeaker from './icons/icSpeaker.svg'
import IcSpeakerTag from './icons/icSpeakerTag.svg'
import IcStar16 from './icons/icStar16.svg'
import IcTeamTag from './icons/icTeamTag.svg'
import IcToggleCamera from './icons/icToggleCamera.svg'
import IcTwitter from './icons/icTwitter.svg'
import IcVerticalMenu from './icons/icVerticalMenu.svg'
import IcWaveHand from './icons/icWaveHand.svg'
import WarningSign from './icons/warningSign.svg'

export type AppIconType = 'bannerFestival' | 'festivalCheckIn' | 'festivalName' | 'festivalSmallCheckIn' | 'icAdd' | 'icAdd16' | 'icAddEvent' | 'icAddPeople' | 'icAddToCal' | 'icArrowDown' | 'icArrowRight' | 'icArrowRightOpaque' | 'icAvailableForChat' | 'icAvailableForChatOnline' | 'icBadConnection' | 'icBucket24' | 'icCalendar' | 'icCalendarBig' | 'icCamOff' | 'icCamOn' | 'icChangeAvatar' | 'icCheck' | 'icCheck24' | 'icCheck24Primary' | 'icCheckTwo' | 'icCirclePlus' | 'icClear' | 'icClose' | 'icClosedLock' | 'icClosedLock16' | 'icCommunity24' | 'icConnectLogo' | 'icConnectStatusConnected' | 'icConnectStatusIRequested' | 'icConnectStatusNotConnected' | 'icConnectStatusTheyRequested' | 'icCopy' | 'icCopyButton' | 'icCopyToBuffer' | 'icCreateClub' | 'icCrown' | 'icCrown24' | 'icCrownFilled24' | 'icDiscord24' | 'icDiscord34' | 'icEmoji' | 'icEmptyClubs' | 'icEmptyExplore' | 'icEmptyMainFeedCalendar' | 'icEvent' | 'icEventInfo' | 'icEventSpeaker' | 'icEventTotalUsers' | 'icExplore' | 'icExternalLink' | 'icFestival' | 'icFlatLogo' | 'icFullArrowRight' | 'icHasInvites' | 'icInfo' | 'icInstagram' | 'icInvite' | 'icInvited' | 'icLeave' | 'icLink' | 'icLinkedin' | 'icLock' | 'icLock16' | 'icLockCompact' | 'icMailWithStars' | 'icMegafonOff' | 'icMegafonOn' | 'icMicOff' | 'icMicOn' | 'icModerator' | 'icNavigationBack' | 'icNavigationClose' | 'icNavigationClose16' | 'icNetworkingSelectedRoom' | 'icNetworkingUnselectedRoom' | 'icNewbieTag' | 'icOpenedHands' | 'icOpenedLock' | 'icPencil' | 'icPersons' | 'icPersons40' | 'icPlus' | 'icPressTag' | 'icPublicSelectedRoom' | 'icPublicUnselectedRoom' | 'icRaiseHand' | 'icRaisedHand' | 'icRaisedHandSmall' | 'icRing' | 'icRingSubscribed' | 'icRoomLoading' | 'icSearch' | 'icSearch24' | 'icSearchWithStars' | 'icSelectPhoto' | 'icSelfie' | 'icSettings' | 'icShare' | 'icSpeaker' | 'icSpeakerTag' | 'icStar16' | 'icTeamTag' | 'icToggleCamera' | 'icTwitter' | 'icVerticalMenu' | 'icWaveHand' | 'warningSign'
export interface AppIconProps {
  readonly type: AppIconType
  readonly testID?: string
  readonly style?: StyleProp<ViewStyle>
  readonly isVisible?: boolean
  readonly tint?: string
}

const getIcon = (type: AppIconType, tint: string | undefined): JSX.Element => {
    switch (type) {
  case 'bannerFestival':
    return tint ? <BannerFestival fill={tint} /> : <BannerFestival />
  case 'festivalCheckIn':
    return tint ? <FestivalCheckIn fill={tint} /> : <FestivalCheckIn />
  case 'festivalName':
    return tint ? <FestivalName fill={tint} /> : <FestivalName />
  case 'festivalSmallCheckIn':
    return tint ? <FestivalSmallCheckIn fill={tint} /> : <FestivalSmallCheckIn />
  case 'icAdd':
    return tint ? <IcAdd fill={tint} /> : <IcAdd />
  case 'icAdd16':
    return tint ? <IcAdd16 fill={tint} /> : <IcAdd16 />
  case 'icAddEvent':
    return tint ? <IcAddEvent fill={tint} /> : <IcAddEvent />
  case 'icAddPeople':
    return tint ? <IcAddPeople fill={tint} /> : <IcAddPeople />
  case 'icAddToCal':
    return tint ? <IcAddToCal fill={tint} /> : <IcAddToCal />
  case 'icArrowDown':
    return tint ? <IcArrowDown fill={tint} /> : <IcArrowDown />
  case 'icArrowRight':
    return tint ? <IcArrowRight fill={tint} /> : <IcArrowRight />
  case 'icArrowRightOpaque':
    return tint ? <IcArrowRightOpaque fill={tint} /> : <IcArrowRightOpaque />
  case 'icAvailableForChat':
    return tint ? <IcAvailableForChat fill={tint} /> : <IcAvailableForChat />
  case 'icAvailableForChatOnline':
    return tint ? <IcAvailableForChatOnline fill={tint} /> : <IcAvailableForChatOnline />
  case 'icBadConnection':
    return tint ? <IcBadConnection fill={tint} /> : <IcBadConnection />
  case 'icBucket24':
    return tint ? <IcBucket24 fill={tint} /> : <IcBucket24 />
  case 'icCalendar':
    return tint ? <IcCalendar fill={tint} /> : <IcCalendar />
  case 'icCalendarBig':
    return tint ? <IcCalendarBig fill={tint} /> : <IcCalendarBig />
  case 'icCamOff':
    return tint ? <IcCamOff fill={tint} /> : <IcCamOff />
  case 'icCamOn':
    return tint ? <IcCamOn fill={tint} /> : <IcCamOn />
  case 'icChangeAvatar':
    return tint ? <IcChangeAvatar fill={tint} /> : <IcChangeAvatar />
  case 'icCheck':
    return tint ? <IcCheck fill={tint} /> : <IcCheck />
  case 'icCheck24':
    return tint ? <IcCheck24 fill={tint} /> : <IcCheck24 />
  case 'icCheck24Primary':
    return tint ? <IcCheck24Primary fill={tint} /> : <IcCheck24Primary />
  case 'icCheckTwo':
    return tint ? <IcCheckTwo fill={tint} /> : <IcCheckTwo />
  case 'icCirclePlus':
    return tint ? <IcCirclePlus fill={tint} /> : <IcCirclePlus />
  case 'icClear':
    return tint ? <IcClear fill={tint} /> : <IcClear />
  case 'icClose':
    return tint ? <IcClose fill={tint} /> : <IcClose />
  case 'icClosedLock':
    return tint ? <IcClosedLock fill={tint} /> : <IcClosedLock />
  case 'icClosedLock16':
    return tint ? <IcClosedLock16 fill={tint} /> : <IcClosedLock16 />
  case 'icCommunity24':
    return tint ? <IcCommunity24 fill={tint} /> : <IcCommunity24 />
  case 'icConnectLogo':
    return tint ? <IcConnectLogo fill={tint} /> : <IcConnectLogo />
  case 'icConnectStatusConnected':
    return tint ? <IcConnectStatusConnected fill={tint} /> : <IcConnectStatusConnected />
  case 'icConnectStatusIRequested':
    return tint ? <IcConnectStatusIRequested fill={tint} /> : <IcConnectStatusIRequested />
  case 'icConnectStatusNotConnected':
    return tint ? <IcConnectStatusNotConnected fill={tint} /> : <IcConnectStatusNotConnected />
  case 'icConnectStatusTheyRequested':
    return tint ? <IcConnectStatusTheyRequested fill={tint} /> : <IcConnectStatusTheyRequested />
  case 'icCopy':
    return tint ? <IcCopy fill={tint} /> : <IcCopy />
  case 'icCopyButton':
    return tint ? <IcCopyButton fill={tint} /> : <IcCopyButton />
  case 'icCopyToBuffer':
    return tint ? <IcCopyToBuffer fill={tint} /> : <IcCopyToBuffer />
  case 'icCreateClub':
    return tint ? <IcCreateClub fill={tint} /> : <IcCreateClub />
  case 'icCrown':
    return tint ? <IcCrown fill={tint} /> : <IcCrown />
  case 'icCrown24':
    return tint ? <IcCrown24 fill={tint} /> : <IcCrown24 />
  case 'icCrownFilled24':
    return tint ? <IcCrownFilled24 fill={tint} /> : <IcCrownFilled24 />
  case 'icDiscord24':
    return tint ? <IcDiscord24 fill={tint} /> : <IcDiscord24 />
  case 'icDiscord34':
    return tint ? <IcDiscord34 fill={tint} /> : <IcDiscord34 />
  case 'icEmoji':
    return tint ? <IcEmoji fill={tint} /> : <IcEmoji />
  case 'icEmptyClubs':
    return tint ? <IcEmptyClubs fill={tint} /> : <IcEmptyClubs />
  case 'icEmptyExplore':
    return tint ? <IcEmptyExplore fill={tint} /> : <IcEmptyExplore />
  case 'icEmptyMainFeedCalendar':
    return tint ? <IcEmptyMainFeedCalendar fill={tint} /> : <IcEmptyMainFeedCalendar />
  case 'icEvent':
    return tint ? <IcEvent fill={tint} /> : <IcEvent />
  case 'icEventInfo':
    return tint ? <IcEventInfo fill={tint} /> : <IcEventInfo />
  case 'icEventSpeaker':
    return tint ? <IcEventSpeaker fill={tint} /> : <IcEventSpeaker />
  case 'icEventTotalUsers':
    return tint ? <IcEventTotalUsers fill={tint} /> : <IcEventTotalUsers />
  case 'icExplore':
    return tint ? <IcExplore fill={tint} /> : <IcExplore />
  case 'icExternalLink':
    return tint ? <IcExternalLink fill={tint} /> : <IcExternalLink />
  case 'icFestival':
    return tint ? <IcFestival fill={tint} /> : <IcFestival />
  case 'icFlatLogo':
    return tint ? <IcFlatLogo fill={tint} /> : <IcFlatLogo />
  case 'icFullArrowRight':
    return tint ? <IcFullArrowRight fill={tint} /> : <IcFullArrowRight />
  case 'icHasInvites':
    return tint ? <IcHasInvites fill={tint} /> : <IcHasInvites />
  case 'icInfo':
    return tint ? <IcInfo fill={tint} /> : <IcInfo />
  case 'icInstagram':
    return tint ? <IcInstagram fill={tint} /> : <IcInstagram />
  case 'icInvite':
    return tint ? <IcInvite fill={tint} /> : <IcInvite />
  case 'icInvited':
    return tint ? <IcInvited fill={tint} /> : <IcInvited />
  case 'icLeave':
    return tint ? <IcLeave fill={tint} /> : <IcLeave />
  case 'icLink':
    return tint ? <IcLink fill={tint} /> : <IcLink />
  case 'icLinkedin':
    return tint ? <IcLinkedin fill={tint} /> : <IcLinkedin />
  case 'icLock':
    return tint ? <IcLock fill={tint} /> : <IcLock />
  case 'icLock16':
    return tint ? <IcLock16 fill={tint} /> : <IcLock16 />
  case 'icLockCompact':
    return tint ? <IcLockCompact fill={tint} /> : <IcLockCompact />
  case 'icMailWithStars':
    return tint ? <IcMailWithStars fill={tint} /> : <IcMailWithStars />
  case 'icMegafonOff':
    return tint ? <IcMegafonOff fill={tint} /> : <IcMegafonOff />
  case 'icMegafonOn':
    return tint ? <IcMegafonOn fill={tint} /> : <IcMegafonOn />
  case 'icMicOff':
    return tint ? <IcMicOff fill={tint} /> : <IcMicOff />
  case 'icMicOn':
    return tint ? <IcMicOn fill={tint} /> : <IcMicOn />
  case 'icModerator':
    return tint ? <IcModerator fill={tint} /> : <IcModerator />
  case 'icNavigationBack':
    return tint ? <IcNavigationBack fill={tint} /> : <IcNavigationBack />
  case 'icNavigationClose':
    return tint ? <IcNavigationClose fill={tint} /> : <IcNavigationClose />
  case 'icNavigationClose16':
    return tint ? <IcNavigationClose16 fill={tint} /> : <IcNavigationClose16 />
  case 'icNetworkingSelectedRoom':
    return tint ? <IcNetworkingSelectedRoom fill={tint} /> : <IcNetworkingSelectedRoom />
  case 'icNetworkingUnselectedRoom':
    return tint ? <IcNetworkingUnselectedRoom fill={tint} /> : <IcNetworkingUnselectedRoom />
  case 'icNewbieTag':
    return tint ? <IcNewbieTag fill={tint} /> : <IcNewbieTag />
  case 'icOpenedHands':
    return tint ? <IcOpenedHands fill={tint} /> : <IcOpenedHands />
  case 'icOpenedLock':
    return tint ? <IcOpenedLock fill={tint} /> : <IcOpenedLock />
  case 'icPencil':
    return tint ? <IcPencil fill={tint} /> : <IcPencil />
  case 'icPersons':
    return tint ? <IcPersons fill={tint} /> : <IcPersons />
  case 'icPersons40':
    return tint ? <IcPersons40 fill={tint} /> : <IcPersons40 />
  case 'icPlus':
    return tint ? <IcPlus fill={tint} /> : <IcPlus />
  case 'icPressTag':
    return tint ? <IcPressTag fill={tint} /> : <IcPressTag />
  case 'icPublicSelectedRoom':
    return tint ? <IcPublicSelectedRoom fill={tint} /> : <IcPublicSelectedRoom />
  case 'icPublicUnselectedRoom':
    return tint ? <IcPublicUnselectedRoom fill={tint} /> : <IcPublicUnselectedRoom />
  case 'icRaiseHand':
    return tint ? <IcRaiseHand fill={tint} /> : <IcRaiseHand />
  case 'icRaisedHand':
    return tint ? <IcRaisedHand fill={tint} /> : <IcRaisedHand />
  case 'icRaisedHandSmall':
    return tint ? <IcRaisedHandSmall fill={tint} /> : <IcRaisedHandSmall />
  case 'icRing':
    return tint ? <IcRing fill={tint} /> : <IcRing />
  case 'icRingSubscribed':
    return tint ? <IcRingSubscribed fill={tint} /> : <IcRingSubscribed />
  case 'icRoomLoading':
    return tint ? <IcRoomLoading fill={tint} /> : <IcRoomLoading />
  case 'icSearch':
    return tint ? <IcSearch fill={tint} /> : <IcSearch />
  case 'icSearch24':
    return tint ? <IcSearch24 fill={tint} /> : <IcSearch24 />
  case 'icSearchWithStars':
    return tint ? <IcSearchWithStars fill={tint} /> : <IcSearchWithStars />
  case 'icSelectPhoto':
    return tint ? <IcSelectPhoto fill={tint} /> : <IcSelectPhoto />
  case 'icSelfie':
    return tint ? <IcSelfie fill={tint} /> : <IcSelfie />
  case 'icSettings':
    return tint ? <IcSettings fill={tint} /> : <IcSettings />
  case 'icShare':
    return tint ? <IcShare fill={tint} /> : <IcShare />
  case 'icSpeaker':
    return tint ? <IcSpeaker fill={tint} /> : <IcSpeaker />
  case 'icSpeakerTag':
    return tint ? <IcSpeakerTag fill={tint} /> : <IcSpeakerTag />
  case 'icStar16':
    return tint ? <IcStar16 fill={tint} /> : <IcStar16 />
  case 'icTeamTag':
    return tint ? <IcTeamTag fill={tint} /> : <IcTeamTag />
  case 'icToggleCamera':
    return tint ? <IcToggleCamera fill={tint} /> : <IcToggleCamera />
  case 'icTwitter':
    return tint ? <IcTwitter fill={tint} /> : <IcTwitter />
  case 'icVerticalMenu':
    return tint ? <IcVerticalMenu fill={tint} /> : <IcVerticalMenu />
  case 'icWaveHand':
    return tint ? <IcWaveHand fill={tint} /> : <IcWaveHand />
  case 'warningSign':
    return tint ? <WarningSign fill={tint} /> : <WarningSign />
  }
}

const AppIcon: React.FC<AppIconProps> = ({
  type,
  testID,
  style,
  isVisible,
  tint,
}) => {
  if (isVisible === false) return null
  return (
    <View accessibilityLabel={testID} pointerEvents={'none'} style={style}>
      {getIcon(type, tint)}
    </View>
  )
}
export default memo(AppIcon, deepEqual)
