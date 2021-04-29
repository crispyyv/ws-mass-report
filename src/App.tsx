import { ChakraProvider, Container } from "@chakra-ui/react";
import { useRef } from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";

const client = new W3CWebSocket("ws://127.0.0.1:8000");

const useComponentWillMount = (func: Function) => {
  const willMount = useRef(true);

  if (willMount.current) func();

  willMount.current = false;
};

function App() {
  useComponentWillMount(() => {
    client.onopen = () => {
      console.log("WebSocket Client Connected");
    };
    client.onmessage = (message) => {
      console.log(message);
    };
  });

  return (
    <ChakraProvider>
      <Container maxW="container.2xl"></Container>
    </ChakraProvider>
  );
}

export default App;
