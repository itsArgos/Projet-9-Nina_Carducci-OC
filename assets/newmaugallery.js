function mauGallery(option) {
  const options = { ...mauGallery.defaults, ...option };
  const galleryContainer = document.querySelectorAll(".gallery");
  let tagsCollection = [];

  galleryContainer.forEach(function (gallery) {
    createRowWrapper(gallery);

    if (options.lightBox) {
      createLightBox(gallery, options.lightboxId, options.navigation);
    }

    listeners(options);

    gallery.querySelectorAll(".gallery-item").forEach(function (item) {
      responsiveImageItem(item);
      moveItemInRowWrapper(item);
      wrapItemInColumn(item, options.columns);

      let theTag = item.getAttribute("data-gallery-tag");
      if (
        options.showTags &&
        theTag !== undefined &&
        tagsCollection.indexOf(theTag) === -1
      ) {
        tagsCollection.push(theTag);
      }
    });

    if (options.showTags) {
      showItemTags(gallery, options.tagsPosition, tagsCollection);
    }
    gallery.style.display = "block";
  });

  mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true,
  };

  function listeners(options) {
    const galleryItem = document.querySelectorAll(".gallery-item");

    galleryItem.forEach(function (item) {
      item.addEventListener("click", function () {
        if (options.lightBox && item.tagName === "IMG") {
          openLightBox(item, options.lightboxId);
        } else {
          return;
        }
      });
    });

    document.querySelector(".gallery").addEventListener("click", (event) => {
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
    if (!element.children[0].classList.contains("row")) {
      const rowWrapper = document.createElement("div");
      rowWrapper.classList.add("gallery-items-row", "row");
      element.appendChild(rowWrapper);
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

      const column = document.createElement("div");
      column.className = "item-column mb-4 " + columnClasses;

      element.parentNode.insertBefore(column, element);
      column.appendChild(element);
    } else {
      console.error(
        "Columns should be defined as numbers or objects." +
          typeof columns +
          "is not supported."
      );
    }
  }

  function moveItemInRowWrapper(element) {
    element.parentNode.querySelector(".gallery-items-row").appendChild(element);
  }

  function responsiveImageItem(element) {
    if (element.tagName === "IMG") {
      element.classList.add("img-fluid");
    }
  }

  function openLightBox(element, lightboxId) {
    const modale = document.querySelector(`#${lightboxId}`);
    modale.querySelector(".lightboxImage").src = element.src;
    modale.showModal();
  }

  // function changeImage(lightboxId, direction) {
  //   const activeImage = document.querySelector(".lightboxImage");
  //   if (!activeImage) return;

  //   const activeImageSrc = activeImage.src;
  //   let activeTag = document
  //     .querySelector(".tags-bar span.active-tag")
  //     .getAttribute("data-images-toggle");
  //   let imagesCollection = [];

  //   let selectionneImages = function (img) {
  //     if (
  //       activeTag === "all" ||
  //       img.getAttribute("data-gallery-tag") === activeTag
  //     ) {
  //       imagesCollection.push(img);
  //     }
  //   };

  //   document.querySelectorAll(".item-column img").forEach(selectionneImages);

  //   let currentIndex = imagesCollection.findIndex(function (img) {
  //     return img.src === activeImageSrc;
  //   });

  //   let newIndex =
  //     (currentIndex + direction + imagesCollection.length) %
  //     imagesCollection.length;

  //   activeImage.src = imagesCollection[newIndex].src;
  // }

  function createLightBox(gallery, lightboxId, navigation) {
    const modal = document.createElement("dialog");
    modal.id = lightboxId || "galleryLightbox";
    modal.role = "dialog";

    const galleryContent = document.createElement("div");

    galleryContent.classList.add("modal-content");

    galleryContent.innerHTML = ` 
    ${
      navigation
        ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
        : '<span style="" />'
    }
    <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
    ${
      navigation
        ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
        : '<span style="" />'
    }
  </div>`;

    modal.appendChild(galleryContent);
    document.body.appendChild(modal);
  }

  function showItemTags(gallery, position, tags) {
    let tagItems = `<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>`;

    tags.forEach(function (value) {
      tagItems += `<li class="nav-item active">
          <span class="nav-link"  data-images-toggle="${value}">${value}</span></li>`;
    });

    const tagsRow = document.createElement("ul");
    tagsRow.classList.add("my-4", "tags-bar", "nav", "nav-pills");
    tagsRow.innerHTML = tagItems;

    if (position === "bottom") {
      gallery.appendChild(tagsRow);
    } else if (position === "top") {
      gallery.insertBefore(tagsRow, gallery.firstChild);
    } else {
      console.error("Unknown tags position: " + position);
    }
  }

  function filterByTag(filterTag) {
    if (filterTag.classList.contains("active-tag")) {
      return;
    }
    const activeTags = document.querySelectorAll(".active.active-tag");
    activeTags.forEach(function (tag) {
      tag.classList.remove("active", "active-tag");
    });

    filterTag.classList.add("active-tag", "active");
    const tag = filterTag.getAttribute("data-images-toggle");

    document.querySelectorAll(".gallery-item").forEach(function (event) {
      event.closest(".item-column").style.display = "none";
      if (tag === "all") {
        event.closest(".item-column").style.display = "block";
      } else if (item.getAttribute("data-gallery-tag") === tag) {
        event.closest(".item-column").style.display = "block";
      }
    });
  }
}

export default mauGallery;
