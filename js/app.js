const movieContainer = document.getElementById("moviesContainer");
const genreFilter = document.getElementById("genreFilter");
const sortSelect = document.getElementById("sortSelect");
const searchInput = document.getElementById("searchInput");
const gridToggle = document.getElementById("gridToggle");

let allMovies = [];
let generes = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let gridView = localStorage.getItem("gridView") || "grid";
if (gridView === "list") movieContainer.classList.add("list-view");

async function fetchData() {
  try {
    let response = await fetch("./js/movie.json");
    let data = await response.json();
    allMovies = data;

    allMovies.forEach((movie) => generes.push(movie.genre));

    populateMovies(generes);

    allFilters();
  } catch (error) {
    movieContainer.textContent = "Failed to fetch data";
  }
}

function displayData(arr) {
  let frag = ``;
  arr.forEach((movie, index) => {
    frag += `
      <div class="movie-card" style="animation-duration:  ${Math.min(index * 0.1, 0.5)}s">
        <div class="card-img">
          <img src="${movie.poster}" alt="${movie.title}" />
          <span class="genre-badge">${movie.genre}</span>
          <button class="fav-btn" data-id="${movie.id}">❤</button>
        </div>

        <div class="card-content">
          <h3>${movie.title}</h3>
          <div class="card-info">
            <span>${movie.year}</span>
            <span class="rating">⭐ ${movie.rating}</span>
          </div>
        </div>
      </div>
    `;
  });
  movieContainer.innerHTML = frag;
}

function populateMovies(arr) {
  arr = Array.from(new Set(arr));
  let frag = ``;
  arr.forEach((e) => (frag += `<option value="${e}">${e}</option>`));
  genreFilter.innerHTML += frag;
}

function allFilters() {
  const selectedGenre = genreFilter.value.toLowerCase();
  const searchText = searchInput.value.toLowerCase();
  const selctedSort = sortSelect.value;

  let tempFilter =
    selectedGenre === "all"
      ? allMovies
      : allMovies.filter((e) => e.genre.toLowerCase() === selectedGenre);

  let finalFilter = tempFilter.filter((m) =>
    m.title.toLowerCase().includes(searchText),
  );

  if (selctedSort == "yearAsc") finalFilter.sort((a, b) => a.year - b.year);
  else if (selctedSort == "yearDesc")
    finalFilter.sort((a, b) => b.year - a.year);
  else if (selctedSort == "ratingDesc")
    finalFilter.sort((a, b) => b.rating - a.rating);

  if (showFavsOnly)
    finalFilter = finalFilter.filter((m) => favorites.includes(m.id));

  displayData(finalFilter);

  document.querySelectorAll(".fav-btn").forEach((btn) => {
    const id = Number(btn.dataset.id);
    if (favorites.includes(id)) {
      btn.classList.add("active");
    }
  });
}

sortSelect.addEventListener("change", allFilters);
genreFilter.addEventListener("change", allFilters);
searchInput.addEventListener("input", allFilters);

movieContainer.addEventListener("click", function (e) {
  const btn = e.target.closest(".fav-btn");
  if (!btn) return;

  const id = Number(btn.dataset.id);
  btn.classList.toggle("active");

  if (favorites.includes(id))
    favorites = favorites.filter((favId) => favId !== id);
  else favorites.push(id);

  localStorage.setItem("favorites", JSON.stringify(favorites));
});

gridToggle.addEventListener("click", () => {
  movieContainer.classList.toggle("list-view");
  gridToggle.classList.toggle("is-list");

  const isListNow = movieContainer.classList.contains("list-view");
  gridView = isListNow ? "list" : "grid";
  gridToggle.dataset.tooltip = isListNow ? "Switch to Grid" : "Switch to List";
  localStorage.setItem("gridView", gridView);
});

const favToggle = document.getElementById("favToggle");
let showFavsOnly = false;

favToggle.addEventListener("click", () => {
  showFavsOnly = !showFavsOnly;
  favToggle.classList.toggle("active", showFavsOnly);
  allFilters();
});

fetchData();
