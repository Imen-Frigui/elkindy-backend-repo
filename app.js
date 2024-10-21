// BASE SETUP
// ==============================================
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
const { connect } = require("./config/mongoose.js");
const corsMiddleware = require("./middlewares/cors.js");
var bodyParser = require("body-parser");
const swaggerDoc = require("./docs/swaggerDoc");
const { port, env } = require("./config/vars");
const cors = require("cors");

app.use(bodyParser.json());

const { EventEmitter } = require("events");
const instrumentRouter = require("./routes/instrument.route.js");
app.use(express.json());

const userRoutes = require("./routes/userRoutes/index");
const courseRoutes = require("./routes/courseRoutes/courseRoutes");
const authRoutes = require("./routes/authRoutes");
const examRoutes = require("./routes/examRoutes");
const classRoutes = require("./routes/classRoutes");
const morgan = require("morgan");
const eventRoutes = require("./routes/eventRoutes/eventRoutes");
const ticketRoutes = require("./routes/ticketRoutes/ticketRoutes");
const reservationRoutes = require("./routes/reservationRoutes/reservationRoutes");

// ==============================================
app.use(corsMiddleware);

// SWAGGER docs
swaggerDoc(app);
app.use(morgan("dev"));
connect();

// Cors
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});
app.use(
  cors({
    origin: "http://localhost:3001",
  })
);

app.use("/api/v1/instruments", instrumentRouter);

// SOCKET CONNECTION
io.on("connection", (socket) => {
  socket.on(
    "sendNotification",
    ({ senderName, receiverName, instrument, message }) => {
      console.log("emit notif now");
      io.emit("getNotification", {
        senderName,
        instrument,
        message,
      });
    }
  );

  socket.on("disconnect", () => {
    console.log("disconnect of the socket");
  });
});

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/exam", examRoutes);
app.use("/api/class", classRoutes);
app.use(bodyParser.json());

// Increase the limit for EventEmitter instance
EventEmitter.defaultMaxListeners = 20;

// ==============================================
// START THE SERVER
// ==============================================

// Function to start the server
const startServer = () => {
  return new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
      resolve();
    });
  });
};

// Function to stop the server
const stopServer = () => {
  return new Promise((resolve) => {
    server.close(resolve);
  });
};

// Export app, server, io, and lifecycle functions
module.exports = { app, startServer, stopServer, io };

// Uncomment the following lines to run the server directly
// if (process.env.NODE_ENV !== 'test') {
//   startServer();
//   io.listen(5000);
// }
