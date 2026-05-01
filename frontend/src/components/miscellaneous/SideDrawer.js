import { useNavigate } from "react-router-dom";
import {
  Box,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { BellIcon } from "@chakra-ui/icons";
import { Effect } from "react-notification-badge";
import NotificationBadge from "react-notification-badge";
import ProfileModal from "./ProfileModal";
import { getSender } from "../../config/ChatLogics";
import { ChatState } from "../../Context/ChatProvider";
import SVGComponent from "../../assests/three-dot-icon.js";
import theme from "../../theme.js";
import Logo from "../Logo";

function SideDrawer() {

  const {
    setSelectedChat,
    user,
    setUser,
    notification,
    setNotification,
  } = ChatState();

  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  return (
    <>
      <Box
        position={{ base: "fixed", md: "static" }}
        top={{ base: "0", md: "auto" }}
        left={{ base: "0", md: "auto" }}
        right={{ base: "0", md: "auto" }}
        zIndex={{ base: "1000", md: "auto" }}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg={{ base: "white", md: theme.mainBgColor }}
        w="100%"
        p={{ base: "12px 15px", md: "8px 15px" }}
        borderWidth={{ base: "0", md: "0" }}
        minH={{ base: "60px", md: "65px" }}
        boxShadow={{ base: "0 2px 8px rgba(0,0,0,0.1)", md: "0 2px 8px rgba(0,0,0,0.05)" }}
        borderBottom={{ base: "1px solid #e5e7eb", md: "1px solid #e5e7eb" }}
      >
        <Box display="flex" alignItems="center">
          <Logo size={{ base: "sm", md: "md" }} />
        </Box>
        <Box display="flex" alignItems="center" gap={{ base: 2, md: 3 }}>
          <Menu>
            <MenuButton 
              p={{ base: 2, md: 2 }}
              borderRadius="10px"
              _hover={{ bg: "rgba(107, 145, 255, 0.1)" }}
              transition="all 0.2s ease"
            >
              <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
              />
              <BellIcon 
                fontSize={{ base: "lg", md: "xl" }} 
                m={1} 
                color={{ base: "#6b91ff", md: "#6b91ff" }}
                transition="all 0.2s ease"
                _hover={{ transform: "scale(1.1)" }}
              />
            </MenuButton>
            <MenuList 
              pl={2}
              borderRadius="12px"
              boxShadow="0 10px 40px rgba(0, 0, 0, 0.12)"
              border="1px solid #e5e7eb"
            >
              {!notification.length && "No New Messages"}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu >
            <MenuButton >
              <SVGComponent />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user} isUserEditable={true} setUser={setUser}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Box >
    </>
  );
}

export default SideDrawer;
