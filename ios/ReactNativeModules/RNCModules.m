//
//  RNCModules.m
//  ConnectClub
//
//  Created by Тарас Минин on 15/02/2021.
//  Copyright © 2021 Sergei Golishnikov. All rights reserved.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(AppModule, RCTEventEmitter)

RCT_EXTERN_METHOD(connectToRoom:(nonnull NSString *)json
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(connectionStateChanged:(BOOL)isOffline)

RCT_EXTERN_METHOD(disconnectFromRoom:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(toggleVideo:(BOOL)enable)
RCT_EXTERN_METHOD(toggleAudio:(BOOL)enable)
RCT_EXTERN_METHOD(websocketsSendMessage:(NSString *)message)

RCT_EXTERN_METHOD(sendAudioVideoState:(BOOL)isVideoEnabled
                  isAudioEnabled:(BOOL)isAudioEnabled)
RCT_EXTERN_METHOD(phoneState:(NSString *)state)
RCT_EXTERN_METHOD(setDjMode:(BOOL)enabled)

RCT_EXTERN_METHOD(isThereOtherAdmin:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(admins:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(hands:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(switchCamera)
RCT_EXTERN_METHOD(jvBusterSetSubscriptionType:type(NSString *)type)

RCT_EXTERN_METHOD(getUniqueDeviceId:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(preserveLogFile:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end


@interface RCT_EXTERN_MODULE(HttpClient, RCTEventEmitter)
RCT_EXTERN_METHOD(initialize:(NSString *)endpoint
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(isAuthorized:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(queryAuthorize:(NSString *)query
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(request:(NSString *)endpoint
                  method:(NSString *)method
                  useAuthorizeHeader:(BOOL)useAuthorizeHeader
                  generateJwt:(BOOL)generateJwt
                  query:(nullable NSString *)query
                  body:(nullable NSString *)body
                  file:(nullable NSString *)file
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(sendLogFile:(NSString *)body
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(sendPreservedLogFile:(NSString *)body
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(setAmplitudeIds:(NSString *)sessionId
                  deviceId:(NSString *)deviceId)
@end


@interface RCT_EXTERN_MODULE(IntercomModule, RCTEventEmitter)
RCT_EXTERN_METHOD(loginUser:(NSString *)userId)
RCT_EXTERN_METHOD(logoutUser)
RCT_EXTERN_METHOD(presentIntercom)
RCT_EXTERN_METHOD(presentIntercomCarousel)
RCT_EXTERN_METHOD(registerUnidentifiedUser)
RCT_EXTERN_METHOD(setLauncherVisibility:(BOOL)isVisible)

@end

@interface RCT_EXTERN_MODULE(Logger, RCTEventEmitter)
RCT_EXTERN_METHOD(logJS:(NSString *)message level:(NSString *)level)
RCT_EXTERN_METHOD(sendLogs:(int sessionCount))
@end

@interface RCT_EXTERN_MODULE(CaptureScreenShot, RCTEventEmitter)
RCT_EXTERN_METHOD(takeScreenShot:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
@end

@interface RCT_EXTERN_MODULE(RNMessageComposer, RCTEventEmitter)
RCT_EXTERN_METHOD(send:(NSString *)recipient
                  body:(NSString *)body)
@end
