import React, { useState } from "react";
import "./RecipeForm.css";

//const DIETARY_OPTIONS = [
//  { value: "none", label: "No restrictions" },
//  { value: "vegan", label: "Vegan" },
//  { value: "gluten-free", label: "Gluten-Free" },
//  { value: "dairy-free", label: "Dairy-Free" },
//  { value: "nut-free", label: "Nut-Free" },
//];

const DIFFICULTY_OPTIONS = [
  { value: "", label: "Any difficulty" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "advanced", label: "Advanced" },
];

const OCCASION_OPTIONS = [
  { value: "", label: "Any occasion" },
  { value: "everyday treat", label: "Everyday Treat" },
  { value: "dinner party", label: "Dinner Party" },
  { value: "holiday", label: "Holiday" },
  { value: "quick snack", label: "Quick Snack" },
];

export default function RecipeForm({
  onSubmit,
  isLoadingRecipes,
  recipeCount,
}) {
  const [dietary, setDietary] = useState([]);
  const [flavor, setFlavor] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [occasion, setOccasion] = useState("");

  function toggleDietary(value) {
    if (value === "none") {
      setDietary(dietary.includes("none") ? [] : ["none"]);
      return;
    }
    setDietary((prev) => {
      const without = prev.filter((v) => v !== "none");
      return without.includes(value)
        ? without.filter((v) => v !== value)
        : [...without, value];
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ dietary, flavor: flavor.trim(), difficulty, occasion });
  }

  const canSubmit = !isLoadingRecipes && recipeCount > 0;

  return (
    <form className="recipe-form" onSubmit={handleSubmit} noValidate>
      <div className="form-status">
        {isLoadingRecipes ? (
          <span className="status-loading">
            <span className="status-dot loading" />
            Loading recipes from the blog…
          </span>
        ) : (
          <span className="status-ready">
            <span className="status-dot ready" />
            Recipes loaded
          </span>
        )}
      </div>

      {/*} <div className="form-section">
        <label className="form-label">Dietary Restrictions</label>
        <div className="checkbox-grid">
          {DIETARY_OPTIONS.map(opt => (
           <label key={opt.value} className={`checkbox-pill ${dietary.includes(opt.value) ? 'checked' : ''}`}>
             <input
             type="checkbox"
               value={opt.value}
                checked={dietary.includes(opt.value)}
                onChange={() => toggleDietary(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>*/}

      <div className="form-section">
        <label className="form-label" htmlFor="flavor">
          Main Ingredient or Flavor
        </label>
        <input
          id="flavor"
          type="text"
          className="form-input"
          placeholder="e.g. chocolate, lemon, banana, matcha…"
          value={flavor}
          onChange={(e) => setFlavor(e.target.value)}
          maxLength={80}
        />
      </div>

      <div className="form-row">
        <div className="form-section">
          <label className="form-label" htmlFor="difficulty">
            Difficulty Level
          </label>
          <select
            id="difficulty"
            className="form-select"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            {DIFFICULTY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-section">
          <label className="form-label" htmlFor="occasion">
            Occasion
          </label>
          <select
            id="occasion"
            className="form-select"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
          >
            {OCCASION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={!canSubmit}>
        {isLoadingRecipes ? "Loading recipes…" : "Find My Recipes"}
      </button>
    </form>
  );
}
