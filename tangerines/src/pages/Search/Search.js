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
    const searchTerm = query.toLowerCase();

    try {
      const querySnapshot = await db.collection("recipes").get();

      querySnapshot.forEach((doc) => {
        const recipe = doc.data();
        const title = recipe.title.toLowerCase();

        if (title.includes(searchTerm)) {
          results.push({ id: doc.id, ...recipe });
        }
      });

      return results;
    } catch (error) {
      console.error("Error fetching recipes:", error);
      return [];
    }
  };

  const searchByIngredient = async (ingredient) => {
    if (!ingredient.trim()) return [];

    try {
      const results = [];
      const querySnapshot = await db.collection("recipes").get();

      querySnapshot.forEach((doc) => {
        const recipe = doc.data();
        const ingredientsArray = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];

        const match = ingredientsArray.some((item) =>
          item.ingredient?.toLowerCase().includes(ingredient.toLowerCase())
        );

        if (match) {
          results.push({ id: doc.id, ...recipe });
        }
      });

      return results;
    } catch (error) {
      console.error("Error searching by ingredient:", error);
      return [];
    }
  };

  const searchByPreferences = async (preferences) => {
    if (!preferences || preferences.length === 0) return [];

    try {
      let results = [];
      const areaQuery = db.collection("recipes").where("area", "in", preferences).get();
      const categoryQuery = db.collection("recipes").where("category", "in", preferences).get();

      const ingredientsResults = [];
      const querySnapshot = await db.collection("recipes").get();

      querySnapshot.forEach((doc) => {
        const recipe = doc.data();
        const ingredientsArray = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];

        const match = ingredientsArray.some((item) =>
          preferences.some((preference) =>
            item.ingredient?.toLowerCase().includes(preference.toLowerCase())
          )
        );

        if (match) {
          ingredientsResults.push({ id: doc.id, ...recipe });
        }
      });

      const [areaSnapshot, categorySnapshot] = await Promise.all([areaQuery, categoryQuery]);

      areaSnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });

      categorySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });

      results = [...results, ...ingredientsResults];
      const uniqueResults = new Map();
      results.forEach((recipe) => uniqueResults.set(recipe.id, recipe));
      return Array.from(uniqueResults.values());
    } catch (error) {
      console.error("Error searching by preferences:", error);
      return [];
    }
  };

  return (
    <div>
      <NavBar />
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
          <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
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
    </div>
  );
};

export default Search;
