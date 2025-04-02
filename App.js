import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import BookListScreen from "./screens/BookListScreen";
import BorrowedBooksScreen from "./screens/BorrowedBooksScreen";
import BookDetailScreen from "./screens/BookDetailScreen";
import { Ionicons } from "@expo/vector-icons";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";
import LoginScreen from "./screens/LoginScreen";
import ProfileScreen from "./screens/ProfileScreen";
import RegisterScreen from "./screens/RegisterScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack for Book List and Book Detail
function BookStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="BookList"
        component={BookListScreen}
        options={{ title: "Home" }}
      />
      <Stack.Screen
        name="BookDetail"
        component={BookDetailScreen}
        options={{ title: "Book Details" }}
      />
    </Stack.Navigator>
  );
}

// Stack for Borrowed Books (adds a header)
function BorrowedBooksStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="BorrowedBooks"
        component={BorrowedBooksScreen}
        options={{ title: "My Borrowed Books" }}
      />
    </Stack.Navigator>
  );
}

// Tab Navigator for main app
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = focused ? "book" : "book-outline";
          } else if (route.name === "Borrowed") {
            iconName = focused ? "bookmark" : "bookmark-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#4A90E2",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "#fff",
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "bold",
        },
      })}
    >
      <Tab.Screen name="Home" component={BookStack} />
      <Tab.Screen name="Borrowed" component={BorrowedBooksStack} />
      <Tab.Screen name="Profile" component={ProfileScreen}/>
    </Tab.Navigator>
  );
}

// Main App Component
export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="MainTabs" component={MainTabs} />
        ) : (
          <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen}/>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
