const WP_BASE = process.env.REACT_APP_WP_URL || "https://prettypastelitos.com";

export async function fetchRecentRecipes() {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
  const after = twelveMonthsAgo.toISOString().split(".")[0]; // removes milliseconds

  const url = `${WP_BASE}/wp-json/wp/v2/posts?per_page=100&after=${encodeURIComponent(after)}&_embed`;

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
