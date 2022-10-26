import Modal from "@mui/material/Modal";
import Multiselect from "multiselect-react-dropdown";
import { Socket } from "socket.io-client";
import { Group, User, Message } from "../models";
import { FriendWithFullName } from "./CreateGroup";
import Loader from "./Loader";
import { useContext, useState } from "react";
import useApi from "../hooks/useApi";
import { useMutation, useQueryClient } from "react-query";
import useAuth from "../hooks/auth/useAuth";
import { AuthContext } from "../hooks/auth/AuthContext";

interface AddRemoveGroupModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setGroupMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  friends?: Omit<User, "friends">[];
  group?: Group;
  type?: "add" | "remove";
  socket: Socket | null;
}

interface AddRemoveUserFromGroup {
  groupId?: string;
  ids: number[];
}

export default function AddRemoveGroupModal({
  open,
  setOpen,
  friends,
  group,
  type,
  setGroupMessages,
  socket,
}: AddRemoveGroupModalProps) {
  const [selectedFriends, setSelectedFriends] = useState<FriendWithFullName[]>(
    []
  );

  const api = useApi();
  const queryClient = useQueryClient();
  const { storedUser } = useContext(AuthContext);

  const fullNameFriends: FriendWithFullName[] | undefined = (
    type === "add" ? friends : group?.friends
  )?.map((friend) => ({
    ...friend,
    fullName: `${friend.firstName} ${friend.lastName}`,
  }));

  const friendsNotInGroup = fullNameFriends?.filter((friend) => {
    if (friend.id === group?.userId) {
      return false;
    }
    return !group?.friends.some((groupFriend) => groupFriend.id === friend.id);
  });

  const { mutateAsync: addRemoveFromGroup, isLoading } = useMutation(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (selectedFriends.length === 0) throw new Error("No Friends Selected");
      const ids = selectedFriends.map(({ id }) => id);
      if (type === "add") {
        await api.put<AddRemoveGroupModalProps>(
          `groups/add-user/${group?.id}`,
          { ids }
        );
      } else {
        await api.put<AddRemoveUserFromGroup>(
          `groups/remove-user/${group?.id}`,
          { ids }
        );
      }
    },
    {
      onSuccess: () => {
        const formattedRemovedAddedUsers =
          selectedFriends.length === 1
            ? selectedFriends[0].fullName
            : selectedFriends.reduce((acc, friend, index) => {
                if (index === selectedFriends.length - 1) {
                  acc += `and ${friend.fullName}`;
                } else {
                  acc += `${friend.fullName}, `;
                }

                return acc;
              }, "");
        const serverMessage: Message = {
          userId: 1, // Server UserId
          groupId: group?.id,
          message: `${storedUser?.firstName} ${storedUser?.lastName} ${
            type === "add" ? "added" : "removed"
          } ${formattedRemovedAddedUsers} ${
            type === "add" ? "to" : "from"
          } the group.`,
          created_at: Date.now(),
          updated_at: Date.now(),
        };
        socket?.emit("sendGroupMessage", serverMessage, `group${group?.id}`);

        const selectedFriendIds = selectedFriends.map(({ id }) => id);
        const groupFriendIds = group?.friends.map(({ id }) => id);
        socket?.emit("refetchGroups", group?.id, [
          ...selectedFriendIds,
          ...(groupFriendIds ? groupFriendIds : []),
          group?.userId,
        ]);

        queryClient.invalidateQueries(["groups"]);
        setGroupMessages((prev) => [...prev, serverMessage]);
        setSelectedFriends([]);
        setOpen(false);
      },
      onError: (err) => console.log(err),
    }
  );

  return (
    <>
      <Loader isLoading={isLoading} />
      <Modal open={open} onClose={() => setOpen(false)}>
        <form onSubmit={(e) => addRemoveFromGroup(e)}>
          <div className="modalContainer">
            <div className="modalContent">
              <div className="modalTitle">{`${
                type === "add" ? "Add Member To" : "Remove Member From"
              } ${group?.name}`}</div>

              <div className="selectContainer">
                <Multiselect
                  options={type === "add" ? friendsNotInGroup : fullNameFriends}
                  displayValue="fullName"
                  placeholder="Friends in group"
                  onSelect={(newSelectedFriends) => {
                    setSelectedFriends(newSelectedFriends);
                  }}
                  onRemove={(_, friend) => {
                    setSelectedFriends((prev) =>
                      prev.filter(({ id }) => id !== friend.id)
                    );
                  }}
                  closeOnSelect
                />
              </div>
              <button className="modalSubmitButton" type="submit">
                {type === "add" ? "Add to Group" : "Remove From Group"}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
