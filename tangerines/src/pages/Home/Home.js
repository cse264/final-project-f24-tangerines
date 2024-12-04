import React, { useState, useEffect } from "react";
import { db, auth, firebase } from "../../firebase";
import "./Home.css";
import "../navbar/NavBar.css";
import { Link } from "react-router-dom";
import logo from "../../assets/images/Logo.svg";
import searchIcon from "../../assets/images/Search Icon.svg";
import MyRecipeIcon from "../../assets/images/Recipe Button.svg";
import ExploreRecipesIcon from "../../assets/images/Food Button.svg";
import ViewChefsIcon from "../../assets/images/View Chefs Button.svg";
import HomeIcon from "../../assets/images/On Hover.svg";

function Home() {
  const [recipes, setRecipes] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newRecipe, setNewRecipe] = useState({
    title: "",
    description: "",
    ingredients: "",
    instructions: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userDoc = await db.collection("users").doc(user.email).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          setUserRole(userData.role);
          setPreferences(userData.preferences || []);
        }

        await fetchRecipes(userDoc.data().preferences || []);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data.");
      }
    };

    fetchUserData();
  }, []);

  const fetchRecipes = async (preferences) => {
    try {
      const recipesRef = db.collection("recipes");
      const query = recipesRef.where("title", "ingredients", "array-contains-any", preferences);
      const snapshot = await query.get();

      const recipesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setRecipes(recipesData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setError("Failed to load recipes.");
    }
  };

  const handleSaveRecipe = async (recipeId) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = db.collection("users").doc(user.email);
      await userRef.update({
        savedRecipes: firebase.firestore.FieldValue.arrayUnion(recipeId),
      });
    } catch (err) {
      console.error("Error saving recipe:", err);
      setError("Failed to save the recipe.");
    }
  };

  const handleAddRecipe = async (e) => {
    e.preventDefault();

    try {
      const user = auth.currentUser;
      if (!user || userRole !== "chef") return;

      const recipesRef = db.collection("recipes");
      await recipesRef.add({
        ...newRecipe,
        chefEmail: user.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        tags: newRecipe.ingredients.split(",").map((ing) => ing.trim()),
      });

      setNewRecipe({ title: "", description: "", ingredients: "", steps: "" });
      await fetchRecipes(preferences); // Refresh the recipe feed
    } catch (err) {
      console.error("Error adding recipe:", err);
      setError("Failed to add the recipe.");
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    try {
      if (userRole !== "chef") return;

      const recipeRef = db.collection("recipes").doc(recipeId);
      await recipeRef.delete();
      await fetchRecipes(preferences); // Refresh the recipe feed
    } catch (err) {
      console.error("Error deleting recipe:", err);
      setError("Failed to delete the recipe.");
    }
  };

  const handleAddComment = async (recipeId, comment) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
  
      const recipeRef = db.collection("recipes").doc(recipeId);
      await recipeRef.update({
        comments: firebase.firestore.FieldValue.arrayUnion({
          userEmail: user.email,
          content: comment,
          createdAt: new Date(),
        }),
      });
  
      await fetchRecipes(preferences); // Refresh the recipes
    } catch (err) {
      console.error("Error adding comment:", err);
      setError("Failed to add the comment.");
    }
  };
  
  const handleAddReview = async (recipeId, rating) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
  
      const recipeRef = db.collection("recipes").doc(recipeId);
      const recipeDoc = await recipeRef.get();
      if (!recipeDoc.exists) return;
  
      const recipeData = recipeDoc.data();
      const newRating = {
        userEmail: user.email,
        rating,
      };
  
      const updatedRatings = [...(recipeData.ratings || []), newRating];
      const averageRating =
        updatedRatings.reduce((sum, r) => sum + r.rating, 0) / updatedRatings.length;
  
      await recipeRef.update({
        ratings: updatedRatings,
        averageRating,
      });
  
      await fetchRecipes(preferences); // Refresh the recipes
    } catch (err) {
      console.error("Error adding review:", err);
      setError("Failed to add the review.");
    }
  };

  return (
    <div className="home">
      {/* Navbar at the top */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        {/* NavBar Logo */}
        <a className="navbar-brand" href="/">
          <img className="logo" src={logo} alt="Logo" />
        </a>
  
        {/* Toggle button for smaller screens */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
  
        {/* Navbar links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item active">
              <Link className="navbar-link" to="/search">
                <img className="search-icon" src={searchIcon} alt="Search" />
              </Link>
            </li>
  
            <li className="nav-item">
              <Link className="nav-link" to="/myrecipes">
                <img
                  className="my-recipe-icon"
                  src={MyRecipeIcon}
                  alt="My Recipes"
                />
              </Link>
            </li>
  
            <li className="nav-item">
              <Link className="nav-link" to="/myinfo">
                <img className="home-icon" src={HomeIcon} alt="Home" />
              </Link>
            </li>
  
            <li className="nav-item">
              <Link className="nav-link" to="/foodcategories">
                <img
                  className="explore-recipe-icon"
                  src={ExploreRecipesIcon}
                  alt="Explore Recipes"
                />
              </Link>
            </li>
  
            <li className="nav-item">
              <Link className="nav-link" to="/viewchefs">
                <img
                  className="view-chefs-icon"
                  src={ViewChefsIcon}
                  alt="View Chefs"
                />
              </Link>
            </li>
          </ul>
        </div>
      </nav>
  
      {/* Home Page Content */}
      <h3>Welcome to Your Feed</h3>
  
      {loading ? (
        <p>Loading recipes...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="recipes">
          {recipes.length === 0 ? (
            <p>No recipes found. Try updating your preferences.</p>
          ) : (
            recipes.map((recipe) => (
              <div className="recipe-card" key={recipe.id}>
                <h2>{recipe.title}</h2>
                <p>{recipe.description}</p>
                <p>
                  <strong>Ingredients:</strong> {recipe.ingredients}
                </p>
                <p>
                  <strong>Steps:</strong> {recipe.steps}
                </p>
                <p>
                  <strong>Average Rating:</strong>{" "}
                  {recipe.averageRating?.toFixed(1) || "N/A"}
                </p>
  
                <button onClick={() => handleSaveRecipe(recipe.id)}>Save</button>
  
                {userRole === "chef" &&
                  recipe.chefEmail === auth.currentUser.email && (
                    <button onClick={() => handleDeleteRecipe(recipe.id)}>
                      Delete
                    </button>
                  )}
  
                <div className="comments">
                  <h3>Comments</h3>
                  {recipe.comments?.length > 0 ? (
                    recipe.comments.map((comment, index) => (
                      <p key={index}>
                        <strong>{comment.userEmail}:</strong> {comment.content}
                      </p>
                    ))
                  ) : (
                    <p>No comments yet.</p>
                  )}
                  <input
                    type="text"
                    placeholder="Add a comment"
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        handleAddComment(recipe.id, e.target.value);
                    }}
                  />
                </div>
  
                <div className="reviews">
                  <h3>Leave a Review</h3>
                  <select
                    onChange={(e) =>
                      handleAddReview(recipe.id, parseInt(e.target.value))
                    }
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Rate this recipe
                    </option>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <option value={star} key={star}>
                        {star} Star{star > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      )}
  
      {userRole === "chef" && (
        <div className="add-recipe">
          <h2>Add a New Recipe</h2>
          <form onSubmit={handleAddRecipe}>
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
            <button type="submit">Add Recipe</button>
          </form>
        </div>
      )}
    </div>
  );
  

}

export default Home;