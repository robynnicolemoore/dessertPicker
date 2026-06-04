import React, { useState, useEffect } from 'react';
import './App.css';
import RecipeForm from './components/RecipeForm';
import RecipeResults from './components/RecipeResults';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import { fetchRecentRecipes } from './services/wordpressService';
import { getRecipeRecommendations } from './services/claudeService';

const VIEWS = { FORM: 'form', LOADING: 'loading', RESULTS: 'results', ERROR: 'error' };

export default function App() {
  const [recipes, setRecipes] = useState([]);
  const [recipesLoading, setRecipesLoading] = useState(true);
  const [recipesError, setRecipesError] = useState(null);
  const [view, setView] = useState(VIEWS.FORM);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecentRecipes()
      .then(setRecipes)
      .catch(() => setRecipesError('We had trouble loading recipes from the blog. Please try refreshing.'))
      .finally(() => setRecipesLoading(false));
  }, []);

  async function handleFormSubmit(inputs) {
    if (recipes.length === 0) {
      setError('No recipes loaded yet. Please try refreshing the page.');
      setView(VIEWS.ERROR);
      return;
    }
    setView(VIEWS.LOADING);
    setError(null);
    try {
      const recommendations = await getRecipeRecommendations(recipes, inputs);
      setResults(recommendations);
      setView(VIEWS.RESULTS);
    } catch (err) {
      setError(err.message || 'Something went wrong finding your recipes. Please try again.');
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
          <p className="header-subtitle">Tell me what you're craving and I'll match you with the best recipes from the blog.</p>
        </div>
      </header>

      <main className="app-main">
        {view === VIEWS.FORM && (
          recipesError ? (
            <ErrorMessage message={recipesError} onRetry={() => window.location.reload()} retryLabel="Refresh Page" />
          ) : (
            <RecipeForm onSubmit={handleFormSubmit} isLoadingRecipes={recipesLoading} recipeCount={recipes.length} />
          )
        )}
        {view === VIEWS.LOADING && <LoadingSpinner />}
        {view === VIEWS.RESULTS && <RecipeResults results={results} onReset={handleReset} />}
        {view === VIEWS.ERROR && <ErrorMessage message={error} onRetry={handleReset} retryLabel="Try Again" />}
      </main>

      <footer className="app-footer">
        <p>Recipes from <a href={process.env.REACT_APP_WP_URL || 'https://prettypastelitos.com'} target="_blank" rel="noopener noreferrer">Pretty Pastelitos</a> · Powered by Claude AI</p>
      </footer>
    </div>
  );
}
