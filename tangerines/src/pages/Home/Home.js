import React, { useState, useEffect } from "react";
import { db, auth, firebase } from "../../firebase";
import "./Home.css";
import { Link } from "react-router-dom";
import NavBar from "../navbar/NavBar";
import { FaHeart, FaRegHeart } from "react-icons/fa"; // Import heart icons

function Home() {
  const [recipes, setRecipes] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [newRecipe, setNewRecipe] = useState({
    title: "",
    description: "",
    ingredients: "",
    steps: "",
  });
  const [showAddRecipeForm, setShowAddRecipeForm] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userDoc = await db.collection("users").doc(user.email).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          setUserRole(userData.role || "");
          setPreferences(userData.preferences || []);
          setSavedRecipes(userData.savedRecipes || []);
        }

        await fetchRecipes(userDoc?.data()?.preferences || []);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data.");
      }
    };

    fetchUserData();
  }, []);

  const toggleSaveRecipe = async (recipeId) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setError("You must be logged in to save a recipe.");
        return;
      }
  
      const recipeRef = db.collection("recipes").doc(recipeId);
      const userRef = db.collection("users").doc(user.email);
  
      let updatedSavedRecipes;
      if (savedRecipes.includes(recipeId)) {
        // Remove the recipe from savedRecipes
        updatedSavedRecipes = savedRecipes.filter((id) => id !== recipeId);
        await userRef.update({
          savedRecipes: firebase.firestore.FieldValue.arrayRemove(recipeId),
        });
        await recipeRef.update({
          saves: firebase.firestore.FieldValue.increment(-1),
        });
      } else {
        // Add the recipe to savedRecipes
            updatedSavedRecipes = [...savedRecipes, recipeId];
        await userRef.update({
          savedRecipes: firebase.firestore.FieldValue.arrayUnion(recipeId),
        });
        await recipeRef.update({
          saves: firebase.firestore.FieldValue.increment(1),
        });
      }
  
      setSavedRecipes(updatedSavedRecipes);
    } catch (err) {
      console.error("Error toggling save: ", err);
      setError("Failed to save the recipe.");
    }
  };
  

  const fetchRecipes = async (preferences) => {
    try {
      const recipesRef = db.collection("recipes");
      const allRecipes = [];
      const queries = [];

      if (preferences.length > 0) {
        queries.push(recipesRef.where("area", "in", preferences).get());
        queries.push(recipesRef.where("category", "in", preferences).get());
      }

      const snapshots = await Promise.all(queries);

      snapshots.forEach((snapshot) => {
        snapshot.forEach((doc) => {
          allRecipes.push({ id: doc.id, ...doc.data() });
        });
      });

      setRecipes(allRecipes);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setError("Failed to load recipes.");
    }
  };

  const handleAddRecipe = async (e) => {
    e.preventDefault();

    try {
      const user = auth.currentUser;
      if (!user) {
        setError("You must be logged in to add a recipe.");
        return;
      }

      if (userRole !== "chef") {
        setError("Only chefs can add recipes.");
        return;
      }

      // Validate newRecipe fields
      if (
        !newRecipe.title.trim() ||
        !newRecipe.description.trim() ||
        !newRecipe.ingredients.trim() ||
        !newRecipe.steps.trim()
      ) {
        setError("All fields are required to add a recipe.");
        return;
      }

      const recipesRef = db.collection("recipes");
      await recipesRef.add({
        ...newRecipe,
        chefEmail: user.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        tags: newRecipe.ingredients
          .split(",")
          .map((ing) => ing.trim()) // Convert ingredients to an array of trimmed strings
          .filter((ing) => ing !== ""), // Remove any empty strings
      });

      setNewRecipe({ title: "", description: "", ingredients: "", steps: "" });
      await fetchRecipes(preferences); // Refresh the recipe feed
      setError(""); // Clear error messages on success
      setShowAddRecipeForm(false); // Close the form
    } catch (err) {
      console.error("Error adding recipe:", err);
      setError("Failed to add the recipe. Please try again.");
    }
  };

  return (
    <div className="home">
      <NavBar />
    
      {/* Add Recipe Button */}
      {userRole === "chef" && (
        <div className="add-recipe-button">
            
          <button onClick={() => setShowAddRecipeForm(!showAddRecipeForm)}>
            {showAddRecipeForm ? "Close Recipe Form" : "Add Recipe"}
          </button>
        </div>
      )}

      {/* Add Recipe Form */}
      {showAddRecipeForm && (

        <form className="add-recipe-form" onSubmit={handleAddRecipe}>
            
          <h2>Add a New Recipe</h2>
          <input
            type="text"
            placeholder="Title"
            value={newRecipe.title}
            onChange={(e) =>
              setNewRecipe({ ...newRecipe, title: e.target.value })
            }
            required
          />
          <textarea
            placeholder="Description"
            value={newRecipe.description}
            onChange={(e) =>
              setNewRecipe({ ...newRecipe, description: e.target.value })
            }
            required
          ></textarea>
          <input
            type="text"
            placeholder="Ingredients (comma-separated)"
            value={newRecipe.ingredients}
            onChange={(e) =>
              setNewRecipe({ ...newRecipe, ingredients: e.target.value })
            }
            required
          />
          <textarea
            placeholder="Steps"
            value={newRecipe.steps}
            onChange={(e) =>
              setNewRecipe({ ...newRecipe, steps: e.target.value })
            }
            required
          ></textarea>
          <button type="submit">Submit Recipe</button>
        </form>
      )}

      <h3 className="center-text">Welcome to Your Feed</h3>
      {loading ? (
        <p className="center-text">Loading recipes...</p>
      ) : error ? (
        <p className="center-text error">{error}</p>
      ) : recipes.length === 0 ? (
        <p className="center-text">No recipes found. Try updating your preferences.</p>
      ) : (
        <div className="recipes">
  {recipes.map((recipe) => (
    <div className="recipe-card" key={recipe.id}>
      <img
        className="recipe-image"
        src={recipe.imageURL}
      />
      
      <Link to={`/recipe/${recipe.title}`} className="recipe-title">
        <h2>{recipe.title}</h2>
      </Link>
      <p className="recipe-description">{recipe.description}</p>

      {/* Display saves and rating */}
      <div className="recipe-stats ">
        <p>
          <strong>Saves:</strong> {recipe.saves || 0}
        </p>
        <p>
          <strong>Rating:</strong> {recipe.rating ? recipe.rating.toFixed(1) : "N/A"}
        </p>
      </div>

      <div className="recipe-actions">
        <button
          className="save-button"
          onClick={() => toggleSaveRecipe(recipe.id)}
        >
          {savedRecipes.includes(recipe.id) ? (
            <FaHeart className="heart-icon saved" />
          ) : (
            <FaRegHeart className="heart-icon" />
          )}
        </button>
      </div>
    </div>
  ))}
        </div>
      )}
    </div>
  );
}

export default Home;
