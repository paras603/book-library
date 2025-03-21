import React, { useEffect, useState } from "react";
import {View,Text,FlatList,TouchableOpacity,StyleSheet,ActivityIndicator} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

const BookListScreen = ({ navigation }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch books from Firestore
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "books"));
        const booksArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBooks(booksArray);
      } catch (error) {
        console.error("Error fetching books: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        <Ionicons name="library-outline" size={26} color="#4A90E2" /> Book
        Library
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4A90E2" />
      ) : books.length > 0 ? (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.bookItem}
              onPress={() => navigation.navigate("BookDetail", { book: item })}
              activeOpacity={0.8}
            >
              <Ionicons name="book-outline" size={22} color="#555" />
              <View style={styles.bookInfo}>
                <Text style={styles.title}>{item.title}</Text>
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
  title: {
    fontSize: 18,
    fontWeight: "bold",
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
