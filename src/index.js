const http = require("http")
const express = require("express")
const path = require("path")
const socketio = require("socket.io")
const { generateMessage } = require("./utils/messages")
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
} = require("./utils/users")

const port = process.env.PORT || 3000

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname, "../public")

app.use(express.static(publicDirectoryPath))

io.on("connection", socket => {
    console.log("New Web Socket Connection")

    //sending event from server
    // socket.emit("countupdated", count);
    // socket.on("increment", () => {
    //   count++;

    //   //this will emit to current connection only,to emit to all connections we will use io.emit
    //   //socket.emit("countupdated", count);
    //   io.emit("countupdated", count);
    // });

    socket.on("join", ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })
        if (error) {
            return callback(error)
        }
        socket.join(user.room)
        socket.emit("message", generateMessage(`Welcome ${username}!`))

        socket.broadcast
            .to(user.room)
            .emit(
                "message",
                generateMessage(`${user.username} has joined the room.`)
            )

        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on("sendMessage", (message, callback) => {
        const user = getUser(socket.id)
        if (!user) return callback("Error sending Message")
        io.to(user.room).emit(
            "message",
            generateMessage(user.username, message)
        )
        callback("delivered")
    })

    socket.on("sendLocation", (position, callback) => {
        const user = getUser(socket.id)
        if (!user) return callback("Error sending Location")
        position.createdAt = new Date().getTime()
        position.username = user.username
        io.to(user.room).emit("locationmessage", position)
        callback("Location Sent")
    })

    socket.on("disconnect", () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit(
                "message",
                generateMessage(`${user.username} has left the room`)
            )
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

app.use("/*", (req, res) => {
    res.send("404 not found")
})

server.listen(port, () => {
    console.log("listening on port - " + port)
})
