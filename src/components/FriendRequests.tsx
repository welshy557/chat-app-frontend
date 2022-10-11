import Modal from "@mui/material/Modal";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import useApi from "../hooks/useApi";
import { User } from "../models";
import moment from "moment";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";
import CheckIcon from "@mui/icons-material/Check";
import { Socket } from "socket.io-client";
import Loader from "./Loader";

interface FriendRequestsProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  friendRequests: Omit<User, "friends">[];
  socket: Socket | null;
}

export default function FriendRequests({
  open,
  setOpen,
  friendRequests,
  socket,
}: FriendRequestsProps) {
  const api = useApi();
  const queryClient = useQueryClient();

  const {
    mutateAsync: acceptFriendRequest,
    isLoading: isLoadingAcceptFriendRequest,
  } = useMutation(
    async (friendId: number) => {
      await api.post("accept-friend-request", { friendId });
      return friendId;
    },
    {
      onSuccess: (friendId) => {
        queryClient.invalidateQueries(["friendRequests"]);
        queryClient.invalidateQueries(["friends"]);
        socket?.emit("refetchFriends", {}, friendId);
      },
    }
  );

  const {
    mutateAsync: denyFriendRequest,
    isLoading: isLoadingDenyFriendRequest,
  } = useMutation(
    async (friendId: number) => {
      await api.delete(`friend-requests/${friendId}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["friendRequests"]);
        queryClient.invalidateQueries(["friends"]);
      },
    }
  );

  const friendRequestJSX = useMemo(() => {
    return friendRequests.map((friendRequest, index) => (
      <div key={index} className="friendRequestContainer">
        <div className="friendRequestInfoContainer">
          <div className="friendRequestName">
            {friendRequest.firstName} {friendRequest.lastName}
          </div>
          <div className="friendRequestDate">
            Sent {moment(friendRequest.created_at).fromNow()}
          </div>
        </div>
        <div className="friendRequestButtonsContainer">
          <IconButton
            style={{ color: "green", marginRight: 20 }}
            onClick={() => acceptFriendRequest(friendRequest.id)}
          >
            <CheckIcon />
          </IconButton>
          <IconButton
            style={{ color: "red" }}
            onClick={() => denyFriendRequest(friendRequest.id)}
          >
            <ClearIcon />
          </IconButton>
        </div>
      </div>
    ));
  }, [friendRequests]);

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <>
        <Loader
          isLoading={isLoadingAcceptFriendRequest || isLoadingDenyFriendRequest}
        />
        <div className="modalContainer">
          <div className="modalContent">
            {friendRequests.length > 0 ? (
              friendRequestJSX
            ) : (
              <span className="noFriendRequests">
                No Active Friend Requests
              </span>
            )}
          </div>
        </div>
      </>
    </Modal>
  );
}
