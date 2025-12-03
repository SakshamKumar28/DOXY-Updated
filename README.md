# DOXY - Your Telehealth Companion

DOXY is a comprehensive telehealth platform designed to bridge the gap between patients and healthcare providers. It facilitates seamless appointment booking, real-time video consultations, and secure medical record management.

## 🚀 Features

*   **User & Doctor Authentication:** Secure login and registration flows for both patients and doctors using JWT and OTP verification.
*   **Appointment Management:** Easy booking system for patients to schedule appointments with available doctors.
*   **Real-time Communication:** Integrated Socket.io for real-time updates and notifications.
*   **Video Consultations:** (Planned/In-progress) WebRTC integration for secure video calls between doctors and patients.
*   **Responsive Design:** Modern, mobile-first UI built with React and Tailwind CSS.
*   **Interactive Feedback:** Toast notifications for seamless user feedback on actions.

## 🛠️ Tech Stack

### Frontend
*   **Framework:** React (Vite)
*   **Styling:** Tailwind CSS, Lucide React (Icons)
*   **State/Routing:** React Router DOM
*   **HTTP Client:** Axios
*   **Real-time:** Socket.io-client
*   **Notifications:** React Hot Toast

### Backend
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB (Mongoose)
*   **Authentication:** JWT, bcryptjs
*   **Real-time:** Socket.io
*   **SMS/OTP:** Twilio (integrated but requires API keys)

## 📦 Prerequisites

Before you begin, ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v14 or higher)
*   [MongoDB](https://www.mongodb.com/) (Local or Atlas connection)

## 🔧 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd DOXY-Updated
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    npm install
    ```
    *   Create a `.env` file in the `backend` directory with the following variables:
        ```env
        PORT=3000
        MONGODB_URI=your_mongodb_connection_string
        JWT_SECRET=your_jwt_secret_key
        CLIENT_URL=http://localhost:5173
        # Twilio Credentials (Optional for dev if mocked)
        TWILIO_ACCOUNT_SID=your_sid
        TWILIO_AUTH_TOKEN=your_token
        TWILIO_PHONE_NUMBER=your_number
        ```

3.  **Frontend Setup**
    ```bash
    cd ../frontend
    npm install
    ```
    *   Create a `.env` file in the `frontend` directory:
        ```env
        VITE_API_URL=http://localhost:3000/api
        ```

## 🏃‍♂️ Running the Application

1.  **Start the Backend Server**
    ```bash
    cd backend
    npm run dev
    ```
    The server will start on `http://localhost:3000`.

2.  **Start the Frontend Development Server**
    ```bash
    cd frontend
    npm run dev
    ```
    The application will be accessible at `http://localhost:5173`.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

