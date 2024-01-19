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

      let theTag = item.setAttribute("data-gallery-tag", "");
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
    // *** Faire une transition en CSS de 0.5s à la place du fadeIn ***
    // $(this).fadeIn(500);
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

      target.classList.contains("nav-link")
        ? filterByTag(target)
        : target.classList.contains("mg-prev")
        ? prevImage(options.lightboxId)
        : target.classList.contains("mg-next")
        ? nextImage(options.lightboxId)
        : null;
    });
  }
  // La fonction prend "element" en tant que paramètre
  function createRowWrapper(element) {
    // Vérifie si le premier enfant de l'élément ne possède pas la classe "row"
    if (!element.children[0].classList.contains("row")) {
      const rowWrapper = document.createElement("div");
      // Ajoute les classes "gallery-items-row" et "row" nouvel élément crée
      rowWrapper.classList.add("gallery-items-row", "row");
      // Met le nouvel élément à l'intérieur de l'élément existant.
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

  // function prevImage() {
  //   let activeImage = document.querySelector(".lightboxImage");
  //   if (!activeImage) return;

  //   let activeTag = document.querySelector(".tags-bar span.active-tag").getAttribute("data-images-toggle");

  //   let imagesCollection = [];

  //   if (activeTag === "all") {
  //     document.querySelectorAll(".item-column img").forEach(function (img) {
  //       imagesCollection.push(img);
  //     });
  //   } else {
  //     document.querySelectorAll(".item-column img").forEach(function (img) {
  //       const galleryTag = img.getAttribute("data-gallery-tag");
  //       if (galleryTag === activeTag) {
  //         imagesCollection.push(img);
  //       }
  //     });
  //   }

  //   let index = 0,
  //   next = null;

  //   $(imagesCollection).each(function (i) {
  //     if ($(activeImage).attr("src") === $(this).attr("src")) {
  //       index = i - 1;
  //     }
  //   });
  //   next =
  //   imagesCollection[index] ||
  //   imagesCollection[imagesCollection.length - 1];
  //   $(".lightboxImage").attr("src", $(next).attr("src"));
  // }

  // function nextImage() {
  //   let activeImage = null;
  //   $("img.gallery-item").each(function () {
  //     if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
  //       activeImage = $(this);
  //     }
  //   });
  //   let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
  //   let imagesCollection = [];
  //   if (activeTag === "all") {
  //     $(".item-column").each(function () {
  //       if ($(this).children("img").length) {
  //         imagesCollection.push($(this).children("img"));
  //       }
  //     });
  //   } else {
  //     $(".item-column").each(function () {
  //       if ($(this).children("img").data("gallery-tag") === activeTag) {
  //         imagesCollection.push($(this).children("img"));
  //       }
  //     });
  //   }
  //   let index = 0,
  //   next = null;

  //   $(imagesCollection).each(function (i) {
  //     if ($(activeImage).attr("src") === $(this).attr("src")) {
  //       index = i + 1;
  //     }
  //   });
  //   next = imagesCollection[index] || imagesCollection[0];
  //   $(".lightboxImage").attr("src", $(next).attr("src"));
  // }

  function createLightBox(gallery, lightboxId, navigation) {
    const modal = document.createElement("div");
    modal.classList.add("modal", "fade");
    modal.id = lightboxId || "galleryLightbox";
    modal.tabIndex = -1;
    modal.role = "dialog";
    modal.ariaHidden = true;

    const galleryContent = document.createElement("div");
    galleryContent.classList.add("modal-content");

    galleryContent.innerHTML = ` <div class="modal-body">  
        ${
          navigation
            ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
            : '<span style="display:none;" />'
        }
        <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
        ${
          navigation
            ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
            : '<span style="display:none;" />'
        }
        </div>`;

    modal.classList.add("modal-dialog");
    modal.appendChild(galleryContent);

    gallery.appendChild(modal);
  }

  function showItemTags(gallery, position, tags) {
    const tagItems = `<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>`;

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
