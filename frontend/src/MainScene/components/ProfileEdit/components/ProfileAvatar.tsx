import { AVAILABLE_AVATARS } from "@/MainScene/components/ProfileEdit/components/Avatars";
import avatarDefaultIcon from "@/assets/interface-icons/icon-avatar.svg";
import { clsx } from "clsx";

export const ProfileAvatar = ({ avatarId }: { avatarId: string | null }) => {
  const Avatar = AVAILABLE_AVATARS.find((a) => a.id === avatarId)?.Component || (() => <img src={avatarDefaultIcon} className="block h-full w-full rounded-full object-cover" alt="" />);

  return (
    <div className={clsx("pointer-events-auto relative mx-auto rounded-full bg-white shadow-sm h-[130px] w-[130px] landscape:h-[100px] landscape:w-[100px]", !avatarId || avatarId === "default" ? "border-0 p-0" : "border-[3px] border-[#e2e8f0] p-1.5")}>
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full"><Avatar /></div>
    </div>
  );
};
