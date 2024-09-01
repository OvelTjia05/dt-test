import { Button } from "@/components/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/dialog";
import { Input } from "@/components/input";
import Loader from "@/components/loader";
import { API_URL } from "@/config/api";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddCoupon = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [coupon, setCoupon] = useState({
    code: Math.random()
      .toString(36)
      .substring(2, 2 + 8)
      .replace(/[^a-zA-Z0-9]/g, ""),
    name: "",
    start_date: "",
    end_date: "",
  });

  const handleCreate = async () => {
    try {
      setIsLoading(true);
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      };
      await axios.post(
        `${API_URL.customerService}/coupons`,
        {
          code: coupon.code,
          name: coupon.name,
          start_date: coupon.start_date,
          end_date: coupon.end_date,
        },
        { headers },
      );
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log("Request canceled", error.message);
      } else if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        alert("Your session has expired. Please log in again.");
        localStorage.removeItem("access_token");
        navigate("/login", { replace: true });
      } else {
        console.error("Error update coupon", error);
      }
    } finally {
      setIsLoading(false);
      setCoupon({
        code: Math.random()
          .toString(36)
          .substring(2, 2 + 8)
          .replace(/[^a-zA-Z0-9]/g, ""),
        name: "",
        start_date: "",
        end_date: "",
      });
    }
  };

  return (
    <DialogHeader>
      {!isLoading ? (
        <>
          <DialogTitle hidden></DialogTitle>
          <DialogDescription asChild>
            <div className="flex gap-4">
              <div className="flex flex-col justify-between">
                <p className="flex h-10 items-center">Title</p>
                <p className="flex h-10 items-center">Start Date</p>
                <p className="flex h-10 items-center">End Date</p>
              </div>
              <div className="flex flex-col items-center justify-between">
                {Array.from({ length: 3 }).map((_, index) => (
                  <p key={index} className="flex h-10 items-center">
                    :
                  </p>
                ))}
              </div>
              <div className="flex flex-col justify-between gap-2 text-primary">
                <Input
                  type="text"
                  value={coupon.name}
                  placeholder="Coupon Name"
                  onChange={(e) =>
                    setCoupon((prevState) => ({
                      ...prevState,
                      name: e.target.value,
                    }))
                  }
                  className="h-10"
                />
                <Input
                  type="date"
                  value={coupon.start_date}
                  onChange={(e) =>
                    setCoupon((prevState) => ({
                      ...prevState,
                      start_date: e.target.value,
                    }))
                  }
                  className="h-10"
                />
                <Input
                  type="date"
                  value={coupon.end_date}
                  onChange={(e) =>
                    setCoupon((prevState) => ({
                      ...prevState,
                      end_date: e.target.value,
                    }))
                  }
                  className="h-10"
                />
              </div>
            </div>
          </DialogDescription>
        </>
      ) : (
        <Loader label="Loading..." />
      )}

      <DialogFooter>
        <Button onClick={handleCreate}>Create</Button>
      </DialogFooter>
    </DialogHeader>
  );
};

export default AddCoupon;
