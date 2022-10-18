import Message from "./components/Message";
import Login from "./components/Login";
import { Route, Routes, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import Register from "./components/Register";

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="home" element={<Message />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
