import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  IconButton,
  Text,
  Image,
  Box
} from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";

const ProfileModal = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton display={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />
      )}
      <Modal size={{ base: "xs", md: "sm" }} onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent mx={{ base: 4, md: 0 }} my={{ base: 4, md: 0 }}>
          <ModalHeader fontSize={{ base: "18px", md: "24px" }} textAlign="center">
            User Info
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="center"
            gap={{ base: 3, md: 4 }}
            px={{ base: 4, md: 6 }}
            py={{ base: 4, md: 6 }}
          >
            <Box display="flex" flexDir="column" alignItems="center" gap={2}>
              <Image
                borderRadius="10%"
                boxSize={{ base: "60px", md: "80px" }}
                src={user.pic}
                alt={user.name}
              />
              <Text
                fontSize={{ base: "18px", md: "22px" }}
                fontFamily="Work sans"
                fontWeight="bold"
                textAlign="center"
              >
                {user.name}
              </Text>
            </Box>
            <Text
              fontSize={{ base: "14px", md: "16px" }}
              fontFamily="Work sans"
              color="gray.600"
              textAlign="center"
              wordBreak="break-word"
            >
              {user.email}
            </Text>
          </ModalBody>
          <ModalFooter px={{ base: 4, md: 6 }} py={{ base: 3, md: 4 }}>
            <Button onClick={onClose} w={{ base: "100%", md: "auto" }} size={{ base: "md", md: "lg" }}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
