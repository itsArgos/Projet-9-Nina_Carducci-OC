import mauGallery from "./maugallery.min.js";

document.addEventListener("DOMContentLoaded", function () {
  mauGallery({
    columns: {
      xs: 1,
      sm: 2,
      md: 3,
      lg: 3,
      xl: 3,
    },
    lightBox: true,
    lightboxId: "myAwesomeLightbox",
    showTags: true,
    tagsPosition: "top",
  });
});
