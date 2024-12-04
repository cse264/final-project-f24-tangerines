import { doc, getDoc } from "firebase/firestore"; // Ensure correct Firestore imports
import React, { useEffect, useState } from "react";
import { db } from "../../firebase"; // Adjust path to your Firebase configuration
import "./ExampleRecipe.css"; // Import your custom CSS

// remeber to change the test to take in an Id from home
const ExampleRecipe = () => {
  const recipeId = "52764"; // Corrected ID based on Firestore database
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const docRef = doc(db, "recipes", recipeId); // 'recipes' should match your Firestore collection name
        console.log("Fetching document with ID:", recipeId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("Fetched data:", data); // Debugging
          setRecipe(data); // Store the entire document data
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching recipe:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!recipe) {
    return <p>Recipe not found!</p>;
  }

  return (
    <div className="recipe-container">
      <h1 className="recipe-title">{recipe.title}</h1>
      <img
        src={recipe.imageURL}
        alt={recipe.title}
        className="recipe-image"
      />

      <div className="section">
        <h2 className="section-title">Ingredients</h2>
        <ul className="ingredients-list">
          {recipe.ingredients &&
            recipe.ingredients.map((ingredient, index) => (
              <li key={index}>
                <strong>{ingredient.ingredient}:</strong> {ingredient.measure}
              </li>
            ))}
        </ul>
      </div>

      <div className="section">
        <h2 className="section-title">Instructions</h2>
        <p className="instructions">{recipe.instructions}</p>
      </div>

      <button className="save-button">Save Recipe</button>
    </div>
  );
};

export default ExampleRecipe;
