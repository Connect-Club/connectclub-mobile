// Objective-C API for talking to gitlab.com/connect.club/app-common.git Go package.
//   gobind -lang=objc gitlab.com/connect.club/app-common.git
//
// File is generated by gobind. Do not edit.

#ifndef __Common_H__
#define __Common_H__

@import Foundation;
#include "ref.h"
#include "Universe.objc.h"


@class CommonBaseRoom;
@class CommonDeviceCurrentUser;
@class CommonDeviceRoomUser;
@class CommonDeviceState;
@class CommonLiveRoom;
@class CommonPoint;
@class CommonRecordedRoom;
@class CommonUserPoint;
@class CommonViewport;
@protocol CommonDatatrackDelegate;
@class CommonDatatrackDelegate;
@protocol CommonJvBusterDelegate;
@class CommonJvBusterDelegate;
@protocol CommonJvbusterCallbacks;
@class CommonJvbusterCallbacks;
@protocol CommonJvbusterPeerConnectionCallbacks;
@class CommonJvbusterPeerConnectionCallbacks;
@protocol CommonMediaDelegate;
@class CommonMediaDelegate;
@protocol CommonPublicHttpClient;
@class CommonPublicHttpClient;
@protocol CommonPublicLogger;
@class CommonPublicLogger;
@protocol CommonPublicStorage;
@class CommonPublicStorage;

@protocol CommonDatatrackDelegate <NSObject>
- (void)onChangeRoomMode:(NSString* _Nullable)mode isFirstConnection:(BOOL)isFirstConnection;
- (void)onConnectionState:(NSData* _Nullable)json;
- (void)onMessage:(NSString* _Nullable)json;
- (void)onNativeState:(NSData* _Nullable)json;
- (void)onParticipantsVisibilityChanged:(NSString* _Nullable)json;
- (void)onPath:(NSString* _Nullable)userId x:(double)x y:(double)y duration:(double)duration;
- (void)onPopupUsers:(NSString* _Nullable)json;
- (void)onRadarVolume:(NSData* _Nullable)json;
- (void)onReaction:(NSData* _Nullable)json;
- (void)onStateChanged:(long)newState;
@end

@protocol CommonJvBusterDelegate <NSObject>
- (void)destroyPeerConnections;
- (void)init_:(id<CommonJvbusterCallbacks> _Nullable)callbacks;
- (NSString* _Nonnull)initializeRTCPeerConnection:(NSString* _Nullable)userId id_:(NSString* _Nullable)id_ isMain:(BOOL)isMain isSpeaker:(BOOL)isSpeaker sdpOffer:(NSString* _Nullable)sdpOffer callbacks:(id<CommonJvbusterPeerConnectionCallbacks> _Nullable)callbacks;
- (void)onError:(NSString* _Nullable)error;
- (void)processMetaAdd:(NSString* _Nullable)json;
- (void)processMetaRemove:(NSString* _Nullable)json;
- (void)sendMessageToDataChannel:(NSString* _Nullable)id_ message:(NSString* _Nullable)message;
- (void)setLocalRTCPeerConnectionDescription:(NSString* _Nullable)id_ description:(NSString* _Nullable)description;
@end

@protocol CommonJvbusterCallbacks <NSObject>
- (void)updateAudioLevel:(long)level;
- (void)updateVideoAudioPhoneState:(BOOL)videoEnabled audioEnabled:(BOOL)audioEnabled isOnPhoneCall:(BOOL)isOnPhoneCall;
@end

@protocol CommonJvbusterPeerConnectionCallbacks <NSObject>
- (void)processDataChannelMessage:(NSString* _Nullable)message;
- (void)processState:(long)state;
@end

@protocol CommonMediaDelegate <NSObject>
- (void)onPlay:(NSString* _Nullable)url userId:(NSString* _Nullable)userId;
- (void)onPrepare:(NSString* _Nullable)url userId:(NSString* _Nullable)userId;
@end

@protocol CommonPublicHttpClient <NSObject>
- (NSString* _Nonnull)authorize:(NSString* _Nullable)clientQuery;
- (NSString* _Nonnull)getRequest:(NSString* _Nullable)endpoint method:(NSString* _Nullable)method useAuthorizeHeader:(BOOL)useAuthorizeHeader generateJwt:(BOOL)generateJwt query:(NSString* _Nullable)query body:(NSString* _Nullable)body filePartName:(NSString* _Nullable)filePartName fileName:(NSString* _Nullable)fileName filePath:(NSString* _Nullable)filePath;
- (NSString* _Nonnull)sendLogFileWithBodyText:(NSString* _Nullable)p0;
- (NSString* _Nonnull)sendLogFileWithPath:(NSString* _Nullable)path bodyText:(NSString* _Nullable)bodyText;
@end

@protocol CommonPublicLogger <NSObject>
- (void)debug:(NSString* _Nullable)message;
- (void)error:(NSString* _Nullable)message;
- (void)info:(NSString* _Nullable)message;
- (void)trace:(NSString* _Nullable)message;
- (void)warn:(NSString* _Nullable)message;
@end

@protocol CommonPublicStorage <NSObject>
- (void)delete:(NSString* _Nullable)key;
- (NSString* _Nonnull)getString:(NSString* _Nullable)key;
- (void)setString:(NSString* _Nullable)key value:(NSString* _Nullable)value;
@end

@interface CommonBaseRoom : NSObject <goSeqRefInterface> {
}
@property(strong, readonly) _Nonnull id _ref;

- (nonnull instancetype)initWithRef:(_Nonnull id)ref;
- (nonnull instancetype)init;
- (NSData* _Nullable)admins;
- (NSData* _Nullable)hands;
- (BOOL)isThereOtherAdmin;
@end

@interface CommonDeviceCurrentUser : NSObject <goSeqRefInterface> {
}
@property(strong, readonly) _Nonnull id _ref;

- (nonnull instancetype)initWithRef:(_Nonnull id)ref;
- (nonnull instancetype)init;
@property (nonatomic) BOOL isAdmin;
@property (nonatomic) BOOL isHandRaised;
@property (nonatomic) NSString* _Nonnull mode;
@property (nonatomic) BOOL isAbsoluteSpeaker;
@end

@interface CommonDeviceRoomUser : NSObject <goSeqRefInterface> {
}
@property(strong, readonly) _Nonnull id _ref;

- (nonnull instancetype)initWithRef:(_Nonnull id)ref;
- (nonnull instancetype)init;
@property (nonatomic) NSString* _Nonnull id_;
@property (nonatomic) double size;
@property (nonatomic) BOOL isLocal;
@property (nonatomic) BOOL hasRadar;
@property (nonatomic) NSString* _Nonnull name;
@property (nonatomic) NSString* _Nonnull surname;
@property (nonatomic) NSString* _Nonnull avatar;
@property (nonatomic) NSString* _Nonnull mode;
@property (nonatomic) BOOL isAdmin;
@property (nonatomic) BOOL isExpired;
@property (nonatomic) BOOL inRadar;
@property (nonatomic) BOOL video;
@property (nonatomic) BOOL audio;
@property (nonatomic) BOOL phoneCall;
@property (nonatomic) BOOL isSpecialGuest;
@property (nonatomic) BOOL isAbsoluteSpeaker;
// skipped field DeviceRoomUser.Badges with unsupported type: []string

@end

@interface CommonDeviceState : NSObject <goSeqRefInterface> {
}
@property(strong, readonly) _Nonnull id _ref;

- (nonnull instancetype)initWithRef:(_Nonnull id)ref;
- (nonnull instancetype)init;
@property (nonatomic) CommonDeviceCurrentUser* _Nullable current;
// skipped field DeviceState.Room with unsupported type: []*gitlab.com/connect.club/app-common.git.DeviceRoomUser

@property (nonatomic) long listenersCount;
@property (nonatomic) long raisedHandsCount;
@property (nonatomic) BOOL handsAllowed;
@property (nonatomic) BOOL absoluteSpeakerPresent;
@end

@interface CommonLiveRoom : NSObject <goSeqRefInterface, CommonJvbusterCallbacks> {
}
@property(strong, readonly) _Nonnull id _ref;

- (nonnull instancetype)initWithRef:(_Nonnull id)ref;
- (nonnull instancetype)init;
// skipped field LiveRoom.BaseRoom with unsupported type: gitlab.com/connect.club/app-common.git.BaseRoom

- (NSData* _Nullable)admins;
- (void)disconnect;
- (NSData* _Nullable)hands;
- (BOOL)isThereOtherAdmin;
- (void)processDataChannelMessage:(NSString* _Nullable)peerConnectionId message:(NSString* _Nullable)message;
- (void)processPeerConnectionState:(NSString* _Nullable)peerConnectionId state:(long)state;
- (void)removeReaction:(NSString* _Nullable)id_;
- (void)sendMessage:(NSString* _Nullable)message;
- (void)sendUserPath:(double)toX toY:(double)toY;
- (void)setJvbusterSubscriptionType:(NSString* _Nullable)subscriptionType;
- (void)setViewport:(double)x1 y1:(double)y1 x2:(double)x2 y2:(double)y2;
- (void)updateAudioLevel:(long)level;
- (void)updateVideoAudioPhoneState:(BOOL)videoEnabled audioEnabled:(BOOL)audioEnabled isOnPhoneCall:(BOOL)isOnPhoneCall;
@end

@interface CommonPoint : NSObject <goSeqRefInterface> {
}
@property(strong, readonly) _Nonnull id _ref;

- (nonnull instancetype)initWithRef:(_Nonnull id)ref;
- (nonnull instancetype)init;
@property (nonatomic) double x;
@property (nonatomic) double y;
@end

@interface CommonRecordedRoom : NSObject <goSeqRefInterface> {
}
@property(strong, readonly) _Nonnull id _ref;

- (nonnull instancetype)initWithRef:(_Nonnull id)ref;
- (nonnull instancetype)init;
// skipped field RecordedRoom.BaseRoom with unsupported type: gitlab.com/connect.club/app-common.git.BaseRoom

- (NSData* _Nullable)admins;
- (NSData* _Nullable)hands;
- (BOOL)isThereOtherAdmin;
- (void)stop;
@end

@interface CommonUserPoint : NSObject <goSeqRefInterface> {
}
@property(strong, readonly) _Nonnull id _ref;

- (nonnull instancetype)initWithRef:(_Nonnull id)ref;
- (nonnull instancetype)init;
@property (nonatomic) double x;
@property (nonatomic) double y;
@end

@interface CommonViewport : NSObject <goSeqRefInterface> {
}
@property(strong, readonly) _Nonnull id _ref;

- (nonnull instancetype)initWithRef:(_Nonnull id)ref;
- (nonnull instancetype)init;
// skipped field Viewport.P1 with unsupported type: gitlab.com/connect.club/app-common.git.Point

// skipped field Viewport.P2 with unsupported type: gitlab.com/connect.club/app-common.git.Point

// skipped method Viewport.IsInside with unsupported parameter or return types

// skipped method Viewport.IsInsideWithBorder with unsupported parameter or return types

- (BOOL)isZero;
@end

// skipped const LiveRoomStateClosed with unsupported type: gitlab.com/connect.club/app-common.git.LiveRoomState

// skipped const LiveRoomStateConnected with unsupported type: gitlab.com/connect.club/app-common.git.LiveRoomState

// skipped const LiveRoomStateConnecting with unsupported type: gitlab.com/connect.club/app-common.git.LiveRoomState

// skipped const PeerConnectionStateClosed with unsupported type: gitlab.com/connect.club/app-common.git.PeerConnectionState

// skipped const PeerConnectionStateConnected with unsupported type: gitlab.com/connect.club/app-common.git.PeerConnectionState

// skipped const PeerConnectionStateConnecting with unsupported type: gitlab.com/connect.club/app-common.git.PeerConnectionState

// skipped const PeerConnectionStateDisconnected with unsupported type: gitlab.com/connect.club/app-common.git.PeerConnectionState

// skipped const PeerConnectionStateFailed with unsupported type: gitlab.com/connect.club/app-common.git.PeerConnectionState

// skipped const PeerConnectionStateNew with unsupported type: gitlab.com/connect.club/app-common.git.PeerConnectionState

// skipped const RecordedRoomStatePaused with unsupported type: gitlab.com/connect.club/app-common.git.RecordedRoomState

// skipped const RecordedRoomStateStarted with unsupported type: gitlab.com/connect.club/app-common.git.RecordedRoomState

// skipped const RecordedRoomStateStopped with unsupported type: gitlab.com/connect.club/app-common.git.RecordedRoomState


FOUNDATION_EXPORT CommonLiveRoom* _Nullable CommonConnectToLiveRoom(id<CommonDatatrackDelegate> _Nullable datatrackDelegate, NSString* _Nullable wsUrl, NSString* _Nullable roomId, NSString* _Nullable accessToken, NSString* _Nullable roomPass, double roomWidthMul, double roomHeightMul, double adaptiveBubbleSize, double devicePixelRatio, id<CommonJvBusterDelegate> _Nullable jvbusterDelegate, NSString* _Nullable jvbusterAddress, NSString* _Nullable jvbusterToken, double fullResCircleDiameterInch, double viewportWidthInch, long videoBandwidth, long audioBandwidth, NSError* _Nullable* _Nullable error);

FOUNDATION_EXPORT id<CommonPublicHttpClient> _Nullable CommonHttpClient(NSString* _Nullable endpoint, NSString* _Nullable platform, NSString* _Nullable version, NSString* _Nullable versionName, NSString* _Nullable buildNumber);

FOUNDATION_EXPORT void CommonInitLoggerFile(NSString* _Nullable filesDir, NSString* _Nullable filename);

FOUNDATION_EXPORT void CommonInitialize(void);

FOUNDATION_EXPORT void CommonInsecureHttpTransport(void);

FOUNDATION_EXPORT id<CommonPublicLogger> _Nullable CommonNewLogger(NSString* _Nullable caller);

FOUNDATION_EXPORT void CommonPreserveLogFile(NSString* _Nullable filesDir, NSString* _Nullable filename);

/**
 * todo: add timeout
 */
FOUNDATION_EXPORT CommonRecordedRoom* _Nullable CommonReplayRecordedRoom(NSString* _Nullable roomHttpUrl, id<CommonDatatrackDelegate> _Nullable datatrackDelegate, double roomWidthMul, double roomHeightMul, double adaptiveBubbleSize, double devicePixelRatio, id<CommonMediaDelegate> _Nullable mediaDelegate, NSError* _Nullable* _Nullable error);

FOUNDATION_EXPORT void CommonSetStorage(id<CommonPublicStorage> _Nullable s);

@class CommonDatatrackDelegate;

@class CommonJvBusterDelegate;

@class CommonJvbusterCallbacks;

@class CommonJvbusterPeerConnectionCallbacks;

@class CommonMediaDelegate;

@class CommonPublicHttpClient;

@class CommonPublicLogger;

@class CommonPublicStorage;

@interface CommonDatatrackDelegate : NSObject <goSeqRefInterface, CommonDatatrackDelegate> {
}
@property(strong, readonly) _Nonnull id _ref;

- (nonnull instancetype)initWithRef:(_Nonnull id)ref;
- (void)onChangeRoomMode:(NSString* _Nullable)mode isFirstConnection:(BOOL)isFirstConnection;
- (void)onConnectionState:(NSData* _Nullable)json;
- (void)onMessage:(NSString* _Nullable)json;
- (void)onNativeState:(NSData* _Nullable)json;
- (void)onParticipantsVisibilityChanged:(NSString* _Nullable)json;
- (void)onPath:(NSString* _Nullable)userId x:(double)x y:(double)y duration:(double)duration;
- (void)onPopupUsers:(NSString* _Nullable)json;
- (void)onRadarVolume:(NSData* _Nullable)json;
- (void)onReaction:(NSData* _Nullable)json;
- (void)onStateChanged:(long)newState;
@end

@interface CommonJvBusterDelegate : NSObject <goSeqRefInterface, CommonJvBusterDelegate> {
}
@property(strong, readonly) _Nonnull id _ref;

- (nonnull instancetype)initWithRef:(_Nonnull id)ref;
- (void)destroyPeerConnections;
- (void)init_:(id<CommonJvbusterCallbacks> _Nullable)callbacks;
- (NSString* _Nonnull)initializeRTCPeerConnection:(NSString* _Nullable)userId id_:(NSString* _Nullable)id_ isMain:(BOOL)isMain isSpeaker:(BOOL)isSpeaker sdpOffer:(NSString* _Nullable)sdpOffer callbacks:(id<CommonJvbusterPeerConnectionCallbacks> _Nullable)callbacks;
- (void)onError:(NSString* _Nullable)error;
- (void)processMetaAdd:(NSString* _Nullable)json;
- (void)processMetaRemove:(NSString* _Nullable)json;
- (void)sendMessageToDataChannel:(NSString* _Nullable)id_ message:(NSString* _Nullable)message;
- (void)setLocalRTCPeerConnectionDescription:(NSString* _Nullable)id_ description:(NSString* _Nullable)description;
@end

@interface CommonJvbusterCallbacks : NSObject <goSeqRefInterface, CommonJvbusterCallbacks> {
}
@property(strong, readonly) _Nonnull id _ref;

- (nonnull instancetype)initWithRef:(_Nonnull id)ref;
- (void)updateAudioLevel:(long)level;
- (void)updateVideoAudioPhoneState:(BOOL)videoEnabled audioEnabled:(BOOL)audioEnabled isOnPhoneCall:(BOOL)isOnPhoneCall;
@end

@interface CommonJvbusterPeerConnectionCallbacks : NSObject <goSeqRefInterface, CommonJvbusterPeerConnectionCallbacks> {
}
@property(strong, readonly) _Nonnull id _ref;

- (nonnull instancetype)initWithRef:(_Nonnull id)ref;
- (void)processDataChannelMessage:(NSString* _Nullable)message;
- (void)processState:(long)state;
@end

@interface CommonMediaDelegate : NSObject <goSeqRefInterface, CommonMediaDelegate> {
}
@property(strong, readonly) _Nonnull id _ref;

- (nonnull instancetype)initWithRef:(_Nonnull id)ref;
- (void)onPlay:(NSString* _Nullable)url userId:(NSString* _Nullable)userId;
- (void)onPrepare:(NSString* _Nullable)url userId:(NSString* _Nullable)userId;
@end

@interface CommonPublicHttpClient : NSObject <goSeqRefInterface, CommonPublicHttpClient> {
}
@property(strong, readonly) _Nonnull id _ref;

- (nonnull instancetype)initWithRef:(_Nonnull id)ref;
- (NSString* _Nonnull)authorize:(NSString* _Nullable)clientQuery;
- (NSString* _Nonnull)getRequest:(NSString* _Nullable)endpoint method:(NSString* _Nullable)method useAuthorizeHeader:(BOOL)useAuthorizeHeader generateJwt:(BOOL)generateJwt query:(NSString* _Nullable)query body:(NSString* _Nullable)body filePartName:(NSString* _Nullable)filePartName fileName:(NSString* _Nullable)fileName filePath:(NSString* _Nullable)filePath;
- (NSString* _Nonnull)sendLogFileWithBodyText:(NSString* _Nullable)p0;
- (NSString* _Nonnull)sendLogFileWithPath:(NSString* _Nullable)path bodyText:(NSString* _Nullable)bodyText;
@end

@interface CommonPublicLogger : NSObject <goSeqRefInterface, CommonPublicLogger> {
}
@property(strong, readonly) _Nonnull id _ref;

- (nonnull instancetype)initWithRef:(_Nonnull id)ref;
- (void)debug:(NSString* _Nullable)message;
- (void)error:(NSString* _Nullable)message;
- (void)info:(NSString* _Nullable)message;
- (void)trace:(NSString* _Nullable)message;
- (void)warn:(NSString* _Nullable)message;
@end

@interface CommonPublicStorage : NSObject <goSeqRefInterface, CommonPublicStorage> {
}
@property(strong, readonly) _Nonnull id _ref;

- (nonnull instancetype)initWithRef:(_Nonnull id)ref;
- (void)delete:(NSString* _Nullable)key;
- (NSString* _Nonnull)getString:(NSString* _Nullable)key;
- (void)setString:(NSString* _Nullable)key value:(NSString* _Nullable)value;
@end

#endif
