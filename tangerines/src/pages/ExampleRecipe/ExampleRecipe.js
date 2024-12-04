import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
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
    const [rating, setRating] = useState(0); // User's selected rating
    const [averageRating, setAverageRating] = useState(null); // Average rating of the recipe
  
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
            setAverageRating(data.averageRating || null); // Set the average rating
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
          savedRecipes: arrayUnion(recipeId), // Add recipeId to savedRecipes array
        });
        setSaveStatus("Recipe saved successfully!"); // Update save status
      } catch (error) {
        console.error("Error saving recipe:", error);
        setSaveStatus("Failed to save recipe."); // Update save status
      }
    };
  
    const handleRatingSubmit = async () => {
      if (!userEmail) {
        setSaveStatus("You need to be logged in to rate a recipe.");
        return;
      }
  
      try {
        const recipeRef = doc(db, "recipes", recipeId);
        const updatedRatings = recipe.ratings || [];
  
        // Add user's rating
        const newRating = {
          userEmail,
          value: rating,
        };
  
        const existingRatingIndex = updatedRatings.findIndex(
          (r) => r.userEmail === userEmail
        );
  
        if (existingRatingIndex !== -1) {
          // Replace existing rating
          updatedRatings[existingRatingIndex] = newRating;
        } else {
          // Add new rating
          updatedRatings.push(newRating);
        }
  
        // Calculate new average rating
        const totalRating = updatedRatings.reduce(
          (sum, r) => sum + r.value,
          0
        );
        const avgRating = totalRating / updatedRatings.length;
  
        // Update Firestore
        await updateDoc(recipeRef, {
          ratings: updatedRatings,
          averageRating: avgRating,
        });
  
        setAverageRating(avgRating); // Update local state
        setRecipe((prev) => ({
          ...prev,
          ratings: updatedRatings,
          averageRating: avgRating,
        }));
        setSaveStatus("Rating submitted successfully!");
      } catch (error) {
        console.error("Error submitting rating:", error);
        setSaveStatus("Failed to submit rating.");
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
        <NavBar />
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
  
        <div className="rating-container">
          <h2 className="section-title">Rating</h2>
          <p>Average Rating: {averageRating ? averageRating.toFixed(1) : "N/A"}</p>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            <option value="" disabled>
              Select Rating
            </option>
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value} Star{value > 1 ? "s" : ""}
              </option>
            ))}
          </select>
          <button className="save-button" onClick={handleRatingSubmit}>
            Submit Rating
          </button>
        </div>
  
        <button className="save-button" onClick={handleSaveRecipe}>
          Save Recipe
        </button>
        {saveStatus && <p className="save-status">{saveStatus}</p>}
      </div>
    );
  };
  
  export default ExampleRecipe;
  