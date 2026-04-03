import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider, useUser } from "./providers/UserProvider";
import { AxiosProvider } from "./providers/AxiosProvider";
import { ToastProvider } from "./providers/ToastProvider";
import { RoomsProvider } from "./providers/RoomsProvider";
import { ChatProvider } from "./providers/ChatProvider";
import { PrivateRoute } from "./components/PrivateRoute/PrivateRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { RoomsPage } from "./pages/RoomsPage";
import { ChatPage } from "./pages/ChatPage";

const AppRoutes = () => {
  const { auth } = useUser();

  return (
    <Routes>
      <Route
        path="/login"
        element={auth ? <Navigate to="/rooms" /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={auth ? <Navigate to="/rooms" /> : <RegisterPage />}
      />
      <Route
        path="/rooms"
        element={
          <PrivateRoute isAuth={Boolean(auth)} redirectTo="/login">
            <RoomsProvider>
              <RoomsPage />
            </RoomsProvider>
          </PrivateRoute>
        }
      />
      <Route
        path="/rooms/:id"
        element={
          <PrivateRoute isAuth={Boolean(auth)} redirectTo="/login">
            <ChatProvider>
              <ChatPage />
            </ChatProvider>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to={auth ? "/rooms" : "/login"} />} />
    </Routes>
  );
};

export const App = () => {
  return (
    <BrowserRouter>
      <AxiosProvider>
        <ToastProvider>
          <UserProvider>
            <AppRoutes />
          </UserProvider>
        </ToastProvider>
      </AxiosProvider>
    </BrowserRouter>
  );
};
