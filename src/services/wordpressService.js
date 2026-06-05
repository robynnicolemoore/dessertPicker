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

  let page = 1;
  let allPosts = [];

  while (true) {
    const url = `${WP_BASE}/wp-json/wp/v2/posts?per_page=100&page=${page}&_fields=title,link,_embedded,_links&_embed=wp:term`;

    let response;
    try {
      response = await fetch(url);
    } catch {
      throw new Error(
        "Could not connect to the blog. Please check your connection and try again.",
      );
    }

    // WordPress returns 400 when you go past the last page
    if (!response.ok) {
      if (response.status === 400 || response.status === 404) break;
      throw new Error(
        `The blog returned an error (${response.status}). Please try again later.`,
      );
    }

    const posts = await response.json();
    if (!posts.length) break;

    allPosts = [...allPosts, ...posts];
    page++;
  }

  const results = allPosts
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
