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
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg={theme.mainBgColor}
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <>
          <Image
            src={chattr}
            alt="Chattr Logo"
            width="110px"
            height="50px"
          />
        </>
        <div>
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
              />
              <BellIcon fontSize="2xl" m={1} />
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
        </div>
      </Box >
    </>
  );
}

export default SideDrawer;
