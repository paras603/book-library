import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen({ navigation }) {
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person-circle-outline" size={120} color="#fff" />
        <Text style={styles.headerText}>Welcome Back!</Text>
      </View>

      <View style={[styles.profileCard]}>
        {user ? (
          <>
            <Text style={styles.userInfo}>
              <Ionicons name="mail" size={20} color="#555" /> {user.email}
            </Text>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.noUserText}>No user logged in</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#8cb8ed",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  profileCard: {
    backgroundColor: "#fff",
    width: "85%",
    padding: 25,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
    alignItems: "center",
  },
  userInfo: {
    fontSize: 18,
    color: "#333",
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    shadowColor: "#FF3B30",
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  noUserText: {
    fontSize: 16,
    color: "#777",
    marginTop: 20,
  },
});

