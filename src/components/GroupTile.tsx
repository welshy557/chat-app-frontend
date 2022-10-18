import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";
import { UseMutateAsyncFunction } from "react-query";
import { AxiosResponse } from "axios";

interface GroupProps {
  group: any;
  selected: boolean;
  deleteGroup: UseMutateAsyncFunction<
    AxiosResponse<any, any>,
    unknown,
    number,
    unknown
  >;
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
      <div className="name">{group.name}</div>
      <IconButton onClick={(e) => deleteGroup(group.id)}>
        <DeleteIcon />
      </IconButton>
    </div>
  );
}
