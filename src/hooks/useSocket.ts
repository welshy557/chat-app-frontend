import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "react-query";
import { Socket, io } from "socket.io-client";
import { User } from "../models";
import useAuth from "./auth/useAuth";

interface RefetchFriendsRequest {
  friend: User;
  type: "accept" | "deny" | "removed";
}

export default function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { storedToken } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) {
      setSocket(
        io(`http://localhost:3001`, {
          auth: { token: storedToken },
        })
      );
    }
    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    socket?.on("recieveMessage", (type: "friend" | "group") => {
      if (type === "friend") {
        queryClient.invalidateQueries(["friendMessages"]);
      } else if (type === "group") {
        queryClient.invalidateQueries(["groupMessages"]);
      }
    });

    socket?.on("recievedFriendRequest", (user: User) => {
      queryClient.invalidateQueries(["friendRequests"]);
      toast.success(
        `You recieved a friend request from ${user.firstName} ${user.lastName}!`,
        { style: { textAlign: "center" } }
      );
    });

    socket?.on("refetchFriends", ({ friend, type }: RefetchFriendsRequest) => {
      queryClient.invalidateQueries(["friends"]);

      switch (type) {
        case "accept":
          toast.success(
            `${friend.firstName} ${friend.lastName} accepted your friend request!`,
            { style: { textAlign: "center" } }
          );
          break;
        case "deny":
          toast.error(
            `${friend.firstName} ${friend.lastName} denied your friend request!`,
            { style: { textAlign: "center" } }
          );
          break;
        case "removed":
          toast.error(
            `${friend.firstName} ${friend.lastName} removed you as a friend!`,
            { style: { textAlign: "center" } }
          );
          break;
      }
    });

    socket?.on("refetchGroups", () => {
      queryClient.invalidateQueries(["groups"]);

      return () => {
        socket.off("recieveMessage");
        socket.off("recievedFriendRequest");
        socket.off("refetchFriends");
        socket.off("refetchGroups");
      };
    });
  }, [socket]);

  return socket;
}
