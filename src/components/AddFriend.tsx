import Modal from "@mui/material/Modal";
import useApi from "../hooks/useApi";
import { useState } from "react";
import { useMutation } from "react-query";
import { Socket } from "socket.io-client";
import { User } from "../models";
import Loader from "./Loader";

interface AddFriendProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  loggedInUser?: User | null;
  socket: Socket | null;
}

type FriendRequest = { email: string };

export default function AddFriend({
  open,
  setOpen,
  socket,
  loggedInUser,
}: AddFriendProps) {
  const api = useApi();
  const [email, setEmail] = useState("");

  const { mutateAsync: sendFriendRequest, isLoading: isLoadingFriendRequest } =
    useMutation(
      async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (email.length <= 0 || addingSelf) {
          throw new Error("Email not entered or trying to add self");
        }
        await api.post<FriendRequest, string>("friend-requests", { email });
        socket?.emit("sentFriendRequest", email);
      },
      { onSuccess: () => setOpen(false), onError: (err) => console.error(err) }
    );

  const addingSelf = email === loggedInUser?.email;

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <form onSubmit={(e) => sendFriendRequest(e)}>
        <Loader isLoading={isLoadingFriendRequest} />
        <div className="modalContainer">
          <div className="modalContent">
            <div className="modalTitle">Add Friend</div>

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="addFriendInput"
              type="email"
              placeholder="Enter Email..."
            />
            {addingSelf && (
              <div style={{ marginTop: 5 }}>You can't add your self!</div>
            )}
            <button className="modalSubmitButton" type="submit">
              Send Friend Request
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
