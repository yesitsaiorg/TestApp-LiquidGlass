#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(LiquidGlassViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(interactive, BOOL)
RCT_EXPORT_VIEW_PROPERTY(effectVariant, NSString)
RCT_EXPORT_VIEW_PROPERTY(glassTintColor, UIColor)

@end
