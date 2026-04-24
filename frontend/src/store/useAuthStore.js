import create from 'zustand';
import { fetchMeApi } from '../services/user';

const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isLoading: false,

  setAuth: (token, user) =>
    set({
      accessToken: token,
      user,
      isLogin: true,
    }),

  fetchMe: async () => {
    try {
      const res = await fetchMeApi();

      set({
        user: res.data.user,
        isLogin: true,
      });
    } catch (err) {
      set({
        user: null,
        isLogin: false,
      });
    }
  },

  logout: () =>
    set({
      accessToken: null,
      user: null,
      isLogin: false,
    }),

  
}));

export default useAuthStore;
