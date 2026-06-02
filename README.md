# CV Artisan - Premium CV Builder

A modern, web-based CV generator that allows you to upload your own Word templates and fill them with professional data.

## Features
- **Glassmorphic UI**: A stunning, premium design with smooth animations.
- **Multi-step Form**: Easy-to-use interface for personal info, education, experience, and more.
- **Template Upload**: Upload any `.docx` file with tags (e.g., `{fullName}`).
- **Dual Export**: Download your CV in Word (.docx) or PDF (.pdf) format.

## Tech Stack
- **Frontend**: Vite, React, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express, Multer, Docxtemplater, Pizzip.

## How to Run

### 1. Backend Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Start the server:
   ```bash
   node index.js
   ```
   The server will run on `http://localhost:5000`.

### 2. Frontend Setup
1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open your browser at the URL provided (usually `http://localhost:5173`).

## Using Templates
Create a Word document and use the following tags:
- `{fullName}`, `{jobTitle}`, `{email}`, `{phone}`
- `{summary}`
- `{#education}` ... `{school}`, `{degree}`, `{year}` ... `{/education}`
- `{#experience}` ... `{company}`, `{position}`, `{duration}`, `{tasks}` ... `{/experience}`
- `{skills}`, `{certificates}`, `{referees}`, `{attributes}`
