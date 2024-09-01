import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/chart";
import {
  Bar,
  BarChart,
  AreaChart,
  Area,
  CartesianGrid,
  YAxis,
  XAxis,
  LabelList,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/card";
import axios from "axios";
import { useEffect, useState } from "react";
import { API_URL } from "@/config/api";
import { useNavigate } from "react-router-dom";
import { TrendingDown, TrendingUp } from "lucide-react";
import Loader from "@/components/loader";

interface MonthlyOrderItem {
  month: string;
  orders: string;
}

interface YearlyOrderItem {
  year: number;
  amount: string;
}

interface OrderComparisonItem {
  percentage: string;
  current: {
    month: string;
    amount: number;
  };
  previous: {
    month: string;
    amount: number;
  };
}

interface TopItem {
  name: string;
  code: string;
  amount: string;
  qty: number;
  category: string;
}

interface TopBuyerItem {
  name: string;
  amount: string;
  phone: string;
}

interface TopStoreItem {
  name: string;
  amount: string;
  city: string;
  province: string;
  code: string;
}

interface DataState {
  monthlyOrder: MonthlyOrderItem[];
  yearlyOrder: YearlyOrderItem[];
  orderComparison: OrderComparisonItem[];
  topProduct: TopItem[];
  topBuyer: TopBuyerItem[];
  topStore: TopStoreItem[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const today = new Date();
  const startDate = new Date(today);
  startDate.setMonth(today.getMonth() - 5);
  const startMonth = startDate.toISOString().slice(0, 7);
  const endMonth = today.toISOString().slice(0, 7);
  const endYear = startDate.toISOString().slice(0, 4);
  const startYear = today.getFullYear() - 3;
  const limitData = 5;
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<DataState>({
    monthlyOrder: [],
    yearlyOrder: [],
    orderComparison: [],
    topProduct: [],
    topBuyer: [],
    topStore: [],
  });

  const chartConfigMonthly = {
    orders: {
      color: "#2563eb",
    },
  } satisfies ChartConfig;

  const chartConfigYearly = {
    amount: {
      color: "#2563eb",
    },
  } satisfies ChartConfig;

  const chartConfigComparison = {
    current: {
      label: "Current",
      color: "#2563eb",
    },
    previous: {
      label: "Previous",
      color: "#60a5fa",
    },
    "current.amount": {
      label: "Current",
      color: "red",
    },
    "previous.amount": {
      label: "Previous",
      color: "yellow",
    },
  } satisfies ChartConfig;

  const chartConfigTopProduct = {
    name: {
      label: "Name",
      color: "#2563eb",
    },
    qty: {
      label: "Qty",
    },
    amount: {
      label: "Amount",
    },
    category: {
      label: "Category",
    },
  } satisfies ChartConfig;

  const chartConfigTopBuyer = {
    name: {
      color: "#2563eb",
    },
    amount: {
      label: "Amount",
    },
    phone: {
      label: "phone",
    },
  } satisfies ChartConfig;

  const chartConfigTopStore = {
    name: {
      color: "#2563eb",
    },
    amount: {
      label: "Amount",
    },
    city: {
      label: "City",
    },
    province: {
      label: "Province",
    },
    code: {
      label: "Code",
    },
  } satisfies ChartConfig;

  const fetchData = async (signal: AbortSignal) => {
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      };
      const [
        monthlyOrderResponse,
        yearlyOrderResponse,
        orderComparisonResponse,
        topProductResponse,
        topBuyerResponse,
        topStoreResponse,
      ] = await axios.all([
        axios.get(
          `${API_URL.common}/summaries/orders/monthly?start_month=${startMonth}&end_month=${endMonth}`,
          { headers, signal },
        ),
        axios.get(
          `${API_URL.common}/summaries/orders/yearly?start_year=${startYear}&end_year=${endYear}`,
          { headers, signal },
        ),
        axios.get(`${API_URL.common}/summaries/orders/comparison`, {
          headers,
          signal,
        }),
        axios.get(
          `${API_URL.common}/summaries/top/products?limit=${limitData}`,
          { headers, signal },
        ),
        axios.get(`${API_URL.common}/summaries/top/buyers?limit=${limitData}`, {
          headers,
          signal,
        }),
        axios.get(`${API_URL.common}/summaries/top/stores?limit=${limitData}`, {
          headers,
          signal,
        }),
      ]);

      const monthlyOrder = monthlyOrderResponse.data.items.map(
        (item: MonthlyOrderItem) => ({
          month: item.month,
          orders: parseFloat(item.orders),
        }),
      );
      const yearlyOrder = yearlyOrderResponse.data.items.map(
        (item: YearlyOrderItem) => ({
          year: item.year,
          amount: parseFloat(item.amount),
        }),
      );
      const orderComparison: OrderComparisonItem = {
        percentage: orderComparisonResponse.data.percentage,
        current: orderComparisonResponse.data.current,
        previous: orderComparisonResponse.data.previous,
      };
      const topProduct = topProductResponse.data.items.map((item: TopItem) => ({
        name: item.name.toLowerCase(),
        code: item.code,
        amount: convertToNumber(item.amount),
        qty: item.qty,
        category: item.category,
      }));
      const topBuyer = topBuyerResponse.data.items.map(
        (item: TopBuyerItem) => ({
          name: item.name,
          phone: item.phone,
          amount: convertToNumber(item.amount),
        }),
      );
      const topStore = topStoreResponse.data.items.map(
        (item: TopStoreItem) => ({
          name: item.name,
          code: item.code,
          amount: convertToNumber(item.amount),
          city: item.city,
          province: item.province,
        }),
      );

      console.log(
        "response dashboard",
        monthlyOrder,
        yearlyOrder,
        orderComparison,
        topProduct,
        topBuyer,
        topStore,
      );

      setData({
        monthlyOrder,
        yearlyOrder,
        orderComparison: [orderComparison],
        topProduct,
        topBuyer,
        topStore,
      });
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
        console.error("Error fetching data dashboard", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  function convertToNumber(value: string): number {
    const suffixes = {
      K: 1e3, // Thousand
      M: 1e6, // Million
      B: 1e9, // Billion
      T: 1e12, // Trillion
    };

    const unit = value.slice(-1);
    const numberPart = parseFloat(value);

    if (unit in suffixes) {
      return numberPart * suffixes[unit as keyof typeof suffixes];
    }

    return numberPart;
  }

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    fetchData(signal);

    return () => {
      controller.abort();
      setIsLoading(true);
    };
  }, []);

  return (
    <div className="flex h-full">
      {!isLoading ? (
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {/* monthly chart */}
          <Card className="">
            <CardHeader>
              <CardTitle>Monthly Order</CardTitle>
              <CardDescription>
                {startDate.toLocaleString(undefined, { month: "long" })} -{" "}
                {today.toLocaleString(undefined, { month: "long" })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfigMonthly}>
                <AreaChart
                  accessibilityLayer
                  data={data?.monthlyOrder}
                  margin={{
                    left: 20,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />

                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <Area
                    dataKey="orders"
                    type="natural"
                    fill="var(--color-orders)"
                    radius={8}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* yearly chart */}
          <Card className="">
            <CardHeader>
              <CardTitle>Yearly Order</CardTitle>
              <CardDescription>
                {startYear} - {endYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfigYearly}>
                <AreaChart
                  accessibilityLayer
                  data={data.yearlyOrder}
                  stackOffset="expand"
                  margin={{
                    left: 19,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="year"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Area
                    dataKey="amount"
                    type="natural"
                    fill="var(--color-amount)"
                    radius={8}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* order comparison chart */}
          <Card className="">
            <CardHeader>
              <CardTitle>Order Comparison</CardTitle>
              <CardDescription>This month and last month</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfigComparison}>
                <BarChart accessibilityLayer data={data.orderComparison}>
                  <CartesianGrid vertical={false} />

                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="previous.amount"
                    fill="var(--color-previous)"
                    radius={8}
                  />
                  <Bar
                    dataKey="current.amount"
                    fill="var(--color-current)"
                    radius={8}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
            <CardFooter>
              <div className="flex gap-2 font-medium leading-none">
                {data.orderComparison[0]?.percentage}%{" "}
                {data.orderComparison[0]?.current.amount >
                data.orderComparison[0]?.previous.amount ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
              </div>
            </CardFooter>
          </Card>

          {/* Top product chart */}
          <Card className="">
            <CardHeader>
              <CardTitle>Top Product</CardTitle>
              {/* <CardDescription>January - June 2024</CardDescription> */}
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfigTopProduct}>
                <BarChart
                  accessibilityLayer
                  data={data.topProduct}
                  layout="vertical"
                  margin={{
                    right: 16,
                  }}
                >
                  <CartesianGrid horizontal={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <XAxis dataKey="amount" type="number" />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Bar
                    dataKey="amount"
                    layout="vertical"
                    fill="var(--color-name)"
                    className=""
                    radius={4}
                  >
                    <LabelList
                      dataKey="name"
                      position="insideLeft"
                      offset={8}
                      clockWise={true}
                      className="fill-[--color-label] capitalize"
                      fontSize={12}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Top buyer chart */}
          <Card className="">
            <CardHeader>
              <CardTitle>Top buyer</CardTitle>
              {/* <CardDescription>January - June 2024</CardDescription> */}
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfigTopBuyer}>
                <BarChart
                  accessibilityLayer
                  data={data.topBuyer}
                  layout="vertical"
                  margin={{
                    right: 16,
                  }}
                >
                  <CartesianGrid horizontal={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <XAxis dataKey="amount" type="number" />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Bar
                    dataKey="amount"
                    layout="vertical"
                    fill="var(--color-name)"
                    radius={4}
                  >
                    <LabelList
                      dataKey="name"
                      position="insideLeft"
                      offset={8}
                      className="fill-[--color-label]"
                      fontSize={12}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Top Store chart */}
          <Card className="">
            <CardHeader>
              <CardTitle>Top Store</CardTitle>
              {/* <CardDescription>January - June 2024</CardDescription> */}
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfigTopStore}>
                <BarChart
                  accessibilityLayer
                  data={data.topStore}
                  layout="vertical"
                  margin={{
                    right: 16,
                  }}
                >
                  <CartesianGrid horizontal={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <XAxis dataKey="amount" type="number" />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Bar
                    dataKey="amount"
                    layout="vertical"
                    fill="var(--color-name)"
                    radius={4}
                  >
                    <LabelList
                      dataKey="name"
                      position="insideLeft"
                      offset={8}
                      className="fill-[--color-label]"
                      fontSize={12}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Loader label="Loading..." />
      )}
    </div>
  );
};

export default Dashboard;
