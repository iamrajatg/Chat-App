const socket = io()

//receive event on client

// socket.on("countupdated", count => {
//   console.log("Count has been updated", count);
// });

// const increment = document.getElementById("increment");
// increment.addEventListener("click", () => {
//   socket.emit("increment");
// });

//Elements
const $messageForm = document.querySelector("#form")
const $sndButton = document.querySelector("#snd_btn")
const $input = document.querySelector("#msg_text")
const $messages = document.querySelector("#messages")

//Templates
const $messageTemplate = document.querySelector("#message-template").innerHTML
const $locationTemplate = document.querySelector("#location-template").innerHTML
const $sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

//Options
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

const autoscroll = () => {
    //New Message Element
    const $newMessage = $messages.lastElementChild

    //Height of New Message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible Height
    const visibleHeight = $messages.offsetHeight

    //Height of Messages Container
    const containerHeight = $messages.scrollHeight

    //How far have i scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on("message", msg => {
    console.log(msg)
    const html = Mustache.render($messageTemplate, {
        username: msg.username,
        message: msg.text,
        createdAt: moment(msg.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend", html)
    autoscroll()
})

socket.on("locationmessage", location => {
    console.log(location)
    const html = Mustache.render($locationTemplate, {
        username: location.username,
        url:
            "https://google.com/maps?q=" +
            location.latitude +
            "," +
            location.longitude,
        createdAt: moment(location.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend", html)
    autoscroll()
})

$messageForm.addEventListener("submit", e => {
    $sndButton.setAttribute("disabled", "disabled")
    e.preventDefault()
    socket.emit("sendMessage", $input.value, msg => {
        $input.value = ""
        $input.focus()
        $sndButton.removeAttribute("disabled")
        console.log("Msg Acknowledgement", msg)
    })
})

document.querySelector("#send-location").addEventListener("click", () => {
    if (!navigator.geolocation) {
        return alert("Browser does not support Geolocation")
    }

    navigator.geolocation.getCurrentPosition(position => {
        //console.log(position);
        socket.emit(
            "sendLocation",
            {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            },
            msg => {
                console.log("Location Acknowledgement", msg)
            }
        )
    })
})

socket.emit("join", { username, room }, error => {
    if (error) {
        alert(error)
        location.href = "/"
    }
})

socket.on("roomData", ({ room, users }) => {
    const html = Mustache.render($sidebarTemplate, {
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML = html
})
