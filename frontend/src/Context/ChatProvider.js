import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { readUser } from "../api/session";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState();

  const navigate = useNavigate();

  useEffect(() => {
    const syncSession = () => {
      const userInfo = readUser();
      setUser(userInfo);
      if (!userInfo) {
        setChats(undefined);
        setSelectedChat(undefined);
        setNotification([]);
        navigate("/", { replace: true });
      }
    };
    syncSession();
    window.addEventListener("chat-session-changed", syncSession);
    window.addEventListener("storage", syncSession);
    return () => {
      window.removeEventListener("chat-session-changed", syncSession);
      window.removeEventListener("storage", syncSession);
    };
  }, [navigate]);

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        notification,
        setNotification,
        chats,
        setChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
