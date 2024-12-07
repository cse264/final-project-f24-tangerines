import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { Link, useNavigate } from "react-router-dom"; // Import Link and navigate
import "./FoodCategories.css";
import NavBar from "../navbar/NavBar";
import { FaHeart, FaRegHeart } from "react-icons/fa"; // Import heart icons for save button

const FoodCategories = () => {
  const [categories, setCategories] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [savedRecipes, setSavedRecipes] = useState([]); // State to track saved recipes
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all unique categories from Firestore
    db.collection("recipes")
      .get()
      .then((snapshot) => {
        const uniqueCategories = new Set();
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.category) {
            uniqueCategories.add(data.category);
          }
        });
        setCategories([...uniqueCategories]);
      })
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  const fetchRecipesByCategory = (category) => {
    setSelectedCategory(category);

    db.collection("recipes")
      .where("category", "==", category)
      .get()
      .then((snapshot) => {
        const categoryRecipes = [];
        snapshot.forEach((doc) => {
          categoryRecipes.push({ id: doc.id, ...doc.data() });
        });
        setRecipes(categoryRecipes);
      })
      .catch((error) => console.error("Error fetching recipes:", error));
  };

  const toggleSaveRecipe = (recipeId) => {
    setSavedRecipes((prev) =>
      prev.includes(recipeId)
        ? prev.filter((id) => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  return (
    <div className="food-categories">
      <NavBar />
      {!selectedCategory && (
        <>
          <br />
          <br />
          <h1>Food Categories</h1>
          <br />
          <div className="categories-grid">
            {categories.map((category) => (
              <div
                key={category}
                className="category-card"
                onClick={() => fetchRecipesByCategory(category)}
              >
                {category}
              </div>
            ))}
          </div>
        </>
      )}

      {selectedCategory && (
        <>
        <br></br>
        <br></br>
          <h1>Recipes in {selectedCategory}</h1>
          <br></br>
          <button
            className="back-button"
            onClick={() => setSelectedCategory(null)}
          >
            Back to Categories
          </button>
          <div className="recipes-grid">
            {recipes.map((recipe) => (
              <div className="recipe-card" key={recipe.id}>
                <img
                  className="recipe-image"
                  src={recipe.imageURL}
                  alt={recipe.title}
                />
                <Link to={`/recipe/${recipe.title}`} className="recipe-title">
                  <h2>{recipe.title}</h2>
                </Link>
                <p className="recipe-description">{recipe.description}</p>
                <div className="recipe-stats">
                  <p>
                    <strong>Saves:</strong> {recipe.saves || 0}
                  </p>
                  <p>
                    <strong>Rating:</strong>{" "}
                    {recipe.rating ? recipe.rating.toFixed(1) : "N/A"}
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
        </>
      )}
    </div>
  );
};

export default FoodCategories;
