const socket = io("/");
const videoGrid = document.getElementById('video-grid')


const myPeer = new Peer(undefined, {
    host: "/",
    port: "5051"
})

const myVideo = document.createElement('video')
myVideo.muted = true;

const peers = {}
let myVideoStream;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
}).then(stream => {
    myVideoStream = stream;
    addVideoSream(myVideo, stream)

    myPeer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoSream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userid => {
        connectToNewUser(userid, stream);
    })
})

socket.on('user-disconnected', (userid) => {
    if (peers[userid]) peers[userid].close();
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userid, straem) {
    const call = myPeer.call(userid, straem)
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoSream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove();
    })
    peers[userid] = call;
}

function addVideoSream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video)
}

// messanger code 
let text = $('input');
$('html').keydown((e) => {
    if (e.which == 13 && text.val().length !== 0) {
        console.log(text.val());
        socket.emit('message', text.val());
        text.val('');
    }
})

socket.on('createMessage', message => {
    $('ul').append(`<li class = "message"><b>user </b>${message}</li>`)
})