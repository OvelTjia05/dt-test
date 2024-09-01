import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Coupon from "./pages/Coupon";
import Order from "./pages/Order";
import Login from "./pages/Login";
import AuthLayout from "./layouts/AuthLayout";
import { getAuthToken } from "./config/auth";
import Error from "./pages/Error";
// import Export from "./pages/Coupon/Export";

export const routerList = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: getAuthToken() ? (
          <Navigate to="app" replace />
        ) : (
          <Navigate to="login" replace />
        ),
      },
      {
        path: "app",
        element: <MainLayout />,
        errorElement: <Error />,
        children: [
          {
            index: true,
            element: <Navigate to="dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "coupon",
            element: <Coupon />,
            // children: [
            //   {
            //     path: "export",
            //     element: <Export />,
            //   },
            // ],
          },
          {
            path: "order",
            element: <Order />,
          },
        ],
      },
      {
        path: "login",
        element: <Login />,
        errorElement: <Error />, // Add errorElement for login page
      },
    ],
  },
]);
