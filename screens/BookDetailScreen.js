import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { doc, updateDoc, getDoc, query, where, collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { auth } from "../firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

const BookDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { book } = route.params;
  const [loading, setLoading] = useState(false);
  const [bookData, setBookData] = useState(book);
  const [userDetails, setUserDetails] = useState(null);

  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const bookRef = doc(db, "books", book.id);
        const bookSnap = await getDoc(bookRef);
        if (bookSnap.exists()) {
          setBookData(bookSnap.data());
        }
        
      } catch (error) {
        console.error("Error fetching book details: ", error);
        Alert.alert("Error", "Failed to load book details.");
      }
    };
    fetchBookDetails();

    const fetchUserDetails = async () => {
      try {
        const userEmail = auth.currentUser?.email; // Get the current user's email

        if (!userEmail) {
          Alert.alert("Error", "User is not logged in.");
          return;
        }

        // Query the users collection using the email
        const q = query(collection(db, "users"), where("email", "==", userEmail));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log("No such document!");
        } else {
          querySnapshot.forEach((doc) => {
            console.log("User role:", doc.data().role);
            setUserRole(doc.data().role);
          });
        }
      } catch (error) {
        console.error("Error fetching user details: ", error);
        Alert.alert("Error", "Failed to load user details.");
      } finally {
        setLoading(false); // Set loading state to false
      }
    }

    fetchUserDetails()
  }, []);
  

  const borrowBook = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "You must be logged in to borrow books.");
        return;
      }

      if (!bookData.available) {
        Alert.alert("Unavailable", "This book is already borrowed.");
        return;
      }

      const bookRef = doc(db, "books", book.id);
      await updateDoc(bookRef, {
        available: false,
        borrower: {
          bookedBy: user.email,
          borrowedAt: new Date().toISOString(),
          returned: false,
        },
      });

      setBookData({
        ...bookData,
        available: false,
        borrower: { bookedBy: user.email, borrowedAt: new Date().toISOString(), returned: false },
      });
      Alert.alert("Success", `${book.title} has been borrowed!`);
      navigation.navigate("Borrowed");
    } catch (error) {
      console.error("Error borrowing book: ", error);
      Alert.alert("Error", "Failed to borrow the book.");
    } finally {
      setLoading(false);
    }
  };

  const returnBook = async () => {
    try {
      setLoading(true);
      const bookRef = doc(db, "books", book.id);
      await updateDoc(bookRef, {
        available: true,
        "borrower.returned": true,
      });

      setBookData({
        ...bookData,
        available: true,
        borrower: { ...bookData.borrower, returned: true },
      });
      Alert.alert("Success", "Book has been returned.");
      navigation.navigate("BookList");
    } catch (error) {
      console.error("Error returning book: ", error);
      Alert.alert("Error", "Failed to return the book.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <View style={styles.container}>
      <Ionicons name="book-outline" size={80} color="#4A90E2" style={styles.icon} />
      <Text style={styles.title}>{bookData.title}</Text>
      <Text style={styles.author}>by {bookData.author}</Text>
      <Text style={styles.description}>{bookData.description}</Text>

      {!bookData.available && bookData.borrower ? (
        <View style={styles.borrowerDetails}>
          <Text style={styles.borrowerText}><Text style={styles.boldText}>Borrowed by:</Text> {bookData.borrower.bookedBy}</Text>
          <Text style={styles.borrowerText}><Text style={styles.boldText}>Borrowed At:</Text> {new Date(bookData.borrower.borrowedAt).toLocaleDateString()}</Text>
          <Text style={styles.borrowerText}><Text style={styles.boldText}>Returned:</Text> {bookData.borrower && bookData.borrower.returned ? "Yes" : "No"}</Text>
        </View>
      ) : null}

      {/* Always show borrow button unless the book has not been returned */}
      {bookData.borrower && bookData.borrower.returned === false ? 
        (
          <TouchableOpacity
            style={[styles.button, styles.buttonUnavailable]}
            disabled={true}
          >
            <Text style={styles.buttonText}>Unavailable</Text>
          </TouchableOpacity>
        )
        : (
          <TouchableOpacity
            style={[
              styles.button,
              bookData.borrower && bookData.borrower.returned === false
                ? styles.buttonUnavailable
                : styles.buttonAvailable,
              { opacity: bookData.borrower && bookData.borrower.returned === false ? 0.5 : 1 }, // Reduce opacity for disabled button
            ]}
            onPress={borrowBook}
            disabled={userRole == 'admin'}
            pointerEvents={bookData.borrower && bookData.borrower.returned === false ? "none" : "auto"} // Prevent interactions
          >
            <Text style={styles.buttonText}>Borrow this book</Text>
          </TouchableOpacity>
        )
      }
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
  borrowerDetails: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    width: "100%",
    alignItems: "center",
  },
  borrowerText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  boldText: {
    fontWeight: "bold",
    color: "#4A90E2",
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
    backgroundColor: 'grey',
  },
  buttonReturn: {
    backgroundColor: "#FF5733",
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default BookDetailScreen;
