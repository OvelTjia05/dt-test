import { Toaster } from "@/components/toaster";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
};

export default AuthLayout;
