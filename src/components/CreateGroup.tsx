import Modal from "@mui/material/Modal";
import useApi from "../hooks/useApi";
import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Socket } from "socket.io-client";
import { User } from "../models";
import Loader from "./Loader";
import Multiselect from "multiselect-react-dropdown";

interface CreateGroupProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  friends?: Omit<User, "friends">[];
  socket: Socket | null;
}

export interface FriendWithFullName extends Omit<User, "friends"> {
  fullName: string;
}

interface CreateGroup {
  name: string;
  friends: number[];
}

export default function CreateGroup({
  open,
  setOpen,
  socket,
  friends,
}: CreateGroupProps) {
  const [selectedFriends, setSelectedFriends] = useState<FriendWithFullName[]>(
    []
  );

  const api = useApi();
  const queryClient = useQueryClient();
  const groupNameRef = useRef<HTMLInputElement>(null);

  const fullNameFriends: FriendWithFullName[] | undefined = useMemo(
    () =>
      friends?.map((friend) => ({
        ...friend,
        fullName: `${friend.firstName} ${friend.lastName}`,
      })),
    [friends]
  );

  const { mutateAsync: createGroup, isLoading: isLoadingCreateGroup } =
    useMutation(
      async () => {
        if (
          groupNameRef.current &&
          groupNameRef.current?.value?.length > 0 &&
          selectedFriends.length > 0
        ) {
          const ids = selectedFriends.map(({ id }) => id);
          await api.post<CreateGroup, string>("groups", {
            name: groupNameRef.current?.value,
            friends: ids,
          });
          return ids;
        } else throw new Error("No name or no friends selected");
      },
      {
        onSuccess: (ids) => {
          queryClient.invalidateQueries(["groups"]);
          socket?.emit("refetchGroups", undefined, ids);
          setSelectedFriends([]);
          setOpen(false);
        },
        onError: (err) => console.error(err),
      }
    );

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <>
        <Loader isLoading={isLoadingCreateGroup} />
        <div className="modalContainer">
          <div className="modalContent">
            <div className="modalTitle">Create Group</div>

            <input
              ref={groupNameRef}
              className="addFriendInput"
              type="text"
              placeholder="Enter Group Name..."
            />
            <div className="selectContainer">
              <Multiselect
                options={fullNameFriends}
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
              />
            </div>
            <button className="modalSubmitButton" onClick={() => createGroup()}>
              Create Group
            </button>
          </div>
        </div>
      </>
    </Modal>
  );
}
