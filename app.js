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
  if (document) {
    document.users++;
    return await document.save();
  };
  return await Document.create({ _id: id, data: "", users: 1 });
};

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ["https://frontend-collaborative-text-editor.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  const doc_id = socket.handshake.query.id;
  socket.on("get-document", async (id) => {
    const document = await findOrCreateDocument(id);
    socket.join(id);
    // socket.emit("total-user", document.users);
    socket.broadcast.to(id).emit("total-user", document.users);
    socket.emit("load-document", {data: document.data, users: document.users});
    socket.on("send-changes", (data) => {
      socket.broadcast.to(id).emit("receive-changes", data);
    });
    socket.on("save-changes", async (data) => {
        // console.log(data);
      await Document.findByIdAndUpdate(id, { data: data });
    });
  });
  socket.on("disconnect", async () => {
    const id = doc_id;
    const doc = await Document.findById(id);
    doc.users--;
    await doc.save();
    socket.broadcast.to(id).emit("total-user", doc.users);
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

httpServer.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
