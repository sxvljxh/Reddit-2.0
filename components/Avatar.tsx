import { useSession } from "next-auth/react";
import Image from "next/image";
import { type } from "os";
import React from "react";

type Props = {
  seed?: string;
  large?: boolean;
};
export default function Avatar({ seed, large }: Props) {
  const { data: session } = useSession();
  // console.log(large);

  return (
    <div
      className={`relative bg-white border-gray-300 rounded-full overflow-hidden ${
        large ? "h-20 w-20" : "h-10 w-10"
      }`}
    >
      <Image
        layout="fill"
        className="object-contain"
        src={`https://avatars.dicebear.com/api/open-peeps/${
          seed || session?.user?.name || "placeholder"
        }.svg`}
        alt="avatar"
      />
    </div>
  );
}
