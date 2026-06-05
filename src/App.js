import React, { useState, useEffect } from "react";
import "./App.css";
import RecipeForm from "./components/RecipeForm";
import RecipeResults from "./components/RecipeResults";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorMessage from "./components/ErrorMessage";
import { searchRecipes } from "./services/wordpressService";
import { getRecipeRecommendations } from "./services/claudeService";

const VIEWS = {
  FORM: "form",
  LOADING: "loading",
  RESULTS: "results",
  ERROR: "error",
};

export default function App() {
  const [view, setView] = useState(VIEWS.FORM);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  async function handleFormSubmit(inputs) {
    setView(VIEWS.LOADING);
    setError(null);
    try {
      const recipes = await searchRecipes(inputs);
      if (recipes.length === 0) {
        throw new Error(
          "No recipes found matching your search. Try different keywords!",
        );
      }
      const recommendations = await getRecipeRecommendations(recipes, inputs);
      setResults(recommendations);
      setView(VIEWS.RESULTS);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setView(VIEWS.ERROR);
    }
  }

  function handleReset() {
    setResults([]);
    setError(null);
    setView(VIEWS.FORM);
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <p className="header-eyebrow">Pretty Pastelitos</p>
          <h1 className="header-title">Find Your Perfect Recipe</h1>
          <p className="header-subtitle">
            Tell me what you're craving and I'll match you with the best recipes
            from the blog.
          </p>
        </div>
      </header>

      <main className="app-main">
        {view === VIEWS.FORM && <RecipeForm onSubmit={handleFormSubmit} />}
        {view === VIEWS.LOADING && <LoadingSpinner />}
        {view === VIEWS.RESULTS && (
          <RecipeResults results={results} onReset={handleReset} />
        )}
        {view === VIEWS.ERROR && (
          <ErrorMessage
            message={error}
            onRetry={handleReset}
            retryLabel="Try Again"
          />
        )}
      </main>

      <footer className="app-footer">
        <p>
          Recipes from{" "}
          <a
            href={
              process.env.REACT_APP_WP_URL || "https://prettypastelitos.com"
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            Pretty Pastelitos
          </a>{" "}
          · Powered by Claude AI
        </p>
      </footer>
    </div>
  );
}
