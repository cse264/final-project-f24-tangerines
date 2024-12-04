import React, { useState, useEffect } from "react";
import "./Search.css";
import { db, auth } from "../../firebase";

const Search = () => {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchType, setSearchType] = useState("recipe");
  const [userPreferences, setUserPreferences] = useState([]);

  // Fetch user preferences when the component mounts
  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userRef = db.collection("users").doc(currentUser.email);
          const doc = await userRef.get();

          if (doc.exists) {
            setUserPreferences(doc.data().preferences || []);
          }
        } else {
          console.log("No user is signed in");
        }
      } catch (error) {
        console.error("Error fetching user preferences:", error);
      }
    };

    fetchUserPreferences();
  }, []);

  // Handle search logic
  const handleSearch = async () => {
    if (!search.trim() && searchType !== "preferences") {
      console.log("Please enter a valid search term.");
      return;
    }

    try {
      let results = [];

      switch (searchType) {
        case "recipe":
          results = await searchByRecipeTitle(search);
          break;
        case "ingredient":
          results = await searchByIngredient(search);
          break;
        case "preferences":
          results = await searchByPreferences(userPreferences);
          break;
        default:
          console.log("Invalid search type.");
          break;
      }

      setSearchResults(results);
    } catch (error) {
      console.error("Error during search:", error);
    }
  };

  const searchByRecipeTitle = async (query) => {
    const results = [];
    const searchTerm = query.toLowerCase(); // Convert the query to lowercase
  
    console.log("Search query term:", searchTerm); // Debugging: Check the query term
  
    try {
      const querySnapshot = await db.collection("recipes").get(); // Get all recipes
  
      console.log("Query executed successfully."); // Debugging: Query executed
      console.log("Total recipes retrieved:", querySnapshot.size); // Debugging: Total recipes
  
      querySnapshot.forEach((doc) => {
        const recipe = doc.data();
        const title = recipe.title.toLowerCase(); // Convert title to lowercase
  
        if (title.includes(searchTerm)) { // Check if the title includes the search term
          console.log("Found matching recipe:", recipe); // Debugging: Log each match
          results.push({ id: doc.id, ...recipe });
        }
      });
  
      if (results.length === 0) {
        console.log("No recipes found for query:", query); // Debugging: No results
      }
    } catch (error) {
      console.error("Error fetching recipes:", error); // Debugging: Log any errors
    }
  
    console.log("Final search results:", results); // Debugging: Final results
    return results;
  };
  
  

  // Search by Ingredient
  const searchByIngredient = async (ingredient) => {
    const results = [];
    const querySnapshot = await db.collection("recipes").get();

    querySnapshot.forEach((doc) => {
      const recipe = doc.data();
      const ingredientsArray = recipe.ingredients || [];

      if (
        ingredientsArray.some(
          (item) => item.ingredient.toLowerCase() === ingredient.toLowerCase()
        )
      ) {
        results.push({ id: doc.id, ...recipe });
      }
    });

    return results;
  };

  // Search by User Preferences
  const searchByPreferences = async (preferences) => {
    if (!preferences || preferences.length === 0) {
      console.log("No user preferences available.");
      return [];
    }

    let results = [];

    // Search by category, tags, and area
    const queries = [
      db.collection("recipes").where("category", "in", preferences).get(),
      db
        .collection("recipes")
        .where("tags", "array-contains-any", preferences)
        .get(),
      db.collection("recipes").where("area", "in", preferences).get(),
    ];

    const querySnapshots = await Promise.allSettled(queries);

    querySnapshots.forEach((result) => {
      if (result.status === "fulfilled") {
        result.value.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() });
        });
      }
    });

    // Remove duplicate recipes
    const uniqueResults = new Map();
    results.forEach((recipe) => uniqueResults.set(recipe.id, recipe));
    return Array.from(uniqueResults.values());
  };

  return (
    <div className="search-container">
      <h1>Search Recipes</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for a recipe or ingredient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={searchType === "preferences"}
        />
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
        >
          <option value="recipe">Search by Recipe</option>
          <option value="ingredient">Search by Ingredient</option>
          <option value="preferences">Search by Preferences</option>
        </select>
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="search-results">
        {searchResults.length > 0 ? (
          <ul>
            {searchResults.map((result) => (
              <li key={result.id}>
                <h2>{result.title}</h2>
                <p>{result.instructions.substring(0, 100)}...</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No results found.</p>
        )}
      </div>
    </div>
  );
};

export default Search;
