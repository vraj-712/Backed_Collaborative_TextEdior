import express from "express";

import { createServer } from "http";
import { Server } from "socket.io";

const PORT = process.env.PORT || 3000;  // Port Number for running soket.io

const app = express();
const httpServer = createServer(app);  // Creating http server

// Socket.io connection
const io = new Server(httpServer, {
  cors: {
    origin: [
      "https://frontend-collaborative-text-editor.vercel.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST"],
  },
});

export {
    app, 
    httpServer,
    io,
    PORT
}