import React, { useState } from "react";
import { User } from "../models";

interface MentionUsersProps {
  users: User[];
  message: string;
  setMessage: (value: React.SetStateAction<string>) => void;
}

const isSearchingUser = (message: string, filterValue: string) => {
  let count = 0;

  for (let i = 0; i < filterValue.length; i++) {
    if (count === 2) {
      return false;
    }
    if (filterValue[i] === " ") {
      count++;
    }
  }
  return message.includes("@") || message.includes(" @");
};

export default function MentionUsers({
  users,
  message,
  setMessage,
}: MentionUsersProps) {
  const [selectedMention, setSelectedMention] = useState<User>(users[0]);

  const filterValue = message.substring(
    message.indexOf("@") + 1,
    message.length
  );

  const filteredUsers = users.filter(({ firstName, lastName }) =>
    filterValue.length > 0
      ? `${firstName} ${lastName}`
          .toLowerCase()
          .includes(filterValue.toLowerCase())
      : true
  );

  return isSearchingUser(message, filterValue) ? (
    <div className="userSearch">
      {filteredUsers.map(({ id, firstName, lastName }, i) => (
        <div key={i} className="userSearchSelection">
          <div
            className={
              id === selectedMention.id
                ? "searchUser selectedMention"
                : "searchUser"
            }
          >
            {firstName} {lastName}
          </div>
        </div>
      ))}
    </div>
  ) : (
    <></>
  );
}
