import { Avatar, Tooltip, Text } from "@chakra-ui/react";
import ScrollableFeed from "react-scrollable-feed";
import dayjs from "dayjs";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import theme from "../theme.js";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  const messageContent = (m) => {
    return (
      <Text display={"flex"} alignItems="center" flexWrap={{ base: "wrap", md: "nowrap" }}>
        <span style={{ marginRight: "8px" }}>{m.content}</span>
        <Text 
          fontSize={{ base: '0.7em', md: '0.8em' }} 
          color={theme.lightGreyColor} 
          marginLeft={{ base: '0px', md: '12px' }}
          whiteSpace="nowrap"
        >
          {dayjs(m.updatedAt).format("hh:mm A")}
        </Text>
      </Text>
    );
  }

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: "flex" }} key={m._id}>
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
                <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                  <Avatar
                    mt="7px"
                    mr={1}
                    size="sm"
                    cursor="pointer"
                    name={m.sender.name}
                    src={m.sender.pic}
                  />
                </Tooltip>
              )}
            <span
              style={{
                backgroundColor: `${m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                  }`,
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                borderRadius: "20px",
                padding: window.innerWidth < 768 ? "8px 12px" : "5px 15px",
                maxWidth: window.innerWidth < 768 ? "85%" : "75%",
                fontSize: window.innerWidth < 768 ? "14px" : "16px",
                wordBreak: "break-word",
                overflowWrap: "break-word"
              }}
            >
              {messageContent(m)}
            </span>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
