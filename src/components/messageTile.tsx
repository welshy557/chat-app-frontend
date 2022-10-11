import { Message, User } from "../models";
import { useQuery } from "react-query";
import useApi from "../hooks/useApi";
import { useEffect, useRef } from "react";

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
      {messages.map((message, i) => (
        <div
          key={i}
          className={
            message.userId === loggedInUser?.id
              ? "sentMessage"
              : "recivedMessage"
          }
        >
          {message.message}
        </div>
      ))}
    </div>
  );
}
