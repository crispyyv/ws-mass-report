import { DownloadIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  ChakraProvider,
  Container,
  Heading,
  Icon,
  Link,
  List,
  ListItem,
  Text,
} from "@chakra-ui/react";
import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { w3cwebsocket as W3CWebSocket } from "websocket";

const client = new W3CWebSocket("ws://127.0.0.1:8000");

const availableFileTypes = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
];

const fileSize = (size: number) => {
  if (size === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(size) / Math.log(k));
  return parseFloat((size / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

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

  const [error, setError] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file: File) => {
      const reader = new FileReader();

      reader.onload = () => {
        setError(false);
        if (availableFileTypes.indexOf(file.type) !== -1) {
          setSelectedFiles((prev) => [...prev, file]);
        } else {
          setError(true);
          setTimeout(() => setError(false), 1500);
          return false;
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  const sendFiles = () => {};
  return (
    <ChakraProvider>
      <Box minH="100vh" display="flex" flexDir="column">
        <Box as="header" h={14} w="100%" mb="auto" shadow="base">
          <Container
            maxW="container.2xl"
            h="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Heading as="h1" size="lg">
              Массовый генератор отчётов
            </Heading>
          </Container>
        </Box>
        <Container maxW="container.md">
          <Box
            as="main"
            flex="1"
            display="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="center"
          >
            <Box
              {...getRootProps()}
              p={4}
              w={"100%"}
              h={48}
              border="4px dashed"
              borderColor={error ? "red.400" : "gray.100"}
              rounded="md"
              display="flex"
              flexDir="column"
              justifyContent="center"
              alignItems="center"
              cursor="pointer"
            >
              <input {...getInputProps()} />
              <Icon as={DownloadIcon} mb={4} w={12} h={12} />
              {isDragActive ? (
                <p>Отпустите файл здесь</p>
              ) : (
                <p>Нажмите зону, или поместите файл внутрь</p>
              )}
              <Text color="gray.400">
                Досутпные расширения файлов: .csv, .xlsx, .xls
              </Text>
            </Box>
            {error && (
              <Text color="red.400" mt={6}>
                Вы не можете загружать файлы такого типа
              </Text>
            )}
            <List w="full" mt={6} spacing={4}>
              {selectedFiles.map((file) => (
                <ListItem as="li" w="100%" key={file.size}>
                  {file.name} {fileSize(file.size)}
                </ListItem>
              ))}
            </List>

            {selectedFiles.length > 0 && (
              <Button size="lg" colorScheme="teal" onClick={sendFiles}>
                Отправить
              </Button>
            )}
          </Box>
        </Container>
        <Box h={10} mt="auto">
          <Container
            h="100%"
            maxW="container.2xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            Powered by
            <Link target="_blank" ml={1} color="blue.400">
              statsnet.co
            </Link>
          </Container>
        </Box>
      </Box>
    </ChakraProvider>
  );
}

export default App;
