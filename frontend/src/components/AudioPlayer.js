import { useContext } from "react";
import { Grid, Box, Heading } from "@chakra-ui/react";
import { SocketContext } from "../context/SocketContext";
import AudioVisualization from "./AudioVisualization";

const AudioPlayer = () => {
  const { name, callAccepted, myAudio, userAudio, callEnded, stream, call } = useContext(SocketContext);

  return (
    <Grid justifyContent="center" templateColumns="repeat(2, 1fr)" mt="12">
      {stream && (
        <Box>
          <Heading as="h5">{name || "Your Audio"}</Heading>
          <audio playsInline muted ref={myAudio} autoPlay controls />
        </Box>
      )}

      {callAccepted && !callEnded && (
        <Box>
          <Heading as="h5">{call.name || "Other User Audio"}</Heading>
          <audio playsInline ref={userAudio} autoPlay controls />
        </Box>
      )}

      <Box>
        <Heading as="h5">Audio Visualization</Heading>
        <AudioVisualization />
      </Box>
    </Grid>
  );
};

export default AudioPlayer;
