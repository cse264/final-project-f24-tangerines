import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    arrayUnion,
  } from "firebase/firestore"; // Import necessary Firestore methods
  import React, { useEffect, useState } from "react";
  import { db } from "../../firebase"; // Adjust path to your Firebase configuration
  import { getAuth } from "firebase/auth"; // Import Firebase Auth for the logged-in user's email
  import { useParams } from "react-router-dom"; // Import useParams for dynamic URL handling
  import NavBar from "../navbar/NavBar";
  import "./ExampleRecipe.css"; // Import your custom CSS
  
  const ExampleRecipe = () => {
    const { title } = useParams(); // Retrieve title from the URL
    const [recipeId, setRecipeId] = useState(null);
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState(""); // Status message for save operation
  
    const auth = getAuth(); // Initialize Firebase Auth
    const userEmail = auth.currentUser?.email; // Get the logged-in user's email
  
    useEffect(() => {
      const fetchRecipeIdByTitle = async () => {
        try {
          const recipesRef = collection(db, "recipes");
          const q = query(recipesRef, where("title", "==", title)); // Query by title
          const querySnapshot = await getDocs(q);
  
          if (!querySnapshot.empty) {
            const recipeDoc = querySnapshot.docs[0]; // Get the first matching document
            setRecipeId(recipeDoc.id); // Set the recipe ID
          } else {
            console.error(`No recipe found with title: ${title}`);
          }
        } catch (error) {
          console.error("Error fetching recipe ID by title:", error);
        }
      };
  
      fetchRecipeIdByTitle();
    }, [title]);
  
    useEffect(() => {
      const fetchRecipe = async () => {
        if (!recipeId) return;
  
        try {
          const docRef = doc(db, "recipes", recipeId); // Fetch the recipe
          const docSnap = await getDoc(docRef);
  
          if (docSnap.exists()) {
            const data = docSnap.data();
            setRecipe(data); // Store the recipe data
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
  
    const handleSaveRecipe = async () => {
      if (!userEmail) {
        setSaveStatus("You need to be logged in to save a recipe.");
        return;
      }
  
      try {
        const userRef = doc(db, "users", userEmail); // Use email as the document ID
        await updateDoc(userRef, {
          savedRecipies: arrayUnion(recipeId), // Add recipeId to savedRecipes array
        });
        setSaveStatus("Recipe saved successfully!"); // Update save status
      } catch (error) {
        console.error("Error saving recipe:", error);
        setSaveStatus("Failed to save recipe."); // Update save status
      }
    };
  
    if (loading) {
      return <p>Loading...</p>;
    }
  
    if (!recipe) {
      return <p>Recipe not found!</p>;
    }
  
    return (
      <div className="page-container">
        <NavBar /> {/* Add the NavBar at the top */}
        <h1 className="recipe-title">{recipe.title}</h1>
        <div className="grey-container">
          <img
            src={recipe.imageURL}
            alt={recipe.title}
            className="recipe-image"
          />
        </div>
  
        <div className="grey-container">
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
  
        <div className="grey-container">
          <h2 className="section-title">Instructions</h2>
          <p className="instructions">{recipe.instructions}</p>
        </div>
  
        <button className="save-button" onClick={handleSaveRecipe}>
          Save Recipe
        </button>
        {saveStatus && <p className="save-status">{saveStatus}</p>} {/* Display save status */}
      </div>
    );
  };
  
  export default ExampleRecipe;
  