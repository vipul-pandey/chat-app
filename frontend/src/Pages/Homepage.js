import { useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";
import Logo from "../components/Logo";

function Homepage() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) navigate("/chats");
  }, [navigate]);

  return (
    <Container maxW={{ base: "95%", md: "xl" }} centerContent px={{ base: 4, md: 6 }}>
      <Box
        display="flex"
        textAlign="center"
        p={{ base: 3, md: 4 }}
        bg="white"
        w="100%"
        m={{ base: "20px 0 10px 0", md: "40px 0 15px 0" }}
        borderRadius="16px"
        borderWidth="1px"
        borderColor="#e5e7eb"
        boxShadow="0 2px 8px rgba(0, 0, 0, 0.06)"
      >
        <Box margin={"0 auto"}>
          <Logo size="lg" />
        </Box>
      </Box>
      <Box 
        bg="white" 
        w="100%" 
        p={{ base: 3, md: 4 }} 
        borderRadius="16px" 
        borderWidth="1px"
        borderColor="#e5e7eb"
        boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)"
      >
        <Tabs isFitted variant="soft-rounded">
          <TabList mb="1em">
            <Tab>Login</Tab>
            <Tab>Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
}

export default Homepage;
