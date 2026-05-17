import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import {
  NativeLiquidGlassView,
  isNativeGlassAvailable,
  getGlassInfo,
} from '../native/NativeLiquidGlass';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';

const {width} = Dimensions.get('window');

const FEATURES = [
  {
    title: 'Liquid Glass UI',
    description:
      'Experience the new iOS 26 glass material effects with real-time refraction.',
    icon: '✨',
  },
  {
    title: 'Adaptive Design',
    description:
      "Automatic fallback for devices that don't support Liquid Glass.",
    icon: '📱',
  },
  {
    title: 'Interactive Elements',
    description:
      'Buttons and cards respond to touch with glass haptic feedback.',
    icon: '👆',
  },
  {
    title: 'Container Sampling',
    description:
      'Multiple glass views share a sampling container for proper effects.',
    icon: '🎨',
  },
];

const HomeScreen: React.FC = () => {
  const [glassAvailable, setGlassAvailable] = useState<boolean>(false);
  const [glassInfo, setGlassInfo] = useState<any>(null);

  useEffect(() => {
    isNativeGlassAvailable().then(setGlassAvailable);
    getGlassInfo().then(setGlassInfo);
  }, []);

  const handleGetStarted = () => {
    const infoStr = glassInfo
      ? `iOS: ${glassInfo.iosVersion}\nUIGlassEffect: ${glassInfo.hasUIGlassEffect}\nContainer: ${glassInfo.hasUIGlassContainerEffect}`
      : 'Loading...';

    Alert.alert(
      'Native Glass Status',
      `Glass effects ${glassAvailable ? 'ARE ✅' : 'are NOT ❌'} supported.\n\n${infoStr}`,
    );
  };

  const renderHero = () => (
    <View style={styles.heroSection}>
      {glassAvailable ? (
        <NativeLiquidGlassView
          interactive={false}
          effectVariant="clear"
          style={styles.heroGlass}>
          <Text style={styles.heroTitle}>Welcome to</Text>
          <Text style={styles.heroTitleBold}>Liquid Glass</Text>
          <Text style={styles.heroSubtitle}>
            iOS 26 • React Native 0.80 • Native Module
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>✅ NATIVE UIGlassEffect</Text>
          </View>
        </NativeLiquidGlassView>
      ) : (
        <View style={[styles.heroGlass, styles.heroFallback]}>
          <Text style={styles.heroTitle}>Welcome to</Text>
          <Text style={styles.heroTitleBold}>Liquid Glass</Text>
          <Text style={styles.heroSubtitle}>
            iOS 26 • React Native 0.80 • Fallback Mode
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeTextFallback}>⚠️ FALLBACK RENDERING</Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderDiagnostics = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Diagnostics</Text>
      <GlassCard>
        <Text style={styles.diagnosticLabel}>Native Glass Available:</Text>
        <Text style={styles.diagnosticValue}>
          {glassAvailable ? '✅ YES' : '❌ NO'}
        </Text>
        {glassInfo && (
          <>
            <Text style={styles.diagnosticLabel}>iOS Version:</Text>
            <Text style={styles.diagnosticValue}>{glassInfo.iosVersion}</Text>
            <Text style={styles.diagnosticLabel}>UIGlassEffect Class:</Text>
            <Text style={styles.diagnosticValue}>
              {glassInfo.hasUIGlassEffect ? '✅ Found' : '❌ Not Found'}
            </Text>
            <Text style={styles.diagnosticLabel}>GlassContainer Class:</Text>
            <Text style={styles.diagnosticValue}>
              {glassInfo.hasUIGlassContainerEffect ? '✅ Found' : '❌ Not Found'}
            </Text>
          </>
        )}
      </GlassCard>
    </View>
  );

  const renderFeatureCards = () => (
    <View>
      {FEATURES.map((feature, index) => (
        <GlassCard key={index} interactive>
          <Text style={styles.featureIcon}>{feature.icon}</Text>
          <Text style={styles.featureTitle}>{feature.title}</Text>
          <Text style={styles.featureDescription}>{feature.description}</Text>
        </GlassCard>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Background gradient simulation for glass refraction */}
      <View style={styles.backgroundGradient}>
        <View style={styles.gradientCircle1} />
        <View style={styles.gradientCircle2} />
        <View style={styles.gradientCircle3} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {renderHero()}

        {renderDiagnostics()}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          {renderFeatureCards()}
        </View>

        <View style={styles.section}>
          <GlassButton
            title="Check Glass Status"
            onPress={handleGetStarted}
            tintColor="#007AFF"
          />
          <View style={{height: 12}} />
          <GlassButton
            title="Native Module Info"
            onPress={() =>
              Alert.alert(
                'Build Info',
                'Custom Swift Native Module\nDirect UIGlassEffect API\nXcode 26.4 • iOS SDK 26',
              )
            }
            tintColor="#34C759"
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  gradientCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#667eea',
    opacity: 0.6,
    top: -50,
    left: -50,
  },
  gradientCircle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#f093fb',
    opacity: 0.5,
    top: 200,
    right: -80,
  },
  gradientCircle3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#4facfe',
    opacity: 0.4,
    bottom: 100,
    left: 30,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  heroGlass: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: width - 48,
    overflow: 'hidden',
  },
  heroFallback: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroTitle: {
    fontSize: 22,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
  },
  heroTitleBold: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '800',
    marginTop: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 12,
    letterSpacing: 1,
  },
  badge: {
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 200, 83, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 83, 0.4)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00C853',
  },
  badgeTextFallback: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFB300',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    marginLeft: 4,
  },
  diagnosticLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 8,
  },
  diagnosticValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 2,
  },
  featureCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 100,
  },
});

export default HomeScreen;
