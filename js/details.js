const API_KEY = "964d1dac2918f8cf16b36c376919a683";
const BASE_IMG_URL = "https://image.tmdb.org/t/p/w500";
const BASE_BG_URL = "https://image.tmdb.org/t/p/original";
const fallbackImg = "assets/fallback.jpg";

// Get ID and type from URL
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const type = urlParams.get("type"); // movie or tv

const detailsContainer = document.getElementById("details-container");

async function fetchDetails() {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=${API_KEY}`);
    const data = await res.json();
    displayDetails(data);
  } catch (err) {
    detailsContainer.innerHTML = "<p>Error fetching details.</p>";
    console.error("Details error:", err);
  }
}

function displayDetails(item) {
  const title = item.title || item.name;
  const poster = item.poster_path ? `${BASE_IMG_URL}${item.poster_path}` : fallbackImg;
  const bg = item.backdrop_path ? `${BASE_BG_URL}${item.backdrop_path}` : null;
  const release = item.release_date || item.first_air_date || "N/A";
  const rating = item.vote_average?.toFixed(1) || "N/A";
  const genres = item.genres?.map(g => g.name).join(", ") || "N/A";
  const overview = item.overview || "No description available.";

  detailsContainer.innerHTML = `
    <div class="relative rounded-xl overflow-hidden shadow-lg">
      ${bg ? `<img src="${bg}" alt="bg" class="absolute top-0 left-0 w-full h-full object-cover opacity-30 z-0">` : ""}
      <div class="relative z-10 p-6 bg-gray-800 bg-opacity-80 rounded-xl">
        <div class="flex flex-col md:flex-row gap-6">
          <img src="${poster}" alt="${title}" class="w-60 h-auto rounded-lg shadow-md"/>
          <div>
            <h2 class="text-3xl font-bold mb-2">${title}</h2>
            <p class="text-sm text-gray-400 mb-2">${type.toUpperCase()} | ${release.slice(0, 4)} | ⭐ ${rating}</p>
            <p class="mb-2"><strong>Genres:</strong> ${genres}</p>
            <p class="mb-4"><strong>Overview:</strong> ${overview}</p>
            <a href="https://www.themoviedb.org/${type}/${id}" target="_blank" class="text-blue-400 underline">View on TMDB</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

fetchDetails();
