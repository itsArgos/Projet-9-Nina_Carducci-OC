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
    let tagsCollection = [];
    
    gallery.querySelectorAll(".gallery-item").forEach(function (item) {
      responsiveImageItem(item);
      moveItemInRowWrapper(item);
      // Enveloppe l'élément dans une colonne en fonction du nombre de colonnes spécifié dans les options
      wrapItemInColumn(item, options.columns);
      
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
        // Si l'élément cliqué a la classe "nav-link", alors il filtre les images par tag
        if (target.classList.contains("nav-link")) {
          filterByTag(target);
          // Sinon si l'élément a la classe "mg-prev", affiche l'image précédente dans la lightbox
        } else if (target.classList.contains("mg-prev")) {
          prevImage(options.lightboxId);
          // Sinon si l'élément a la classe "mg-next", affiche l'image suivante dans la lightbox
        } else if (target.classList.contains("mg-next")) {
          nextImage(options.lightboxId);
        }
      });
    }
    
    function createRowWrapper(element) {
      // Récupère le premier enfant de l'élément
      const firstChild = element.children[0];
      // Vérifie si le premier enfant n'est pas déjà enveloppé dans un conteneur ("row")
      if (!firstChild?.classList.contains("row")) {
        const rowWrapper = document.createElement("div");
        rowWrapper.classList.add("gallery-items-row", "row");
        // Met la div avant le premier enfant de l'élément
        element.insertBefore(rowWrapper, firstChild);
      }
    }
    
    function wrapItemInColumn(element, columns) {
      // Si le nombre de colonnes est spécifié en tant que nombre
      if (typeof columns === "number") {
        // Calcule la largeur de la colonne en fonction du nombre de colonnes
        const columnWidth = Math.ceil(12 / columns);
        const columnClasses = `item-column mb-4 col-${columnWidth}`;
        
        const column = document.createElement("div");
        column.className = columnClasses;
        // Insère la colonne avant l'élément à envelopper
        element.parentNode.insertBefore(column, element);
        column.appendChild(element);
        // Si les tailles de colonnes sont spécifiées en tant qu'objet
      } else if (typeof columns === "object") {
        let columnClasses = "";
        // Ajoute les classes de colonne pour chaque taille d'écran spécifiée
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
        // Insère la colonne avant l'élément à envelopper
        element.parentNode.insertBefore(columnDiv, element);
        columnDiv.appendChild(element);
        // Si le paramètre columns n'est ni un nombre ni un objet, affiche une erreur
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
        // Vérifie sii element est false (!element) alors il ferme la modale
        if (!element) {
          modale.close();
          return;
        }
        // Enregistre l'élément actuel dans la variable currentPicture
        currentPicture = element;
        // Met à jour la source de l'image dans la lightbox avec la source de l'élément spécifié
        modale.querySelector(".lightboxImage").src = element.src;
        modale.addEventListener("click", function (event) {
          // Si nous sommes amenés à clicker en dehors de la modale alors elle se ferme
          if (event.target === modale) {
            modale.close();
          }
        });
        modale.showModal();
      }
      
      function changeImage(direction) {
        // Lors du changement d'image ferme là modale actuelle et rouvre la nouvelle modale avec l'image correspondante via la fonction "openLightBox "
        modale.close();
        openLightBox(
          currentPicture.parentNode[`${direction}Sibling`]?.querySelector("img")
          );
        }
        
        // Mise en place des boutons pour passer à l'image suivante ou revenir à l'image précédente
        const btnPrev = modale.querySelector("button:first-child");
        const btnNext = modale.querySelector("button:last-child");
        btnPrev.addEventListener("click", () => changeImage("previous"));
        btnNext.addEventListener("click", () => changeImage("next"));
        
        function createLightBox(lightboxId) {
          const modal = document.createElement("dialog");
          const galleryContent = document.createElement("div");
          // Attribue un ID à la modal (utilise "galleryLightbox" par défaut si aucun ID n'est fourni)
          modal.id = lightboxId || "galleryLightbox";
          // Définit le rôle de la modal comme "dialog"
          modal.role = "dialog";
          
          galleryContent.classList.add("modal-content");
          // Crée le contenu HTML à notre div "galleryContent"
          galleryContent.innerHTML = `<button title="image précédente" class="btn-left" > &lt; </button> <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/> <button title="image suivante" class="btn-right"> &gt; </button>`;
          
          modal.appendChild(galleryContent);
          document.body.appendChild(modal);
        }
        
        function showItemTags(gallery, position, tag) {
          // Initialise la première balise li pour le tag "Tous"
          let tagItems = `<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>`;
          // Ajoute une balise li pour chaque tag dans le tableau
          tag.forEach(function (value) {
            tagItems += `<li class="nav-item active">
            <span class="nav-link"  data-images-toggle="${value}">${value}</span></li>`;
          });
          
          const tagRow = document.createElement("ul");
          tagRow.classList.add("my-4", "tags-bar", "nav", "nav-pills");
          // Remplit l'élément ul avec les balises li générées
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
          // Si le tag actuel est déjà actif, ne rien faire
          if (filterTag.classList.contains("active-tag")) {
            return;
          }
          // Désactive tous les tags actifs
          activeTag.forEach(function (tag) {
            tag.classList.remove("active", "active-tag");
          });
          // Active le tag spécifié
          filterTag.classList.add("active-tag", "active");
          // Récupère la valeur de l'attribut data-images-toggle du tag spécifié
          const tag = filterTag.getAttribute("data-images-toggle");
          
          galleryItem.forEach(function (category) {
            category.closest(".item-column").style.display = "none";
            // Si le tag est "all", affiche tous les éléments
            if (tag === "all") {
              category.closest(".item-column").style.display = "block";
              // Sinon, affiche seulement les éléments avec le tag correspondant
            } else if (category.getAttribute("data-gallery-tag") === tag) {
              category.closest(".item-column").style.display = "block";
            }
          });
        }
      }
      export default mauGallery;