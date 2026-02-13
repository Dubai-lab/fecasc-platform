import http from "./http";

export async function fetchAllServicesAdmin() {
  const res = await http.get("/services/all");
  return res.data;
}

export async function createService(payload) {
  const res = await http.post("/services", payload);
  return res.data;
}

export async function updateService(id, payload) {
  const res = await http.patch(`/services/${id}`, payload);
  return res.data;
}

export async function deleteService(id) {
  const res = await http.delete(`/services/${id}`);
  return res.data;
}
