import Home from "./components/Home";
import Login from "./components/Login";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import Register from "./components/Register";
import useAuth from "./hooks/auth/useAuth";
import { AuthContext, AuthContextTypes } from "./hooks/auth/AuthContext";

function App() {
  const { storedUser, storedToken, setStoredToken, setStoredUser } = useAuth();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          storedToken,
          setStoredToken,
          storedUser,
          setStoredUser,
        }}
      >
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            element={
              storedToken && storedUser ? <Outlet /> : <Navigate to="/" />
            }
          >
            <Route path="/home" element={<Home />} />
          </Route>
        </Routes>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
