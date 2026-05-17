import UIKit
import React

@available(iOS 26.0, *)
class LiquidGlassNativeView: RCTView {
    private var effectView: UIVisualEffectView?
    
    @objc var interactive: Bool = false {
        didSet { rebuildEffect() }
    }
    
    @objc var effectVariant: String = "regular" {
        didSet { rebuildEffect() }
    }
    
    @objc var glassTintColor: UIColor? {
        didSet { rebuildEffect() }
    }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupGlassEffect()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupGlassEffect()
    }
    
    private func setupGlassEffect() {
        self.clipsToBounds = true
        rebuildEffect()
    }
    
    private func rebuildEffect() {
        effectView?.removeFromSuperview()
        
        let glassEffect = UIGlassEffect()
        glassEffect.isInteractive = interactive
        
        let newEffectView = UIVisualEffectView(effect: glassEffect)
        newEffectView.frame = self.bounds
        newEffectView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        newEffectView.clipsToBounds = true
        newEffectView.isUserInteractionEnabled = false
        
        if let tint = glassTintColor {
            newEffectView.backgroundColor = tint.withAlphaComponent(0.15)
        }
        
        // Insert effect view at the very back — behind all React Native children
        self.insertSubview(newEffectView, at: 0)
        self.effectView = newEffectView
    }
    
    // KEY FIX: Do NOT reparent children into contentView.
    // Let React Native manage children as direct subviews of self.
    // This preserves Yoga layout calculations and overflow: 'hidden' clipping.
    // The effectView sits at index 0 as a background; children render on top.
    override func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
        super.insertReactSubview(subview, at: atIndex)
        // Ensure the glass effect stays behind all children
        if let effectView = effectView {
            sendSubviewToBack(effectView)
        }
    }
    
    override func removeReactSubview(_ subview: UIView!) {
        super.removeReactSubview(subview)
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        effectView?.frame = bounds
        effectView?.layer.cornerRadius = layer.cornerRadius
    }
}

// Fallback for iOS < 26
class LiquidGlassFallbackView: RCTView {
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupFallback()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupFallback()
    }
    
    private func setupFallback() {
        self.backgroundColor = UIColor.white.withAlphaComponent(0.6)
        self.layer.borderWidth = 1
        self.layer.borderColor = UIColor.white.withAlphaComponent(0.3).cgColor
        self.clipsToBounds = true
    }
}

@objc(LiquidGlassViewManager)
class LiquidGlassViewManager: RCTViewManager {
    
    override func view() -> UIView! {
        if #available(iOS 26.0, *) {
            return LiquidGlassNativeView()
        } else {
            return LiquidGlassFallbackView()
        }
    }
    
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
