import { Box, Text, Avatar } from "@chakra-ui/react";

const UserListItem = ({ key, user, handleFunction }) => {
  return (
    <Box
      key={key}
      onClick={handleFunction}
      cursor="pointer"
      bg="#f8fafc"
      _hover={{
        background: "linear-gradient(135deg, #6b91ff 0%, #4f63d6 100%)",
        color: "white",
        transform: "translateX(4px)",
      }}
      w="100%"
      display="flex"
      alignItems="center"
      color="#1e293b"
      px={4}
      py={3}
      mb={2}
      borderRadius="14px"
      transition="all 0.3s ease"
      border="1px solid #e5e7eb"
    >
      <Avatar
        mr={3}
        size="md"
        cursor="pointer"
        name={user.name}
        src={user.pic}
        borderRadius="12px"
        border="2px solid #e5e7eb"
      />
      <Box flex={1} minW={0}>
        <Text fontWeight="600" fontSize="md" noOfLines={1}>{user.name}</Text>
        <Text fontSize="sm" color="inherit" opacity={0.7} noOfLines={1}>
          {user.email}
        </Text>
      </Box>
    </Box>
  );
};

export default UserListItem;
