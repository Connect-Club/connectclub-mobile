//
//  RNCViewManagers.m
//  ConnectClub
//
//  Created by Тарас Минин on 24/02/2021.
//  Copyright © 2021 Sergei Golishnikov. All rights reserved.
//

#import <React/RCTViewManager.h>
#import "connectreactive-Swift.h"

// MARK: TargetPathViewManager
@interface TargetPathViewManager : RCTViewManager
@end

@implementation TargetPathViewManager

RCT_EXPORT_MODULE(TargetPathView)

- (UIView *)view
{
  return [[TargetPathView alloc] init];
}

@end


// MARK: SpeakerViewManager
@interface SpeakerViewManager : RCTViewManager
@end

@implementation SpeakerViewManager

RCT_EXPORT_MODULE(SpeakerView)
RCT_EXPORT_VIEW_PROPERTY(userId, NSString *)
RCT_EXPORT_VIEW_PROPERTY(onClick, RCTBubblingEventBlock)

- (UIView *)view
{
  return [[SpeakerView alloc] init];
}

@end

// MARK: ClickableViewManager
@interface ClickableViewManager : RCTViewManager
@end

@implementation ClickableViewManager

RCT_EXPORT_MODULE(ClickableView)
RCT_EXPORT_VIEW_PROPERTY(onClick, RCTBubblingEventBlock)

- (UIView *)view
{
  return [[ClickableView alloc] init];
}

@end

// MARK: RadarViewManager
@interface RadarViewManager : RCTViewManager
@end

@implementation RadarViewManager

RCT_EXPORT_MODULE(RadarView)

- (UIView *)view
{
  return [[RadarView alloc] init];
}

@end


// MARK: SpeakerVideoViewContainerManager
@interface SpeakerVideoViewContainerManager : RCTViewManager
@end

@implementation SpeakerVideoViewContainerManager

RCT_EXPORT_MODULE(SpeakerVideoViewContainer)

- (UIView *)view
{
  return [[SpeakerVideoViewContainer alloc] init];
}

@end


// MARK: SpeakerVideoViewContainerManager
@interface ShareDesktopContainerViewManager : RCTViewManager
@end

@implementation ShareDesktopContainerViewManager

RCT_EXPORT_MODULE(ShareDesktopContainerView)
RCT_EXPORT_VIEW_PROPERTY(allowToShare, BOOL)
RCT_EXPORT_VIEW_PROPERTY(onShareClick, RCTBubblingEventBlock)

- (UIView *)view
{
  return [[ShareDesktopContainerView alloc] init];
}

@end


// MARK: AvatarViewManager
@interface AvatarViewManager : RCTViewManager
@end

@implementation AvatarViewManager

RCT_EXPORT_MODULE(AvatarView)
RCT_EXPORT_VIEW_PROPERTY(avatar, NSString *)
RCT_EXPORT_VIEW_PROPERTY(initials, NSString *)
RCT_EXPORT_VIEW_PROPERTY(fontSize, NSNumber *)

- (UIView *)view
{
  return [[AvatarView alloc] init];
}

@end


// MARK: UserTogglesView
@interface UserTogglesViewManager : RCTViewManager
@end

@implementation UserTogglesViewManager

RCT_EXPORT_MODULE(UserTogglesView)

- (UIView *)view
{
  return [[UserTogglesView alloc] init];
}

@end

// MARK: UserSpeakerMicrophoneIconsView
@interface UserSpeakerMicrophoneIconsViewManager : RCTViewManager
@end

@implementation UserSpeakerMicrophoneIconsViewManager

RCT_EXPORT_MODULE(UserSpeakerMicrophoneIconsView)

- (UIView *)view
{
  return [[UserSpeakerMicrophoneIconsView alloc] init];
}

@end

// MARK: ToggleVideoAudioButtons
@interface ToggleVideoAudioButtonsManager : RCTViewManager
@end

@implementation ToggleVideoAudioButtonsManager

RCT_EXPORT_MODULE(ToggleVideoAudioButtons)
RCT_EXPORT_VIEW_PROPERTY(micOnIcon, NSString *)
RCT_EXPORT_VIEW_PROPERTY(micOffIcon, NSString *)
RCT_EXPORT_VIEW_PROPERTY(cameraOnIcon, NSString *)
RCT_EXPORT_VIEW_PROPERTY(cameraOffIcon, NSString *)

- (UIView *)view
{
  return [[ToggleVideoAudioButtons alloc] init];
}

RCT_EXPORT_METHOD(toggleAudio:(nonnull NSNumber *)viewTag)
{
  
  [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
    UIView *view = viewRegistry[viewTag];
    
    if ([view isKindOfClass:[ToggleVideoAudioButtons class]]) {
    
      [(ToggleVideoAudioButtons *)view toggleAudio];
    }
  }];
}

RCT_EXPORT_METHOD(toggleVideo:(nonnull NSNumber *)viewTag)
{
  
  [self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
    UIView *view = viewRegistry[viewTag];
    
    if ([view isKindOfClass:[ToggleVideoAudioButtons class]]) {
    
      [(ToggleVideoAudioButtons *)view toggleVideo];
    }
  }];
}

@end

// MARK: RNCInvitesListView
@interface RNCRoomLayout : RCTViewManager
@end

@implementation RNCRoomLayout

RCT_EXPORT_MODULE(RNCRoomLayout)
RCT_EXPORT_VIEW_PROPERTY(options, NSDictionary *)

- (UIView *)view
{
  return [[ZoomImageView alloc] init];
}

@end

// MARK: RNCFloatingReactions
@interface RNCFloatingReactions : RCTViewManager
@end

@implementation RNCFloatingReactions

RCT_EXPORT_MODULE(RNCFloatingReactions)

- (UIView *)view
{
  return [[FloatingReactionsView alloc] init];
}

@end

// MARK: RNCRoomListeners
@interface RNCRoomListeners : RCTViewManager
@end

@implementation RNCRoomListeners

RCT_EXPORT_MODULE(RNCRoomListeners)
RCT_EXPORT_VIEW_PROPERTY(onUserTap, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(minSheetHeight, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(middleSheetHeight, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(emojiIcons, NSDictionary*)
RCT_EXPORT_VIEW_PROPERTY(specialGuestBadgeIcon, NSString *)
RCT_EXPORT_VIEW_PROPERTY(badgedGuestBadgeIcon, NSString *)
RCT_EXPORT_VIEW_PROPERTY(specialModeratorBadgeIcon, NSString *)
RCT_EXPORT_VIEW_PROPERTY(newbieBadgeIcon, NSString *)

- (UIView *)view
{
  return [[ListenersBottomSheetView alloc] init];
}

@end

// MARK: RNCRoomListeners
@interface RNCTextureVideoView : RCTViewManager
@end

@implementation RNCTextureVideoView

RCT_EXPORT_MODULE(RNCTextureVideoView)
RCT_EXPORT_VIEW_PROPERTY(trackId, NSString *)
RCT_EXPORT_VIEW_PROPERTY(isMirror, BOOL)
RCT_EXPORT_VIEW_PROPERTY(onFirstFrameRendered, RCTBubblingEventBlock)

- (UIView *)view
{ return [[SubscriberView alloc] init]; }
@end

// MARK: RNCRoomListeners
@interface RasterIconManager : RCTViewManager
@end

@implementation RasterIconManager

RCT_EXPORT_MODULE(RasterIcon)
RCT_EXPORT_VIEW_PROPERTY(uri, NSString *)
RCT_EXPORT_VIEW_PROPERTY(scaleType, NSString *)
RCT_EXPORT_VIEW_PROPERTY(paddingHorizontal, NSNumber *)
RCT_EXPORT_VIEW_PROPERTY(circle, BOOL)

- (UIView *)view
{
  return [[RasterIcon alloc] init];
}

@end

// MARK: RNCRoomBackground
@interface RNCRoomBackground : RCTViewManager
@end

@implementation RNCRoomBackground

RCT_EXPORT_MODULE(RNCRoomBackground)
RCT_EXPORT_VIEW_PROPERTY(imageSource, NSString *)
RCT_EXPORT_VIEW_PROPERTY(bgSize, NSString *)
RCT_EXPORT_VIEW_PROPERTY(onBackgroundLoaded, RCTBubblingEventBlock)

- (UIView *)view
{
  return [[RoomBackgroundView alloc] init];
}

@end

// MARK: UserReactionsViewManager
@interface UserReactionsViewManager : RCTViewManager
@end
@implementation UserReactionsViewManager

RCT_EXPORT_MODULE(UserReactionsView)

- (UIView *)view
{ return [[UserReactionsView alloc] init]; }
@end

// MARK: MenuTextInput
@interface MenuTextInputManager : RCTViewManager
@end
@implementation MenuTextInputManager

RCT_EXPORT_MODULE(MenuTextInput)
RCT_EXPORT_VIEW_PROPERTY(value, NSString *)
RCT_EXPORT_VIEW_PROPERTY(placeholder, NSString *)
RCT_EXPORT_VIEW_PROPERTY(maxLength, NSNumber *)
RCT_EXPORT_VIEW_PROPERTY(maxHeight, NSNumber *)
RCT_EXPORT_VIEW_PROPERTY(indentRight, NSNumber *)
RCT_EXPORT_VIEW_PROPERTY(onLinkText, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onChangeText, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(shouldDismissKeyboard, BOOL)

- (UIView *)view
{ return [[MenuTextInput alloc] init]; }
@end
