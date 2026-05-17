import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  NativeLiquidGlassView,
  isNativeGlassAvailable,
} from '../native/NativeLiquidGlass';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

interface TabIconProps {
  label: string;
  icon: string;
  focused: boolean;
  color: string;
}

const TabIcon: React.FC<TabIconProps> = ({icon, focused, color}) => {
  const [glassAvailable, setGlassAvailable] = useState<boolean>(false);

  useEffect(() => {
    isNativeGlassAvailable().then(setGlassAvailable);
  }, []);

  if (glassAvailable && focused) {
    return (
      <NativeLiquidGlassView
        interactive={true}
        effectVariant="clear"
        glassTintColor={color}
        style={styles.tabIconGlass}>
        <Text style={styles.tabIconText}>{icon}</Text>
      </NativeLiquidGlassView>
    );
  }

  return (
    <View style={[styles.tabIconContainer, focused && styles.tabIconFocused]}>
      <Text style={styles.tabIconText}>{icon}</Text>
    </View>
  );
};

const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
        tabBarLabelStyle: styles.tabBarLabel,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({focused, color}) => (
            <TabIcon label="Home" icon="🏠" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({focused, color}) => (
            <TabIcon
              label="Search"
              icon="🔍"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({focused, color}) => (
            <TabIcon
              label="Profile"
              icon="👤"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    borderTopWidth: 0,
    elevation: 0,
    position: 'absolute',
    height: 85,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  tabIconGlass: {
    borderRadius: 12,
    padding: 6,
    minWidth: 36,
    alignItems: 'center',
    overflow: 'hidden',
  },
  tabIconContainer: {
    padding: 6,
    borderRadius: 12,
    minWidth: 36,
    alignItems: 'center',
  },
  tabIconFocused: {
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
  },
  tabIconText: {
    fontSize: 22,
  },
});

export default BottomTabNavigator;
