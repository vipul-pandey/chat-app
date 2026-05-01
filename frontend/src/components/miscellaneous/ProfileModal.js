import { useCallback, useState } from "react";
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
  Box,
  Input,
  useToast,
} from "@chakra-ui/react";
import { EditIcon, ViewIcon } from "@chakra-ui/icons";
import axios from '../../api/axiosInstance';

const ProfileModal = ({ user, children, isUserEditable, setUser }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = useState(user.name);
  const [pic, setPic] = useState(user.pic);
  const [editing, setEditing] = useState(false);

  const toast = useToast();

  const handleEditClick = () => setEditing(true);

  const handleSave = useCallback(async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `/api/user/${user._id}`,
        { name, pic },
        config
      );
      setEditing(false);
      if (setUser) {
        setUser(data);
        localStorage.setItem("userInfo", JSON.stringify(data));
      }
      toast({
        title: "Profile updated!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  }, [name, pic, user, setUser, toast]);

  const postDetails = (pics) => {
    if (pics === undefined) {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "vipulproj");
      data.append("cloud_name", "domzykvag");
      fetch("https://api.cloudinary.com/v1_1/domzykvag/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());

        })
        .catch((err) => {
          console.log(err);

        });
    } else {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      return;
    }
  };

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
          {isUserEditable && !editing && (
            <EditIcon mx='4' my='4' onClick={handleEditClick} cursor="pointer" />
          )}
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
                src={pic}
                alt={name}
              />
              {editing ? (
                <>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => postDetails(e.target.files[0])}
                    placeholder="Enter picture URL"
                  />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name"
                    mb={2}
                  />

                </>
              ) : (
                <Text
                  fontSize={{ base: "18px", md: "22px" }}
                  fontFamily="Work sans"
                  fontWeight="bold"
                  textAlign="center"
                >
                  {name}
                </Text>
              )}
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
            <Button onClick={editing ? handleSave : onClose} w={{ base: "100%", md: "auto" }} size={{ base: "md", md: "lg" }}>
              {editing ? "Save" : 'Close'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
