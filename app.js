import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
import { connectDB } from "./connection.js";
import { Document } from "./model.js";

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));
const findOrCreateDocument = async (id) => {
  if (!id) return;
  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({ _id: id, data: "" });
};

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "https://frontend-collaborative-text-editor.vercel.app",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("get-document", async (id) => {
    const document = await findOrCreateDocument(id);
    socket.join(id);
    socket.emit("load-document", document.data);
    socket.on("send-changes", (data) => {
      socket.broadcast.to(id).emit("receive-changes", data);
    });
    socket.on("save-changes", async (data) => {
        // console.log(data);
      await Document.findByIdAndUpdate(id, { data: data });
    });
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

httpServer.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
