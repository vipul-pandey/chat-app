import { Avatar, Tooltip, Text, Box } from "@chakra-ui/react";
import ScrollableFeed from "react-scrollable-feed";
import dayjs from "dayjs";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  const messageContent = (m) => {
    return (
      <Box display={"flex"} alignItems="flex-end" gap={2} flexWrap="wrap">
        <span>{m.content}</span>
        <Text 
          fontSize={{ base: '0.7em', md: '0.8em' }} 
          color={m.sender._id === user._id ? "rgba(255,255,255,0.8)" : "#64748b"}
          whiteSpace="nowrap"
          fontWeight="500"
        >
          {dayjs(m.updatedAt).format("hh:mm A")}
        </Text>
      </Box>
    );
  }

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div 
            style={{ 
              display: "flex", 
              marginBottom: "10px",
              animation: "slideIn 0.3s ease-out"
            }} 
            key={m._id}
          >
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
                <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                  <Avatar
                    mt="4px"
                    mr={2}
                    size={{ base: "sm", md: "md" }}
                    cursor="pointer"
                    name={m.sender.name}
                    src={m.sender.pic}
                    borderRadius="10px"
                    border="2px solid #e5e7eb"
                  />
                </Tooltip>
              )}
            <span
              style={{
                background: m.sender._id === user._id 
                  ? "linear-gradient(135deg, #5a7fff 0%, #3b52d4 100%)" 
                  : "#ffffff",
                color: m.sender._id === user._id ? "white" : "#1e293b",
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                marginTop: isSameUser(messages, m, i, user._id) ? "4px" : "12px",
                borderRadius: m.sender._id === user._id ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                padding: window.innerWidth < 768 ? "10px 14px" : "12px 16px",
                maxWidth: window.innerWidth < 768 ? "80%" : "70%",
                fontSize: window.innerWidth < 768 ? "14px" : "15px",
                wordBreak: "break-word",
                overflowWrap: "break-word",
                boxShadow: m.sender._id === user._id 
                  ? "0 2px 8px rgba(90, 127, 255, 0.3)" 
                  : "0 2px 8px rgba(0, 0, 0, 0.08)",
                fontWeight: "500",
                lineHeight: "1.4",
                border: m.sender._id === user._id ? "none" : "1px solid #e5e7eb"
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
