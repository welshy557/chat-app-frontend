import { useContext } from "react";
import { useQueryClient } from "react-query";
import { useNavigate } from "react-router";
import { AuthContext } from "../hooks/auth/AuthContext";
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
  const { setStoredToken, setStoredUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  function handleLogout() {
    setStoredToken(null);
    setStoredUser(null);
    queryClient.invalidateQueries();
    navigate("/");
  }

  return (
    <header>
      <img src="/full-logo.png" width={250} className="headerImg" />
      <div className="headerButtonContainer">
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
      </div>
    </header>
  );
}
