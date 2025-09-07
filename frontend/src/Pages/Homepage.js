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
  Image,
} from "@chakra-ui/react";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";
import chattr from "../assests/chattr.png";

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
        p={{ base: 2, md: 3 }}
        bg="white"
        w="100%"
        m={{ base: "20px 0 10px 0", md: "40px 0 15px 0" }}
        borderRadius="lg"
        borderWidth="1px"
      >
        <Box margin={"0 auto"}>
          <Image
            src={chattr}
            alt="Chattr Logo"
            width={{ base: "80px", md: "110px" }}
            height={{ base: "35px", md: "50px" }}
          />
        </Box>
      </Box>
      <Box bg="white" w="100%" p={{ base: 3, md: 4 }} borderRadius="lg" borderWidth="1px">
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
