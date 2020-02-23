const users = []

const addUser = ({ id, username, room }) => {
    //Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate the data
    if (!username || !room) {
        return {
            error: "Username and Room are Required"
        }
    }

    //check for existing user
    //   users.forEach(user => {
    //     if (user.room === room && user.username === username) {
    //       return {
    //         error: "Username Already Taken."
    //       };
    //     }
    //   });
    const existingUser = users.find(user => {
        return user.room === room && user.username === username
    })

    if (existingUser) {
        return {
            error: "Username Already Taken."
        }
    }

    //Store User
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = id => {
    const index = users.findIndex(user => {
        return user.id === id
    })

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = id => {
    return users.find(user => {
        return user.id === id
    })
}

const getUsersInRoom = room => {
    room = room.trim().toLowerCase()
    const usersInRoom = users.filter(user => {
        return user.room === room
    })
    return usersInRoom
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
