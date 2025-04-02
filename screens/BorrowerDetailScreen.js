import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from "react-native";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";

const BorrowerListScreen = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBorrowedBooks = async () => {
      try {
        const booksQuery = query(collection(db, "books"), where("borrower.returned", "==", false));


        const booksSnapshot = await getDocs(booksQuery);

        if (booksSnapshot.empty) {
          setBorrowedBooks([]);
          return;
        }

        const booksWithBorrowerDetails = await Promise.all(
          booksSnapshot.docs.map(async (bookDoc) => {
            const bookData = bookDoc.data();

            let borrowerData = {};
            borrowerData = bookData.borrower

            if (bookData.borrowedBy) {
              const borrowerDocRef = doc(db, "users", bookData.borrowedBy);
              const borrowerSnap = await getDoc(borrowerDocRef);
              borrowerData = borrowerSnap.exists() ? bookDoc.data().borrower : {};
            }

            return {
              id: bookDoc.id,
              ...bookData,
              borrower: borrowerData,
            };
          })
        );

        setBorrowedBooks(booksWithBorrowerDetails);
      } catch (error) {
        console.error("Error fetching borrowed books: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBorrowedBooks();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#4A90E2" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Borrowed Books</Text>
      {borrowedBooks.length > 0 ? (
        <FlatList
          data={borrowedBooks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.bookContainer}>
              <Text style={styles.bookTitle}>{item.title}</Text>
              <Text style={styles.detail}>
                <Text style={styles.label}>Email:</Text> {item.borrower.bookedBy || "N/A"}
              </Text>
              <Text style={styles.detail}>
                <Text style={styles.label}>Booked Date:</Text> {item.borrower.borrowedAt ? new Date(item.borrower.borrowedAt).toLocaleDateString() : "N/A"}
              </Text>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noBooks}>No books have been borrowed yet.</Text>
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A90E2",
    textAlign: "center",
    marginBottom: 15,
  },
  bookContainer: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  detail: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  label: {
    fontWeight: "bold",
    color: "#4A90E2",
  },
  noBooks: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});

export default BorrowerListScreen;
