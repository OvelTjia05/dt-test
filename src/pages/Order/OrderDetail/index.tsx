import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/dialog";
import Loader from "@/components/loader";
import { API_URL } from "@/config/api";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type OrderItem = {
  product: {
    code: string;
    name: string;
    category: string;
    price: string;
  };
  qty: string;
  total_price: string;
};

type OrderDetail = {
  invoice_no: string;
  grandtotal: string;
  created_at: string;
  buyer: {
    name: string;
    phone: string;
  };
  store: {
    code: string;
    name: string;
    city: string;
    province: string;
  };
  coupon: {
    code: string;
    name: string;
  };
  items: OrderItem[];
};

const OrderDetail: React.FC<{ invoice: string }> = ({ invoice }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [detail, setDetail] = useState<OrderDetail | null>(null);

  const getDetail = async (signal: AbortSignal) => {
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      };
      const response = await axios.get(
        `${API_URL.customerService}/orders/${invoice}`,
        { headers, signal },
      );

      console.log("res order detail", response);
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
        console.error("Error fetch detail order", error);
      }
    } finally {
      setIsLoading(false);
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
    <>
      {!isLoading ? (
        <>
          <DialogHeader>
            <DialogTitle className="mb-4 capitalize">
              {detail?.invoice_no}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription asChild>
            <div className="space-y-6 p-4">
              {/* Order Information */}
              <div>
                <h3 className="mb-2 text-lg font-semibold">
                  Order Information
                </h3>
                <div className="flex justify-between">
                  <span>Grand Total:</span>
                  <span>Rp. {detail?.grandtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Created At:</span>
                  <span>{detail?.created_at}</span>
                </div>
              </div>

              {/* Buyer Information */}
              <div>
                <h3 className="mb-2 text-lg font-semibold">
                  Buyer Information
                </h3>
                <div className="flex justify-between">
                  <span>Name:</span>
                  <span>{detail?.buyer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span>{detail?.buyer.phone}</span>
                </div>
              </div>

              {/* Store Information */}
              <div>
                <h3 className="mb-2 text-lg font-semibold">
                  Store Information
                </h3>
                <div className="flex justify-between">
                  <span>Store Code:</span>
                  <span>{detail?.store.code}</span>
                </div>
                <div className="flex justify-between">
                  <span>Store Name:</span>
                  <span>{detail?.store.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>City:</span>
                  <span>{detail?.store.city}</span>
                </div>
                <div className="flex justify-between">
                  <span>Province:</span>
                  <span>{detail?.store.province}</span>
                </div>
              </div>

              {/* Coupon Information */}
              {detail?.coupon && (
                <div>
                  <h3 className="mb-2 text-lg font-semibold">
                    Coupon Information
                  </h3>
                  <div className="flex justify-between">
                    <span>Coupon Code:</span>
                    <span>{detail?.coupon.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coupon Name:</span>
                    <span>{detail?.coupon.name}</span>
                  </div>
                </div>
              )}

              {/* Items Information */}
              <div>
                <h3 className="mb-2 text-lg font-semibold">Items</h3>
                <div className="space-y-2">
                  {detail?.items.map((item, index) => (
                    <div key={index} className="rounded-lg border p-2">
                      <div className="flex justify-between">
                        <span>Product Name:</span>
                        <span>{item.product.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Category:</span>
                        <span>{item.product.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price:</span>
                        <span>Rp. {item.product.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quantity:</span>
                        <span>{item.qty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Price:</span>
                        <span>Rp. {item.total_price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogDescription>
        </>
      ) : (
        <Loader label="Loading..." />
      )}
    </>
  );
};
export default OrderDetail;
