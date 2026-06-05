const WP_BASE = process.env.REACT_APP_WP_URL || "https://prettypastelitos.com";

const CACHE_KEY = "recipes_cache";
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export async function searchRecipes(inputs) {
  const searchTerm = inputs.flavor || inputs.occasion || "";
  const url = `${WP_BASE}/wp-json/wp/v2/posts?per_page=20&_fields=title,link,_embedded,_links&_embed=wp:term${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""}`;

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

  return posts
    .map((post) => ({
      title: decodeHtmlEntities(post.title?.rendered || ""),
      url: post.link || "",
      tags: extractTags(post),
    }))
    .filter((r) => r.title && r.url);
}
