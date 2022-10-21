import { useQueryClient } from "react-query";
import { useNavigate } from "react-router";
import useAuth from "../hooks/useAuth";
import { User } from "../models";

interface HeaderProps {
  friendRequests?: Omit<User, "friends">[];
  setAddFriendModalOpen: (value: React.SetStateAction<boolean>) => void;
  setFriendRequestsModalOpen: (value: React.SetStateAction<boolean>) => void;
}

export default function Header({
  friendRequests,
  setAddFriendModalOpen,
  setFriendRequestsModalOpen,
}: HeaderProps) {
  const { setStoredToken } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  function handleLogout() {
    setStoredToken(null);
    queryClient.invalidateQueries();
    navigate("/");
  }

  return (
    <header>
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
        {friendRequests?.length !== 0 && (
          <div
            className="numberOfFriendRequestsContainer"
            style={{
              width: ("1".toString().length as number) * 20,
            }}
          >
            <div className="numberOfFriendRequests">
              {friendRequests
                ? friendRequests.length > 100
                  ? "100+"
                  : friendRequests.length
                : 0}
            </div>
          </div>
        )}
      </button>
      <button className="headerButton" onClick={handleLogout}>
        Logout
      </button>
    </header>
  );
}
