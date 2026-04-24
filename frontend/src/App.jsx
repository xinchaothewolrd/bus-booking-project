import AppRouter from "./routes";
import { Toaster } from "sonner";

function App() {
  return (
    <>
      <Toaster richColors position="top-right" />
      <AppRouter />
    </>
  );
}

export default App;
