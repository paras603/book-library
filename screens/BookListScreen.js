import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { collection, doc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";

const BookListScreen = ({ navigation }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Fetch user role from Firestore
  useEffect(() => {
    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid);

      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          setUserRole(docSnap.data().role); // Store role in state
        }
      });
    }
  }, [currentUser]);

  // Fetch books in real-time using Firestore's onSnapshot
  useEffect(() => {
    const booksCollection = collection(db, "books");

    const unsubscribe = onSnapshot(booksCollection, (snapshot) => {
      const booksArray = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setBooks(booksArray);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Function to handle book press
  const handleBookPress = (book) => {
    navigation.navigate("BookDetail", { book });
  };

  // Filter books based on search query
  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        <Ionicons name="library-outline" size={26} color="#4A90E2" /> Book
        Library
      </Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search by title or author..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#4A90E2" />
      ) : filteredBooks.length > 0 ? (
        <FlatList
          data={filteredBooks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.bookItem}
              onPress={() => handleBookPress(item)}
              activeOpacity={0.8}
            >
              <Ionicons name="book-outline" size={22} color="#555" />
              <View style={styles.bookInfo}>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>{item.title}</Text>
                  {!item.available && (
                    <Text style={styles.unavailableTag}>Unavailable</Text>
                  )}
                </View>
                <Text style={styles.author}>by {item.author}</Text>
              </View>
              <Ionicons
                name="chevron-forward-outline"
                size={22}
                color="#4A90E2"
              />
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.noBooks}>No books found!</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#4A90E2",
    marginBottom: 15,
    textAlign: "center",
  },
  searchBar: {
    height: 40,
    borderColor: "#cccccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  bookItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginVertical: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  bookInfo: {
    flex: 1,
    marginLeft: 10,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  unavailableTag: {
    marginLeft: 10,
    fontSize: 12,
    color: "#fff",
    backgroundColor: "#ff6666",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    fontWeight: "bold",
    overflow: "hidden",
  },
  author: {
    fontSize: 14,
    color: "#555",
  },
  loading: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
  noBooks: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});

export default BookListScreen;
