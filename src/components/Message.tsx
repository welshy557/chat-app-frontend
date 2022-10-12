import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useMutation, useQuery, useQueryClient } from "react-query";
import useApi from "../hooks/useApi";
import useAuth from "../hooks/useAuth";
import { User } from "../models";
import FriendTile from "./friendTile";
import { Message as MessageModel } from "../models";
import MessageTile from "./messageTile";
import AddFriend from "./AddFriend";
import FriendRequests from "./FriendRequests";
import Loader from "./Loader";
import { useNavigate } from "react-router-dom";

export default function Message() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<MessageModel[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<User>();
  const [sentMessageValue, setSentMessageValue] = useState("");
  const [addFriendModalOpen, setAddFriendModalOpen] = useState(false);
  const [friendRequestsModalOpen, setFriendRequestsModalOpen] = useState(false);

  const sendingMessage = useRef(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { storedToken, setStoredToken } = useAuth();
  const api = useApi();

  useEffect(() => {
    const newSocket = io(`https://liamwelsh-quizapp-backend.herokuapp.com`, {
      auth: { token: storedToken },
    });

    setSocket(newSocket);
  }, [setSocket]);

  socket?.on("recieveMessage", (msg: MessageModel) => {
    setMessages([...messages, msg]);
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
        return await api.get(`messages/${selectedFriend?.id}`);
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

  const { data: loggedInUser, isLoading: isLoadingLoggedInUser } = useQuery(
    ["loggedInUser"],
    async () => {
      const res = await api.get("loggedIn");
      return res.data as User;
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

  const friendTiles = useMemo(() => {
    return friends?.map((friend, i) => {
      return (
        <div
          key={i}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedFriend(friend);
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

  function handleSendingMessage() {
    if (sentMessageValue.length <= 0) return;

    sendingMessage.current = true;
    socket?.emit(
      "sendMessage",
      {
        message: sentMessageValue,
        friendId: selectedFriend?.id.toString(),
      },
      selectedFriend?.id.toString()
    );
    setMessages([
      ...messages,
      {
        message: sentMessageValue,
        friendId: selectedFriend?.id ?? -1,
        userId: loggedInUser?.id ?? -1,
        created_at: Date.now(),
        updated_at: Date.now(),
      },
    ]);
    queryClient.invalidateQueries(["friendMessages"]);
    setSentMessageValue("");
  }

  function handleLogout() {
    setStoredToken(null);
    queryClient.invalidateQueries();
    navigate("/");
  }

  const isLoading =
    isLoadingDeleteFriend ||
    isLoadingFriendMessages ||
    isLoadingFriendRequests ||
    isLoadingFriends ||
    isLoadingLoggedInUser;

  return (
    <>
      <Loader isLoading={isLoading} />
      <AddFriend
        socket={socket}
        open={addFriendModalOpen}
        setOpen={setAddFriendModalOpen}
        loggedInUser={loggedInUser}
      />
      <FriendRequests
        open={friendRequestsModalOpen}
        setOpen={setFriendRequestsModalOpen}
        friendRequests={friendRequests ?? []}
        socket={socket}
      />
      <header>
        <div className="numberOfFriendRequestsContainer">
          <div className="numberOfFriendRequests">
            {friendRequests
              ? friendRequests.length > 100
                ? "100+"
                : friendRequests.length
              : 0}
          </div>
        </div>

        <button
          className="headerButton"
          onClick={() => setAddFriendModalOpen(true)}
        >
          Add Friend
        </button>
        <button
          className="headerButton"
          onClick={() => setFriendRequestsModalOpen(true)}
        >
          Friend Requests
        </button>
        <button className="headerButton" onClick={handleLogout}>
          Logout
        </button>
      </header>
      {friends && friends.length > 0 ? (
        <div className="container">
          <div className="content">
            <div className="friendsContainer">{friendTiles}</div>
            <div className="messagesContainer">
              {selectedFriend ? (
                <>
                  <MessageTile
                    messages={messages}
                    loggedInUser={loggedInUser}
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
                    Choose a friend to start chatting
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
