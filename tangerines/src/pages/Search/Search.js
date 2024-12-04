import React, { useState, useEffect } from "react";
import "./Search.css";
import { db, auth } from "../../firebase";

function Search() {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchType, setSearchType] = useState("recipe");
  const [userPreferences, setUserPreferences] = useState(null);

  // Fetch user preferences when the component mounts
  useEffect(() => {
    async function getUserInfo() {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userRef = db.collection("users").doc(currentUser.email);
          const doc = await userRef.get();

          if (doc.exists) {
            const userData = doc.data();
            setUserPreferences(userData.preferences || []);
          }
        } else {
          console.log("No user is signed in");
        }
      } catch (error) {
        console.log(error.message);
      }
    }

    getUserInfo();
  }, []);

  // Handle search based on searchType
  const handleSearch = async () => {
    try {
      let results = [];
      if (searchType === "recipe") {
        const querySnapshot = await db
          .collection("recipes")
          .where("title", "==", search)
          .get();

        querySnapshot.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() });
        });
      } else if (searchType === "ingredient") {
        const querySnapshot = await db.collection("recipes").get();
        querySnapshot.forEach((doc) => {
          const recipe = doc.data();
          const ingredientsArray = recipe.ingredients || [];

          const hasIngredient = ingredientsArray.some(
            (item) => item.ingredient.toLowerCase() === search.toLowerCase()
          );

          if (hasIngredient) {
            results.push({ id: doc.id, ...recipe });
          }
        });
      } else if (searchType === "preferences") {
        if (userPreferences === null || userPreferences.length === 0) {
          console.log("No user preferences available");
        } else {
          // Fetch recipes based on user preferences by category, tags, or area
          const categorySnapshot = await db
            .collection("recipes")
            .where("category", "in", userPreferences)
            .get();

          categorySnapshot.forEach((doc) => {
            results.push({ id: doc.id, ...doc.data() });
          });

          const tagSnapshot = await db
            .collection("recipes")
            .where("tags", "array-contains-any", userPreferences)
            .get();

          tagSnapshot.forEach((doc) => {
            results.push({ id: doc.id, ...doc.data() });
          });

          const areaSnapshot = await db
            .collection("recipes")
            .where("area", "in", userPreferences)
            .get();

          areaSnapshot.forEach((doc) => {
            results.push({ id: doc.id, ...doc.data() });
          });

          // Remove duplicate recipes by using a Map with recipe IDs as keys
          const uniqueResults = new Map();
          results.forEach((recipe) => {
            uniqueResults.set(recipe.id, recipe);
          });

          results = Array.from(uniqueResults.values());
        }
      }

      setSearchResults(results);
    } catch (error) {
      console.log("Error during search:", error);
    }
  };

  return (
    <div>
        <p>Search</p>
    </div>
  );
}

export default Search;
