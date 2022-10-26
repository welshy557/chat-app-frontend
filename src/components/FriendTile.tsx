import { useState } from "react";
import { User } from "../models";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import { UseMutateAsyncFunction } from "react-query";
interface FriendTileProps {
  friend: User;
  selected: boolean;
  deleteFriend: UseMutateAsyncFunction<User, unknown, User, unknown>;
}

export default function FriendTile({
  friend,
  selected,
  deleteFriend,
}: FriendTileProps) {
  const [isHover, setIsHover] = useState(false);

  const style: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "5px",
    backgroundColor: selected || isHover ? "whitesmoke" : "white",
    border: selected ? "1px solid black" : "none",
    cursor: "pointer",
    marginTop: "5px",
    borderRadius: "5px",
  };

  return (
    <div
      style={style}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div className="name">
        {friend.firstName} {friend.lastName}
      </div>
      <IconButton onClick={(e) => deleteFriend(friend)}>
        <DeleteIcon />
      </IconButton>
    </div>
  );
}
