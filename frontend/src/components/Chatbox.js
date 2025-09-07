import { Box } from "@chakra-ui/react";
import "./styles.css";
import SingleChat from "./SingleChat";
import { ChatState } from "../Context/ChatProvider";
import theme from "../theme.js"; // Importing the theme for consistent styling

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDir="column"
      p={{ base: 0, md: 3 }}
      bg={theme.mainBgColor}
      w={{ base: "100%", md: "68%" }}
      borderRadius={{ base: "0", md: "lg" }}
      borderWidth={{ base: "0", md: "1px" }}
      h={{ base: "100%", md: "100%" }}
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default Chatbox;
