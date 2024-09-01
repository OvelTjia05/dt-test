import { useState } from "react";
import { API_URL } from "@/config/api";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/button";

const Export = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    setIsLoading(true);
    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      };
      const response = await axios.get(
        `${API_URL.customerService}/coupons/export?sort_by=name&sort_direction=asc&search_by=name`,
        {
          headers,
          responseType: "blob",
        },
      );

      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "coupon_list.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        alert("Something went wrong. Please try again later.");
      }
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert("Your session has expired. Please log in again.");
        localStorage.removeItem("access_token");
        navigate("/login", { replace: true });
      } else {
        console.error("Error exporting data", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={isLoading}>
      {isLoading ? "Exporting..." : "Export"}
    </Button>
  );
};

export default Export;
