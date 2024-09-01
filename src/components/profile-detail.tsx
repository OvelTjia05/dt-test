import { Button } from "@/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/dialog";
import { Input } from "@/components/input";
import { API_URL } from "@/config/api";
import { getAuthToken } from "@/config/auth";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "./loader";
import { LockKeyholeIcon } from "lucide-react";
import ChangePassword from "./change-password";

type ProfileDetailType = {
  phone: string;
  name: string;
  profile_image: File | string;
  role_code: string;
  role_name: string;
};

const ProfileDetail = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [detail, setDetail] = useState<ProfileDetailType | null>(null);

  const getProfile = async (signal: AbortSignal) => {
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      };
      const response = await axios.get(`${API_URL.common}/auth/profile`, {
        headers,
        signal,
      });
      const { data, status } = response;
      if (status === 200) {
        setDetail(data);
      } else {
        alert("Something went wrong when getting your profile");
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
        console.error("Error get profile", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("name", detail?.name || "");
      formData.append("phone", detail?.phone || "");
      if (detail?.profile_image instanceof File) {
        formData.append("profile_image", detail.profile_image);
      }

      const headers = {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${getAuthToken()}`,
      };
      const response = await axios.post(
        `${API_URL.common}/auth/profile`,
        formData,
        { headers },
      );
      const { status } = response;
      if (status === 200) {
        localStorage.setItem("name", detail?.name || "");
        localStorage.setItem("role_name", detail?.role_name || "");
        if (typeof detail?.profile_image === "string") {
          localStorage.setItem("profile_image", detail.profile_image);
        }
        getProfile(new AbortController().signal);
      } else {
        alert("Something went wrong when updating your profile");
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
        console.error("Error updating profile", error);
      }
    } finally {
      setIsLoading(false);
      setIsEditing(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    getProfile(signal);

    return () => {
      setIsLoading(true);
      controller.abort();
    };
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDetail(detail ? { ...detail, profile_image: file } : null);
    }
  };

  return (
    <DialogHeader>
      {!isLoading ? (
        <>
          <DialogTitle className="mb-4 capitalize">
            {isEditing ? (
              <div className="relative">
                <label
                  htmlFor="profile_image"
                  className="inline-flex cursor-pointer rounded-full"
                >
                  <img
                    src={
                      typeof detail?.profile_image === "string"
                        ? detail.profile_image
                        : detail?.profile_image instanceof File
                          ? URL.createObjectURL(detail.profile_image)
                          : ""
                    }
                    alt="profile"
                    className="h-20 w-20 rounded-full object-cover hover:opacity-80"
                  />
                </label>
                <input
                  type="file"
                  id="profile_image"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
              </div>
            ) : (
              detail?.profile_image && (
                <img
                  src={
                    typeof detail.profile_image === "string"
                      ? detail.profile_image
                      : detail.profile_image instanceof File
                        ? URL.createObjectURL(detail.profile_image)
                        : ""
                  }
                  alt="profile"
                  className="h-20 w-20 rounded-full object-cover"
                />
              )
            )}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="flex gap-4">
              <div className="flex flex-col space-y-2">
                <p className="flex h-10 items-center">Name</p>
                <p className="flex h-10 items-center">Phone</p>
                <p className="flex h-10 items-center">Role Code</p>
                <p className="flex h-10 items-center">Role Name</p>
              </div>
              <div className="flex flex-col space-y-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <p key={index} className="flex h-10 items-center">
                    :
                  </p>
                ))}
              </div>
              <div className="flex flex-col gap-2 capitalize text-foreground max-md:flex-1">
                {isEditing ? (
                  <>
                    <Input
                      type="text"
                      name="name"
                      value={detail?.name}
                      onChange={(e) =>
                        setDetail(
                          detail ? { ...detail, name: e.target.value } : null,
                        )
                      }
                    />
                    <Input
                      type="tel"
                      value={detail?.phone}
                      onChange={(e) =>
                        setDetail(
                          detail ? { ...detail, phone: e.target.value } : null,
                        )
                      }
                    />
                  </>
                ) : (
                  <>
                    <p className="flex h-10 items-center">{detail?.name}</p>
                    <p className="flex h-10 items-center">{detail?.phone}</p>
                  </>
                )}
                <p className="flex h-10 items-center">{detail?.role_code}</p>
                <p className="flex h-10 items-center">{detail?.role_name}</p>
              </div>
            </div>
          </DialogDescription>
        </>
      ) : (
        <Loader label="Loading profile..." />
      )}
      <DialogFooter>
        {!isEditing ? (
          <>
            <Dialog>
              <DialogTrigger asChild>
                <Button title="Change password?">
                  <LockKeyholeIcon className="stroke-background" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <ChangePassword />
              </DialogContent>
            </Dialog>

            <Button onClick={() => setIsEditing(true)}>Edit</Button>
          </>
        ) : (
          <Button onClick={handleUpdate}>Update</Button>
        )}
      </DialogFooter>
    </DialogHeader>
  );
};
export default ProfileDetail;
