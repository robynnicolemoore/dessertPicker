const WP_BASE = process.env.REACT_APP_WP_URL || "https://prettypastelitos.com";

const CACHE_KEY = "recipes_cache";
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export async function fetchRecentRecipes() {
  // Check cache first
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) return data;
    }
  } catch {}

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
  //const after = twelveMonthsAgo.toISOString().split(".")[0];

  const url = `${WP_BASE}/wp-json/wp/v2/posts?per_page=300&_fields=title,link,tags&_embed=wp:term`;

  let response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error(
      "Could not connect to the blog. Please check your connection and try again.",
    );
  }

  if (!response.ok) {
    throw new Error(
      `The blog returned an error (${response.status}). Please try again later.`,
    );
  }

  const posts = await response.json();

  const results = posts
    .map((post) => ({
      title: decodeHtmlEntities(post.title?.rendered || ""),
      url: post.link || "",
      tags: extractTags(post),
    }))
    .filter((r) => r.title && r.url);

  // Save to cache
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data: results, timestamp: Date.now() }),
    );
  } catch {}

  return results;
}

function extractTags(post) {
  const embedded = post._embedded;
  if (!embedded) return [];
  const terms = embedded["wp:term"] || [];
  return terms
    .flat()
    .map((t) => t.name)
    .filter(Boolean);
}

function decodeHtmlEntities(str) {
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}
