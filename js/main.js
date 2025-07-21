const API_KEY = "964d1dac2918f8cf16b36c376919a683";
const BASE_IMG_URL = "https://image.tmdb.org/t/p/w500";
const fallbackImg = "assets/fallback.jpg";

// DOM Elements
const trendingContainer = document.getElementById("trending-container");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const searchResultsSection = document.getElementById("search-results-section");
const searchResultsContainer = document.getElementById("search-results-container");
const trendingSection = document.getElementById("trending-section");

// Filters
let currentFilters = {
  type: "movie",
  sort: "popularity.desc",
  genre: null,
  year: null,
};

// 🎯 Local Storage Wishlist
function getWishlist() {
  return JSON.parse(localStorage.getItem("wishlist")) || [];
}

function saveWishlist(wishlist) {
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

function toggleWishlistItem(item) {
  const wishlist = getWishlist();
  const exists = wishlist.find((i) => i.id === item.id && i.media_type === item.media_type);
  let updated;

  if (exists) {
    updated = wishlist.filter((i) => !(i.id === item.id && i.media_type === item.media_type));
  } else {
    updated = [...wishlist, item];
  }

  saveWishlist(updated);
}

// 🎯 Check if in wishlist
function isInWishlist(item) {
  const wishlist = getWishlist();
  return wishlist.some((i) => i.id === item.id && i.media_type === item.media_type);
}

// 🎯 Fetch Trending Content (Movies + TV)
async function fetchTrending() {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/trending/all/day?api_key=${API_KEY}`);
    const data = await res.json();
    displayResults(data.results, trendingContainer);
  } catch (err) {
    console.error("Error fetching trending content:", err);
  }
}

// 🎯 Apply filters and fetch from TMDB
async function applyFilters() {
  const { type, sort, genre, year } = currentFilters;
  let url = `https://api.themoviedb.org/3/discover/${type}?api_key=${API_KEY}&sort_by=${sort}`;
  if (genre) url += `&with_genres=${genre}`;
  if (year) {
    url += type === "movie"
      ? `&primary_release_year=${year}`
      : `&first_air_date_year=${year}`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();

    trendingSection.classList.remove("hidden");
    searchResultsSection.classList.add("hidden");
    trendingContainer.innerHTML = "";
    displayResults(data.results, trendingContainer);
  } catch (err) {
    console.error("Failed to fetch filtered content:", err);
  }
}

// 🎯 Handle Search
searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();

  if (!query) {
    trendingSection.classList.remove("hidden");
    searchResultsSection.classList.add("hidden");
    return;
  }

  try {
    const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    const data = await res.json();

    trendingSection.classList.add("hidden");
    searchResultsSection.classList.remove("hidden");
    searchResultsContainer.innerHTML = "";
    displayResults(data.results, searchResultsContainer);
    searchResultsSection.scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    console.error("Search failed:", err);
  }
});

// 🎯 Clear search input = restore trending
searchInput.addEventListener("input", () => {
  if (searchInput.value.trim() === "") {
    trendingSection.classList.remove("hidden");
    searchResultsSection.classList.add("hidden");
    searchResultsContainer.innerHTML = "";
  }
});

// 🎯 Display results (card format)
function displayResults(items, container) {
  container.innerHTML = "";
  if (!items || items.length === 0) {
    container.innerHTML = "<p>No results found.</p>";
    return;
  }

  items.forEach(item => {
    if (!item.title && !item.name) return;

    const title = item.title || item.name;
    const poster = item.poster_path ? `${BASE_IMG_URL}${item.poster_path}` : null;
    const year = item.release_date || item.first_air_date || "N/A";
    const mediaType = item.media_type || "movie";

    const card = document.createElement("div");
    card.classList.add("card");

    const img = document.createElement("img");
    if (poster) {
      img.src = poster;
    } else {
      return;
    }
    img.alt = title;
    img.onerror = function () {
      if (card.parentNode) {
        card.parentNode.removeChild(card);
      }
    };

    const cardContent = document.createElement("div");
    cardContent.classList.add("card-content");

    const cardTitle = document.createElement("h3");
    cardTitle.classList.add("card-title");
    cardTitle.textContent = title;

    const cardSubtext = document.createElement("p");
    cardSubtext.classList.add("card-subtext");
    cardSubtext.textContent = `${mediaType.toUpperCase()} | ${year.slice(0, 4)}`;

    // 💖 Wishlist button
    const wishlistBtn = document.createElement("button");
    wishlistBtn.classList.add("wishlist-btn");
    wishlistBtn.textContent = isInWishlist(item) ? "💖" : "🤍";
    wishlistBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleWishlistItem({
        id: item.id,
        title: item.title || item.name,
        poster_path: item.poster_path,
        release_date: item.release_date || item.first_air_date,
        media_type: mediaType,
      });
      wishlistBtn.textContent = isInWishlist(item) ? "💖" : "🤍";
    });

    cardContent.appendChild(cardTitle);
    cardContent.appendChild(cardSubtext);
    cardContent.appendChild(wishlistBtn);

    card.appendChild(img);
    card.appendChild(cardContent);
    card.addEventListener("click", () => {
      window.location.href = `details.html?type=${mediaType}&id=${item.id}`;
    });

    container.appendChild(card);
  });
}

// 🎯 Create Dropdown Filter Bar
function createFilterBar() {
  const container = document.getElementById("filter-bar");
  container.innerHTML = `
    <select id="type-filter">
      <option value="movie">Movies</option>
      <option value="tv">TV Shows</option>
    </select>

    <select id="sort-filter">
      <option value="popularity.desc">Most Popular</option>
      <option value="vote_average.desc">Top Rated</option>
      <option value="release_date.desc">Newest First</option>
      <option value="release_date.asc">Oldest First</option>
    </select>

    <select id="genre-filter">
      <option value="">All Genres</option>
    </select>

    <select id="year-filter">
      <option value="">All Years</option>
    </select>
  `;
}

// 🎯 Populate genre and year dropdowns
async function populateGenresAndYears() {
  const movieGenreURL = `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`;
  const tvGenreURL = `https://api.themoviedb.org/3/genre/tv/list?api_key=${API_KEY}`;

  const [movieRes, tvRes] = await Promise.all([
    fetch(movieGenreURL),
    fetch(tvGenreURL),
  ]);

  const movieGenres = (await movieRes.json()).genres;
  const tvGenres = (await tvRes.json()).genres;

  const genreSelect = document.getElementById("genre-filter");
  const yearSelect = document.getElementById("year-filter");

  genreSelect.innerHTML = `<option value="">All Genres</option>`;
  yearSelect.innerHTML = `<option value="">All Years</option>`;

  const genreMap = new Map();
  [...movieGenres, ...tvGenres].forEach((genre) => {
    if (!genreMap.has(genre.id)) {
      genreMap.set(genre.id, genre.name);
      const option = document.createElement("option");
      option.value = genre.id;
      option.textContent = genre.name;
      genreSelect.appendChild(option);
    }
  });

  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= 1950; year--) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }
}

// 🎯 Filter change listeners
document.addEventListener("change", (e) => {
  if (e.target.id === "type-filter") {
    currentFilters.type = e.target.value;
  } else if (e.target.id === "sort-filter") {
    currentFilters.sort = e.target.value;
  } else if (e.target.id === "genre-filter") {
    currentFilters.genre = e.target.value || null;
  } else if (e.target.id === "year-filter") {
    currentFilters.year = e.target.value || null;
  }

  applyFilters();
});

// 🔃 Initialize
createFilterBar();
populateGenresAndYears();
fetchTrending();
