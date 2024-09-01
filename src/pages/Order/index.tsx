import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/pagination";
import { Dialog, DialogContent, DialogTrigger } from "@/components/dialog";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_URL } from "@/config/api";
import axios from "axios";
import OrderDetail from "./OrderDetail";
import Loader from "@/components/loader";

type OrderItem = {
  invoice_no: string;
  grandtotal: string;
  buyer: {
    name: string;
    phone: string;
  };
  store: {
    code: string;
    name: string;
  };
  coupon: {
    code: string;
    name: string;
  };
  created_at: string;
};

type OrderData = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  items: OrderItem[];
};

const Order = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [pageIndex, setPageIndex] = useState(1);
  const today = new Date();
  const endDate = today.toISOString().split("T")[0];
  today.setMonth(today.getMonth() - 1);
  const startDate = today.toISOString().split("T")[0];
  const pageSize = 10;
  const sortBy = "created_at";
  const sortDirection = "desc";
  const searchBy = "invoice_no";

  const getList = async (signal: AbortSignal) => {
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      };
      const response = await axios.get(
        `${API_URL.customerService}/orders?page=${pageIndex}&per_page=${pageSize}&sort_by=${sortBy}&start_date=${startDate}&end_date=${endDate}&sort_direction=${sortDirection}&search_by=${searchBy}`,
        { headers, signal },
      );

      const { data, status } = response;
      if (status === 200) {
        setOrderData(data);
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
        console.error("Error fetching data order", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    getList(signal);

    return () => {
      controller.abort();
      setIsLoading(true);
    };
  }, [pageIndex, pageSize, sortBy, sortDirection, searchBy]);

  const handlePagination = (page: string) => {
    if (page === "-") {
      setPageIndex((prev) => Math.max(prev - 1, 1));
    } else if (page === "+") {
      setPageIndex((prev) => prev + 1);
    } else {
      setPageIndex(parseInt(page));
    }
  };

  return (
    <div className="flex h-full flex-col">
      {!isLoading ? (
        <div className="grid">
          <Table className="">
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead>Invoice No.</TableHead>
                <TableHead>Grand Total</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Coupon</TableHead>
                <TableHead className="text-right">Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderData?.items?.map((order) => (
                <Dialog key={order.invoice_no}>
                  <DialogTrigger asChild className="cursor-pointer">
                    <TableRow>
                      <TableCell className="font-medium">
                        {order.invoice_no}
                      </TableCell>
                      <TableCell>Rp. {order.grandtotal}</TableCell>
                      <TableCell>
                        {order.buyer.name}
                        <br />
                        {order.buyer.phone}
                      </TableCell>
                      <TableCell>{order.store.name}</TableCell>
                      <TableCell>{order.coupon.name}</TableCell>
                      <TableCell className="text-right">
                        {order.created_at}
                      </TableCell>
                    </TableRow>
                  </DialogTrigger>
                  <DialogContent className="max-h-[85vh] overflow-y-auto">
                    <OrderDetail invoice={order.invoice_no} />
                  </DialogContent>
                </Dialog>
              ))}
            </TableBody>
          </Table>
          <Pagination className="">
            <PaginationContent>
              <PaginationItem
                className={`${pageIndex === 1 ? "pointer-events-none cursor-not-allowed opacity-70" : "cursor-pointer"}`}
              >
                <PaginationPrevious onClick={() => handlePagination("-")} />
              </PaginationItem>
              {orderData?.last_page === pageIndex ? (
                <PaginationItem>
                  <PaginationLink>{pageIndex}</PaginationLink>
                </PaginationItem>
              ) : (
                Array.from(
                  {
                    length:
                      (orderData?.last_page ?? 0) -
                        (orderData?.current_page ?? 0) <
                      2
                        ? 2
                        : 3,
                  },
                  (_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        className={`${orderData?.current_page === pageIndex + index && "rounded bg-muted"}`}
                        onClick={() => handlePagination(`${pageIndex + index}`)}
                      >
                        {pageIndex + index}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )
              )}
              <PaginationItem
                className={`${orderData?.last_page === pageIndex ? "pointer-events-none cursor-not-allowed opacity-70" : "cursor-pointer"}`}
              >
                <PaginationNext onClick={() => handlePagination("+")} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : (
        <Loader label="Loading..." />
      )}
    </div>
  );
};
export default Order;
