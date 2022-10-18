import { Message, User } from "../models";
import React, { useEffect, useRef } from "react";
import moment from "moment";
import { useQuery } from "react-query";
import useApi from "../hooks/useApi";
import Loader from "./Loader";

interface MessageTileProps {
  messages: Message[];
  loggedInUser?: User | null;
}

export default function MessageTile({
  messages,
  loggedInUser,
}: MessageTileProps) {
  const messageContentRef = useRef<HTMLDivElement>(null);

  const api = useApi();
  useEffect(() => {
    if (
      messageContentRef.current !== null &&
      typeof messageContentRef.current.scrollTop !== undefined
    ) {
      messageContentRef.current.scrollTop =
        messageContentRef.current?.scrollHeight;
    }
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery(
    ["users"],
    async () => {
      return (await api.get("users")).data as User[];
    },
    {
      onError: (err) => console.log(err),
    }
  );

  return (
    <div className="messagesContent" ref={messageContentRef}>
      <Loader isLoading={isLoadingUsers} />

      {messages.length === 0 ? (
        <span style={{ alignSelf: "center" }}>No Messages</span>
      ) : (
        messages.map((message, i) => {
          const currentMessageDate = moment(message.created_at);
          const prevMessageDate = moment(
            messages[i - 1]?.created_at ?? message.created_at
          );
          const sameHour =
            currentMessageDate.dayOfYear() === prevMessageDate.dayOfYear() &&
            currentMessageDate.hour() - prevMessageDate.hour() === 0;

          const user = users?.find((u) => u.id === message.userId);

          return (
            <React.Fragment key={i}>
              {(i === 0 || !sameHour) && (
                <div className="messageTime">
                  {moment(message.created_at).calendar()}
                </div>
              )}
              <div
                className={
                  message.userId === loggedInUser?.id
                    ? "sentMessage"
                    : "recivedMessage"
                }
              >
                {message.message}
              </div>
              {message.groupId && message.userId !== loggedInUser?.id && (
                <div className="messsageAuthor">{`${user?.firstName} ${user?.lastName}`}</div>
              )}
            </React.Fragment>
          );
        })
      )}
    </div>
  );
}
