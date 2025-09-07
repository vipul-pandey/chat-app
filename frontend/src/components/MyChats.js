import { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Text,
  useToast,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tooltip,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Spinner,
  Input,
  Avatar,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import axios from "../api/axiosInstance";
import { getSender, getSenderImage, isMessageSeen } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { ChatState } from "../Context/ChatProvider";
import SVGComponent from "../assests/three-dot-icon.js";
import UserListItem from "./userAvatar/UserListItem";
import theme from "../theme.js";
import ChatWidget from "./AIChatWidget.jsx";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    const markAllMessagesAsUnSeen = async () => {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      await axios.put(
        `/api/chat/mark-as-seen`,
        { chatId: null, userId: user._id, },
        config
      );
    }
    markAllMessagesAsUnSeen();
  }, [user._id, user.token]);

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChat = async (userId) => {
    console.log(userId);

    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };
  // console.log('chats');
  // Helper function to check if unseen message badge should be shown
  const shouldShowUnseenBadge = (chat) => {
    return (
      selectedChat?._id !== chat?._id &&
      chat.unseenMessagesCounts > 0 &&
      isMessageSeen(loggedUser, chat.latestMessage?.sender)
    );
  };

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={{ base: 0, md: 1 }}
      bg={theme.mainBgColor}
      w={{ base: "100%", md: "31%" }}
      borderRadius={{ base: "0", md: "lg" }}
      borderWidth={{ base: "0", md: "1px" }}
      h={{ base: "100%", md: "100%" }}
    >
      <Box
        display="flex"
        flexDir="column"
        p={{ base: 0, md: 1 }}
        bg={theme.mainBgColor}
        w="100%"
        h="100%"
        borderRadius={{ base: "0", md: "lg" }}
        overflowY="hidden"
      >
        <Box
          display={"flex"}
          justifyContent="space-between"
          alignItems="center"
          w="100%"
          px={{ base: 3, md: 2 }}
          py={{ base: 2, md: 4 }}
          minH={{ base: "50px", md: "auto" }}
        >
          <Text fontSize={{ base: "16px", md: "18px" }} fontWeight="bold" color={{ base: "gray.800", md: "inherit" }}>Chats</Text>
          <Box display="flex" alignItems="center" gap={2}>
            <ChatWidget />
            <Menu>
              <MenuButton>
                <SVGComponent />
              </MenuButton>
              <MenuList>
                <GroupChatModal>
                  <MenuItem> Group Chat </MenuItem>
                </GroupChatModal>
                <Box display={{ base: "block", md: "none" }}>
                  <MenuItem onClick={onOpen}> Search Users </MenuItem>
                </Box>
              </MenuList>
            </Menu>
          </Box>
        </Box>
        <Box display={{ base: "none", md: "block" }}>
          <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
            <Button
              variant="ghost"
              onClick={onOpen}
              w={"100%"}
              justifyContent={"start"}
              bg={"#E8E8E8"}
              my={2}
              py={1}
            >
              <i className="fas fa-search"></i>
              <Text display={{ base: "none", md: "flex" }} px={4}>
                Search User
              </Text>
            </Button>
          </Tooltip>
        </Box>
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                px={{ base: 2, md: 3 }}
                py={{ base: 1, md: 2 }}
                borderRadius="lg"
                key={chat._id}
                display={"flex"}
                alignItems={"center"}
                minH={{ base: "50px", md: "auto" }}
              >
                <Avatar
                  mr={{ base: 1.5, md: 2 }}
                  size={{ base: "xs", md: "sm" }}
                  cursor="pointer"
                  name={chat.name}
                  borderRadius={"10%"}
                  src={!chat.isGroupChat
                    ? getSenderImage(loggedUser, chat.users)
                    : chat.pic || chat.groupAdmin.pic}
                />
                <Box display={'flex'} width={'100%'} justifyContent={"space-between"}>
                  <Box>
                    <Text fontSize={{ base: "xs", md: "md" }} fontWeight={{ base: "medium", md: "medium" }}>
                      {!chat.isGroupChat
                        ? getSender(loggedUser, chat.users)
                        : chat.chatName}
                    </Text>
                    {chat.latestMessage && (
                      <Text fontSize={{ base: "xs", md: "xs" }} noOfLines={1} color="gray.500" fontWeight="normal">
                        {chat.isGroupChat && <b>{chat.latestMessage.sender.name} : </b>}
                        {chat.latestMessage.content.length > 40
                          ? chat.latestMessage.content.substring(0, 40) + "..."
                          : chat.latestMessage.content}
                      </Text>
                    )}
                  </Box>
                  <Box textAlign={"right"}>
                    <Text style={{ fontSize: "0.8em", color: shouldShowUnseenBadge(chat) ? '#d11567' : theme.lightGreyColor, marginLeft: "12px" }}>
                      {dayjs(chat?.latestMessage?.updatedAt).format("hh:mm A")}
                    </Text>
                    {shouldShowUnseenBadge(chat) && (
                      <Text as="div" style={{
                        marginLeft: "8px",
                        backgroundColor: "#d11567",
                        width: "20px",
                        height: "20px",
                        display: "inline-block",
                        alignContent: "center",
                        textAlign: "center",
                        lineHeight: "20px",
                        color: "white",
                        borderRadius: "50%",
                        fontSize: "0.7em",
                      }}>
                        {chat.unseenMessagesCounts}
                      </Text>
                    )}
                  </Box>
                </Box>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen} >
        <DrawerOverlay />
        <DrawerContent bg={theme.mainBgColor}>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box >
  );
};

export default MyChats;
