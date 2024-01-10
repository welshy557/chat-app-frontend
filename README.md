# chat-app-frontend

This webapp is built with React and takes advantage of websockets via the Socket.io package.

Usage:
- This webapp allows you to text chat live with your friends.
- You must make an account to begin. Passwords are hashed before being stored in the database which can be seen in the backend source code.
- Upon making an account and signing in, you can add another user as a friend via the email they signed up with.
- You can also add friends to a group allowing you to chat with multiple people all in real time.
- All user events such as messages, friend requests, newly added friends and groups, etc. are all updated in real time and do not require a browser refresh to see.


Backend repo and local setup instructions can be found at: https://github.com/welshy557/chat-app-backend

Inital Setup:
- yarn install

Dev Server:
- yarn dev

Dev Server URL: 
- http://localhost:5173
