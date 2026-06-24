import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useApp } from '../context/AppContext';
import AuthScreen from '../screens/AuthScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import IntroScreen from '../screens/IntroScreen';
import ChoreSetupScreen from '../screens/ChoreSetupScreen';
import MyTasksScreen from '../screens/MyTasksScreen';
import ChoresScreen from '../screens/ChoresScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ChartsScreen from '../screens/ChartsScreen';
import CheckinScreen from '../screens/CheckinScreen';
import BattleScreen from '../screens/BattleScreen';
import MembersScreen from '../screens/MembersScreen';
import HeaderUser from '../components/HeaderUser';
import { colors, fonts } from '../theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Splash() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
      <ActivityIndicator color={colors.gold} size="large" />
    </View>
  );
}

function FamilyButton() {
  const navigation = useNavigation();
  return (
    <Pressable onPress={() => navigation.navigate('Family')} hitSlop={10} style={{ marginLeft: 16 }}>
      <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: colors.ink }}>
        Family
      </Text>
    </Pressable>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTitleStyle: { fontFamily: fonts.serif, color: colors.ink, fontSize: 24, letterSpacing: 0.5 },
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerLeft: () => <FamilyButton />,
        headerRight: () => <HeaderUser />,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.bg, borderTopWidth: 0, height: 84, paddingTop: 14 },
        tabBarLabelStyle: { fontSize: 9, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase' },
        tabBarIcon: ({ focused }) => (
          <View style={{ width: 5, height: 5, borderRadius: 3, marginBottom: 3, backgroundColor: focused ? colors.gold : 'transparent' }} />
        ),
      }}
    >
      <Tab.Screen name="Mine" component={MyTasksScreen} />
      <Tab.Screen name="Weekly" component={ChoresScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Charts" component={ChartsScreen} />
      <Tab.Screen name="Check-in" component={CheckinScreen} />
      <Tab.Screen name="Forfeit" component={BattleScreen} />
    </Tab.Navigator>
  );
}

const INTRO_KEY = 'ff_intro_seen_v1';
const CHORE_SETUP_KEY = 'ff_chore_setup_v1';

export default function RootNavigator() {
  const { booting, session, profileLoaded, hasFamily, chores, loadingFamily } = useApp();
  // null = still loading the flag; false = show the one-time walkthrough.
  const [introSeen, setIntroSeen] = useState(null);
  const [choreSetupSeen, setChoreSetupSeen] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(INTRO_KEY)
      .then((v) => setIntroSeen(v === '1'))
      .catch(() => setIntroSeen(true));
    AsyncStorage.getItem(CHORE_SETUP_KEY)
      .then((v) => setChoreSetupSeen(v === '1'))
      .catch(() => setChoreSetupSeen(true));
  }, []);

  const dismissIntro = () => {
    setIntroSeen(true);
    AsyncStorage.setItem(INTRO_KEY, '1').catch(() => {});
  };

  const dismissChoreSetup = () => {
    setChoreSetupSeen(true);
    AsyncStorage.setItem(CHORE_SETUP_KEY, '1').catch(() => {});
  };

  // After the intro, a freshly created family with no chores yet gets the
  // one-time setup picker. Joiners land in a family that already has chores,
  // so they never see it.
  const needChoreSetup =
    introSeen === true && choreSetupSeen === false && !loadingFamily && chores.length === 0;

  if (booting) return <Splash />;

  return (
    <NavigationContainer>
      {!session ? (
        <AuthScreen />
      ) : !profileLoaded ? (
        <Splash />
      ) : !hasFamily ? (
        <OnboardingScreen />
      ) : (
        <>
          <Stack.Navigator>
            <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen
              name="Family"
              component={MembersScreen}
              options={{
                presentation: 'modal',
                headerStyle: { backgroundColor: colors.bg },
                headerTitleStyle: { fontFamily: fonts.serif, color: colors.ink, fontSize: 22 },
                headerShadowVisible: false,
                title: 'Family',
              }}
            />
          </Stack.Navigator>
          <Modal visible={introSeen === false} animationType="fade" onRequestClose={dismissIntro}>
            <IntroScreen onDone={dismissIntro} />
          </Modal>
          <Modal visible={needChoreSetup} animationType="slide" onRequestClose={dismissChoreSetup}>
            <ChoreSetupScreen onDone={dismissChoreSetup} />
          </Modal>
        </>
      )}
    </NavigationContainer>
  );
}
