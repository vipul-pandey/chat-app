import { useState } from "react";
import { AiFillWechatWork } from "react-icons/ai";
import { IoMdSend } from "react-icons/io";
import {
  Box,
  SkeletonText,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { boxStyle, textStyle } from '../commonStyles';

import axios from "../api/axiosInstance";

function ChatWidget() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { text: input, role: "user" }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);
    const config = {
      headers: {
        "Content-type": "application/json",
      },
    };
    const { data } = await axios.post("/api/aiChat", { messages: newMessages }, config);

    setIsTyping(false);

    // Typing effect
    let index = 0;
    const typingMessage = { text: "", role: "ai" };
    setMessages(prev => [...prev, typingMessage]);

    const typingInterval = setInterval(() => {
      if (index < data.reply.length) {
        typingMessage.text += data.reply[index];
        setMessages(prev => [...prev.slice(0, -1), { ...typingMessage }]);
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 25);
  };
  const handleClose = () => {
    setMessages([]);
    onClose();
  };
  return (
    <>
      <Tooltip label='Ask AI' placement={"top"} className="cursor-pointer">
        <span> <AiFillWechatWork onClick={onOpen} size={'22px'} /></span>
      </Tooltip>

      <Modal
        isCentered
        onClose={handleClose}
        isOpen={isOpen}
        motionPreset='slideInBottom'
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Ask anything</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <InputGroup size='md'>
              <Input
                pr='4.5rem'
                placeholder='Enter your message'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                disabled={isTyping}
              />
              <InputRightElement width='4.5rem'>
                <IoMdSend color='green.500' onClick={sendMessage} style={{ pointerEvents: isTyping ? 'none' : 'auto', opacity: isTyping ? 0.5 : 1 }} />
              </InputRightElement>
            </InputGroup>
            {messages.map((m, i) => (
              <Box key={i} {...(m.role === "user" ? boxStyle : {})}>
                <Text  {...(m.role === "user" ? textStyle : {})}> {m.text}</Text>
                {(
                  i === messages.length - 1 &&
                  isTyping &&
                  messages.length % 2 === 1
                ) && (
                    <Box padding='6' boxShadow='lg' bg='white' width={'100%'}>
                      <SkeletonText mt='4' noOfLines={4} spacing='4' skeletonHeight='2' />
                    </Box>
                  )}
              </Box>
            ))}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={handleClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal >
    </>
  );
}

export default ChatWidget;
