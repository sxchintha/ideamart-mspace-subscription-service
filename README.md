# Manage Dialog and Mobitel Subscription Services

## Overview

This is a Node.js Express API that provides authentication, subscription management, and device-based session management. The backend uses Firebase for authentication and SQLite for session storage.

## Features

- Firebase authentication integration
- Device-based session management system
- Subscription management with OTP verification
- Secure API endpoints with middleware protection
- Single active device per user (prevents multiple logins)
- Request/response logging with daily log files
- Centralized error handling with standardized responses
- Automatic log cleanup (logs older than 3 months are removed)
- Rate limiting protection against API abuse

## Technologies Used

- Node.js and Express
- Firebase Authentication and Admin SDK
- SQLite (via better-sqlite3)
- Express Async Handler for error management
- UUID for session ID generation

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm
- Firebase project with authentication enabled

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/sxchintha/mcq-karamu-backend.git
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file based on `.env.sample`

4. Add `firebase.json` to config folder.

5. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication Endpoints

#### Get Subscriber ID

```
GET /auth/subscriber-id
```

Retrieves the subscriber ID associated with the authenticated user.

**Headers:**

- `Authorization: Bearer <firebase-id-token>`

**Response:**

```json
{
  "apiStatus": "success",
  "subscriberId": "subscriber-id-value"
}
```

#### Register/Update Device

```
POST /auth/update-device
```

Registers or updates a device for the authenticated user. This endpoint is used for device-based session management.

**Headers:**

- `Authorization: Bearer <firebase-id-token>`

**Request Body:**

```json
{
  "deviceId": "unique-device-identifier"
}
```

**Response:**

```json
{
  "apiStatus": "success",
  "message": "Device registered successfully",
  "updatedAt": 1234567890
}
```

#### Check Device Validity

```
GET /auth/check-device
```

Checks if the current device is valid for the authenticated user.

**Headers:**

- `Authorization: Bearer <firebase-id-token>`
- `x-device-id: unique-device-identifier`

**Response (Valid Device):**

```json
{
  "apiStatus": "success",
  "message": "Device is valid",
  "isCurrentDevice": true,
  "updatedAt": 1234567890
}
```

**Response (Invalid Device):**

```json
{
  "apiStatus": "success",
  "message": "Device is not the current registered device",
  "isCurrentDevice": false,
  "updatedAt": 1234567890,
  "statusCode": "DEVICE_MISMATCH"
}
```

### Subscription Endpoints

All subscription endpoints require authentication and valid device verification.

#### Request OTP

```
POST /subscription/otp/request
```

Requests an OTP for subscription verification.

**Headers:**

- `Authorization: Bearer <firebase-id-token>`
- `x-device-id: unique-device-identifier`

**Request Body:**

```json
{
  "subscriberId": "phone-number-or-subscriber-id",
  "device": "device-name",
  "os": "operating-system"
}
```

**Response:**

```json
{
  "apiStatus": "success",
  "data": {
    "referenceNo": "reference-number-for-verification"
  }
}
```

#### Verify OTP

```
POST /subscription/otp/verify
```

Verifies the OTP and completes the subscription process.

**Headers:**

- `Authorization: Bearer <firebase-id-token>`
- `x-device-id: unique-device-identifier`

**Request Body:**

```json
{
  "subscriberId": "phone-number-or-subscriber-id",
  "referenceNo": "reference-number-from-otp-request",
  "otp": "one-time-password"
}
```

**Response:**

```json
{
  "apiStatus": "success",
  "data": {
    "statusCode": "success-code",
    "subscriberId": "masked-subscriber-id"
  }
}
```

#### Unsubscribe

```
POST /subscription/unsubscribe
```

Unsubscribes a user from the service.

**Headers:**

- `Authorization: Bearer <firebase-id-token>`
- `x-device-id: unique-device-identifier`

**Request Body:**

```json
{
  "subscriberId": "phone-number-or-subscriber-id"
}
```

**Response:**

```json
{
  "apiStatus": "success",
  "data": {
    "statusCode": "success-code"
  }
}
```

#### Get Subscription Status

```
POST /subscription/get-status
```

Gets the current subscription status for a user.

**Headers:**

- `Authorization: Bearer <firebase-id-token>`
- `x-device-id: unique-device-identifier`

**Request Body:**

```json
{
  "subscriberId": "phone-number-or-subscriber-id"
}
```

**Response:**

```json
{
  "apiStatus": "success",
  "data": {
    "statusCode": "status-code",
    "subscriptionStatus": "active/inactive"
  }
}
```

#### Get Charging Information

```
POST /subscription/get-charging-info
```

Gets charging information for a subscriber.

**Headers:**

- `Authorization: Bearer <firebase-id-token>`
- `x-device-id: unique-device-identifier`

**Request Body:**

```json
{
  "subscriberId": "phone-number-or-subscriber-id"
}
```

**Response:**

```json
{
  "apiStatus": "success",
  "data": {
    "chargingInfo": {
      // Charging details
    }
  }
}
```

## Device-Based Session Management System

The backend implements a device-based session management system to prevent multiple logins from the same account. Here's how it works:

### Features

- Single active device per user
- Automatic device registration and updating
- Tracks last update time for each device
- Device validation middleware
- API endpoints for device registration and checking

### Implementation Details

- Device information is stored in a SQLite database
- Each user can have only one active device at a time
- When a user registers a new device, it becomes their active device
- The system tracks when each device was last updated

### Using the Device ID

For all authenticated requests, include the device ID in the `x-device-id` header:

```
x-device-id: unique-device-identifier
```

### Error Responses

If a device ID is missing:

```json
{
  "apiStatus": "error",
  "message": "Device ID is required"
}
```

If a user tries to access a protected route with an invalid device:

```json
{
  "apiStatus": "error",
  "message": "This account is logged in on another device",
  "statusCode": "DEVICE_MISMATCH"
}
```

## Development

### Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm run build` - No build step required (placeholder)

### Project Structure

- `/controllers` - Request handlers for each route
- `/middleware` - Express middleware for authentication and session verification
- `/services` - Business logic and external service integrations
- `/routes` - API route definitions
- `/config` - Configuration files (Firebase, etc.)
- `/database` - SQLite database files
- `/constants` - Application constants and status codes
- `/utils` - Utility functions
- `/logs` - Application log files

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Disclaimer

This project is not officially affiliated with Dialog Ideamart or mSpace.
