import AppRouter from "./routes";
import { Toaster } from "sonner";
import { useEffect } from "react";
import useAuthStore from "./store/useAuthStore";
import axios from "axios";

function App() {
  const { fetchMe, setLoading, setAuth } = useAuthStore.getState();

  useEffect(() => {
  const initAuth = async () => {
    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/refresh",
        {},
        { withCredentials: true }
      );

      const token = res.data.accessToken;

      setAuth(token, null);
      await fetchMe(token);

    } catch (err) {
      console.log("Chưa login");
    } finally {
      setLoading(false);
    }
  };

  initAuth();
}, []);
  return (
    <>
      <Toaster richColors position="top-right" />
      <AppRouter />
    </>
  );
}

export default App;
