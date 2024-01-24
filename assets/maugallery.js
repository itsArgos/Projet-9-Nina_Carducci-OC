function mauGallery(option) {
  const galleryContainer = document.querySelectorAll(".gallery");

  mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true,
  };

  // Crée un objet options en fusionnant les valeurs par défaut de mauGallery.defaults
  // avec les options fournies en paramètre (option).
  const options = { ...mauGallery.defaults, ...option };

  // Pour chaque élément (gallery) dans le conteneur de galerie (galleryContainer).
  galleryContainer.forEach(function (gallery) {
    // Appelle la fonction createRowWrapper avec l'élément actuel de la galerie.
    createRowWrapper(gallery);

    // Si l'option lightBox est activée
    if (options.lightBox) {
      // Appelle la fonction createLightBox avec le conteneur de galerie (gallery),
      // l'id de la lightbox (options.lightboxId), et les options de navigation (options.navigation).
      createLightBox(gallery, options.lightboxId, options.navigation);
    }
    listeners(options);

    function moveItemInRowWrapper(element) {
      // Accède au parent de l'élément, puis recherche le premier élément avec la classe ".gallery-items-row".
      // Ensuite, ajoute (element) aux enfants.
      element.parentNode
        .querySelector(".gallery-items-row")
        .appendChild(element);
    }

    function responsiveImageItem(element) {
      if (element.tagName === "IMG") {
        element.classList.add("img-fluid");
      }
    }

    // Sélectionne tous les éléments avec la classe "gallery-item" dans la galerie
    gallery.querySelectorAll(".gallery-item").forEach(function (item) {
      responsiveImageItem(item);
      moveItemInRowWrapper(item);
      // Enveloppe l'élément dans une colonne en fonction du nombre de colonnes spécifié dans les options
      wrapItemInColumn(item, options.columns);
      let tagsCollection = [];

      let galleryTag = item.getAttribute("data-gallery-tag");
      // Vérifie si les tags doivent être affichées, si un tag est présent et si il n'est pas déjà dans la collection
      if (
        options.showTags &&
        galleryTag !== undefined &&
        tagsCollection.indexOf(galleryTag) === -1
      ) {
        // Ajoute le tag à la collection si elle n'est pas déjà présente
        tagsCollection.push(galleryTag);
      }
    });
    // Vérifie si l'option pour afficher les tags est activée
    if (options.showTags) {
      // Alors il affiche les tags associées à la galerie en utilisant la fonction showItemTags
      // avec la position spécifiée dans les options et la collection de balises
      showItemTags(gallery, options.tagsPosition, tagsCollection);
    }
    // Affiche la galerie en changeant le style d'affichage à "block"
    gallery.style.display = "block";
  });

  function listeners(options) {
    const galleryItem = document.querySelectorAll(".gallery-item");
    const gallery = document.querySelector(".gallery");

    // Pour chaque élément dans la collection galleryItem
    galleryItem.forEach(function (item) {
      item.addEventListener("click", function () {
        // Vérifie si l'élément cliqué est une balise d'image (IMG)
        if (item.tagName === "IMG") {
          // Si c'est le cas, ouvre la lightbox en passant l'élément image cliqué à la fonction openLightBox
          openLightBox(item);
        } else {
          // Si l'élément n'est pas une balise d'image, ne fait rien
          return;
        }
      });
    });

    gallery.addEventListener("click", (event) => {
      const target = event.target;

      if (target.classList.contains("nav-link")) {
        filterByTag(target);
      } else if (target.classList.contains("mg-prev")) {
        prevImage(options.lightboxId);
      } else if (target.classList.contains("mg-next")) {
        nextImage(options.lightboxId);
      }
    });
  }

  function createRowWrapper(element) {
    const firstChild = element.children[0];

    if (!firstChild?.classList.contains("row")) {
      const rowWrapper = document.createElement("div");
      rowWrapper.classList.add("gallery-items-row", "row");
      element.insertBefore(rowWrapper, firstChild);
    }
  }

  function wrapItemInColumn(element, columns) {
    if (typeof columns === "number") {
      const columnWidth = Math.ceil(12 / columns);
      const columnClasses = `item-column mb-4 col-${columnWidth}`;

      const column = document.createElement("div");
      column.className = columnClasses;

      element.parentNode.insertBefore(column, element);
      column.appendChild(element);
    } else if (typeof columns === "object") {
      let columnClasses = "";

      if (columns.xs) {
        columnClasses += " col-" + Math.ceil(12 / columns.xs);
      }
      if (columns.sm) {
        columnClasses += " col-sm-" + Math.ceil(12 / columns.sm);
      }
      if (columns.md) {
        columnClasses += " col-md-" + Math.ceil(12 / columns.md);
      }
      if (columns.lg) {
        columnClasses += " col-lg-" + Math.ceil(12 / columns.lg);
      }
      if (columns.xl) {
        columnClasses += " col-xl-" + Math.ceil(12 / columns.xl);
      }

      const columnDiv = document.createElement("div");
      columnDiv.className = "item-column mb-4 " + columnClasses;

      element.parentNode.insertBefore(columnDiv, element);
      columnDiv.appendChild(element);
    } else {
      console.error(
        "Columns should be defined as numbers or objects." +
          typeof columns +
          "is not supported."
      );
    }
  }

  let currentPicture = null;

  const modale = document.querySelector(`dialog`);

  function openLightBox(element) {
    if (!element) {
      modale.close();
      return;
    }
    currentPicture = element;

    modale.querySelector(".lightboxImage").src = element.src;
    modale.addEventListener("click", function (event) {
      if (event.target === modale) {
        modale.close();
      }
    });
    modale.showModal();
  }

  function changeImage(direction) {
    modale.close();
    openLightBox(
      currentPicture.parentNode[`${direction}Sibling`]?.querySelector("img")
    );
  }

  const btnPrev = modale.querySelector("button:first-child");
  const btnNext = modale.querySelector("button:last-child");
  btnPrev.addEventListener("click", () => changeImage("previous"));
  btnNext.addEventListener("click", () => changeImage("next"));

  function createLightBox(gallery, lightboxId, navigation) {
    const modal = document.createElement("dialog");
    const galleryContent = document.createElement("div");

    modal.id = lightboxId || "galleryLightbox";
    modal.role = "dialog";

    galleryContent.classList.add("modal-content");
    galleryContent.innerHTML = `<button class="btn-left" > &lt; </button> <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/> <button class="btn-right"> &gt; </button>`;

    modal.appendChild(galleryContent);
    document.body.appendChild(modal);
  }

  function showItemTags(gallery, position, tag) {
    let tagItems = `<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>`;

    tag.forEach(function (value) {
      tagItems += `<li class="nav-item active">
            <span class="nav-link"  data-images-toggle="${value}">${value}</span></li>`;
    });

    const tagRow = document.createElement("ul");
    tagRow.classList.add("my-4", "tags-bar", "nav", "nav-pills");
    tagRow.innerHTML = tagItems;

    if (position === "bottom") {
      gallery.appendChild(tagRow);
    } else if (position === "top") {
      gallery.insertBefore(tagRow, gallery.firstChild);
    } else {
      console.error("Unknown tags position: " + position);
    }
  }

  function filterByTag(filterTag) {
    const activeTag = document.querySelectorAll(".active.active-tag");
    const galleryItem = document.querySelectorAll(".gallery-item");

    if (filterTag.classList.contains("active-tag")) {
      return;
    }
    activeTag.forEach(function (tag) {
      tag.classList.remove("active", "active-tag");
    });

    filterTag.classList.add("active-tag", "active");
    const tag = filterTag.getAttribute("data-images-toggle");

    galleryItem.forEach(function (category) {
      category.closest(".item-column").style.display = "none";
      if (tag === "all") {
        category.closest(".item-column").style.display = "block";
      } else if (category.getAttribute("data-gallery-tag") === tag) {
        category.closest(".item-column").style.display = "block";
      }
    });
  }
}
export default mauGallery;
