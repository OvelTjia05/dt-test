import "./App.css";
import { RouterProvider } from "react-router-dom";
import { routerList } from "./routes";
import { ThemeProvider } from "./components/theme-provider";

function App() {
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <RouterProvider router={routerList} />
      </ThemeProvider>
    </>
  );
}

export default App;
