const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const aiChatROutes = require("./routes/aiChatRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");
const mongoose = require("mongoose");

dotenv.config();

// Initialize DB connection (don't block server startup)
connectDB().catch((err) => {
  console.error("⚠️ Failed to connect to MongoDB on startup:", err.message);
  console.log("🔄 Will retry on first request...");
});

const app = express();

const { allowedOrigins, authRequestGuard } = require("./middleware/sessionSecurity");
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));
app.use("/api/user", authRequestGuard);
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// ✅ Parse JSON payloads
app.use(express.json());

// Deployment readiness: do not report success before MongoDB is connected.
app.get("/api/health", (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ status: ready ? "ok" : "unavailable" });
});

// ✅ API Routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/aiChat", aiChatROutes);

// ✅ Static file setup for production
const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production" && process.env.SERVE_FRONTEND !== "false") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// ✅ Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// ✅ Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, process.env.HOST || "0.0.0.0", () =>
  console.log(`Server running on PORT ${PORT}...`)
);

// ✅ Socket.IO setup
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: false,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    const chat = newMessageRecieved.chat;
    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(socket.id);
  });
});
