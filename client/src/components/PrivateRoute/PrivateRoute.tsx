import { Navigate } from "react-router-dom";
import type { ComponentChildren } from "preact";

interface PrivateRouteProps {
  isAuth: boolean;
  redirectTo: string;
  children: ComponentChildren;
}

export const PrivateRoute = ({
  isAuth,
  redirectTo,
  children,
}: PrivateRouteProps) => {
  return isAuth ? <>{children}</> : <Navigate to={redirectTo} />;
};
