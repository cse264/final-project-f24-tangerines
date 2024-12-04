import React, { useState, useEffect } from 'react';
import './Search.css';
import { db, auth } from '../../firebase';

function Search() {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchType, setSearchType] = useState('recipe');
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
        // Query the "recipes" collection by the "title" field
        const querySnapshot = await db.collection('recipes')
          .where("title", "==", search)
          .get();

        querySnapshot.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() });
        });
      } else if (searchType === "ingredient") {
        // Query the "recipes" collection for ingredients
        const querySnapshot = await db.collection('recipes')
          .where("ingredients.ingredient", "array-contains", search)
          .get();
        
        querySnapshot.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() });
        });
      } else if (searchType === "preferences") {
        if (userPreferences === null || userPreferences.length === 0) {
          console.log("No user preferences available");
        } else {
          // Query recipes based on user preferences (e.g., categories or areas)
          const querySnapshot = await db.collection('recipes')
            .where("category", "in", userPreferences)
            .get();

          querySnapshot.forEach((doc) => {
            results.push({ id: doc.id, ...doc.data() });
          });
        }
      }

      setSearchResults(results);
    } catch (error) {
      console.log("Error during search:", error);
    }
  };

  return (
    <div className="search-container">
      <h1>Recipe Search</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Enter your search term..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
          <option value="recipe">Search by Recipe Name</option>
          <option value="ingredient">Search by Ingredient</option>
          <option value="preferences">Search by Preferences</option>
        </select>
        <button onClick={handleSearch}>Search</button>
      </div>
      <div className="search-results">
        {searchResults.length > 0 ? (
          <ul>
            {searchResults.map((result, index) => (
              <li key={index}>
                <h3>{result.title}</h3>
                <p><strong>Category:</strong> {result.category}</p>
                <p><strong>Area:</strong> {result.area}</p>
                <p><strong>Instructions:</strong> {result.instructions}</p>
                <img src={result.imageURL} alt={result.title} style={{ width: '200px', height: 'auto' }} />
              </li>
            ))}
          </ul>
        ) : (
          <p>No results found</p>
        )}
      </div>
    </div>
  );
}

export default Search;
