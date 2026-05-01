import { Stack, Skeleton, Box } from "@chakra-ui/react";

const ChatLoading = () => {
  return (
    <Stack w="100%" px={2} py={2} gap={2}>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
        <Box
          key={item}
          display="flex"
          gap={3}
          p={3}
          borderRadius="14px"
          bg="#f8fafc"
        >
          <Skeleton 
            height="50px" 
            width="50px" 
            borderRadius="12px"
            startColor="#e2e8f0"
            endColor="#f1f5f9"
          />
          <Stack flex={1} gap={2} w="100%">
            <Skeleton 
              height="14px" 
              width="60%"
              borderRadius="8px"
              startColor="#e2e8f0"
              endColor="#f1f5f9"
            />
            <Skeleton 
              height="10px" 
              width="80%"
              borderRadius="8px"
              startColor="#e2e8f0"
              endColor="#f1f5f9"
            />
          </Stack>
        </Box>
      ))}
    </Stack>
  );
};

export default ChatLoading;
