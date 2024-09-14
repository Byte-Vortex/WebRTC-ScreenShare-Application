var connection_code;
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
var local_stream;
var screenStream;
var peer = null;
var currentPeer = null;
var screenSharing = false;
var conn = null;

window.createConnection = function() {
    notify("Initiating Connection");
    console.log("Initiating Connection");
    let connection = window.connectionCode;
    connection_code = connection;
    peer = new Peer(connection_code);
    peer.on('open', (id) => {
        notify("Establishing Connection");
        console.log("Establishing Connection");
        console.log("Connecting with Id: " + connection_code);
        document.getElementById('B').style.display ='none';     
        setTimeout(() => {
            notify("Connection Established");
            console.log("Connection Established");
            document.getElementById('check').style.color = 'green';
            }, 1100);
        hostSideSetup();
    });
    peer.on('call', (call) => {
        console.log("Receiving Call from Remote");
        call.answer(local_stream);
        call.on('stream', (stream) => {
            console.log("Call Received");
            console.log(stream);
            setRemoteStream(stream);
        });
        currentPeer = call;
    });
}

window.setScreenSharingStream = function(stream) {
    let video = document.getElementById("screenshared-video");
    video.srcObject = stream;
    video.muted = true;
    video.play().catch(error => {
        console.error("Error playing video:", error);
    });
    document.getElementById("screenshare-container").hidden = false;
    setTimeout(()=>{
        
    },2000)
    setTimeout(()=>{
        document.getElementById("stopoptions").style.display='flex';
    },2000)
}

window.setRemoteStream = function(stream) {
    let video = document.getElementById("remote-video");
    video.srcObject = stream;
    video.play().catch(error => {
        console.error("Error playing remote screen:", error);
        });
    
    setTimeout(()=>{
        document.getElementById("remote-vid-container").hidden = false;
    },2500)
}

window.notify = function(msg) {
    let notification = document.getElementById("notification");
    notification.innerHTML = msg;
    notification.classList.remove("hidden");
    notification.classList.add("visible");
    setTimeout(() => {
        notification.classList.remove("visible");
        notification.classList.add("hidden");
    }, 1000);
}

window.joinconnection = async function() {
    notify("Initiating Connection with Host");

    let connection = document.getElementById("connection-input").value;
    if (connection.trim() === "") {
        notify("Please Enter Connection Id");
        return;
    }
    
    connection_code = connection;

    try {
        const response = await axios.post(`https://nwr-server.vercel.app/api/verify-connection`, { connectionId: connection_code });
        
        if (response.data.success) {
            console.log('Connection ID is valid. Proceeding to join connection.');
            notify("Connecting with Host");
            
            peer = new Peer();
            peer.on('open', (id) => {
                console.log("Connection Id: " + id);
                setTimeout(()=>{
                    document.getElementById("A").style.display = 'none';
                })
                notify("Connected with Host");
                
                conn = peer.connect(connection_code);
                setTimeout(() => {
                    document.getElementById("tohost").style.display = 'flex';
                    document.getElementById("gethost").style.display = 'flex';
                }, 1000);
                
                // Handle data from the peer connection
                conn.on('data', (data) => {
                    if (data === 'SCREEN_SHARE_ACCEPTED') {
                        notify('Screen Request Accepted');
                    } else if (data === 'SCREEN_SHARE_DENIED') {
                        notify('Screen Request Denied');
                    } else if (data === 'SCREEN_SHARE_STOPPED') {
                        notify('Screen Share Stopped');
                        document.getElementById("remote-vid-container").hidden = true;
                    }
                });

                // Handle connection errors
                conn.on('error', (err) => {
                    console.error("Data connection error: ", err);
                    notify(`Data connection error: ${err.message}`);
                });
            });

            peer.on('call', (call) => {
                // Answer the call with no local stream if you don't need to send any media
                call.answer();

                call.on('stream', (remoteStream) => {
                    console.log("Received screen stream from host.");
                    setRemoteStream(remoteStream);
                });

                call.on('close', () => {
                    console.log("Media connection closed.");
                });

                call.on('error', (error) => {
                    console.error("Media connection error: ", error);
                });
            });

        } else {
            console.error('Connection ID is invalid:', response.data.message);
            notify("Please Enter Valid Connection Id");
        }

    } catch (error) {
        console.error('Error verifying connection ID:', error);
        notify("Please Enter Valid Connection Id");
    }
};

window.startScreenShare = function() {
    if (screenSharing) {
        stopScreenSharing();
    }
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia({ video: true , audio:true}).then((stream) => {
            setScreenSharingStream(stream);
            screenStream = stream;
            let videoTrack = screenStream.getVideoTracks()[0];
            videoTrack.onended = () => {
                stopScreenSharing();
            };
            // if (peer) {
            //     let sender = currentPeer.peerConnection.getSenders().find(function(s) {
            //         return s.track.kind == videoTrack.kind;
            //     });
            //         sender.replaceTrack(videoTrack);
            //         screenSharing = true;
            //     }

            if (peer) {
                let videoTrack = screenStream.getVideoTracks()[0];
                let audioTrack = screenStream.getAudioTracks()[0]; // Get the audio track
            
                let videoSender = currentPeer.peerConnection.getSenders().find(function(s) {
                    return s.track.kind === videoTrack.kind;
                });
                let audioSender = currentPeer.peerConnection.getSenders().find(function(s) {
                    return s.track.kind === audioTrack.kind; // Find the audio sender
                });
            
                if (videoSender) {
                    videoSender.replaceTrack(videoTrack);
                }
                if (audioSender) {
                    audioSender.replaceTrack(audioTrack); // Replace the audio track as well
                }
            
                screenSharing = true;
            }

            console.log(screenStream);
            setTimeout(() => {
                document.getElementById("stopoptions").style.display='flex';
            }, 3000);
        }).catch((error) => {
            console.error("Error accessing screen for sharing: ", error);
            });
    } else {
        console.error("getDisplayMedia is not supported in this browser.");
        notify("Screen sharing is not supported in this browser. Please use a compatible browser like Chrome, Firefox, or Edge.");
    }
}

window.stopScreenSharing = function() {
    if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        notify("Screen Sharing Stopped")
        screenStream = null;
        if (conn) {
            conn.send('SCREEN_SHARE_STOPPED');
        }
    } else {
        console.log('No Screens to Stop');
    }
}

window.getHostScreen = function () {
    notify("Requesting Host's Screen")
    console.log("Requesting Host's Screen");
    if (!conn) {
        console.error("Data connection (conn) not established.");
        return;
    }
    conn.send('REQUEST_SCREEN_SHARE');
}

window.hostSideSetup = function() {
    if (!peer) {
        console.error("Connection not Initialized");
        return;
    }
    peer.on('connection', (connection) => {
        conn = connection;
        conn.on('data', (data) => {
            if (data === 'REQUEST_SCREEN_SHARE'){
                notify("Remote is requesting your screen")
                setTimeout(()=>{
                    document.getElementById("hostoptions").style.display='flex'
                },1000)
            } 
            else if(data === 'SCREEN_SHARE_STOPPED'){
                console.log("Remote has Stopped Screen Sharing");
                document.getElementById("remote-vid-container").hidden = true;
                notify("Remote has Stopped Screen Sharing");
                // document.getElementById('check').style.display = 'none';
            }
        });
    });
}

window.screenAccessRequest = function (accepted) {
    if (accepted) {
        navigator.mediaDevices.getDisplayMedia({ video: true , audio:true}).then((stream) => {
            screenStream = stream;
            setScreenSharingStream(screenStream);
            if (conn) {
                const remotePeerId = conn.peer;
                console.log('Received connection from peer ID:', remotePeerId);
                const mediaConnection = peer.call(remotePeerId, screenStream);
                mediaConnection.on('close', () => {
                    console.log("Media connection closed.");
                });

                mediaConnection.on('error', (error) => {
                    console.error("Media connection error: ", error);
                });
                conn.send('SCREEN_SHARE_ACCEPTED');
            }
        }).catch((error) => {
            console.error("Error accessing host screen: ", error);
            notify("Error Accessing Host Screen.");
        });
    } else {
        if (conn) {
            conn.send('SCREEN_SHARE_DENIED');
            console.log("Screen share denied message sent to remote.");
        } else {
            console.error("Data connection (conn) not established.");
        }
    }
}

window.sendStreamToRemote = function (stream) {
    notify("Screen Share Initiated")
    // const createMediaStreamFake = () => {
    //     return new MediaStream([createEmptyAudioTrack(), createEmptyVideoTrack({ width: 640, height: 480 })]);
    // }

    // const createEmptyAudioTrack = () => {
    //     const ctx = new AudioContext();
    //     const oscillator = ctx.createOscillator();
    //     const dst = oscillator.connect(ctx.createMediaStreamDestination());
    //     oscillator.start();
    //     const track = dst.stream.getAudioTracks()[0];
    //     return Object.assign(track, { enabled: false });
    // }

    // const createEmptyVideoTrack = ({ width, height }) => {
    //     const canvas = Object.assign(document.createElement('canvas'), { width, height });
    //     const ctx = canvas.getContext('2d');
    //     ctx.fillStyle = "green";
    //     ctx.fillRect(0, 0, width, height);

    //     const stream = canvas.captureStream();
    //     const track = stream.getVideoTracks()[0];

    //     return Object.assign(track, { enabled: false });
    // };

    
    // startScreenShare();
    // let call = peer.call(connection_code, createMediaStreamFake())
    // call.on('stream', (stream) => {
    //     setRemoteStream(stream);
    //     currentPeer = call;

    // })
    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then((stream) => {
        let call = peer.call(connection_code, stream);
        call.on('stream', (remoteStream) => {
            setRemoteStream(remoteStream);
        });
        currentPeer = call;
    }).catch((error) => {
        console.error("Error accessing screen for sharing: ", error);
    });
}

window.shareScreenToHost = function() {
    console.log("Sharing Screen with Host");
    notify("Screen Share Initiated")
    // const createMediaStreamFake = () => {
    //     return new MediaStream([createEmptyAudioTrack(), createEmptyVideoTrack({ width: 360, height: 240 })]);
    // }

    // const createEmptyAudioTrack = () => {
    //     const ctx = new AudioContext();
    //     const oscillator = ctx.createOscillator();
    //     const dst = oscillator.connect(ctx.createMediaStreamDestination());
    //     oscillator.start();
    //     const track = dst.stream.getAudioTracks()[0];
    //     return Object.assign(track, { enabled: false });
    // }

    // const createEmptyVideoTrack = ({ width, height }) => {
    //     const canvas = Object.assign(document.createElement('canvas'), { width, height });
    //     const ctx = canvas.getContext('2d');
    //     ctx.fillStyle = "green";
    //     ctx.fillRect(0, 0, width, height);

    //     const stream = canvas.captureStream();
    //     const track = stream.getVideoTracks()[0];

    //     return Object.assign(track, { enabled: false });
    //     };

    
    // let call = peer.call(connection_code, createMediaStreamFake())
    // call.on('stream', (stream) => {
    //     setRemoteStream(stream);
    //     })

    // currentPeer = call;
    // startScreenShare();   

    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then((stream) => {
        let call = peer.call(connection_code, stream);
        call.on('stream', (remoteStream) => {
            setRemoteStream(remoteStream);
        });
        currentPeer = call;
    }).catch((error) => {
        console.error("Error accessing screen for sharing: ", error);
    });
}

