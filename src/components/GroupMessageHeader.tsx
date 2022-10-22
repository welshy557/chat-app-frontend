import { useContext, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { AuthContext } from "../hooks/auth/AuthContext";
import { User, Group, Message } from "../models";
import AddRemoveGroupModal from "./AddRemoveGroupModal";

interface GroupMessageHeaderProps {
  selectedGroup?: Group;
  friends: Omit<User, "friends">[];
  setGroupMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  socket: Socket | null;
}

export default function GroupMessageHeader({
  selectedGroup,
  friends,
  setGroupMessages,
  socket,
}: GroupMessageHeaderProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const modalType = useRef<"add" | "remove">();
  const { storedUser } = useContext(AuthContext);

  return (
    <section className="groupMessageHeader">
      <AddRemoveGroupModal
        open={modalOpen}
        setOpen={setModalOpen}
        group={selectedGroup}
        type={modalType.current}
        friends={friends}
        setGroupMessages={setGroupMessages}
        socket={socket}
      />
      <button
        className="groupMessageHeaderButton"
        onClick={() => {
          modalType.current = "add";
          setModalOpen(true);
        }}
      >
        Add to Group
      </button>
      {storedUser?.id === selectedGroup?.userId && (
        <button
          className="groupMessageHeaderButton"
          onClick={() => {
            modalType.current = "remove";
            setModalOpen(true);
          }}
        >
          Remove from Group
        </button>
      )}
    </section>
  );
}
