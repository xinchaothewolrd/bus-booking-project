import create from 'zustand';
import { fetchMeApi } from '../services/user';

const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  isLogin: false,

  setAuth: (token, user) =>
    set({
      accessToken: token,
      user,
      isLogin: true,
    }),
  
  setLoading: (val) => set({ isLoading: val }),

  fetchMe: async (token) => {
    try {
      const res = await fetchMeApi(token);

      set({
        user: res.data.user,
        isLogin: true,
      });

      return res.data.user; // 🔥 nên return luôn
    } catch (err) {
      set({
        user: null,
        isLogin: false,
      });
      throw err; // 🔥 để initAuth bắt được
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
