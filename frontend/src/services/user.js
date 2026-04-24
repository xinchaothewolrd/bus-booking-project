import api from "./api";

export const fetchMeApi = () => {
  return api.get('/users/me')
}

