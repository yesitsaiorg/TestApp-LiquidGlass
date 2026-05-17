#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(LiquidGlassModule, NSObject)

RCT_EXTERN_METHOD(isGlassAvailable:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getGlassInfo:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
