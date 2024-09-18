import { useContext } from "react";
import { Button, Input, FormLabel, Heading, Grid, Box, Container, FormControl, Select } from "@chakra-ui/react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { BiClipboard, BiPhoneCall, BiPhoneOff } from "react-icons/bi";
import { SocketContext } from "../context/SocketContext";

const Options = () => {
  const {
    me,
    callAccepted,
    name,
    setName,
    callEnded,
    leaveCall,
    callUser,
    joinRoom,
    roomID,
    setRoomID,
    audioDevices,
    selectedDevice,
    setSelectedDevice,
    toggleFilter,
    isFilterOn,
  } = useContext(SocketContext);

  return (
    <Container maxW="1200px" m="35px 0" p="0">
      <Box p="10px" border="2px" borderColor="black" borderStyle="solid">
        <FormControl display="flex" flexDirection="column">
          {/* Adjusted grid layout */}
          <Grid templateColumns="repeat(3, 1fr)" gap={4} mt="12">
            <Box gridColumn="span 2">
              <Heading as="h6"> Account Info </Heading>
              <FormLabel>Username</FormLabel>
              <Input type="text" value={name} onChange={(e) => setName(e.target.value)} width="100%" />
            </Box>

            <Box display="flex" justifyContent="center" alignItems="flex-end">
              <CopyToClipboard text={me}>
                <Button leftIcon={<BiClipboard />} colorScheme="teal" mt="20" size="sm">
                  Copy ID
                </Button>
              </CopyToClipboard>
            </Box>

            <Box gridColumn="span 2">
              <FormLabel mt="5">Room ID</FormLabel>
              <Input type="text" value={roomID} onChange={(e) => setRoomID(e.target.value)} width="100%" />
            </Box>

            <Box display="flex" justifyContent="center" alignItems="flex-end">
              <Button onClick={() => joinRoom(roomID)} mt="10" colorScheme="teal">
                Join Room
              </Button>
            </Box>

            <Box gridColumn="span 2">
              <FormLabel mt="5">Select Audio Input Device</FormLabel>
              <Select placeholder="Select audio input" value={selectedDevice || ""} onChange={(e) => setSelectedDevice(e.target.value)}>
                {audioDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Microphone ${device.deviceId}`}
                  </option>
                ))}
              </Select>
            </Box>

            <Box display="flex" justifyContent="center" alignItems="flex-end">
              <Button onClick={toggleFilter} mt="10" colorScheme={isFilterOn ? "red" : "green"}>
                {isFilterOn ? "Disable Filter" : "Enable Filter"}
              </Button>
            </Box>
          </Grid>

          <Box mt="10">
            <Heading as="h6"> Call Options </Heading>
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              {callAccepted && !callEnded ? (
                <Button leftIcon={<BiPhoneOff />} onClick={leaveCall} mt="20" colorScheme="teal" width="full">
                  Hang up
                </Button>
              ) : (
                <Button leftIcon={<BiPhoneCall />} onClick={callUser} mt="20" colorScheme="teal" width="full">
                  Call
                </Button>
              )}
            </Grid>
          </Box>
        </FormControl>
      </Box>
    </Container>
  );
};

export default Options;
