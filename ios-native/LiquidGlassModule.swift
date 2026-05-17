import UIKit
import React

@objc(LiquidGlassModule)
class LiquidGlassModule: NSObject {

    @objc static func requiresMainQueueSetup() -> Bool {
        return false
    }

    @objc func isGlassAvailable(_ resolve: @escaping RCTPromiseResolveBlock,
                                 rejecter reject: @escaping RCTPromiseRejectBlock) {
        if #available(iOS 26.0, *) {
            let available = NSClassFromString("UIGlassEffect") != nil
            resolve(available)
        } else {
            resolve(false)
        }
    }

    @objc func getGlassInfo(_ resolve: @escaping RCTPromiseResolveBlock,
                             rejecter reject: @escaping RCTPromiseRejectBlock) {
        var info: [String: Any] = [:]
        info["iosVersion"] = UIDevice.current.systemVersion
        info["systemName"] = UIDevice.current.systemName

        if #available(iOS 26.0, *) {
            info["isIOS26"] = true
            info["hasUIGlassEffect"] = NSClassFromString("UIGlassEffect") != nil
            info["hasUIGlassContainerEffect"] = NSClassFromString("UIGlassContainerEffect") != nil
        } else {
            info["isIOS26"] = false
            info["hasUIGlassEffect"] = false
            info["hasUIGlassContainerEffect"] = false
        }

        resolve(info)
    }
}
