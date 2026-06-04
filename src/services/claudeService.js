const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';

export async function getRecipeRecommendations(recipes, inputs) {
  const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('Anthropic API key is not configured. Please add REACT_APP_ANTHROPIC_API_KEY to your .env file.');
  }

  const recipeList = recipes
    .map((r, i) => `${i + 1}. Title: "${r.title}" | URL: ${r.url} | Tags: ${r.tags.join(', ') || 'none'}`)
    .join('\n');

  const userRequest = buildUserRequest(inputs);

  const systemPrompt = `You are a friendly baking expert helping visitors of the blog Pretty Pastelitos find the perfect recipe.

You will receive a list of real recipes from the blog and a user's preferences. Your job is to recommend the 3–5 best matching recipes from the provided list ONLY.

Rules you must follow:
- ONLY recommend recipes that appear in the provided list. Never invent recipe names or URLs.
- Copy the URL exactly as provided — do not modify, shorten, or guess any URLs.
- Return ONLY a valid JSON array with no markdown, no code fences, no explanation text.
- Each object in the array must have exactly three keys: "name" (string), "url" (string), "reason" (string).
- The "reason" must be a single warm, friendly sentence explaining why this recipe matches the user's request.
- If fewer than 3 recipes match well, return only the best matches (minimum 1). Never pad results with poor matches.

Example output format:
[{"name":"Chocolate Lava Cake","url":"https://prettypastelitos.com/chocolate-lava-cake/","reason":"This rich, intensely chocolatey cake is simple to make and perfect for a cozy treat."}]`;

  const userMessage = `Here are the available recipes from the blog:\n\n${recipeList}\n\n---\n\nUser preferences:\n${userRequest}\n\nPlease recommend the best matching recipes from the list above.`;

  let response;
  try {
    response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });
  } catch {
    throw new Error('Could not reach the AI service. Please check your connection and try again.');
  }

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    const detail = errBody?.error?.message || `Status ${response.status}`;
    throw new Error(`AI service error: ${detail}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '';

  return parseRecommendations(text, recipes);
}

function buildUserRequest(inputs) {
  const lines = [];
  if (inputs.dietary?.length && !inputs.dietary.includes('none')) {
    lines.push(`Dietary restrictions: ${inputs.dietary.join(', ')}`);
  }
  if (inputs.flavor) {
    lines.push(`Main ingredient or flavor: ${inputs.flavor}`);
  }
  if (inputs.difficulty) {
    lines.push(`Difficulty level: ${inputs.difficulty}`);
  }
  if (inputs.occasion) {
    lines.push(`Occasion: ${inputs.occasion}`);
  }
  return lines.length ? lines.join('\n') : 'No specific preferences — just show your best recipes!';
}

function parseRecommendations(text, recipes) {
  const validUrls = new Set(recipes.map(r => r.url));

  let parsed;
  try {
    // Strip markdown fences if Claude wrapped the response anyway
    const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    parsed = JSON.parse(clean);
  } catch {
    throw new Error('We received an unexpected response from the AI. Please try again.');
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('No recipes matched your preferences. Try adjusting your filters and searching again.');
  }

  const valid = parsed.filter(item =>
    item &&
    typeof item.name === 'string' && item.name.trim() &&
    typeof item.url === 'string' && validUrls.has(item.url) &&
    typeof item.reason === 'string' && item.reason.trim()
  );

  if (valid.length === 0) {
    throw new Error('The AI returned recipes we couldn\'t verify. Please try again.');
  }

  return valid;
}
