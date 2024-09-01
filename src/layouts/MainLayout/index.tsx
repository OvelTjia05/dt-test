import Loader from "@/components/loader";
import Profile from "@/components/profile";
import { API_URL } from "@/config/api";
import { getAuthToken } from "@/config/auth";
import axios from "axios";
import { LogOutIcon, MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

const MENU = [
  {
    name: "Dashboard",
    path: "dashboard",
  },
  {
    name: "Coupons",
    path: "coupon",
  },
  {
    name: "Orders",
    path: "order",
  },
];

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const current = location.pathname.split("/")[2];
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      };
      console.log(headers);
      const response = await axios.post(
        `${API_URL.common}/auth/logout`,
        {},
        {
          headers,
        },
      );

      console.log("response logout", response);
      const { status } = response;
      if (status === 200) {
        localStorage.removeItem("token");
        localStorage.removeItem("name");
        localStorage.removeItem("role_name");
        localStorage.removeItem("profile_image");
        navigate("/login", { replace: true });
      } else {
        alert("Something went wrong when logging out");
      }
    } catch (error) {
      console.log("error logout", error);
      alert("Something went wrong when logging out");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      {!isLoading ? (
        <>
          <div
            className={`${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } fixed inset-y-0 left-0 z-30 w-64 transform border bg-background px-4 transition-transform duration-300 ease-in-out md:relative md:w-64 md:translate-x-0`}
          >
            <div className="mt-10 px-4 pb-2">
              <Profile />
            </div>
            <div className="w-full rounded border-2 border-muted-foreground"></div>
            <button
              className="absolute right-4 top-4 fill-foreground opacity-70 hover:opacity-100 md:hidden"
              onClick={toggleSidebar}
            >
              <XIcon />
            </button>
            <nav className="flex flex-col space-y-2 py-4">
              {MENU.map((menu) => (
                <NavLink
                  key={menu.path}
                  to={menu.path}
                  className={({ isActive }) =>
                    `rounded p-2 ${isActive ? "bg-muted" : "hover:bg-muted"}`
                  }
                >
                  {menu.name}
                </NavLink>
              ))}
            </nav>
            <div
              className="absolute bottom-4 left-4 flex cursor-pointer items-center gap-3 hover:opacity-80"
              onClick={handleLogout}
            >
              <LogOutIcon className="h-8 w-8 stroke-foreground" />{" "}
              <p className="text-foreground">Log Out</p>
            </div>
          </div>

          <div className="flex flex-1 flex-col">
            {/* Navbar */}
            <div className="sticky top-0 flex items-center justify-between border p-4 text-foreground shadow-md md:hidden">
              <button onClick={toggleSidebar} className="fill-foreground">
                {!isSidebarOpen && <MenuIcon />}
              </button>
              <h1 className="text-lg font-semibold capitalize">{current}</h1>
            </div>
            <div className="sticky top-0 hidden w-full border p-4 shadow-md md:flex">
              <h1 className="text-lg font-semibold capitalize">{current}</h1>
            </div>

            {/* Content */}
            <div className="w-full flex-1 overflow-auto p-6">
              <Outlet />
            </div>
          </div>
        </>
      ) : (
        <Loader label="Logging out..." />
      )}
    </div>
  );
};

export default MainLayout;
