import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import useApi from "../hooks/useApi";
import useAuth from "../hooks/useAuth";
import { Group, User } from "../models";
import FriendTile from "./FriendTile";
import { Message as MessageModel } from "../models";
import MessageTile from "./MessageTile";
import AddFriend from "./AddFriend";
import FriendRequests from "./FriendRequests";
import Loader from "./Loader";
import Header from "./Header";
import CreateGroup from "./CreateGroup";
import GroupTile from "./GroupTile";
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import GroupMessageHeader from "./GroupMessageHeader";
import { Toaster } from "react-hot-toast";
import useSocket from "../hooks/useSocket";

export default function Home() {
  const [messages, setMessages] = useState<MessageModel[]>([]);
  const [groupMessages, setGroupMessages] = useState<MessageModel[]>([]);

  const [selectedFriend, setSelectedFriend] = useState<User>();
  const [selectedGroup, setSelectedGroup] = useState<Group>();
  const [sentMessageValue, setSentMessageValue] = useState("");
  const [addFriendModalOpen, setAddFriendModalOpen] = useState(false);
  const [friendRequestsModalOpen, setFriendRequestsModalOpen] = useState(false);
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);

  const queryClient = useQueryClient();
  const { storedUser } = useAuth();
  const api = useApi();
  const socket = useSocket();

  const { data: friendMessages, isLoading: isLoadingFriendMessages } = useQuery(
    ["friendMessages", selectedFriend],
    async () => {
      if (selectedFriend) {
        return await api.get<MessageModel[]>(
          `messages/friends/${selectedFriend?.id}`
        );
      }
      return { data: [] as MessageModel[] };
    },

    {
      onSuccess: ({ data }) => {
        setMessages(
          data.sort((a: MessageModel, b: MessageModel) => {
            const aTime = new Date(a.created_at).getTime();
            const bTime = new Date(b.created_at).getTime();
            return aTime - bTime;
          })
        );
      },
      onError: (err) => console.log(err),
    }
  );

  const { isLoading: isLoadingGroupMessages } = useQuery(
    ["groupMessages", selectedGroup],
    async () => {
      if (selectedGroup) {
        return await api.get<MessageModel[]>(
          `messages/groups/${selectedGroup?.id}`
        );
      }
      return { data: [] as MessageModel[] };
    },
    {
      onSuccess: ({ data }) => {
        setGroupMessages(
          data.sort((a: MessageModel, b: MessageModel) => {
            const aTime = new Date(a.created_at).getTime();
            const bTime = new Date(b.created_at).getTime();
            return aTime - bTime;
          })
        );
      },
      onError: (err) => console.log(err),
    }
  );

  const { data: friends, isLoading: isLoadingFriends } = useQuery(
    ["friends"],
    async () => (await api.get<User[]>("friends")).data,
    {
      onSuccess: (friends) => {
        if (selectedFriend) {
          setSelectedFriend((prev) =>
            friends.find(({ id }) => id === prev?.id)
          );
        }
      },
      onError: (err) => console.log(err),
    }
  );

  const { data: friendRequests, isLoading: isLoadingFriendRequests } = useQuery(
    ["friendRequests"],
    //Note:  /friend-requests returns an array of User objects. These users objects are the users of the friends requests
    async () =>
      (await api.get<Omit<User, "friends">[]>("friend-requests")).data,
    {
      onError: (err) => console.error(err),
    }
  );

  const { mutateAsync: deleteFriend, isLoading: isLoadingDeleteFriend } =
    useMutation(
      async (friend: User) => {
        api.delete(`friends/${friend.id}`);
        return friend;
      },
      {
        onSuccess: (friend) => {
          queryClient.invalidateQueries(["friends"]);
          setSelectedFriend(undefined);
          setMessages([]);
          socket?.emit(
            "refetchFriends",
            { friend, type: "removed" },
            friend.id
          );
        },
        onError: (err) => console.log(err),
      }
    );

  const { data: groups, isLoading: isLoadingGroups } = useQuery(
    ["groups"],
    async () => {
      return (await api.get<Group[]>("groups")).data;
    },
    {
      onSuccess: (groups) => {
        if (selectedGroup) {
          setSelectedGroup((prev) => groups.find(({ id }) => id === prev?.id));
        }
      },
      onError: (err) => console.log(err),
    }
  );

  const { mutateAsync: deleteGroup, isLoading: isLoadingDeleteGroup } =
    useMutation(
      async (group: Group) => {
        // If user created the group, delete the group, otherwise remove the user from the group
        if (group.userId === storedUser?.id) {
          await api.delete(`groups/${group.id}`);
        } else {
          await api.put(`groups/remove-user/${group.id}`, {
            ids: [storedUser?.id],
          });
        }
        return group;
      },
      {
        onSuccess: (group) => {
          queryClient.invalidateQueries(["groups"]);
          const ids = group.friends.map(({ id }) => id);
          socket?.emit("refetchGroups", group.id, [...ids, group.userId]);
          if (group.userId !== storedUser?.id) {
            const serverMessage: MessageModel = {
              userId: 1, // Server UserId
              groupId: group.id,
              message: `${storedUser?.firstName} ${storedUser?.lastName} left the group`,
              created_at: Date.now(),
              updated_at: Date.now(),
            };
            socket?.emit("sendGroupMessage", serverMessage, `group${group.id}`);
          }
          setSelectedGroup(undefined);
          setGroupMessages([]);
        },
        onError: (err) => console.log(err),
      }
    );
  const friendTiles = useMemo(() => {
    return friends?.map((friend, i) => {
      return (
        <div
          key={i}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedFriend(friend);
            setSelectedGroup(undefined);
          }}
        >
          <FriendTile
            friend={friend}
            selected={selectedFriend?.id === friend.id}
            deleteFriend={deleteFriend}
          />
        </div>
      );
    });
  }, [friends, messages, selectedFriend, friendMessages]);

  const groupTiles = useMemo(
    () =>
      groups?.map((group, i) => (
        <div
          key={i}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedGroup(group);
            setSelectedFriend(undefined);
            socket?.emit("joinGroupRoom", group.id);
          }}
        >
          <GroupTile
            group={group}
            selected={selectedGroup?.id === group.id}
            deleteGroup={deleteGroup}
          />
        </div>
      )),
    [groups, selectedGroup, messages, groupMessages]
  );

  function handleSendingMessage() {
    if (sentMessageValue.length <= 0) return;

    if (selectedFriend && !selectedGroup) {
      socket?.emit(
        "sendFriendMessage",
        {
          message: sentMessageValue,
          friendId: selectedFriend?.id,
        },
        selectedFriend?.id.toString()
      );
      setMessages([
        ...messages,
        {
          message: sentMessageValue,
          friendId: selectedFriend?.id ?? -1,
          userId: storedUser?.id ?? -1,
          created_at: Date.now(),
          updated_at: Date.now(),
        },
      ]);

      setSentMessageValue("");
    } else if (selectedGroup && !selectedFriend) {
      socket?.emit(
        "sendGroupMessage",
        {
          message: sentMessageValue,
          groupId: selectedGroup?.id,
        },
        `group${selectedGroup?.id}`
      );
      setGroupMessages([
        ...groupMessages,
        {
          message: sentMessageValue,
          groupId: selectedGroup?.id ?? -1,
          userId: storedUser?.id ?? -1,
          created_at: Date.now(),
          updated_at: Date.now(),
        },
      ]);
      setSentMessageValue("");
    }
  }

  const isLoading =
    isLoadingDeleteFriend ||
    isLoadingFriendMessages ||
    isLoadingFriendRequests ||
    isLoadingFriends ||
    isLoadingGroups ||
    isLoadingDeleteGroup ||
    isLoadingGroupMessages;

  return (
    <>
      <Toaster />
      <Loader isLoading={isLoading} />
      <AddFriend
        socket={socket}
        open={addFriendModalOpen}
        setOpen={setAddFriendModalOpen}
        loggedInUser={storedUser}
      />
      <FriendRequests
        open={friendRequestsModalOpen}
        setOpen={setFriendRequestsModalOpen}
        friendRequests={friendRequests ?? []}
        socket={socket}
      />
      <CreateGroup
        friends={friends}
        open={createGroupModalOpen}
        setOpen={setCreateGroupModalOpen}
        socket={socket}
      />
      <Header
        friendRequests={friendRequests}
        setAddFriendModalOpen={setAddFriendModalOpen}
        setFriendRequestsModalOpen={setFriendRequestsModalOpen}
      />
      {friends && friends.length > 0 ? (
        <div className="container">
          <div className="content">
            <div className="sidebarContainer">
              <div className="friendsContainer">
                <div className="friendsTitle">Friends</div>
                {friendTiles}
              </div>
              <div className="groupsContainer">
                <div className="groupsHeaderContainer">
                  <div className="groupsTitle">Groups</div>
                  <IconButton onClick={() => setCreateGroupModalOpen(true)}>
                    <AddIcon htmlColor="white" />
                  </IconButton>
                </div>
                <div className="groupTiles">{groupTiles}</div>
              </div>
            </div>

            {selectedFriend || selectedGroup ? (
              <div className="messagesContainer">
                {selectedGroup && (
                  <GroupMessageHeader
                    selectedGroup={selectedGroup}
                    friends={friends}
                    socket={socket}
                    setGroupMessages={setGroupMessages}
                  />
                )}
                <MessageTile
                  messages={
                    selectedFriend
                      ? messages
                      : selectedGroup
                      ? groupMessages
                      : []
                  }
                  loggedInUser={storedUser}
                />
                <textarea
                  className="sendMessageInput"
                  name={"message"}
                  placeholder="Send Message..."
                  value={sentMessageValue}
                  onChange={(e) => setSentMessageValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendingMessage();
                  }}
                />
              </div>
            ) : (
              <div className="noSelectedFriend">
                Choose a friend or group to start chatting
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="welcome">
          Welcome!
          <br />
          Add a friend to start chatting
        </div>
      )}
    </>
  );
}
