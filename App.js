import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import BookListScreen from "./screens/BookListScreen";
import BorrowedBooksScreen from "./screens/BorrowedBooksScreen";
import BookDetailScreen from "./screens/BookDetailScreen";
import { Ionicons } from "@expo/vector-icons";

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

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Home") {
              iconName = focused ? "book" : "book-outline";
            } else if (route.name === "BorrowedBooks") {
              iconName = focused ? "bookmark" : "bookmark-outline";
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
        <Tab.Screen
          name="BorrowedBooks"
          component={BorrowedBooksStack}
          options={{ title: "My Borrowed Books" }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
