import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
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

export default function Message() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<MessageModel[]>([]);
  const [groupMessages, setGroupMessages] = useState<MessageModel[]>([]);

  const [selectedFriend, setSelectedFriend] = useState<User>();
  const [selectedGroup, setSelectedGroup] = useState<Group>();
  const [sentMessageValue, setSentMessageValue] = useState("");
  const [addFriendModalOpen, setAddFriendModalOpen] = useState(false);
  const [friendRequestsModalOpen, setFriendRequestsModalOpen] = useState(false);
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);

  const queryClient = useQueryClient();
  const { storedToken, storedUser } = useAuth();
  const api = useApi();

  useEffect(() => {
    const newSocket = io(`https://liamwelsh-quizapp-backend.herokuapp.com`, {
      auth: { token: storedToken },
    });

    setSocket(newSocket);
    return () => setSocket(null);
  }, []);

  socket?.on("recieveMessage", (type: "friend" | "group") => {
    if (type === "friend") {
      queryClient.invalidateQueries(["friendMessages"]);
    } else if (type === "group") {
      queryClient.invalidateQueries(["groupMessages"]);
    }
  });

  socket?.on("recievedFriendRequest", () => {
    queryClient.invalidateQueries(["friendRequests"]);
  });

  socket?.on("refetchFriends", () => {
    queryClient.invalidateQueries(["friends"]);
  });

  const { data: friendMessages, isLoading: isLoadingFriendMessages } = useQuery(
    ["friendMessages", selectedFriend],
    async () => {
      if (selectedFriend) {
        return await api.get(`messages/friends/${selectedFriend?.id}`);
      }
      return { data: [] };
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
        return await api.get(`messages/groups/${selectedGroup?.id}`);
      }
      return { data: [] };
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
    async () => {
      const { data: friends } = await api.get("friends");
      return friends as User[];
    },
    { onError: (err) => console.log(err) }
  );

  const { data: friendRequests, isLoading: isLoadingFriendRequests } = useQuery(
    ["friendRequests"],
    //Note:  /friend-requests returns an array of User objects. These users objects are the users of the friends requests
    async () =>
      (await api.get("friend-requests")).data as Omit<User, "friends">[],
    {
      onError: (err) => console.error(err),
    }
  );

  const { mutateAsync: deleteFriend, isLoading: isLoadingDeleteFriend } =
    useMutation(
      async (friendId: number) => {
        api.delete(`friends/${friendId}`);
        return friendId;
      },
      {
        onSuccess: (friendId) => {
          queryClient.invalidateQueries(["friends"]);
          setSelectedFriend(undefined);
          setMessages([]);
          socket?.emit("refetchFriends", {}, friendId);
        },
        onError: (err) => console.log(err),
      }
    );

  const { data: groups, isLoading: isLoadingGroups } = useQuery(
    ["groups"],
    async () => (await api.get("groups")).data as Group[],
    {
      onError: (err) => console.log(err),
    }
  );

  const { mutateAsync: deleteGroup, isLoading: isLoadingDeleteGroup } =
    useMutation(async (id: number) => await api.delete(`groups/${id}`), {
      onSuccess: () => {
        queryClient.invalidateQueries(["groups"]);
        setSelectedGroup(undefined);
        setGroupMessages([]);
      },
      onError: (err) => console.log(err),
    });
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
      queryClient.invalidateQueries(["friendMessages"]);
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
        ...messages,
        {
          message: sentMessageValue,
          groupId: selectedGroup?.id ?? -1,
          userId: storedUser?.id ?? -1,
          created_at: Date.now(),
          updated_at: Date.now(),
        },
      ]);
      queryClient.invalidateQueries(["groups"]);
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
                  <button
                    className="createGroupButton"
                    onClick={() => setCreateGroupModalOpen(true)}
                  >
                    +
                  </button>
                </div>
                <div className="groupTiles">{groupTiles}</div>
              </div>
            </div>

            <div className="messagesContainer">
              {selectedFriend || selectedGroup ? (
                <>
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
                </>
              ) : (
                <div className="noSelectedFriendContent">
                  <div className="noSelectedFriend">
                    Choose a friend or group to start chatting
                  </div>
                </div>
              )}
            </div>
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
