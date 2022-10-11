import { useState } from "react";
import { User } from "../models";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import { UseMutateAsyncFunction } from "react-query";
import { AxiosResponse } from "axios";
interface FriendTileProps {
  friend: User;
  selected: boolean;
  deleteFriend: UseMutateAsyncFunction<number, unknown, number, unknown>;
}

export default function friendTile({
  friend,
  selected,
  deleteFriend,
}: FriendTileProps) {
  const [isHover, setIsHover] = useState(false);

  const style: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "15vw",
    padding: "5px",
    backgroundColor: selected || isHover ? "lightgrey" : "white",
    cursor: "pointer",
    borderRadius: "10px",
    marginTop: "5px",
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
      <IconButton onClick={(e) => deleteFriend(friend.id)}>
        <DeleteIcon />
      </IconButton>
    </div>
  );
}
