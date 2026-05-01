import { useEffect, useState, useRef } from "react";
import "./styles.css";
import axios from "../api/axiosInstance";
import io from "socket.io-client";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { FiSend } from "react-icons/fi";
import {
  Box,
  Text,
  Input,
  FormControl,
  IconButton,
  Spinner,
  useToast,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Avatar,
} from "@chakra-ui/react";
import Lottie from "react-lottie";
import EmojiPicker from "emoji-picker-react";
import { getSender, getSenderFull, getSenderImage } from "../config/ChatLogics";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import animationData from "../animations/typing.json";

import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
import SVGComponent from "../assests/three-dot-icon.js";
import ChatWidget from "./AIChatWidget.jsx";

const ENDPOINT = "https://chat-app-dxnu.onrender.com/"; // "http://localhost:5000"
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const emojiRef = useRef();

  const onEmojiClick = (emojiData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      if (user._id !== selectedChat.latestMessage.sender._id) {
        await axios.put(
          `/api/chat/mark-as-seen`,
          { chatId: selectedChat._id, userId: user._id, },
          config
        );
      }
      // setFetchAgain(!fetchAgain);

      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (event) => {
    if ((event.key === "Enter" || event.type === "click") && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        // let updatedSelectedChat = { ...selectedChat, unseenMessagesCounts: selectedChat.unseenMessagesCounts + 1 };
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            // chatId: updatedSelectedChat,
            chatId: selectedChat,
          },
          config
        );
        setFetchAgain(!fetchAgain);
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
        // setFetchAgain(!fetchAgain);
      }
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const handleClickOutside = (e) => {
    if (emojiRef.current && !emojiRef.current.contains(e.target)) {
      setShowEmojiPicker(false);
    }
  };

  useEffect(() => {
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup on unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  return (
    <>
      {selectedChat ? (
        <>
          <Box
            px={{ base: 3, md: 4 }}
            py={{ base: 3, md: 4 }}
            w="100%"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            minH="70px"
            borderBottom="1px solid #e5e7eb"
            bg="white"
            borderRadius={{ base: "0", md: "20px 20px 0 0" }}
          >
            <Box display="flex" alignItems="center" gap={3}>
              <IconButton
                display={{ base: "flex", md: "none" }}
                icon={<ArrowBackIcon />}
                onClick={() => setSelectedChat("")}
                variant="ghost"
                size="md"
                color="#6b91ff"
                _hover={{ bg: "rgba(107, 145, 255, 0.1)" }}
                minW="44px"
              />
              {messages && (
                <>
                  <Box
                    display="flex"
                    alignItems="center"
                    cursor="pointer"
                    onClick={() => setShowProfileModal(true)}
                    transition="all 0.2s ease"
                    _hover={{ opacity: 0.8 }}
                  >
                    <Avatar
                      mr={3}
                      size={{ base: "md", md: "lg" }}
                      cursor="pointer"
                      name={selectedChat.name}
                      borderRadius="12px"
                      border="2px solid #e5e7eb"
                      src={
                        !selectedChat.isGroupChat
                          ? getSenderImage(user, selectedChat.users)
                          : selectedChat.pic || selectedChat.groupAdmin.pic
                      }
                    />
                    <Box>
                      <Text
                        fontSize={{ base: "md", md: "18px" }}
                        fontWeight="700"
                        color="#1e293b"
                        isTruncated
                        maxW={{ base: "150px", md: "250px" }}
                      >
                        {!selectedChat.isGroupChat
                          ? getSender(user, selectedChat.users)
                          : selectedChat.chatName}
                      </Text>
                      <Text
                        fontSize={{ base: "xs", md: "sm" }}
                        color="#94a3b8"
                        fontWeight="500"
                      >
                        {selectedChat.isGroupChat ? `${selectedChat.users.length} members` : "Active now"}
                      </Text>
                    </Box>
                  </Box>
                </>
              )}
            </Box>
            <Box alignItems={"center"} display="flex" gap={{ base: 2, md: 3 }}>
              <ChatWidget />
              <Menu>
                <MenuButton
                  as={Box}
                  p={2}
                  borderRadius="10px"
                  _hover={{ bg: "rgba(107, 145, 255, 0.1)" }}
                  transition="all 0.2s ease"
                >
                  <SVGComponent />
                </MenuButton>
                <MenuList
                  boxShadow="0 10px 40px rgba(0, 0, 0, 0.12)"
                  borderRadius="12px"
                  border="1px solid #e5e7eb"
                >
                  {!selectedChat.isGroupChat ? (
                    <ProfileModal
                      user={getSenderFull(user, selectedChat.users)}
                      isUserEditable={false}
                    >
                      <MenuItem fontSize="medium" fontWeight="600" borderRadius="8px">
                        Profile
                      </MenuItem>
                    </ProfileModal>
                  ) : (
                    <UpdateGroupChatModal
                      fetchMessages={fetchMessages}
                      fetchAgain={fetchAgain}
                      setFetchAgain={setFetchAgain}
                    >
                      <MenuItem fontSize="medium" fontWeight="600" borderRadius="8px">
                        Profile
                      </MenuItem>
                    </UpdateGroupChatModal>
                  )}
                </MenuList>
              </Menu>
            </Box>
          </Box>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={{ base: 0, md: 3 }}
            bg="#f8fafc"
            w="100%"
            h="100%"
            borderRadius={{ base: "0", md: "0 0 20px 20px" }}
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="lg"
                w={16}
                h={16}
                alignSelf="center"
                margin="auto"
                color="#6b91ff"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl
              onKeyDown={sendMessage}
              id="message-input"
              isRequired
              px={{ base: 2, md: 3 }}
              pb={{ base: 2, md: 3 }}
            >
              {istyping ? (
                <Box mb={2} ml={2}>
                  <Lottie
                    options={defaultOptions}
                    width={70}
                    style={{ marginBottom: 0 }}
                  />
                </Box>
              ) : (
                <></>
              )}
              {showEmojiPicker && (
                <Box
                  ref={emojiRef}
                  position="absolute"
                  bottom="80px"
                  left={{ base: "20px", md: "40px" }}
                  right={{ base: "20px", md: "40px" }}
                  zIndex={10}
                  borderRadius="16px"
                  boxShadow="0 15px 40px rgba(0, 0, 0, 0.15)"
                >
                  <EmojiPicker
                    onEmojiClick={onEmojiClick}
                  />
                </Box>
              )}
              <Box
                display="flex"
                alignItems="center"
                gap={{ base: 2, md: 3 }}
                bg="white"
                px={{ base: 3, md: 4 }}
                py={{ base: 2.5, md: 3 }}
                borderRadius="16px"
                boxShadow="0 4px 16px rgba(0, 0, 0, 0.08)"
                w="100%"
                mx="auto"
                minH={{ base: "48px", md: "56px" }}
                border="1px solid #e5e7eb"
                transition="all 0.2s ease"
                _focus={{ borderColor: "#6b91ff" }}
              >
                <Box
                  as="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  fontSize={{ base: "20px", md: "24px" }}
                  transition="all 0.2s ease"
                  _hover={{ transform: "scale(1.2)" }}
                  _active={{ transform: "scale(0.95)" }}
                >
                  😊
                </Box>
                <Input
                  placeholder="Type your message..."
                  variant="unstyled"
                  value={newMessage}
                  onChange={typingHandler}
                  flex="1"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                  bg="transparent"
                  fontSize={{ base: "14px", md: "16px" }}
                  _placeholder={{ color: "#cbd5e1" }}
                  _hover={{ bg: "transparent" }}
                  _focus={{
                    boxShadow: "none",
                    outline: "none",
                    bg: "transparent",
                  }}
                  _active={{
                    boxShadow: "none",
                    outline: "none",
                    bg: "transparent",
                  }}
                />
                <IconButton
                  aria-label="Send message"
                  icon={<FiSend />}
                  onClick={(e) => sendMessage(e)}
                  borderRadius="10px"
                  size={{ base: "sm", md: "md" }}
                  bg="linear-gradient(135deg, #6b91ff 0%, #4f63d6 100%)"
                  color="white"
                  _hover={{
                    bg: "linear-gradient(135deg, #5570d6 0%, #3f4fad 100%)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(107, 145, 255, 0.4)",
                  }}
                  _active={{
                    transform: "translateY(0)",
                  }}
                  transition="all 0.2s ease"
                />
              </Box>
            </FormControl>
          </Box>
        </>
      ) : (
        // to get socket.io on same page
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
      {showProfileModal && (
        <ProfileModal
          user={
            !selectedChat.isGroupChat
              ? getSenderFull(user, selectedChat.users)
              : user
          }
          isUserEditable={false}
        >
          <></>
        </ProfileModal>

      )}
    </>
  );
};

export default SingleChat;
