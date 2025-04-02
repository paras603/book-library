import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getAuth } from "firebase/auth"; // Import Firebase Auth
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const BorrowedBooksScreen = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(); // Get authentication instance
  const user = auth.currentUser; // Get logged-in user

  // Fetch borrowed books for the logged-in user
  const fetchBorrowedBooks = async () => {
    if (!user) {
      Alert.alert("Error", "You need to be logged in to view borrowed books.");
      return;
    }
    try {
      setLoading(true);
      // Query books collection and filter where 'borrower.returned' is false
      const booksQuery = query(
        collection(db, "books"),
        where("borrower.returned", "==", false), // Only books that have not been returned
        where("borrower.bookedBy", "==", user.email) // Filter books borrowed by the logged-in user
      );
      const querySnapshot = await getDocs(booksQuery);
      
      const books = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          author: data.author,
          borrowedAt: data.borrower.borrowedAt,
        };
      });
      
      setBorrowedBooks(books);
    } catch (error) {
      console.error("Error fetching borrowed books: ", error);
      Alert.alert("Error", "Failed to load borrowed books.");
    } finally {
      setLoading(false);
    }
  };

  // Mark book as returned and update availability
  const returnBook = async (borrowedBook) => {
    try {
      if (!user) return;
      const borrowedBookRef = doc(db, "books", borrowedBook.id);
      await updateDoc(borrowedBookRef, { "borrower.returned": true });

      // Find and update the availability of the book in the books collection
      const booksQuerySnapshot = await getDocs(collection(db, "books"));
      const bookDoc = booksQuerySnapshot.docs.find((doc) => doc.data().title === borrowedBook.title);

      if (bookDoc) {
        const bookRef = doc(db, "books", bookDoc.id);
        await updateDoc(bookRef, { available: true });
      }

      Alert.alert("Returned!", "Book returned successfully.");
      fetchBorrowedBooks(); // Refresh the list
    } catch (error) {
      console.error("Error returning book: ", error);
      Alert.alert("Error", "Failed to update the book's status.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBorrowedBooks();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Borrowed Books</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#4A90E2" />
      ) : borrowedBooks.length === 0 ? (
        <Text style={styles.noBooks}>No books borrowed yet!</Text>
      ) : (
        <FlatList
          data={borrowedBooks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.bookItem}>
              <Ionicons name="book" size={24} color="#4A90E2" style={styles.icon} />
              <View style={styles.bookDetails}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.author}>by {item.author}</Text>
                <Text style={styles.borrowedAt}>Borrowed At: {new Date(item.borrowedAt).toLocaleDateString()}</Text>
              </View>
              <TouchableOpacity
                style={styles.returnButton}
                onPress={() => returnBook(item)}
              >
                <Text style={styles.buttonText}>Return</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#4A90E2",
  },
  noBooks: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
    marginTop: 20,
  },
  bookItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  bookDetails: {
    flex: 1,
    marginLeft: 10,
  },
  icon: {
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  author: {
    fontSize: 16,
    color: "#555",
  },
  description: {
    fontSize: 14,
    color: "#777",
    marginTop: 5,
  },
  borrowedAt: {
    fontSize: 14,
    color: "#777",
    marginTop: 5,
  },
  returnButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default BorrowedBooksScreen;
