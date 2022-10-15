import { Message, User } from "../models";
import { useQuery } from "react-query";
import useApi from "../hooks/useApi";
import React, { useEffect, useRef } from "react";
import moment from "moment";

interface MessageTileProps {
  messages: Message[];
  loggedInUser?: User;
}

export default function messageTile({
  messages,
  loggedInUser,
}: MessageTileProps) {
  const messageContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      messageContentRef.current !== null &&
      typeof messageContentRef.current.scrollTop !== undefined
    ) {
      messageContentRef.current.scrollTop =
        messageContentRef.current?.scrollHeight;
    }
  });

  return (
    <div className="messagesContent" ref={messageContentRef}>
      {messages.map((message, i) => {
        const currentMessageDate = moment(message.created_at);
        const prevMessageDate = moment(
          messages[i - 1]?.created_at ?? message.created_at
        );
        const sameHour =
          currentMessageDate.dayOfYear() === prevMessageDate.dayOfYear() &&
          currentMessageDate.hour() - prevMessageDate.hour() === 0;

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
          </React.Fragment>
        );
      })}
    </div>
  );
}
