import http from "./http";

// Public: Get gallery images by category
export async function fetchGalleryByCategory(category) {
  const res = await http.get(`/gallery/${category}`);
  return res.data;
}

// Public: Get all gallery images
export async function fetchAllGalleryImages() {
  const res = await http.get("/gallery");
  return res.data;
}

// Admin: Upload gallery image
export async function uploadGalleryImage(formData) {
  const res = await http.post("/gallery", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

// Admin: Update gallery image
export async function updateGalleryImage(id, payload) {
  const res = await http.patch(`/gallery/${id}`, payload);
  return res.data;
}

// Admin: Delete gallery image
export async function deleteGalleryImage(id) {
  const res = await http.delete(`/gallery/${id}`);
  return res.data;
}
