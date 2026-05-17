import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View, TextInput} from 'react-native';
import {
  NativeLiquidGlassView,
  isNativeGlassAvailable,
} from '../native/NativeLiquidGlass';
import GlassCard from '../components/GlassCard';

const SearchScreen: React.FC = () => {
  const [glassAvailable, setGlassAvailable] = useState<boolean>(false);

  useEffect(() => {
    isNativeGlassAvailable().then(setGlassAvailable);
  }, []);

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.backgroundGradient}>
        <View style={styles.gradientCircle1} />
        <View style={styles.gradientCircle2} />
      </View>

      <View style={styles.content}>
        {/* Search Bar with Glass Effect */}
        {glassAvailable ? (
          <NativeLiquidGlassView
            interactive={true}
            effectVariant="regular"
            style={styles.searchBarGlass}>
            <Text style={styles.searchIcon}>🔍</Text>
            <Text style={styles.searchPlaceholder}>Search marketplace...</Text>
          </NativeLiquidGlassView>
        ) : (
          <View style={[styles.searchBarGlass, styles.searchBarFallback]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <Text style={styles.searchPlaceholder}>Search marketplace...</Text>
          </View>
        )}

        <GlassCard interactive>
          <Text style={styles.icon}>🔍</Text>
          <Text style={styles.title}>Search</Text>
          <Text style={styles.subtitle}>
            Discover items in the marketplace
          </Text>
        </GlassCard>

        <GlassCard>
          <Text style={styles.placeholder}>
            Search functionality coming soon...
          </Text>
          <Text style={styles.glassStatus}>
            Native Glass: {glassAvailable ? '✅ Active (UIGlassEffect)' : '⚠️ Fallback mode'}
          </Text>
        </GlassCard>

        {/* Category Chips with Glass */}
        <View style={styles.chipRow}>
          {['Electronics', 'Fashion', 'Home', 'Sports'].map((cat, i) => (
            glassAvailable ? (
              <NativeLiquidGlassView
                key={i}
                interactive={true}
                effectVariant="regular"
                style={styles.chipGlass}>
                <Text style={styles.chipText}>{cat}</Text>
              </NativeLiquidGlassView>
            ) : (
              <View key={i} style={[styles.chipGlass, styles.chipFallback]}>
                <Text style={styles.chipText}>{cat}</Text>
              </View>
            )
          ))}
        </View>
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
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#f093fb',
    opacity: 0.5,
    top: 50,
    right: -60,
  },
  gradientCircle2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#667eea',
    opacity: 0.4,
    bottom: 200,
    left: -40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  searchBarGlass: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  searchBarFallback: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
  },
  chipGlass: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    overflow: 'hidden',
  },
  chipFallback: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  placeholder: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 12,
  },
  glassStatus: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
});

export default SearchScreen;
