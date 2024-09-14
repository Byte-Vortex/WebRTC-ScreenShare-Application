# WebRTC Based Screen Sharing Application

![webrtc](https://github.com/user-attachments/assets/b7e12b06-57c3-4e9b-b0f0-cc686bf04352)


This Real-Time Screen Sharing Application is built using modern web technologies such as WebRTC, PeerJS, React.js, and Node.js. The application allows users to share their screens in real-time, enabling seamless remote collaboration, presentations, and technical support sessions.

The app provides secure user authentication, ensuring that only authorized users can initiate or join screen-sharing sessions. Each user is assigned a unique connection ID, which is used to establish peer-to-peer connections for screen sharing. The host can share their screen with a remote user, while the remote user has the option to share their screen back with the host. The application also supports real-time notifications for a smoother user experience.

##Key Features:
-**Secure User Authentication**: Users must log in to access the application, with hashed password storage for security.
-**Peer-to-Peer Connections**: Using WebRTC and PeerJS, the app enables direct, low-latency connections for screen sharing.
-**Screen Sharing**: Hosts and remote users can share screens in real-time, with full control over starting and stopping the share.
-**Password Reset Functionality**: Forgot password and reset password features are implemented using secure token generation and email notifications.
-**Admin Panel**: An admin can manage users, add new ones, and oversee the application’s functionality.
-**Responsive User Interface**: The application has a clean and intuitive UI for a smooth user experience across devices.


## Technologies Used

- **Frontend**: React.js, WebRTC, PeerJS
- **Backend**: Node.js, Express.js, Mongoose (MongoDB)
- **Authentication**: JWT (JSON Web Token), Bcrypt for password hashing
- **Deployment**: Vercel (Frontend), Cloud service for the backend

## Setup

### Prerequisites

- **Node.js**: Version 18.16.0 (64-bit executable)
- **Build Tools**: For errors related to `npm install bcrypt`, you may need to install the Visual C++ Build Tools. [Download and install build tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/).

### Installation

1. **Clone the Repository**
   ```bash
   git https://github.com/Abhi5h3k/WebRTC-ScreenShare.git
   cd WebRTC-ScreenShare
   ```

2. **Install Dependencies**
- Frontend ```npm install```
- Backend 

  ```bash
  cd backend
  npm install
  ```

3. **Frontend**
    ```npm run dev```

4. **Backend**
    ```
    cd backend  
    npm start
    ```
    
**Note**-

Must Include the .env file in backend for the database and other information for functioning like 
```
   MONGODB_URI=""
   JWT_SECRET=""
   PORT=
   EMAIL_USER=""
   EMAIL_PASS=""
```
