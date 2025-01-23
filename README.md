# Status App

This is a **Next.js** project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app). The Status App is a web application designed to monitor the status of various services in real-time, allowing users to report incidents and receive notifications about service changes.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

The Status App provides a user-friendly interface for monitoring the operational status of services. Users can view the current status, report incidents, and receive real-time updates through WebSocket connections. The application is built with a focus on performance and scalability, utilizing MongoDB for data storage and Socket.IO for real-time communication.

## Features

- **Real-Time Monitoring**: View the current status of services and receive updates in real-time.
- **Incident Reporting**: Users can report incidents affecting services, providing details about the issue.
- **Email Notifications**: Automatic email notifications are sent when the status of a service changes.
- **Uptime History**: Track the uptime history of services over time.
- **User Authentication**: Secure user authentication using NextAuth.js.
- **Responsive Design**: The application is designed to work seamlessly on both desktop and mobile devices.

## Technologies Used

- **Next.js**: A React framework for building server-rendered applications.
- **MongoDB**: A NoSQL database for storing service and incident data.
- **Mongoose**: An ODM (Object Data Modeling) library for MongoDB and Node.js.
- **Socket.IO**: A library for real-time web applications, enabling real-time bidirectional communication.
- **Tailwind CSS**: A utility-first CSS framework for styling the application.
- **NextAuth.js**: A complete open-source authentication solution for Next.js applications.

## Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd status-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in a `.env` file:
   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3000/socket.io
   SMTP_HOST=<your-smtp-host>
   SMTP_PORT=<your-smtp-port>
   SMTP_USER=<your-smtp-user>
   SMTP_PASSWORD=<your-smtp-password>
   SMTP_FROM_ADDRESS=<your-from-address>
   ALERT_EMAIL_RECIPIENTS=<recipient-emails>
   ```

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## API Endpoints

### Services

- **GET /api/services**: Fetch all services.
- **POST /api/services**: Create a new service.
- **PUT /api/services/[id]**: Update a service by ID.
- **GET /api/services/[id]**: Fetch a specific service by ID.

### Incidents

- **GET /api/incidents**: Fetch all incidents.
- **POST /api/incidents**: Create a new incident.
- **GET /api/incidents/[id]**: Fetch a specific incident by ID.
- **PUT /api/incidents/[id]**: Update an incident by ID.

### Uptime History

- **GET /api/services/[id]/uptime**: Fetch uptime history for a specific service.

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js. Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.