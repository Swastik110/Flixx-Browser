const BASE_IMG_URL = "https://image.tmdb.org/t/p/w500";

// DOM Elements
const wishlistContainer = document.getElementById("wishlist-container");

// Load wishlist from localStorage
function getWishlist() {
  const wishlistJSON = localStorage.getItem("wishlist");
  return wishlistJSON ? JSON.parse(wishlistJSON) : [];
}

// Save wishlist to localStorage
function saveWishlist(wishlist) {
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

// Remove item from wishlist by id and media_type
function removeFromWishlist(id, mediaType) {
  let wishlist = getWishlist();
  wishlist = wishlist.filter(
    (item) => !(item.id === id && item.media_type === mediaType)
  );
  saveWishlist(wishlist);
  renderWishlist();
}

// Render wishlist items on page
function renderWishlist() {
  const wishlist = getWishlist();
  wishlistContainer.innerHTML = "";

  if (wishlist.length === 0) {
    wishlistContainer.innerHTML = "<p>Your wishlist is empty.</p>";
    return;
  }

  wishlist.forEach((item) => {
    const card = document.createElement("div");
    card.classList.add("card");

    const img = document.createElement("img");
    img.src = item.poster_path
      ? `${BASE_IMG_URL}${item.poster_path}`
      : "assets/fallback.jpg";
    img.alt = item.title || item.name || "No Title";

    const cardContent = document.createElement("div");
    cardContent.classList.add("card-content");

    const cardTitle = document.createElement("h3");
    cardTitle.classList.add("card-title");
    cardTitle.textContent = item.title || item.name || "No Title";

    const cardSubtext = document.createElement("p");
    cardSubtext.classList.add("card-subtext");
    const year =
      (item.release_date || item.first_air_date || "N/A").slice(0, 4);
    cardSubtext.textContent = `${(item.media_type || "movie").toUpperCase()} | ${year}`;

    // Remove button (heart icon)
    const removeBtn = document.createElement("button");
    removeBtn.classList.add("wishlist-btn");
    removeBtn.title = "Remove from wishlist";
    removeBtn.innerHTML = "❤️";
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeFromWishlist(item.id, item.media_type);
    });

    cardContent.appendChild(cardTitle);
    cardContent.appendChild(cardSubtext);
    card.appendChild(img);
    card.appendChild(cardContent);
    card.appendChild(removeBtn);

    // Clicking card goes to details page
    card.addEventListener("click", () => {
      window.location.href = `details.html?type=${item.media_type}&id=${item.id}`;
    });

    wishlistContainer.appendChild(card);
  });
}

// Initialize
renderWishlist();
