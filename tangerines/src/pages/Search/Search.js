import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import "./Search.css";
import { db, auth } from "../../firebase";
import NavBar from "../navbar/NavBar";


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

        if (title.includes(searchTerm)) {
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
    if (!ingredient.trim()) {
      console.error("Ingredient is empty or invalid.");
      return [];
    }
  
    try {
      const results = [];
      const querySnapshot = await db.collection("recipes").get();
  
      querySnapshot.forEach((doc) => {
        const recipe = doc.data();
        // Ensure ingredientsArray is always an array
        const ingredientsArray = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  
        console.log("Processing Recipe ID:", doc.id); // Debugging: Log Recipe ID
        console.log("Ingredients Array:", ingredientsArray); // Debugging: Log Ingredients Array
  
        // Check if any map in the array contains the matching ingredient (case-insensitive)
        const match = ingredientsArray.some(
          (item) =>
            item.ingredient?.toLowerCase().includes(ingredient.toLowerCase())
        );
  
        if (match) {
          results.push({ id: doc.id, ...recipe });
        }
      });
  
      if (results.length === 0) {
        console.log(`No recipes found containing ingredient: ${ingredient}`);
      }
  
      return results;
    } catch (error) {
      console.error("Error searching by ingredient:", error);
      return [];
    }
  };
  
  

  // Search by User Preferences
  const searchByPreferences = async (preferences) => {
    if (!preferences || preferences.length === 0) {
      console.log("No user preferences available.");
      return [];
    }
  
    try {
      let results = [];
  
      // Search by area, ingredients, and categories
      const areaQuery = db.collection("recipes").where("area", "in", preferences).get();
      const categoryQuery = db.collection("recipes").where("category", "in", preferences).get();
  
      const ingredientsResults = [];
      const querySnapshot = await db.collection("recipes").get();
  
      // Search ingredients manually since Firestore does not support array-of-map querying
      querySnapshot.forEach((doc) => {
        const recipe = doc.data();
        const ingredientsArray = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  
        // Check if any ingredient matches the user's preferences
        const match = ingredientsArray.some((item) =>
          preferences.some((preference) =>
            item.ingredient?.toLowerCase().includes(preference.toLowerCase())
          )
        );
  
        if (match) {
          ingredientsResults.push({ id: doc.id, ...recipe });
        }
      });
  
      // Combine all queries using Promise.all
      const [areaSnapshot, categorySnapshot] = await Promise.all([areaQuery, categoryQuery]);
  
      areaSnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
  
      categorySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
  
      // Add ingredients-based matches
      results = [...results, ...ingredientsResults];
  
      // Remove duplicate recipes by ID
      const uniqueResults = new Map();
      results.forEach((recipe) => uniqueResults.set(recipe.id, recipe));
      return Array.from(uniqueResults.values());
    } catch (error) {
      console.error("Error searching by preferences:", error);
      return [];
    }
  };
  

  return (
    
    <div className="search-container">
      <NavBar />
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
                {/* Link to ExampleRecipe page with the recipe title */}
                <Link to={`/recipe/${result.title}`}>
                  <h2>{result.title}</h2>
                </Link>
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
