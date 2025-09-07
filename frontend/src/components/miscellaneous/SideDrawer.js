import { useNavigate } from "react-router-dom";
import {
  Box,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Image,
} from "@chakra-ui/react";
import { BellIcon } from "@chakra-ui/icons";
import { Effect } from "react-notification-badge";
import NotificationBadge from "react-notification-badge";
import ProfileModal from "./ProfileModal";
import { getSender } from "../../config/ChatLogics";
import { ChatState } from "../../Context/ChatProvider";
import SVGComponent from "../../assests/three-dot-icon.js";
import theme from "../../theme.js";
import chattr from "../../assests/chattr.png";

function SideDrawer() {

  const {
    setSelectedChat,
    user,
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
        p={{ base: "12px 15px", md: "5px 10px 5px 10px" }}
        borderWidth={{ base: "0", md: "5px" }}
        minH={{ base: "60px", md: "60px" }}
        boxShadow={{ base: "0 2px 8px rgba(0,0,0,0.1)", md: "none" }}
        borderBottom={{ base: "1px solid #e2e8f0", md: "none" }}
      >
        <Box display="flex" alignItems="center">
          <Image
            src={chattr}
            alt="Chattr Logo"
            width={{ base: "90px", md: "110px" }}
            height={{ base: "40px", md: "50px" }}
          />
        </Box>
        <Box display="flex" alignItems="center" gap={{ base: 2, md: 2 }}>
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
              />
              <BellIcon fontSize={{ base: "xl", md: "2xl" }} m={1} color={{ base: "gray.600", md: "inherit" }} />
            </MenuButton>
            <MenuList pl={2}>
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
              <ProfileModal user={user}>
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
