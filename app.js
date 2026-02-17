const STORAGE_KEYS = {
  profile: "travel.profile",
  trips: "travel.trips",
  posts: "travel.posts"
};

const authForm = document.querySelector("#auth-form");
const tripForm = document.querySelector("#trip-form");
const transportForm = document.querySelector("#transport-form");
const communityForm = document.querySelector("#community-form");
const authStatus = document.querySelector("#auth-status");
const savedTripsContainer = document.querySelector("#saved-trips");
const communityFeed = document.querySelector("#community-feed");
const transportResults = document.querySelector("#transport-results");

const metrics = {
  total: document.querySelector("#metric-total"),
  budget: document.querySelector("#metric-budget"),
  countries: document.querySelector("#metric-countries"),
  top: document.querySelector("#metric-top")
};

const getStorage = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const saveStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value));

function renderProfile() {
  const profile = getStorage(STORAGE_KEYS.profile, null);
  authStatus.textContent = profile
    ? `Welcome ${profile.name} (${profile.homeCity || "traveler"})`
    : "Not logged in";

  if (profile) {
    authForm.name.value = profile.name;
    authForm.email.value = profile.email;
    authForm.homeCity.value = profile.homeCity || "";
  }
}

function buildItinerary(trip) {
  return [
    `Day 1: Arrive in ${trip.destination}, check-in, and local neighborhood walk.`,
    `Day 2: Focus on ${trip.interests || "top attractions"} and local cuisine tours.`,
    `Day 3: Flexible day for shopping, hidden gems, and evening cultural activity.`
  ];
}

function renderTrips() {
  const trips = getStorage(STORAGE_KEYS.trips, []);
  savedTripsContainer.innerHTML = "";

  if (!trips.length) {
    savedTripsContainer.innerHTML = '<p class="list-item">No trips saved yet.</p>';
  }

  trips.forEach((trip, index) => {
    const itinerary = trip.itinerary
      .map((item) => `<li>${item}</li>`)
      .join("");

    const card = document.createElement("article");
    card.className = "list-item";
    card.innerHTML = `
      <strong>${trip.destination}</strong>
      <p>${trip.startDate} → ${trip.endDate} · $${trip.budget} · ${trip.travelers} traveler(s)</p>
      <ul>${itinerary}</ul>
      <button data-delete-index="${index}">Delete Trip</button>
    `;

    savedTripsContainer.append(card);
  });

  savedTripsContainer.querySelectorAll("button[data-delete-index]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const current = getStorage(STORAGE_KEYS.trips, []);
      current.splice(Number(btn.dataset.deleteIndex), 1);
      saveStorage(STORAGE_KEYS.trips, current);
      renderTrips();
      renderAnalytics();
    });
  });
}

function renderAnalytics() {
  const trips = getStorage(STORAGE_KEYS.trips, []);
  metrics.total.textContent = String(trips.length);

  const totalBudget = trips.reduce((sum, trip) => sum + Number(trip.budget || 0), 0);
  metrics.budget.textContent = `$${totalBudget.toLocaleString()}`;

  const destinations = trips.map((trip) => trip.destination.trim().toLowerCase()).filter(Boolean);
  const countryCount = new Set(destinations).size;
  metrics.countries.textContent = String(countryCount);

  const frequency = destinations.reduce((acc, destination) => {
    acc[destination] = (acc[destination] || 0) + 1;
    return acc;
  }, {});

  const topDestination = Object.entries(frequency).sort((a, b) => b[1] - a[1])[0]?.[0];
  metrics.top.textContent = topDestination ? topDestination[0].toUpperCase() + topDestination.slice(1) : "-";
}

function renderCommunity() {
  const posts = getStorage(STORAGE_KEYS.posts, []);
  communityFeed.innerHTML = "";

  if (!posts.length) {
    communityFeed.innerHTML = '<p class="list-item">No community posts yet.</p>';
    return;
  }

  posts
    .slice()
    .reverse()
    .forEach((post) => {
      const item = document.createElement("article");
      item.className = "list-item";
      item.innerHTML = `<strong>${post.author}</strong><p>${post.message}</p><small>${new Date(
        post.createdAt
      ).toLocaleString()}</small>`;
      communityFeed.append(item);
    });
}

function searchTransport({ from, to, mode }) {
  const basePrice = { Flights: 230, Trains: 60, Buses: 35 }[mode] ?? 100;
  return [1, 2, 3].map((option) => {
    const duration = mode === "Flights" ? `${2 + option}h ${20 + option * 5}m` : `${5 + option}h`;
    const price = basePrice + option * 25;
    return `${mode.slice(0, -1)} ${from} → ${to} · ${duration} · $${price}`;
  });
}

authForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const profile = {
    name: authForm.name.value.trim(),
    email: authForm.email.value.trim(),
    homeCity: authForm.homeCity.value.trim()
  };

  saveStorage(STORAGE_KEYS.profile, profile);
  renderProfile();
});

tripForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const trip = {
    destination: tripForm.destination.value.trim(),
    startDate: tripForm.startDate.value,
    endDate: tripForm.endDate.value,
    budget: Number(tripForm.budget.value),
    travelers: Number(tripForm.travelers.value),
    interests: tripForm.interests.value.trim(),
    notes: tripForm.notes.value.trim()
  };

  trip.itinerary = buildItinerary(trip);
  const trips = getStorage(STORAGE_KEYS.trips, []);
  trips.push(trip);
  saveStorage(STORAGE_KEYS.trips, trips);

  tripForm.reset();
  renderTrips();
  renderAnalytics();
});

transportForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = {
    from: transportForm.transportFrom.value.trim(),
    to: transportForm.transportTo.value.trim(),
    date: transportForm.transportDate.value,
    mode: transportForm.transportMode.value
  };

  const options = searchTransport(query);
  transportResults.innerHTML = options
    .map((option) => `<li class="list-item">${option} · ${query.date}</li>`)
    .join("");
});

communityForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const profile = getStorage(STORAGE_KEYS.profile, null);
  const posts = getStorage(STORAGE_KEYS.posts, []);
  posts.push({
    author: profile?.name || "Anonymous Traveler",
    message: communityForm.communityPost.value.trim(),
    createdAt: Date.now()
  });

  saveStorage(STORAGE_KEYS.posts, posts);
  communityForm.reset();
  renderCommunity();
});

renderProfile();
renderTrips();
renderCommunity();
renderAnalytics();
