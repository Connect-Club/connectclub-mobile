/* eslint-disable */
import React, {memo} from 'react'
import {StyleProp, View, ViewStyle} from 'react-native'
import deepEqual from 'deep-equal'
import {ReactComponent as BannerFestival} from './icons/bannerFestival.svg'
import {ReactComponent as FestivalCheckIn} from './icons/festivalCheckIn.svg'
import {ReactComponent as FestivalName} from './icons/festivalName.svg'
import {ReactComponent as FestivalSmallCheckIn} from './icons/festivalSmallCheckIn.svg'
import {ReactComponent as IcAdd} from './icons/icAdd.svg'
import {ReactComponent as IcAdd16} from './icons/icAdd16.svg'
import {ReactComponent as IcAddEvent} from './icons/icAddEvent.svg'
import {ReactComponent as IcAddPeople} from './icons/icAddPeople.svg'
import {ReactComponent as IcAddToCal} from './icons/icAddToCal.svg'
import {ReactComponent as IcArrowDown} from './icons/icArrowDown.svg'
import {ReactComponent as IcArrowRight} from './icons/icArrowRight.svg'
import {ReactComponent as IcArrowRightOpaque} from './icons/icArrowRightOpaque.svg'
import {ReactComponent as IcAvailableForChat} from './icons/icAvailableForChat.svg'
import {ReactComponent as IcAvailableForChatOnline} from './icons/icAvailableForChatOnline.svg'
import {ReactComponent as IcBadConnection} from './icons/icBadConnection.svg'
import {ReactComponent as IcBucket24} from './icons/icBucket24.svg'
import {ReactComponent as IcCalendar} from './icons/icCalendar.svg'
import {ReactComponent as IcCalendarBig} from './icons/icCalendarBig.svg'
import {ReactComponent as IcCamOff} from './icons/icCamOff.svg'
import {ReactComponent as IcCamOn} from './icons/icCamOn.svg'
import {ReactComponent as IcChangeAvatar} from './icons/icChangeAvatar.svg'
import {ReactComponent as IcCheck} from './icons/icCheck.svg'
import {ReactComponent as IcCheck24} from './icons/icCheck24.svg'
import {ReactComponent as IcCheck24Primary} from './icons/icCheck24Primary.svg'
import {ReactComponent as IcCheckTwo} from './icons/icCheckTwo.svg'
import {ReactComponent as IcCirclePlus} from './icons/icCirclePlus.svg'
import {ReactComponent as IcClear} from './icons/icClear.svg'
import {ReactComponent as IcClose} from './icons/icClose.svg'
import {ReactComponent as IcClosedLock} from './icons/icClosedLock.svg'
import {ReactComponent as IcClosedLock16} from './icons/icClosedLock16.svg'
import {ReactComponent as IcCommunity24} from './icons/icCommunity24.svg'
import {ReactComponent as IcConnectLogo} from './icons/icConnectLogo.svg'
import {ReactComponent as IcConnectStatusConnected} from './icons/icConnectStatusConnected.svg'
import {ReactComponent as IcConnectStatusIRequested} from './icons/icConnectStatusIRequested.svg'
import {ReactComponent as IcConnectStatusNotConnected} from './icons/icConnectStatusNotConnected.svg'
import {ReactComponent as IcConnectStatusTheyRequested} from './icons/icConnectStatusTheyRequested.svg'
import {ReactComponent as IcCopy} from './icons/icCopy.svg'
import {ReactComponent as IcCopyButton} from './icons/icCopyButton.svg'
import {ReactComponent as IcCopyToBuffer} from './icons/icCopyToBuffer.svg'
import {ReactComponent as IcCreateClub} from './icons/icCreateClub.svg'
import {ReactComponent as IcCrown} from './icons/icCrown.svg'
import {ReactComponent as IcCrown24} from './icons/icCrown24.svg'
import {ReactComponent as IcCrownFilled24} from './icons/icCrownFilled24.svg'
import {ReactComponent as IcDiscord24} from './icons/icDiscord24.svg'
import {ReactComponent as IcDiscord34} from './icons/icDiscord34.svg'
import {ReactComponent as IcEmoji} from './icons/icEmoji.svg'
import {ReactComponent as IcEmptyClubs} from './icons/icEmptyClubs.svg'
import {ReactComponent as IcEmptyExplore} from './icons/icEmptyExplore.svg'
import {ReactComponent as IcEmptyMainFeedCalendar} from './icons/icEmptyMainFeedCalendar.svg'
import {ReactComponent as IcEvent} from './icons/icEvent.svg'
import {ReactComponent as IcEventInfo} from './icons/icEventInfo.svg'
import {ReactComponent as IcEventSpeaker} from './icons/icEventSpeaker.svg'
import {ReactComponent as IcEventTotalUsers} from './icons/icEventTotalUsers.svg'
import {ReactComponent as IcExplore} from './icons/icExplore.svg'
import {ReactComponent as IcExternalLink} from './icons/icExternalLink.svg'
import {ReactComponent as IcFestival} from './icons/icFestival.svg'
import {ReactComponent as IcFlatLogo} from './icons/icFlatLogo.svg'
import {ReactComponent as IcFullArrowRight} from './icons/icFullArrowRight.svg'
import {ReactComponent as IcHasInvites} from './icons/icHasInvites.svg'
import {ReactComponent as IcInfo} from './icons/icInfo.svg'
import {ReactComponent as IcInstagram} from './icons/icInstagram.svg'
import {ReactComponent as IcInvite} from './icons/icInvite.svg'
import {ReactComponent as IcInvited} from './icons/icInvited.svg'
import {ReactComponent as IcLeave} from './icons/icLeave.svg'
import {ReactComponent as IcLink} from './icons/icLink.svg'
import {ReactComponent as IcLinkedin} from './icons/icLinkedin.svg'
import {ReactComponent as IcLock} from './icons/icLock.svg'
import {ReactComponent as IcLock16} from './icons/icLock16.svg'
import {ReactComponent as IcLockCompact} from './icons/icLockCompact.svg'
import {ReactComponent as IcMailWithStars} from './icons/icMailWithStars.svg'
import {ReactComponent as IcMegafonOff} from './icons/icMegafonOff.svg'
import {ReactComponent as IcMegafonOn} from './icons/icMegafonOn.svg'
import {ReactComponent as IcMicOff} from './icons/icMicOff.svg'
import {ReactComponent as IcMicOn} from './icons/icMicOn.svg'
import {ReactComponent as IcModerator} from './icons/icModerator.svg'
import {ReactComponent as IcNavigationBack} from './icons/icNavigationBack.svg'
import {ReactComponent as IcNavigationClose} from './icons/icNavigationClose.svg'
import {ReactComponent as IcNavigationClose16} from './icons/icNavigationClose16.svg'
import {ReactComponent as IcNetworkingSelectedRoom} from './icons/icNetworkingSelectedRoom.svg'
import {ReactComponent as IcNetworkingUnselectedRoom} from './icons/icNetworkingUnselectedRoom.svg'
import {ReactComponent as IcNewbieTag} from './icons/icNewbieTag.svg'
import {ReactComponent as IcOpenedHands} from './icons/icOpenedHands.svg'
import {ReactComponent as IcOpenedLock} from './icons/icOpenedLock.svg'
import {ReactComponent as IcPencil} from './icons/icPencil.svg'
import {ReactComponent as IcPersons} from './icons/icPersons.svg'
import {ReactComponent as IcPersons40} from './icons/icPersons40.svg'
import {ReactComponent as IcPlus} from './icons/icPlus.svg'
import {ReactComponent as IcPressTag} from './icons/icPressTag.svg'
import {ReactComponent as IcPublicSelectedRoom} from './icons/icPublicSelectedRoom.svg'
import {ReactComponent as IcPublicUnselectedRoom} from './icons/icPublicUnselectedRoom.svg'
import {ReactComponent as IcRaiseHand} from './icons/icRaiseHand.svg'
import {ReactComponent as IcRaisedHand} from './icons/icRaisedHand.svg'
import {ReactComponent as IcRaisedHandSmall} from './icons/icRaisedHandSmall.svg'
import {ReactComponent as IcRing} from './icons/icRing.svg'
import {ReactComponent as IcRingSubscribed} from './icons/icRingSubscribed.svg'
import {ReactComponent as IcRoomLoading} from './icons/icRoomLoading.svg'
import {ReactComponent as IcSearch} from './icons/icSearch.svg'
import {ReactComponent as IcSearch24} from './icons/icSearch24.svg'
import {ReactComponent as IcSearchWithStars} from './icons/icSearchWithStars.svg'
import {ReactComponent as IcSelectPhoto} from './icons/icSelectPhoto.svg'
import {ReactComponent as IcSelfie} from './icons/icSelfie.svg'
import {ReactComponent as IcSettings} from './icons/icSettings.svg'
import {ReactComponent as IcShare} from './icons/icShare.svg'
import {ReactComponent as IcSpeaker} from './icons/icSpeaker.svg'
import {ReactComponent as IcSpeakerTag} from './icons/icSpeakerTag.svg'
import {ReactComponent as IcStar16} from './icons/icStar16.svg'
import {ReactComponent as IcTeamTag} from './icons/icTeamTag.svg'
import {ReactComponent as IcToggleCamera} from './icons/icToggleCamera.svg'
import {ReactComponent as IcTwitter} from './icons/icTwitter.svg'
import {ReactComponent as IcVerticalMenu} from './icons/icVerticalMenu.svg'
import {ReactComponent as IcWaveHand} from './icons/icWaveHand.svg'
import {ReactComponent as WarningSign} from './icons/warningSign.svg'

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
