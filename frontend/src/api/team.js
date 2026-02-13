import http from "./http";

export const fetchTeam = () => http.get("/team").then(res => res.data);

export const fetchAllTeamAdmin = () => http.get("/team/all").then(res => res.data);

export const createTeamMember = (data) => {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("title", data.title);
  if (data.credentials) formData.append("credentials", data.credentials);
  if (data.bio) formData.append("bio", data.bio);
  if (data.order !== undefined) formData.append("order", data.order);
  if (data.image) formData.append("image", data.image);
  if (data.email) formData.append("email", data.email);
  if (data.password) formData.append("password", data.password);
  if (data.role) formData.append("role", data.role);
  if (data.assignedServices && data.assignedServices.length > 0) {
    formData.append("assignedServices", JSON.stringify(data.assignedServices));
  }
  if (data.isPublic !== undefined) formData.append("isPublic", data.isPublic);

  return http.post("/team", formData).then(res => res.data);
};

export const updateTeamMember = (id, data) => {
  const formData = new FormData();
  if (data.name) formData.append("name", data.name);
  if (data.title) formData.append("title", data.title);
  if (data.credentials !== undefined) formData.append("credentials", data.credentials);
  if (data.bio !== undefined) formData.append("bio", data.bio);
  if (data.order !== undefined) formData.append("order", data.order);
  if (data.image) formData.append("image", data.image);
  if (data.isActive !== undefined) formData.append("isActive", data.isActive);
  if (data.email) formData.append("email", data.email);
  if (data.password) formData.append("password", data.password);
  if (data.role) formData.append("role", data.role);
  if (data.assignedServices && data.assignedServices.length > 0) {
    formData.append("assignedServices", JSON.stringify(data.assignedServices));
  }
  if (data.isPublic !== undefined) formData.append("isPublic", data.isPublic);

  return http.patch(`/team/${id}`, formData).then(res => res.data);
};

export const deleteTeamMember = (id) => http.delete(`/team/${id}`).then(res => res.data);
