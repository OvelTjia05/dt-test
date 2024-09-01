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

import { API_URL } from "@/config/api";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTrigger } from "@/components/dialog";
import CouponDetail from "./CouponDetail";
import { Button } from "@/components/button";
import AddCoupon from "./AddCoupon";
import Loader from "@/components/loader";
import Export from "./Export";

type CouponItem = {
  code: string;
  name: string;
  start_date: string;
  end_date: string;
  created_at: string;
};

type CouponData = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  items: CouponItem[];
};

const Coupon = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [couponData, setCouponData] = useState<CouponData | null>(null);
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 10;
  const sortBy = "name";
  const sortDirection = "asc";
  const searchBy = "name";

  const getList = async (signal: AbortSignal) => {
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      };
      const response = await axios.get(
        `${API_URL.customerService}/coupons?page=${pageIndex}&per_page=${pageSize}&sort_by=${sortBy}&sort_direction=${sortDirection}&search_by=${searchBy}`,
        { headers, signal },
      );

      const { data, status } = response;
      if (status === 200) {
        setCouponData(data);
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
        console.error("Error fetching data coupon", error);
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
    <div className="flex h-full flex-1 flex-col">
      {!isLoading ? (
        <>
          <div className="flex gap-3 self-end">
            <Export />
            <Dialog>
              <DialogTrigger asChild>
                <Button className="mb-4 w-fit self-end">Add Coupon</Button>
              </DialogTrigger>
              <DialogContent>
                <AddCoupon />
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid">
            <Table className="">
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-right">Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {couponData?.items.map((coupon) => (
                  <Dialog key={coupon.code}>
                    <DialogTrigger asChild className="cursor-pointer">
                      <TableRow>
                        <TableCell className="font-medium">
                          {coupon.code}
                        </TableCell>
                        <TableCell>{coupon.name}</TableCell>
                        <TableCell>{coupon.start_date}</TableCell>
                        <TableCell>{coupon.end_date}</TableCell>
                        <TableCell className="text-right">
                          {coupon.created_at}
                        </TableCell>
                      </TableRow>
                    </DialogTrigger>
                    <DialogContent>
                      <CouponDetail id={coupon.code} />
                    </DialogContent>
                  </Dialog>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination className="">
            <PaginationContent>
              <PaginationItem
                className={`${pageIndex === 1 ? "pointer-events-none cursor-not-allowed opacity-70" : "cursor-pointer"}`}
              >
                <PaginationPrevious onClick={() => handlePagination("-")} />
              </PaginationItem>
              {couponData?.last_page === pageIndex ? (
                <PaginationItem>
                  <PaginationLink>{pageIndex}</PaginationLink>
                </PaginationItem>
              ) : (
                Array.from(
                  {
                    length:
                      (couponData?.last_page ?? 0) -
                        (couponData?.current_page ?? 0) <
                      2
                        ? 2
                        : 3,
                  },
                  (_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        className={`${couponData?.current_page === pageIndex + index && "rounded bg-muted"}`}
                        onClick={() => handlePagination(`${pageIndex + index}`)}
                      >
                        {pageIndex + index}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )
              )}
              <PaginationItem
                className={`${couponData?.last_page === pageIndex ? "pointer-events-none cursor-not-allowed opacity-70" : "cursor-pointer"}`}
              >
                <PaginationNext onClick={() => handlePagination("+")} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      ) : (
        <Loader label="Loading..." />
      )}
    </div>
  );
};
export default Coupon;
