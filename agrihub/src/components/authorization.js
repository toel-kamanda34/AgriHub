import { useContext } from "react";
import { AppContext } from "../AppContext";
import { Navigate } from "react-router-dom";

export function AdminRoute(props) {
  const { userCredentials } = useContext(AppContext);

  if (!userCredentials || userCredentials.user.role !== "admin") {
    return <Navigate to="/" />;
  }
  return props.children;
}

export function AuthenticatedUserRoute({ children }) {
  const { userCredentials } = useContext(AppContext);

  if (!userCredentials) {
    return <Navigate to="/" />;
  }
  return children;
}

export function VisitorRoute({ children }) {
  const { userCredentials } = useContext(AppContext);

  if (userCredentials) {
    return <Navigate to="/" />;
  }
  return children;
}
