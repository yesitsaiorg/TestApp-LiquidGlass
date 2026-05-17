import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View, Alert} from 'react-native';
import {
  NativeLiquidGlassView,
  isNativeGlassAvailable,
  getGlassInfo,
} from '../native/NativeLiquidGlass';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';

const ProfileScreen: React.FC = () => {
  const [glassAvailable, setGlassAvailable] = useState<boolean>(false);
  const [glassInfo, setGlassInfo] = useState<any>(null);

  useEffect(() => {
    isNativeGlassAvailable().then(setGlassAvailable);
    getGlassInfo().then(setGlassInfo);
  }, []);

  const handleShowDiagnostics = () => {
    const info = glassInfo
      ? JSON.stringify(glassInfo, null, 2)
      : 'Loading...';
    Alert.alert('Native Glass Diagnostics', info);
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.backgroundGradient}>
        <View style={styles.gradientCircle1} />
        <View style={styles.gradientCircle2} />
      </View>

      <View style={styles.content}>
        {/* Avatar with Glass Effect */}
        <GlassCard interactive>
          {glassAvailable ? (
            <NativeLiquidGlassView
              interactive={true}
              effectVariant="clear"
              style={styles.avatarGlass}>
              <Text style={styles.avatarText}>👤</Text>
            </NativeLiquidGlassView>
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
          )}
          <Text style={styles.name}>Test User</Text>
          <Text style={styles.email}>user@testapp.dev</Text>
        </GlassCard>

        <GlassCard>
          <Text style={styles.sectionTitle}>App Info</Text>
          <Text style={styles.infoRow}>React Native 0.80.0</Text>
          <Text style={styles.infoRow}>Custom Swift Native Module</Text>
          <Text style={styles.infoRow}>Xcode 26.4 • iOS SDK 26</Text>
          <Text style={styles.infoRow}>
            Native Glass: {glassAvailable ? '✅ Active (UIGlassEffect)' : '⚠️ Fallback mode'}
          </Text>
          {glassInfo && (
            <>
              <Text style={styles.infoRow}>
                iOS Version: {glassInfo.iosVersion}
              </Text>
              <Text style={styles.infoRow}>
                UIGlassEffect: {glassInfo.hasUIGlassEffect ? '✅' : '❌'}
              </Text>
            </>
          )}
        </GlassCard>

        {/* Stats Row with Glass */}
        <View style={styles.statsRow}>
          {[
            {label: 'Posts', value: '24'},
            {label: 'Following', value: '156'},
            {label: 'Followers', value: '1.2K'},
          ].map((stat, i) =>
            glassAvailable ? (
              <NativeLiquidGlassView
                key={i}
                interactive={true}
                effectVariant="regular"
                style={styles.statCard}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </NativeLiquidGlassView>
            ) : (
              <View key={i} style={[styles.statCard, styles.statFallback]}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ),
          )}
        </View>

        <GlassButton
          title="Show Diagnostics"
          onPress={handleShowDiagnostics}
          tintColor="#AF52DE"
        />
        <View style={{height: 12}} />
        <GlassButton
          title="Edit Profile"
          onPress={() => Alert.alert('Profile', 'Coming soon!')}
          tintColor="#007AFF"
        />
      </View>
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
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#4facfe',
    opacity: 0.5,
    top: 80,
    left: -50,
  },
  gradientCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#f093fb',
    opacity: 0.4,
    bottom: 150,
    right: -30,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 100,
  },
  avatarGlass: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  infoRow: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    overflow: 'hidden',
  },
  statFallback: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});

export default ProfileScreen;
