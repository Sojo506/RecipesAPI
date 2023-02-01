function init() {
  const selectCategories = document.querySelector("#categories");
  const result = document.querySelector("#result");
  const modal = new bootstrap.Modal("#modal", {});

  if (selectCategories) {
    selectCategories.addEventListener("change", selectCategory);
    getCategories();
  }

  const favoritesDiv = document.querySelector(".favorites");
  if (favoritesDiv) {
    getFavorites();
  }

  function getCategories() {
    const url = "https://www.themealdb.com/api/json/v1/1/categories.php";
    fetch(url)
      .then((res) => res.json())
      .then((data) => showCategories(data.categories));
  }

  function showCategories(categories = []) {
    categories.forEach((c) => {
      const option = document.createElement("OPTION");

      option.value = c.strCategory;
      option.textContent = c.strCategory;
      selectCategories.appendChild(option);
    });
  }

  function selectCategory(e) {
    const category = e.target.value;
    const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => showRecipes(data.meals));
  }

  function showRecipes(recipes = []) {
    cleanHTML(result);

    const heading = document.createElement("H2");
    heading.classList.add("text-center", "text-black", "my-5");
    heading.textContent = recipes.length ? "Results" : " No Results";

    result.appendChild(heading);
    // Go throuhg recipes
    recipes.forEach((r) => {
      const container = document.createElement("DIV");
      container.classList.add("col-md-4");

      const card = document.createElement("DIV");
      card.classList.add("card", "mb-4");

      const image = document.createElement("IMG");
      image.classList.add("card-img-top");
      image.alt = `Recipe image ${r.strMeal}`;
      image.src = r.strMealThumb ?? r.img;

      const body = document.createElement("DIV");
      body.classList.add("card-body");

      const heading = document.createElement("H3");
      heading.classList.add("card-title", "mb-3");
      heading.textContent = r.strMeal ?? r.title;

      const button = document.createElement("button");
      button.classList.add("btn", "btn-danger", "w-100");
      button.textContent = "View Recipe";
      /* button.dataset.bsTarget = "#modal";
      button.dataset.bsToggle = "modal"; */
      button.onclick = () => selectRecipe(r.idMeal ?? r.id);

      // Insert as HTMl
      body.appendChild(heading);
      body.appendChild(button);

      card.appendChild(image);
      card.appendChild(body);

      container.appendChild(card);

      result.appendChild(container);
    });
  }

  function selectRecipe(id) {
    const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
    fetch(url)
      .then((res) => res.json())
      .then((res) => showRecipeModal(res.meals[0]));
  }

  function showRecipeModal(recipe) {
    // show modal
    const { idMeal, strInstructions, strMeal, strMealThumb } = recipe;

    // Adding content to the modal
    const modalTitle = document.querySelector(".modal .modal-title");
    const modalBody = document.querySelector(".modal .modal-body");

    modalTitle.textContent = strMeal;
    modalBody.innerHTML = `
      <img class="img-fluid" src="${strMealThumb}" alt="recipe ${strMeal}" />
      <h3 class="my-3">Instructions</h3>
      <p>${strInstructions}</p>
      <h3 class="my-3">Ingredients and Measures</h3>
    `;

    const listGroup = document.createElement("UL");
    listGroup.classList.add("list-group");

    // Show measures and ingredients
    for (let i = 1; i <= 20; i++) {
      if (recipe[`strIngredient${i}`]) {
        const ingredient = recipe[`strIngredient${i}`];
        const measure = recipe[`strMeasure${i}`];

        const listItem = document.createElement("LI");
        listItem.classList.add("list-group-item");
        listItem.textContent = `${ingredient} - ${measure}`;

        listGroup.appendChild(listItem);
      }
    }
    modalBody.appendChild(listGroup);

    const modalFooter = document.querySelector(".modal-footer");

    cleanHTML(modalFooter);

    // btns - close and favorite
    const btnFavorite = document.createElement("BUTTON");
    btnFavorite.classList.add("btn", "btn-danger", "col");
    btnFavorite.textContent = `${
      checkStorage(idMeal) ? "Delete Favorite" : "Add Favorite"
    } `;

    // localStorage
    btnFavorite.onclick = () => {
      if (checkStorage(idMeal)) {
        deleteFavorite(idMeal);
        btnFavorite.textContent = "Add Favorite";
        showToast("Deleted");
        getFavorites()
        return;
      }

      addFavorite({
        id: idMeal,
        title: strMeal,
        img: strMealThumb,
      });
      btnFavorite.textContent = "Delete Favorite";
      showToast("Added!");
      getFavorites()
    };

    const btnClose = document.createElement("BUTTON");
    btnClose.classList.add("btn", "btn-secondary", "col");
    btnClose.textContent = "Close";
    btnClose.onclick = () => {
      modal.hide();
    };

    modalFooter.appendChild(btnFavorite);
    modalFooter.appendChild(btnClose);
    // Show modal
    modal.show();
  }

  function addFavorite(recipe = {}) {
    const favorites = JSON.parse(localStorage.getItem("favorites")) ?? [];

    localStorage.setItem("favorites", JSON.stringify([...favorites, recipe]));
  }

  function deleteFavorite(id) {
    const favorites = JSON.parse(localStorage.getItem("favorites")) ?? [];

    const newFavorites = favorites.filter((f) => f.id !== id);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
  }

  function checkStorage(id) {
    const favorites = JSON.parse(localStorage.getItem("favorites")) ?? [];
    return favorites.some((f) => f.id === id);
  }

  function showToast(message) {
    const toastDiv = document.querySelector("#toast");
    const toastBody = document.querySelector(".toast-body");

    const toast = new bootstrap.Toast(toastDiv);

    toastBody.textContent = message;

    toast.show();
  }

  function getFavorites() {
    const favorites = JSON.parse(localStorage.getItem("favorites")) ?? [];
    if (favorites.length) {
      showRecipes(favorites);
      return;
    }

    const noFavorites = document.createElement("P");
    noFavorites.textContent = "There aren't favorites yet!";
    noFavorites.classList.add("fs-4", "text-center", "font-bold", "mt-5");

    favoritesDiv.appendChild(noFavorites);
  }

  function cleanHTML(select) {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  }
}

document.addEventListener("DOMContentLoaded", init);
