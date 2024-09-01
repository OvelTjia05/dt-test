import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { PenBoxIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "./dialog";
import ProfileDetail from "./profile-detail";

const Profile = () => {
  const profile = {
    name: localStorage.getItem("name"),
    role_name: localStorage.getItem("role_name"),
    profile_image: localStorage.getItem("profile_image"),
  };

  return (
    <div className="relative flex flex-col items-center space-y-2">
      <Avatar>
        <AvatarImage src={profile.profile_image || ""} />
        <AvatarFallback>{profile.name}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-center">
        <h2 className="text-xl">{profile.name}</h2>
        <p className="text-muted">{profile.role_name}</p>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <PenBoxIcon className="absolute -right-4 bottom-0 h-6 w-6 stroke-muted-foreground transition hover:stroke-foreground" />
        </DialogTrigger>
        <DialogContent>
          <ProfileDetail />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
