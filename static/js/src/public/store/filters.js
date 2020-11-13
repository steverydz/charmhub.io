function buildCharmCard(charm) {
  const entityCard = document.getElementById("entity-card");
  const clone = entityCard.content.cloneNode(true);

  const entityCardContainer = clone.querySelector(".p-layout__card");
  entityCardContainer.id = charm.name;

  const entityCardButton = clone.querySelector(".p-card--button");
  entityCardButton.href = `/${charm.name}`;

  const entityCardThumbnail = clone.querySelector(".p-card__thumbnail");
  entityCardThumbnail.alt = charm.name;
  entityCardThumbnail.setAttribute("loading", "lazy");

  if (charm.store_front.icons && charm.store_front.icons[0]) {
    entityCardThumbnail.src =
      "https://res.cloudinary.com/canonical/image/fetch/f_auto,q_auto,fl_sanitize,c_fill,w_64,h_64/" +
      charm.store_front.icons[0];
  } else {
    entityCardThumbnail.src =
      "https://res.cloudinary.com/canonical/image/fetch/f_auto,q_auto,fl_sanitize,c_fill,w_64,h_64/https://assets.ubuntu.com/v1/be6eb412-snapcraft-missing-icon.svg";
  }

  const entityCardTitle = clone.querySelector(".entity-card-title");
  entityCardTitle.innerText = charm.name.replace(/-/g, " ");

  const entityCardPublisher = clone.querySelector(".entity-card-publisher");
  entityCardPublisher.innerText = charm.result.publisher["display-name"];

  const entityCardSummary = clone.querySelector(".entity-card-summary");

  if (charm.result.summary) {
    entityCardSummary.innerText = charm.result.summary.substring(0, 90);
  }

  const entityCardIcons = clone.querySelector(".entity-card-icons");

  charm.store_front.os.forEach((os) => {
    const span = document.createElement("span");
    const image = document.createElement("img");
    const tooltip = document.createElement("span");
    span.setAttribute("class", "p-tooltip");
    span.setAttribute("aria-describedby", "default-tooltip");
    image.width = 24;
    image.height = 24;
    tooltip.setAttribute("class", "p-tooltip__message");
    tooltip.setAttribute("role", "tooltip");

    if (os === "kubernetes") {
      image.alt = "Kubernetes";
      image.src = "https://assets.ubuntu.com/v1/f1852c07-Kubernetes.svg";
      tooltip.innerText = "This operator drives the application on Kubernetes";
    }

    if (os === "windows") {
      image.alt = "Windows";
      image.src = "https://assets.ubuntu.com/v1/ff17c4fe-Windows.svg";
      tooltip.innerText =
        "This operator drives the application on Windows servers";
    }

    if (os === "linux") {
      image.alt = "Linux";
      image.src = "https://assets.ubuntu.com/v1/dc11bd39-Linux.svg";
      tooltip.innerText =
        "This operator drives the application on Linux servers";
    }

    span.appendChild(image);
    span.appendChild(tooltip);
    entityCardIcons.appendChild(span);
  });

  return clone;
}

function getCharmsList() {
  fetch("/charms.json")
    .then((result) => result.json())
    .then((data) => {
      const charms = data.charms.filter((charm) => charm.type === "charm");

      if (!charms) {
        renderNoResultsMessage();
        return;
      }

      const searchParams = new URLSearchParams(window.location.search);
      const platformQuery = searchParams.get("platform");
      const categoriesQuery = searchParams.get("categories");

      toggleShowAllOperatorsButton(platformQuery);
      handleShowAllOperators(charms);
      handlePlatformChange(charms);
      handleCategoryFilters(charms);
      handleMobileFilters();
      handleMobilePlatforms();
    })
    .catch((e) => console.log("error", e));
}

function filterCharmsByPlatform(charmSet, platform) {
  return charmSet.filter((charm) => charm.store_front.os.includes(platform));
}

function renderCharmCards(charms) {
  if (!"content" in document.createElement("template")) {
    return;
  }

  const entityContainer = document.getElementById("entity-container");
  entityContainer.innerHTML = "";

  charms.forEach((charm) => {
    entityContainer.appendChild(buildCharmCard(charm));
  });
}

function renderResultsCount(results, charms) {
  if (!"content" in document.createElement("template")) {
    return;
  }

  const resultsCountContainer = document.getElementById(
    "results-count-container"
  );

  resultsCountContainer.innerHTML = `${results} of ${charms}`;
}

function getFeatureCount() {
  const featuredContainer = document.getElementById("features-container");
  const featuredCards = featuredContainer.querySelectorAll(".p-layout__card");
  return featuredCards.length;
}

function handlePlatformChange(charms) {
  const platformSwitcher = document.getElementById("platform-handler");

  platformSwitcher.addEventListener("change", (e) => {
    const platform = e.target.value;

    if (platform === "all") {
      renderResultsCount(charms.length, charms.length);
      renderCharmCards(charms);
      enableFilters();
    } else {
      const platformCharms = filterCharmsByPlatform(charms, platform);
      renderResultsCount(platformCharms.length, charms.length);
      renderCharmCards(platformCharms);
      disableFiltersByPlatform(platformCharms);
    }

    const categoryFilters = document.querySelectorAll(".category-filter");

    categoryFilters.forEach((filter) => {
      filter.checked = false;
    });

    hideFeatured();

    toggleShowAllOperatorsButton(platform);
  });
}

function setQueryStringParameter(name, value) {
  const params = new URLSearchParams(window.location.search);
  params.set(name, value);
  window.history.replaceState(
    {},
    "",
    decodeURIComponent(`${window.location.pathname}?${params}`)
  );
}

function showFeatured() {
  const featuredContainer = document.getElementById("features-container");
  const entityContainer = document.getElementById("entity-container");

  featuredContainer.classList.remove("u-hide");
  entityContainer.classList.add("u-hide");
}

function hideFeatured() {
  const featuredContainer = document.getElementById("features-container");
  const entityContainer = document.getElementById("entity-container");

  featuredContainer.classList.add("u-hide");
  entityContainer.classList.remove("u-hide");
}

function renderNoResultsMessage() {
  if (!"content" in document.createElement("template")) {
    return;
  }

  const entityContainer = document.getElementById("entity-container");
  const noResultsMessage = document.getElementById("no-results-message");
  const clone = noResultsMessage.content.cloneNode(true);

  const searchParams = new URLSearchParams(window.location.search);
  const searchQuery = searchParams.get("q");

  if (searchParams) {
    const searchQueryMessage = clone.querySelector(".search-query");
    searchQueryMessage.innerHTML = ` "<strong>${searchQuery}</strong>"`;
  }

  entityContainer.innerHTML = "";
  entityContainer.appendChild(clone);
}

function handleShowAllOperators(charms) {
  const showAllOperatorsButton = document.getElementById("more-operators");
  showAllOperatorsButton.addEventListener("click", (e) => {
    e.preventDefault();
    // setQueryStringParameter("platform", "all");
    hideFeatured();
    renderResultsCount(charms.length, charms.length);
    renderCharmCards(charms);
    toggleShowAllOperatorsButton("all");
    const categoryFilters = document.querySelectorAll(".category-filter");
    const platformSwitcher = document.getElementById("platform-handler");
    categoryFilters.forEach((filter) => {
      filter.checked = false;
      filter.disabled = false;
    });
    platformSwitcher.value = "all";

    window.scrollTo(0, 0);
  });
}

function toggleShowAllOperatorsButton(platformQuery) {
  const allOperatorsButton = document.getElementById("more-operators");

  if (platformQuery === "all") {
    allOperatorsButton.classList.add("u-hide");
  } else {
    allOperatorsButton.classList.remove("u-hide");
  }
}

function handleCategoryFilters(charms) {
  const categoryFilters = document.querySelectorAll(".category-filter");

  categoryFilters.forEach((categoryFilter) => {
    categoryFilter.addEventListener("click", (e) => {
      const category = e.target.value;

      let categories = [];

      const categoryFilters = document.querySelectorAll(".category-filter");
      categoryFilters.forEach((categoryFilter) => {
        if (categoryFilter.checked) {
          categories.push(categoryFilter.value);
        }
      });

      const platform = document.getElementById("platform-handler").value;

      let filteredCharms = filterCharmsByCategories(charms, categories);
      if (platform !== "all") {
        filteredCharms = filterCharmsByPlatform(filteredCharms, platform);
      }
      hideFeatured();

      if (categories.length || platform != "all") {
        renderResultsCount(filteredCharms.length, charms.length);
        renderCharmCards(filteredCharms);
      } else {
        renderResultsCount(charms.length, charms.length);
        renderCharmCards(charms);
      }

      if (!categories.length && platform == "all") {
        showFeatured();
      }
    });
  });
}

function filterCharmsByCategories(charms, categoriesQuery) {
  if (!categoriesQuery || categoriesQuery === "all") {
    return charms;
  }

  if (categoriesQuery !== typeof "string" && categoriesQuery.includes("all")) {
    categoriesQuery = categoriesQuery.filter((cat) => cat !== "all");
  }

  if (!categoriesQuery.length) {
    return charms;
  }

  return charms.filter((charm) => {
    let charmCategories = [];

    if (charm.store_front.categories) {
      charmCategories = charm.store_front.categories.map((cat) => {
        return cat.slug;
      });
    }

    const cats = categoriesQuery.filter((cat) => {
      if (charmCategories.includes(cat)) {
        return cat;
      }
    });

    if (cats.length) {
      return charm;
    }
  });
}

function selectFilters(categories) {
  const categoryFilters = document.querySelectorAll(".category-filter");

  categoryFilters.forEach((filter) => {
    if (categories.includes(filter.value)) {
      filter.checked = true;
    }
  });
}

function enableFilters() {
  const categoryFilters = document.querySelectorAll(".category-filter");

  categoryFilters.forEach((filter) => {
    filter.disabled = false;
  });
}

function disableFiltersByPlatform(charms) {
  const categoryFilters = document.querySelectorAll(".category-filter");
  const platformCategories = [];

  charms.forEach((charm) => {
    if (charm.store_front.categories) {
      charm.store_front.categories.forEach((cat) => {
        if (!platformCategories.includes(cat.slug)) {
          platformCategories.push(cat.slug);
        }
      });
    }
  });

  categoryFilters.forEach((filter) => {
    if (platformCategories.includes(filter.value)) {
      filter.disabled = false;
    } else {
      filter.disabled = true;
    }
  });
}

function handleMobileFilters() {
  const filtersPanel = document.querySelector("[data-js='filter-handler']");
  const filterButton = document.querySelector(
    "[data-js='mobile-filter-reveal-button']"
  );

  filterButton.addEventListener("click", (e) => {
    e.preventDefault();
    filtersPanel.classList.add("is-active");
  });

  // click desired filters
  const showResultsButton = document.querySelector("[data-js='filter-submit']");

  showResultsButton.addEventListener("click", (e) => {
    e.preventDefault();
    filtersPanel.classList.remove("is-active");
  });

  // page is filtered by categories
  // click reset
  // categories are unchcked
  // click show results
  // menu slides down
  // page unfiltered
}

function handleMobilePlatforms() {
  const platformPanel = document.querySelector(
    "[data-js='mobile-platform-handler']"
  );

  const platformButton = document.querySelector(
    "[data-js='mobile-platform-reveal-button']"
  );

  platformButton.addEventListener("click", (e) => {
    e.preventDefault();
    platformPanel.classList.add("is-active");
  });

  const platformOptions = platformPanel.querySelectorAll("input[type='radio']");

  platformOptions.forEach((platformOption) => {
    platformOption.addEventListener("click", () => {
      platformPanel.classList.remove("is-active");

      // page is filtered by platform
    });
  });
}

export { getCharmsList };
