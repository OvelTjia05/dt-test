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
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type CouponDetail = {
  code: string;
  name: string;
  start_date: string;
  end_date: string;
  created_at: string;
};

const CouponDetail: React.FC<{ id: string }> = ({ id }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [detail, setDetail] = useState<CouponDetail | null>(null);

  const getDetail = async (signal: AbortSignal) => {
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      };
      const response = await axios.get(
        `${API_URL.customerService}/coupons/${id}`,
        { headers, signal },
      );

      console.log("res coupon detail", response);
      const { data, status } = response;
      if (status === 200) {
        setDetail(data);
      } else {
        alert("Something went wrong. Please try again later.");
      }
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
        console.error("Error fetch detail coupon", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      };
      const response = await axios.put(
        `${API_URL.customerService}/coupons/${id}`,
        {
          name: detail?.name,
          start_date: detail?.start_date,
          end_date: detail?.end_date,
        },
        { headers },
      );
      console.log("res update coupon", response);
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
      setIsEditing(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    getDetail(signal);

    return () => {
      controller.abort();
      setIsLoading(true);
    };
  }, []);
  return (
    <DialogHeader>
      {!isLoading ? (
        <>
          <DialogTitle className="mb-4 capitalize">
            {isEditing ? (
              <Input
                type="text"
                value={detail?.name}
                onChange={(e) =>
                  setDetail(detail ? { ...detail, name: e.target.value } : null)
                }
              />
            ) : (
              detail?.name
            )}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="flex gap-2">
              <div className="mr-2 flex flex-col justify-between">
                <p>Start Date</p>
                <p>End Date</p>
                <p>Created At</p>
              </div>
              <div className="flex flex-col justify-between">
                {Array.from({ length: 3 }).map((_, index) => (
                  <p key={index} className="text-right">
                    :
                  </p>
                ))}
              </div>
              <div className="flex flex-col justify-between gap-2 text-primary max-md:flex-1">
                {isEditing ? (
                  <>
                    <Input
                      type="date"
                      value={detail?.start_date}
                      onChange={(e) =>
                        setDetail(
                          detail
                            ? { ...detail, start_date: e.target.value }
                            : null,
                        )
                      }
                    />
                    <Input
                      type="date"
                      value={detail?.end_date}
                      onChange={(e) =>
                        setDetail(
                          detail
                            ? { ...detail, end_date: e.target.value }
                            : null,
                        )
                      }
                    />
                    <p>{detail?.created_at}</p>
                  </>
                ) : (
                  <>
                    <p>{detail?.start_date}</p>
                    <p>{detail?.end_date}</p>
                    <p>{detail?.created_at}</p>
                  </>
                )}
              </div>
            </div>
          </DialogDescription>
        </>
      ) : (
        <Loader label="Loading..." />
      )}
      <DialogFooter>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Edit</Button>
        ) : (
          <Button onClick={handleUpdate}>Update</Button>
        )}
      </DialogFooter>
    </DialogHeader>
  );
};
export default CouponDetail;
