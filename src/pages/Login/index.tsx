import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { useState } from "react";
import axios from "axios";
import { API_URL } from "@/config/api";
import { useNavigate } from "react-router-dom";
import Loader from "@/components/loader";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setIsLoading(true);
      const res = await axios.post(`${API_URL.common}/auth/login`, values);
      const { status, data } = res;
      if (status === 200) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("name", data.name);
        localStorage.setItem("role_name", data.role_name);
        localStorage.setItem("profile_image", data.profile_image);
        navigate("/app", { replace: true });
      }
    } catch (error: any) {
      console.log(error);
      toast({
        title: "Error",
        description: error?.response?.data.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loginSchema = z.object({
    phone: z.string().min(4, "Phone number is required").max(50),
    password: z.string().min(6, "Minimum 6 character").max(20),
  });

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  return (
    <div className="flex h-svh flex-1 items-center justify-center">
      {!isLoading ? (
        <Card className="max-w-xs border-2">
          <CardContent className="py-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col space-y-5"
              >
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="your name..."
                          className=""
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="your password..."
                          className=""
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  variant={"outline"}
                  disabled={isLoading}
                  className="self-end"
                >
                  Submit
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Loader label="Logging in..." />
      )}
    </div>
  );
};

export default Login;
