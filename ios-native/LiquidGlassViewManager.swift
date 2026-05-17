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
        // Store existing subviews that are NOT the effectView
        let childViews = subviews.filter { $0 !== effectView }
        
        effectView?.removeFromSuperview()
        
        let glassEffect = UIGlassEffect()
        glassEffect.isInteractive = interactive
        
        let newEffectView = UIVisualEffectView(effect: glassEffect)
        newEffectView.frame = self.bounds
        newEffectView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        newEffectView.clipsToBounds = true
        newEffectView.contentView.clipsToBounds = true
        
        if let tint = glassTintColor {
            newEffectView.backgroundColor = tint.withAlphaComponent(0.15)
        }
        
        // Insert effect view at the back
        self.insertSubview(newEffectView, at: 0)
        self.effectView = newEffectView
        
        // Move existing child views into the contentView
        for child in childViews {
            child.removeFromSuperview()
            newEffectView.contentView.addSubview(child)
        }
    }
    
    override func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
        // Add React Native children to the effectView's contentView, not directly to self
        if let effectView = effectView {
            effectView.contentView.insertSubview(subview, at: atIndex)
        } else {
            super.insertReactSubview(subview, at: atIndex)
        }
    }
    
    override func removeReactSubview(_ subview: UIView!) {
        subview.removeFromSuperview()
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        effectView?.frame = bounds
        effectView?.layer.cornerRadius = layer.cornerRadius
        effectView?.contentView.layer.cornerRadius = layer.cornerRadius
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
