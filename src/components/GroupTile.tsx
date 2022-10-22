import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";
import { UseMutateAsyncFunction } from "react-query";
import { Group } from "../models";

interface GroupProps {
  group: Group;
  selected: boolean;
  deleteGroup: UseMutateAsyncFunction<Group, unknown, Group, unknown>;
}

export default function GroupTile({
  group,
  selected,
  deleteGroup,
}: GroupProps) {
  const [isHover, setIsHover] = useState(false);

  const style: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "5px",
    backgroundColor: selected || isHover ? "lightgrey" : "white",
    cursor: "pointer",
    marginTop: "5px",
    width: "100%",
    borderRadius: "5px",
  };

  return (
    <div
      style={style}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div className="name">{group.name}</div>
      <IconButton onClick={() => deleteGroup(group)}>
        <DeleteIcon />
      </IconButton>
    </div>
  );
}
