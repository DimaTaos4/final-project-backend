# 🚀 Ichgram Backend – Full-Stack Instagram Clone API

Welcome to the **backend** of **Ichgram**, a full-featured Instagram clone built from scratch. This server powers the core functionality of the app, including user management, real-time messaging, social interactions, image handling, and secure authentication.

---

## ✨ Features

- 🔐 **Authentication & Security**
  - User registration, login & JWT-based sessions
  - Email verification & password reset via email (Resend)
  - Secure password hashing with bcrypt
  - Request validation with Yup

- 🧑‍🤝‍🧑 **Social Interactions**
  - Follow/unfollow users
  - Like and comment on posts
  - Publish, edit, and delete posts
  - Real-time notifications

- 💬 **Real-Time Chat**
  - One-to-one messaging powered by Socket.io

- 🖼️ **Media Management**
  - Upload images with Multer
  - Cloud storage via Cloudinary

- 🔍 **Search**
  - Find users by username

---

## ⚙️ Tech Stack

| Layer           | Technology                        |
| --------------- | --------------------------------- |
| **Runtime**     | Node.js, Express                  |
| **Language**    | TypeScript                        |
| **Database**    | MongoDB with Mongoose ODM         |
| **Auth**        | JWT, bcrypt                       |
| **Validation**  | Yup                               |
| **File Upload** | Multer + Cloudinary               |
| **Real-time**   | Socket.io                         |
| **Email**       | Resend API + SMTP (Namecheap)     |
| **Utils**       | dotenv, uuid, lodash, streamifier |

---

# Clone the repo

git clone https://github.com/yourusername/ichgram-backend.git
cd ichgram-backend

# Install dependencies

npm install

# Create .env file

cp .env.example .env

# Fill in your environment variables

# Start in development mode

npm run dev

# Production

npm start

## 📁 Project Structure

```bash
├── src
│   ├── controllers
│   ├── routes
│   ├── models
│   ├── middleware
│   ├── services
│   ├── sockets
│   ├── utils
│   └── index.ts
├── dist
├── .env
├── package.json
├── tsconfig.json


```
