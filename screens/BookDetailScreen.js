import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { doc, updateDoc, getDoc, collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { auth } from "../firebaseConfig"; // Import auth to get current user
import { Ionicons } from "@expo/vector-icons";

const BookDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { book } = route.params;
  const [loading, setLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  // Check book availability on mount
  useEffect(() => {
    const fetchBookAvailability = async () => {
      try {
        const bookRef = doc(db, "books", book.id);
        const bookSnap = await getDoc(bookRef);
        if (bookSnap.exists()) {
          setIsAvailable(bookSnap.data().available);
        }
      } catch (error) {
        console.error("Error checking book availability: ", error);
        Alert.alert("Error", "Failed to load book details.");
      }
    };
    fetchBookAvailability();
  }, []);

  const borrowBook = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "You must be logged in to borrow books.");
        return;
      }
      const userUid = user.uid;

      if (!isAvailable) {
        Alert.alert("Unavailable", "This book is already borrowed.");
        return;
      }

      // Check how many books the user has already borrowed
      const borrowedBooksQuery = query(
        collection(db, "borrowers", userUid, "borrowedBooks"),
        where("returned", "==", false)
      );
      const borrowedBooksSnapshot = await getDocs(borrowedBooksQuery);
      const borrowedBooksCount = borrowedBooksSnapshot.size;

      if (borrowedBooksCount >= 2) {
        Alert.alert("Limit reached", "You can only borrow 2 books at a time.");
      } else {
        // Mark book as unavailable in Firestore
        const bookRef = doc(db, "books", book.id);
        await updateDoc(bookRef, { available: false });

        // Add the book to the user's borrowedBooks collection
        await addDoc(collection(db, "borrowers", userUid, "borrowedBooks"), {
          title: book.title,
          author: book.author,
          returned: false,
          borrowedAt: new Date().toISOString(),
        });

        Alert.alert("Success", `${book.title} has been borrowed!`);
        setIsAvailable(false);
        navigation.navigate("Borrowed");
      }
    } catch (error) {
      console.error("Error borrowing book: ", error);
      Alert.alert("Error", "Failed to borrow the book.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Ionicons name="book-outline" size={80} color="#4A90E2" style={styles.icon} />
      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.author}>by {book.author}</Text>
      <Text style={styles.description}>{book.description}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4A90E2" />
      ) : (
        <TouchableOpacity
          style={[styles.button, isAvailable ? styles.buttonAvailable : styles.buttonUnavailable]}
          onPress={borrowBook}
          disabled={!isAvailable}
        >
          <Text style={styles.buttonText}>{isAvailable ? "Borrow this book" : "Unavailable"}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginBottom: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#4A90E2",
    marginBottom: 10,
    textAlign: "center",
  },
  author: {
    fontSize: 18,
    color: "#555",
    marginBottom: 10,
    fontStyle: "italic",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
    width: "80%",
    marginTop: 20,
  },
  buttonAvailable: {
    backgroundColor: "#4A90E2",
  },
  buttonUnavailable: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default BookDetailScreen;
