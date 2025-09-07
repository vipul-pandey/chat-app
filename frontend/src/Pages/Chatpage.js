import { useState } from "react";
import { Box } from "@chakra-ui/react";
import Chatbox from "../components/Chatbox";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";

const Chatpage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user } = ChatState();

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column" }}>
      {user && <SideDrawer />}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        w="100%" 
        h={{ base: "calc(100vh - 70px)", md: "91.5vh" }}
        p={{ base: "0", md: "10px" }}
        gap={{ base: "0", md: "10px" }}
        mt={{ base: "70px", md: "0" }}
      >
        {user && <MyChats fetchAgain={fetchAgain} />}
        {user && (
          <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
    </div>
  );
};

export default Chatpage;
