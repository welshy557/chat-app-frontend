import Home from "./components/Home";
import Login from "./components/Login";
import { Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { QueryCache, QueryClient, QueryClientProvider } from "react-query";
import Register from "./components/Register";
import useAuth from "./hooks/auth/useAuth";
import { AuthContext } from "./hooks/auth/AuthContext";
import toast from "react-hot-toast";

function App() {
  const { storedUser, storedToken, setStoredToken, setStoredUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
    queryCache: new QueryCache({
      onError: (err: any, _) => {
        if (err.message === "Request failed with status code 403") {
          navigate("/");
          toast.error("User is unauthorized. Please try again.");
        }
      },
    }),
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
