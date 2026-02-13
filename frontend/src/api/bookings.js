import http from "./http";

export async function fetchBookings() {
  const res = await http.get("/bookings");
  return res.data;
}

export async function updateBookingStatus(id, status) {
  const res = await http.patch(`/bookings/${id}/status`, { status });
  return res.data;
}
