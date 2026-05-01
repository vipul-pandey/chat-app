import React from 'react';
import { Box, Text } from '@chakra-ui/react';

const Logo = ({ showText = true, size = "md" }) => {
  const sizeMap = {
    sm: { box: 24, text: 14, icon: 12 },
    md: { box: 32, text: 18, icon: 16 },
    lg: { box: 48, text: 24, icon: 20 },
  };

  const sizes = sizeMap[size] || sizeMap.md;

  return (
    <Box display="flex" alignItems="center" gap={2}>
      <Box
        position="relative"
        w={`${sizes.box}px`}
        h={`${sizes.box}px`}
        borderRadius="12px"
        background="linear-gradient(135deg, #6b91ff 0%, #4f63d6 100%)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        boxShadow="0 4px 12px rgba(107, 145, 255, 0.3)"
        transition="all 0.3s ease"
        _hover={{
          transform: "translateY(-2px)",
          boxShadow: "0 8px 20px rgba(107, 145, 255, 0.4)",
        }}
      >
        {/* Chat bubble icon */}
        <svg
          width={`${sizes.icon}px`}
          height={`${sizes.icon}px`}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l6.29-.98C10.04 23.47 11.48 24 13 24c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.41 0-2.73-.36-3.88-.97l-.28-.15-2.89.45.45-2.89-.15-.28C4.36 14.73 4 13.41 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"
            fill="white"
          />
          {/* Inner dot for modern look */}
          <circle cx="12" cy="12" r="2" fill="white" />
        </svg>
      </Box>

      {showText && (
        <Box>
          <Text
            fontSize={`${sizes.text}px`}
            fontWeight="700"
            background="linear-gradient(135deg, #6b91ff 0%, #4f63d6 100%)"
            backgroundClip="text"
            WebkitBackgroundClip="text"
            WebkitTextFillColor="transparent"
            letterSpacing="-0.5px"
          >
            Chattr
          </Text>
          <Text
            fontSize={`${Math.max(sizes.text - 6, 10)}px`}
            color="#94a3b8"
            fontWeight="500"
            lineHeight="1"
            letterSpacing="1px"
          >
            CHAT
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default Logo;
