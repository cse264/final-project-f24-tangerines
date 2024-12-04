// NOTE: SIGN UP BACK BUTTON DOESN'T WORKx

import React from "react";
import { useState } from "react";
import "./LogIn.css";
import LogoImage from "../../assets/images/Logo Header.svg";
import { db, auth, provider, firebase } from "../../firebase";
import { useNavigate } from 'react-router-dom';

function LogIn() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSignUpVisible, setIsSignUpVisible] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
  };

  const hideSignUp = () => {
    setIsSignUp(false); 
    setIsSignUpVisible(true);
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await auth.signInWithPopup(provider);
      const user = result.user;

      console.log("User:", user);
      const userRef = db.collection("users").doc(user.email); //Reference to location in database
      const doc = await userRef.get();
      if (!doc.exists) {
        //checking if user exists
        await userRef.set({
          //setting user data
          uid: user.uid,
          email: user.email,
          shoppingList: [],
          isChef: false,
          allergies: [],
          likedRecipes: [],
          savedRecipies: [],
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }

      console.log("User signed in and data stored:", user);
    } catch (error) {
      console.error("Google Sign-In error:", error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await auth.signInWithEmailAndPassword(email, password); //uses firebase auth to sign in
      console.log("User logged in");
    } catch (error) {
      setError(error.message); // Display any errors
      console.error("Error logging in:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(
        email,
        password
      ); //firebase Auth
      const user = userCredential.user;

      await db.collection("users").doc(user.email).set({
        uid: user.uid,
        email: user.email,
        shoppingList: [],
        isChef: false,
        allergies: [],
        likedRecipes: [],
        savedRecipies: [],
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      console.log("User signed up:", user);
    } catch (error) {
      setError(error.message);
      console.error("Error signing up:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {isSignUpVisible && (
        <div class="card">
          <img src={LogoImage} class="logo" alt="Tangerines Logo" />
          <h1 class="loginHeader">Log In</h1>

          <form onSubmit={handleLogin}>
            {/* Email input */}
            <div>
              <input
                type="email"
                value={email}
                class="form-control"
                id="inputEmail"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                required
              />
            </div>

            {/* Password input */}
            <div class="form-group">
              <input
                type="password"
                class="form-control"
                id="inputPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                required
              />
            </div>

            <p class="error">Username/Password not found. Please try again.</p>

            {/* Submit/Log In */}
            <button type="submit" class="btn btn-primary" onClick={() => navigate("/search")}>
              Log In
            </button>
            {/* Google Sign-In */}
            <p class="or">or</p>
            <button
              type="googleSubmit"
              className="btn btn-primary"
              onClick={handleGoogleSignIn}
            >
              Google Log In
            </button>

            {/* Sign Up */}
            <p class="or">or</p>
            <p class="signUp">
              Dont have an account?{" "}
              <span class="signUpLink" onClick={toggleForm}>
                Sign Up
              </span>
            </p>
          </form>
        </div>
      )}

      {/* SignUp Overlay */}
      {isSignUp && (
        <div class="overlay">
          <div class="overlay-form">
            <h2>Create New Account</h2>
            <form onSubmit={handleSignUp}>
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  class="form-control"
                />
              </div>
              <div>
                <input
                  type="password"
                  value={password}
                  class="form-control"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
              </div>
              {error && <p style={{ color: "red" }}>{error}</p>}
              <button type="submit" disabled={loading}>
                {loading ? "Signing up..." : "Sign Up"}
              </button>

              <p class="or">or</p>
              <p class="backToLogin" onClick={hideSignUp}>
                Back to Log In
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LogIn;
