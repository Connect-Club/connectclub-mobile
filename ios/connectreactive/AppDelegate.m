#import <Bugsnag/Bugsnag.h>
#import "AppDelegate.h"
#import "connectreactive-Swift.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTLinkingManager.h>
#import <RNBranch/RNBranch.h>
#import <Firebase.h>
#import "RNBootSplash.h"
#import <AppsFlyerAttribution.h>

#ifdef FB_SONARKIT_ENABLED
#import <FlipperKit/FlipperClient.h>
#import <FlipperKitLayoutPlugin/FlipperKitLayoutPlugin.h>
#import <FlipperKitUserDefaultsPlugin/FKUserDefaultsPlugin.h>
#import <FlipperKitNetworkPlugin/FlipperKitNetworkPlugin.h>
#import <SKIOSNetworkPlugin/SKIOSNetworkAdapter.h>
#import <FlipperKitReactPlugin/FlipperKitReactPlugin.h>

static void InitializeFlipper(UIApplication *application) {
    FlipperClient *client = [FlipperClient sharedClient];
    SKDescriptorMapper *layoutDescriptorMapper = [[SKDescriptorMapper alloc] initWithDefaults];
    [client addPlugin:[[FlipperKitLayoutPlugin alloc] initWithRootNode:application withDescriptorMapper:layoutDescriptorMapper]];
    [client addPlugin:[[FKUserDefaultsPlugin alloc] initWithSuiteName:nil]];
    [client addPlugin:[FlipperKitReactPlugin new]];
    [client addPlugin:[[FlipperKitNetworkPlugin alloc] initWithNetworkAdapter:[SKIOSNetworkAdapter new]]];
    [client start];
}
#endif

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    [Intercom setApiKey:@"ios_sdk-759bd974160cf608ed99743824fac5800c11efe7" forAppId:@"bfcjjicu"];

    BugsnagConfiguration *bgsngConfig = [BugsnagConfiguration loadConfig];
    [bgsngConfig addOnSendErrorBlock:^BOOL(BugsnagEvent * _Nonnull event) {
        if (event.severity != BSGSeverityError) {
            return NO;
        }
        NSString *logId = [Logger getLogId];
        if (logId.length > 0) {
            [event addMetadata:@{@"id": logId} toSection:@"log"];
        }
        return YES;
    }];

    [Bugsnag startWithConfiguration:bgsngConfig];

#ifdef FB_SONARKIT_ENABLED
    InitializeFlipper(application);
#endif
    [RNBranch initSessionWithLaunchOptions:launchOptions isReferrable:YES];

    if ([FIRApp defaultApp] == nil) {
        [FIRApp configure];
    }

    RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
    RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                     moduleName:@"connectreactive"
                                              initialProperties:nil];

    rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

    self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
    UIViewController *rootViewController = [UIViewController new];
    rootViewController.view = rootView;
    self.window.rootViewController = rootViewController;
    [self.window makeKeyAndVisible];
    [RNBootSplash initWithStoryboard:@"LaunchScreen" rootView:rootView];

    [UNUserNotificationCenter currentNotificationCenter].delegate = self;

    return YES;
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler {

    NSDictionary *userInfo = response.notification.request.content.userInfo;
    if ([Intercom isIntercomPushNotification:userInfo]) {
        [Intercom handleIntercomPushNotification:userInfo];
    }
    completionHandler();
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
    return [NSURL URLWithString:[[[[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil] absoluteString] stringByAppendingString:@"&inlineSourceMap=true" ]];
#else
    return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}


- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
            options:(nonnull NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options
{
    [[AppsFlyerAttribution shared] handleOpenUrl:url options:options];
    [RCTLinkingManager application:application
                           openURL:url
                           options:options];
    return YES;
}

- (BOOL)application:(UIApplication *)application
continueUserActivity:(NSUserActivity *)userActivity
 restorationHandler:(void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
    [[AppsFlyerAttribution shared] continueUserActivity:userActivity restorationHandler:restorationHandler];
    return [RCTLinkingManager application:application
                     continueUserActivity:userActivity
                       restorationHandler:restorationHandler];
}

- (UIInterfaceOrientationMask)application:(UIApplication *)application supportedInterfaceOrientationsForWindow:(UIWindow *)window {
    if ([window isKindOfClass:[FullscreenVideoWindow class]]) {
        return UIInterfaceOrientationMaskLandscape;
    }
    return UIInterfaceOrientationMaskPortrait;
}

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
    [Intercom setDeviceToken:deviceToken];
}

@end
