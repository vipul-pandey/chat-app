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
    markAllMessagesAsUnSeen().catch(() => {
      // Authentication is handled by the shared API client.
    });
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
      p={{ base: 0, md: 3 }}
      bg={theme.mainBgColor}
      w={{ base: "100%", md: "31%" }}
      borderRadius={{ base: "0", md: "20px" }}
      borderWidth="0"
      h={{ base: "100%", md: "100%" }}
      boxShadow="0 10px 40px rgba(0, 0, 0, 0.08)"
      transition="all 0.3s ease"
    >
      <Box
        display="flex"
        flexDir="column"
        p={{ base: 0, md: 2 }}
        bg={theme.mainBgColor}
        w="100%"
        h="100%"
        borderRadius={{ base: "0", md: "20px" }}
        overflowY="hidden"
      >
        <Box
          display={"flex"}
          justifyContent="space-between"
          alignItems="center"
          w="100%"
          px={{ base: 3, md: 4 }}
          py={{ base: 2, md: 5 }}
          minH={{ base: "50px", md: "auto" }}
          borderBottom="1px solid #e5e7eb"
        >
          <Text 
            fontSize={{ base: "16px", md: "24px" }} 
            fontWeight="700" 
            color="#1e293b"
            background="linear-gradient(135deg, #6b91ff 0%, #4f63d6 100%)"
            backgroundClip="text"
            WebkitBackgroundClip="text"
            WebkitTextFillColor="transparent"
          >
            Messages
          </Text>
          <Box display="flex" alignItems="center" gap={2}>
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
                <GroupChatModal>
                  <MenuItem borderRadius="8px"> Group Chat </MenuItem>
                </GroupChatModal>
                <Box display={{ base: "block", md: "none" }}>
                  <MenuItem borderRadius="8px" onClick={onOpen}> Search Users </MenuItem>
                </Box>
              </MenuList>
            </Menu>
          </Box>
        </Box>
        <Box display={{ base: "none", md: "block" }} px={3} py={3}>
          <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
            <Button
              variant="ghost"
              onClick={onOpen}
              w={"100%"}
              justifyContent={"start"}
              bg={"#f1f5f9"}
              my={2}
              py={3}
              borderRadius="12px"
              fontSize="14px"
              color="#64748b"
              _hover={{ bg: "rgba(107, 145, 255, 0.1)", color: "#6b91ff" }}
              transition="all 0.2s ease"
            >
              <i className="fas fa-search" style={{ marginRight: "12px" }}></i>
              <Text display={{ base: "none", md: "flex" }}>
                Search User
              </Text>
            </Button>
          </Tooltip>
        </Box>
        {chats ? (
          <Stack overflowY="auto" px={2} py={2} gap={2}>
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "linear-gradient(135deg, #6b91ff 0%, #4f63d6 100%)" : "#f8fafc"}
                color={selectedChat === chat ? "white" : "#1e293b"}
                px={{ base: 2, md: 3 }}
                py={{ base: 1.5, md: 2 }}
                borderRadius="12px"
                key={chat._id}
                display={"flex"}
                alignItems={"center"}
                minH={{ base: "45px", md: "50px" }}
                transition="all 0.3s ease"
                boxShadow={selectedChat === chat ? "0 4px 12px rgba(107, 145, 255, 0.3)" : "none"}
                _hover={{
                  bg: selectedChat === chat ? "linear-gradient(135deg, #5570d6 0%, #3f4fad 100%)" : "#f1f5f9",
                  transform: "translateY(-1px)",
                  boxShadow: selectedChat === chat ? "0 8px 20px rgba(107, 145, 255, 0.4)" : "0 2px 8px rgba(0, 0, 0, 0.06)",
                }}
              >
                <Avatar
                  mr={{ base: 1.5, md: 2 }}
                  size={{ base: "sm", md: "md" }}
                  cursor="pointer"
                  name={chat.name}
                  borderRadius={"10px"}
                  border={selectedChat === chat ? "1px solid white" : "none"}
                  src={!chat.isGroupChat
                    ? getSenderImage(loggedUser, chat.users)
                    : chat.pic || chat.groupAdmin.pic}
                />
                <Box display={'flex'} width={'100%'} justifyContent={"space-between"} alignItems="center">
                  <Box flex={1} minW={0}>
                    <Text 
                      fontSize={{ base: "xs", md: "sm" }} 
                      fontWeight="600"
                      color="inherit"
                      noOfLines={1}
                    >
                      {!chat.isGroupChat
                        ? getSender(loggedUser, chat.users)
                        : chat.chatName}
                    </Text>
                    {chat.latestMessage && (
                      <Text 
                        fontSize={{ base: "xs", md: "xs" }} 
                        noOfLines={1} 
                        color={selectedChat === chat ? "rgba(255,255,255,0.6)" : "#94a3b8"} 
                        fontWeight="400"
                      >
                        {chat.isGroupChat && <b>{chat.latestMessage.sender.name} : </b>}
                        {chat.latestMessage.content.length > 35
                          ? chat.latestMessage.content.substring(0, 35) + "..."
                          : chat.latestMessage.content}
                      </Text>
                    )}
                  </Box>
                  <Box textAlign={"right"} ml={1} flexShrink={0}>
                    <Text 
                      fontSize={{ base: "xs", md: "xs" }} 
                      color={shouldShowUnseenBadge(chat) ? '#ef4444' : (selectedChat === chat ? "rgba(255,255,255,0.6)" : "#94a3b8")}
                      fontWeight="500"
                    >
                      {dayjs(chat?.latestMessage?.updatedAt).format("hh:mm A")}
                    </Text>
                    {shouldShowUnseenBadge(chat) && (
                      <Box
                        mt={0.5}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        ml="auto"
                        bg="#ef4444"
                        w="18px"
                        h="18px"
                        borderRadius="50%"
                        color="white"
                        fontSize="0.65em"
                        fontWeight="700"
                      >
                        {chat.unseenMessagesCounts}
                      </Box>
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
        <DrawerContent bg={theme.mainBgColor} borderRadius="0 20px 20px 0">
          <DrawerHeader 
            borderBottomWidth="1px"
            borderColor="#e5e7eb"
            fontSize="20px"
            fontWeight="700"
            color="#1e293b"
          >
            Search Users
          </DrawerHeader>
          <DrawerBody pt={6}>
            <Box display="flex" pb={4} gap={2}>
              <Input
                placeholder="Search by name or email"
                borderRadius="12px"
                border="1.5px solid #e5e7eb"
                fontSize="14px"
                _focus={{
                  borderColor: "#6b91ff",
                  boxShadow: "0 0 0 3px rgba(107, 145, 255, 0.1)",
                }}
                _placeholder={{ color: "#cbd5e1" }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button 
                onClick={handleSearch}
                borderRadius="12px"
                px={6}
                bg="linear-gradient(135deg, #6b91ff 0%, #4f63d6 100%)"
                color="white"
                fontWeight="600"
                fontSize="14px"
                _hover={{
                  bg: "linear-gradient(135deg, #5570d6 0%, #3f4fad 100%)",
                }}
              >
                Go
              </Button>
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
