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
import { getAuthToken } from "@/config/auth";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [error, setError] = useState<string | null>(null);

  const validatePassword = (password: string): boolean => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumber &&
      hasSymbol
    );
  };

  const validateForm = (): string | null => {
    if (
      !password.current_password ||
      !password.new_password ||
      !password.new_password_confirmation
    ) {
      return "All fields are required.";
    }
    if (password.new_password !== password.new_password_confirmation) {
      return "New password and confirmation do not match.";
    }
    if (!validatePassword(password.new_password)) {
      return "New password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and symbols.";
    }
    return null;
  };

  const handleChange = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    try {
      setIsLoading(true);
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      };
      await axios.put(`${API_URL.common}/auth/password`, password, { headers });

      toast({
        title: "Success",
        description: "Password changed successfully.",
      });
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log("Request canceled", error.message);
      } else if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        toast({
          title: error.response?.status || "Error",
          description: error?.response?.data.message || "Something went wrong",
          variant: "destructive",
        });
        localStorage.removeItem("access_token");
        navigate("/login", { replace: true });
      } else {
        console.error("Error update password", error);
      }
    } finally {
      setIsLoading(false);
      setPassword({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
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
                <p className="flex h-10 items-center">Current Password</p>
                <p className="flex h-10 items-center">New Password</p>
                <p className="flex h-10 items-center">Confirm New Password</p>
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
                  type="password"
                  value={password.current_password}
                  placeholder="Current Password"
                  onChange={(e) =>
                    setPassword((prevState) => ({
                      ...prevState,
                      current_password: e.target.value,
                    }))
                  }
                  className="h-10"
                />
                <Input
                  type="password"
                  value={password.new_password}
                  placeholder="New Password"
                  onChange={(e) =>
                    setPassword((prevState) => ({
                      ...prevState,
                      new_password: e.target.value,
                    }))
                  }
                  className="h-10"
                />
                <Input
                  type="password"
                  value={password.new_password_confirmation}
                  placeholder="Confirm New Password"
                  onChange={(e) =>
                    setPassword((prevState) => ({
                      ...prevState,
                      new_password_confirmation: e.target.value,
                    }))
                  }
                  className="h-10"
                />
              </div>
            </div>
          </DialogDescription>
          {error && <div className="text-destructive">{error}</div>}
        </>
      ) : (
        <Loader label="Loading..." />
      )}

      <DialogFooter className="pt-4">
        <Button onClick={handleChange}>Confirm</Button>
      </DialogFooter>
    </DialogHeader>
  );
};

export default ChangePassword;
