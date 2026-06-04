import React from 'react';
import './RecipeResults.css';

export default function RecipeResults({ results, onReset }) {
  return (
    <div className="results-container">
      <div className="results-header">
        <h2 className="results-title">Your Recipe Matches</h2>
        <p className="results-subtitle">
          {results.length} recipe{results.length !== 1 ? 's' : ''} picked just for you
        </p>
      </div>

      <div className="cards-grid">
        {results.map((recipe, index) => (
          <article key={index} className="recipe-card">
            <div className="card-number">{index + 1}</div>
            <div className="card-body">
              <h3 className="card-title">{recipe.name}</h3>
              <p className="card-reason">{recipe.reason}</p>
            </div>
            <a
              href={recipe.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card-link"
            >
              View Recipe →
            </a>
          </article>
        ))}
      </div>

      <button className="btn-secondary" onClick={onReset}>
        ← Try Another Search
      </button>
    </div>
  );
}
