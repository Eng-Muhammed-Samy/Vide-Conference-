const socket = io("/");
const videoGrid = document.getElementById('video-grid')


const myPeer = new Peer(undefined, {
    host: "/",
    port: "5051"
})

const myVideo = document.createElement('video')
myVideo.muted = true;

const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoSream(myVideo, stream)

    myPeer.on('call', call => {
        call.answer(stream);
        let video = document.createElement(video);
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