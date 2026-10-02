# API Design v1.1 — Twitter/X Clone

## 1. API Overview

### API Style

* **Architecture:** REST
* **Data Format:** JSON
* **Base Path:** `/api/v1`
* **Authentication:** Access Token + Refresh Token
* **Authentication Provider:** Firebase Authentication for identity verification and Google authentication
* **Database:** MongoDB

Examples:

```text
GET  /api/v1/users/me
POST /api/v1/posts
GET  /api/v1/feed
```

### Authentication Model

Protected APIs use an application-issued access token:

```http
Authorization: Bearer <access-token>
```

For Google authentication, the client initially provides a Firebase ID token:

```text
Firebase ID Token
       ↓
Backend verifies token using Firebase Admin SDK
       ↓
Find/Create MongoDB User
       ↓
Create application session
       ↓
Issue Access Token + Refresh Token
```

The access token is used for subsequent API requests.

The refresh token is stored in an `HttpOnly`, `Secure` cookie and is used to obtain new access tokens.

---

# 2. Common API Rules

## Request Headers

For JSON requests:

```http
Content-Type: application/json
```

For protected requests:

```http
Authorization: Bearer <access-token>
```

---

# 3. Standard Success Response

## Single Resource

```json
{
  "success": true,
  "data": {}
}
```

## Collection

```json
{
  "success": true,
  "data": [],
  "pagination": {}
}
```

---

# 4. Standard Error Response

All API errors should follow a predictable structure:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {}
  }
}
```

`details` is optional and can contain field-level validation information.

Example:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "content": "Content is required"
    }
  }
}
```

---

# 5. HTTP Status Codes

| Status Code | Meaning                                           |
| ----------- | ------------------------------------------------- |
| 200         | Successful request                                |
| 201         | Resource successfully created                     |
| 204         | Successful request with no response body          |
| 400         | Bad request                                       |
| 401         | Authentication required or invalid authentication |
| 403         | Authenticated but not authorized                  |
| 404         | Resource not found                                |
| 409         | Resource/state conflict                           |
| 422         | Validation failed                                 |
| 429         | Rate limit exceeded                               |
| 500         | Internal server error                             |

---

# 6. Pagination Standard

The initial pagination strategy is page-based pagination:

```text
?page=1&limit=20
```

### Rules

```text
page >= 1
1 <= limit <= 100
```

Example:

```http
GET /api/v1/feed?page=1&limit=20
```

Response:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 125,
    "totalPages": 7,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Why is the maximum limit 100?

Clients should not be able to send requests such as:

```text
?limit=1000000
```

and potentially trigger extremely expensive database queries.

The server must enforce pagination limits.

For large-scale feeds, cursor-based pagination can be introduced later.

---

# 7. Authentication APIs

## 7.1 Register

```http
POST /api/v1/auth/register
```

### Request Body

```json
{
  "email": "user@example.com",
  "username": "rajat",
  "displayName": "Rajat",
  "password": "********"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "user": {},
    "accessToken": "..."
  }
}
```

The refresh token is issued through an `HttpOnly`, `Secure` cookie.

### Important Rules

* Password must never be returned in the response.
* Password must be securely hashed before storage.
* Email and username must be validated.
* Duplicate email/username must be rejected.
* Verification may be required before certain account actions.

---

# 7.2 Login

```http
POST /api/v1/auth/login
```

### Request Body

```json
{
  "email": "user@example.com",
  "password": "********"
}
```

### Flow

```text
Credentials
    ↓
Validate User
    ↓
Verify Password
    ↓
Create Session
    ↓
Issue Access Token
    ↓
Set Refresh Token Cookie
```

The response returns the application access token and sets the refresh-token cookie.

---

# 7.3 Google Login

```http
POST /api/v1/auth/google
```

### Request Body

```json
{
  "idToken": "<firebase-id-token>"
}
```

### Flow

```text
Firebase ID Token
       ↓
Firebase Admin SDK Verification
       ↓
Find/Create User
       ↓
Create Session
       ↓
Issue Access Token
       ↓
Set Refresh Token Cookie
```

---

# 7.4 Refresh Access Token

```http
POST /api/v1/auth/refresh
```

The refresh token is automatically sent through the secure `HttpOnly` cookie.

### Flow

```text
Refresh Token
      ↓
Validate Session
      ↓
Check Expiration / Revocation
      ↓
Rotate Refresh Token
      ↓
Create New Access Token
      ↓
Set New Refresh Cookie
```

Refresh-token rotation helps reduce the impact of token theft.

---

# 7.5 Logout

```http
POST /api/v1/auth/logout
```

### Behaviour

The backend:

1. Identifies the current session.
2. Revokes the session.
3. Clears the refresh-token cookie.

---

# 7.6 Verify Email

```http
POST /api/v1/auth/verify-email
```

### Request Body

```json
{
  "token": "verification-token"
}
```

The verification token must be validated and must expire after a defined period.

---

# 7.7 Resend Verification Email

```http
POST /api/v1/auth/resend-verification
```

### Security

This endpoint must be rate-limited to prevent email abuse.

---

# 7.8 Forgot Password

```http
POST /api/v1/auth/forgot-password
```

### Request Body

```json
{
  "email": "user@example.com"
}
```

### Security Requirement

The response must not reveal whether the supplied email address exists in the system.

This prevents account enumeration.

Example:

```json
{
  "success": true,
  "data": {
    "message": "If an account exists for this email, a password reset link has been sent."
  }
}
```

---

# 7.9 Reset Password

```http
POST /api/v1/auth/reset-password
```

### Request Body

```json
{
  "token": "reset-token",
  "newPassword": "********"
}
```

### Security

After a successful password reset:

* Existing sessions should be revoked.
* The reset token must become invalid.
* The new password must be securely hashed.

---

# 7.10 Change Password

```http
PATCH /api/v1/auth/password
```

### Authentication

Protected.

### Request Body

```json
{
  "currentPassword": "********",
  "newPassword": "********"
}
```

The current password must be verified before allowing the password change.

---

# 8. User APIs

## 8.1 Get Current User

```http
GET /api/v1/users/me
```

### Authentication

Required.

### Request Body

None.

### Success

```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "username": "rajat",
    "displayName": "Rajat Pandey",
    "email": "user@example.com",
    "bio": "Full Stack Developer",
    "profileImage": null,
    "createdAt": "2026-08-01T10:00:00.000Z",
    "updatedAt": "2026-08-01T10:00:00.000Z"
  }
}
```

### Errors

```text
401 AUTHENTICATION_REQUIRED
404 USER_NOT_FOUND
500 INTERNAL_SERVER_ERROR
```

---

# 8.2 Get User Profile

```http
GET /api/v1/users/:userId
```

### Path Parameter

```text
userId → MongoDB User ID
```

### Authentication

Required.

### Validation

`userId` must be a valid MongoDB ObjectId.

### Success

```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "username": "rajat",
    "displayName": "Rajat Pandey",
    "bio": "Full Stack Developer",
    "profileImage": null,
    "followersCount": 120,
    "followingCount": 80,
    "postsCount": 45,
    "createdAt": "2026-08-01T10:00:00.000Z"
  }
}
```

### Errors

```text
400 INVALID_USER_ID
401 AUTHENTICATION_REQUIRED
404 USER_NOT_FOUND
```

---

# 8.3 Update Own Profile

```http
PATCH /api/v1/users/me
```

### Authentication

Required.

### Request Body

```json
{
  "username": "rajat",
  "displayName": "Rajat Pandey",
  "bio": "Full Stack Developer"
}
```

All fields are optional because this is a `PATCH` operation.

### Validation

#### username

* Optional
* String
* Trimmed
* 3–30 characters
* Letters, numbers and underscores
* Unique

#### displayName

* Optional
* String
* Trimmed
* 1–50 characters

#### bio

* Optional
* String
* Trimmed
* Maximum 160 characters

### Errors

```text
400 INVALID_REQUEST
401 AUTHENTICATION_REQUIRED
409 USERNAME_ALREADY_EXISTS
422 VALIDATION_ERROR
```

---

# 9. Post APIs

## 9.1 Create Post

```http
POST /api/v1/posts
```

### Authentication

Required.

### Headers

```http
Authorization: Bearer <access-token>
Content-Type: application/json
```

### Request Body

```json
{
  "content": "Hello world!"
}
```

Media can be supported later:

```json
{
  "content": "Hello world!",
  "media": []
}
```

### Validation

`content`:

* Required
* String
* Trimmed
* Minimum 1 character
* Maximum 280 characters

When media support is introduced, the requirement that a post contain meaningful text and/or media should be finalized.

### Success

```json
{
  "success": true,
  "data": {
    "id": "post_id",
    "content": "Hello world!",
    "author": {
      "id": "user_id",
      "username": "rajat",
      "displayName": "Rajat Pandey",
      "profileImage": null
    },
    "createdAt": "2026-08-10T10:00:00.000Z",
    "updatedAt": "2026-08-10T10:00:00.000Z"
  }
}
```

### Errors

```text
401 AUTHENTICATION_REQUIRED
422 VALIDATION_ERROR
429 RATE_LIMIT_EXCEEDED
```

---

# 9.2 Get Single Post

```http
GET /api/v1/posts/:postId
```

### Authentication

Required.

### Validation

`postId` must be a valid MongoDB ObjectId.

### Success

```json
{
  "success": true,
  "data": {
    "id": "post_id",
    "content": "Hello world!",
    "author": {
      "id": "user_id",
      "username": "rajat",
      "displayName": "Rajat Pandey",
      "profileImage": null
    },
    "likesCount": 10,
    "commentsCount": 4,
    "likedByCurrentUser": false,
    "createdAt": "2026-08-10T10:00:00.000Z",
    "updatedAt": "2026-08-10T10:00:00.000Z"
  }
}
```

### Errors

```text
400 INVALID_POST_ID
401 AUTHENTICATION_REQUIRED
404 POST_NOT_FOUND
```

---

# 9.3 Update Own Post

```http
PATCH /api/v1/posts/:postId
```

### Request Body

```json
{
  "content": "Updated post content"
}
```

### Authorization

Only the post owner can update the post.

```text
Authenticated User ID == Post Author ID
```

### Validation

`content`:

* Required
* String
* Trimmed
* 1–280 characters

### Errors

```text
400 INVALID_POST_ID
401 AUTHENTICATION_REQUIRED
403 POST_UPDATE_FORBIDDEN
404 POST_NOT_FOUND
422 VALIDATION_ERROR
```

---

# 9.4 Delete Own Post

```http
DELETE /api/v1/posts/:postId
```

### Authorization

Only the post owner can delete the post.

### Success

```text
204 No Content
```

### Errors

```text
400 INVALID_POST_ID
401 AUTHENTICATION_REQUIRED
403 POST_DELETE_FORBIDDEN
404 POST_NOT_FOUND
```

The initial design uses hard deletion.

---

# 10. Feed API

## 10.1 Get Feed

```http
GET /api/v1/feed?page=1&limit=20
```

### Authentication

Required.

### Query Parameters

```text
page
limit
```

### Validation

```text
page → integer >= 1
limit → integer 1–100
```

### Initial Feed Logic

The initial feed contains:

```text
Current user's posts
        +
Posts from users followed by the current user
        ↓
Sort by createdAt DESC
```

### Success

```json
{
  "success": true,
  "data": [
    {
      "id": "post_id",
      "content": "Hello!",
      "author": {
        "id": "user_id",
        "username": "rajat",
        "displayName": "Rajat Pandey",
        "profileImage": null
      },
      "likesCount": 10,
      "commentsCount": 3,
      "likedByCurrentUser": false,
      "createdAt": "2026-08-10T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 125,
    "totalPages": 7,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Errors

```text
401 AUTHENTICATION_REQUIRED
422 INVALID_PAGINATION
```

---

# 11. Like APIs

## 11.1 Like Post

```http
POST /api/v1/posts/:postId/like
```

### Authentication

Required.

### Validation

* `postId` must be valid.
* Post must exist.

### Business Rules

* A user can like a post only once.
* Duplicate likes must be rejected.

### Success

```json
{
  "success": true,
  "data": {
    "liked": true,
    "postId": "post_id"
  }
}
```

### Errors

```text
400 INVALID_POST_ID
401 AUTHENTICATION_REQUIRED
404 POST_NOT_FOUND
409 POST_ALREADY_LIKED
```

---

# 11.2 Unlike Post

```http
DELETE /api/v1/posts/:postId/like
```

### Authentication

Required.

### Success

```text
204 No Content
```

### Errors

```text
400 INVALID_POST_ID
401 AUTHENTICATION_REQUIRED
404 POST_NOT_FOUND
404 LIKE_NOT_FOUND
```

---

# 12. Comment APIs

## 12.1 Create Comment

```http
POST /api/v1/posts/:postId/comments
```

### Request Body

```json
{
  "content": "Nice post!"
}
```

### Validation

`content`:

* Required
* String
* Trimmed
* 1–280 characters

### Success

```json
{
  "success": true,
  "data": {
    "id": "comment_id",
    "content": "Nice post!",
    "author": {
      "id": "user_id",
      "username": "rajat",
      "displayName": "Rajat Pandey",
      "profileImage": null
    },
    "postId": "post_id",
    "createdAt": "2026-08-10T10:00:00.000Z"
  }
}
```

### Errors

```text
400 INVALID_POST_ID
401 AUTHENTICATION_REQUIRED
404 POST_NOT_FOUND
422 VALIDATION_ERROR
429 RATE_LIMIT_EXCEEDED
```

---

# 12.2 Get Comments

```http
GET /api/v1/posts/:postId/comments?page=1&limit=20
```

### Authentication

Required.

### Pagination

```text
page >= 1
limit 1–100
```

### Success

```json
{
  "success": true,
  "data": [
    {
      "id": "comment_id",
      "content": "Nice post!",
      "author": {
        "id": "user_id",
        "username": "rajat",
        "displayName": "Rajat Pandey"
      },
      "createdAt": "2026-08-10T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Errors

```text
400 INVALID_POST_ID
401 AUTHENTICATION_REQUIRED
404 POST_NOT_FOUND
422 INVALID_PAGINATION
```

---

# 13. Follow APIs

## 13.1 Follow User

```http
POST /api/v1/users/:userId/follow
```

### Authentication

Required.

### Validation

Target user:

* Must be a valid MongoDB ObjectId.
* Must exist.

### Business Rules

* A user cannot follow themselves.
* A user cannot follow the same user more than once.

### Success

```json
{
  "success": true,
  "data": {
    "following": true,
    "userId": "target_user_id"
  }
}
```

### Errors

```text
400 INVALID_USER_ID
401 AUTHENTICATION_REQUIRED
404 USER_NOT_FOUND
409 CANNOT_FOLLOW_SELF
409 ALREADY_FOLLOWING
```

---

# 13.2 Unfollow User

```http
DELETE /api/v1/users/:userId/follow
```

### Authentication

Required.

### Success

```text
204 No Content
```

### Errors

```text
400 INVALID_USER_ID
401 AUTHENTICATION_REQUIRED
404 USER_NOT_FOUND
404 FOLLOW_NOT_FOUND
```

---

# 13.3 Get Followers

```http
GET /api/v1/users/:userId/followers?page=1&limit=20
```

### Success

```json
{
  "success": true,
  "data": [
    {
      "id": "user_id",
      "username": "john",
      "displayName": "John",
      "profileImage": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 120,
    "totalPages": 6,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Errors

```text
400 INVALID_USER_ID
401 AUTHENTICATION_REQUIRED
404 USER_NOT_FOUND
422 INVALID_PAGINATION
```

---

# 13.4 Get Following

```http
GET /api/v1/users/:userId/following?page=1&limit=20
```

The same pagination, validation, authentication, and response conventions used by the Followers API apply here.

---

# 14. Complete API Reference

| Method | Endpoint                    |   Auth | Pagination |
| ------ | --------------------------- | -----: | ---------: |
| POST   | `/auth/register`            |      ❌ |          ❌ |
| POST   | `/auth/login`               |      ❌ |          ❌ |
| POST   | `/auth/google`              |      ❌ |          ❌ |
| POST   | `/auth/refresh`             | Cookie |          ❌ |
| POST   | `/auth/logout`              |      ✅ |          ❌ |
| POST   | `/auth/verify-email`        |      ❌ |          ❌ |
| POST   | `/auth/resend-verification` |      ✅ |          ❌ |
| POST   | `/auth/forgot-password`     |      ❌ |          ❌ |
| POST   | `/auth/reset-password`      |      ❌ |          ❌ |
| PATCH  | `/auth/password`            |      ✅ |          ❌ |
| GET    | `/users/me`                 |      ✅ |          ❌ |
| GET    | `/users/:userId`            |      ✅ |          ❌ |
| PATCH  | `/users/me`                 |      ✅ |          ❌ |
| POST   | `/users/:userId/follow`     |      ✅ |          ❌ |
| DELETE | `/users/:userId/follow`     |      ✅ |          ❌ |
| GET    | `/users/:userId/followers`  |      ✅ |          ✅ |
| GET    | `/users/:userId/following`  |      ✅ |          ✅ |
| POST   | `/posts`                    |      ✅ |          ❌ |
| GET    | `/posts/:postId`            |      ✅ |          ❌ |
| PATCH  | `/posts/:postId`            |      ✅ |          ❌ |
| DELETE | `/posts/:postId`            |      ✅ |          ❌ |
| POST   | `/posts/:postId/like`       |      ✅ |          ❌ |
| DELETE | `/posts/:postId/like`       |      ✅ |          ❌ |
| POST   | `/posts/:postId/comments`   |      ✅ |          ❌ |
| GET    | `/posts/:postId/comments`   |      ✅ |          ✅ |
| GET    | `/feed`                     |      ✅ |          ✅ |

---

# 15. Business Rules

The API design must enforce the following business rules:

**BR-01:** Protected APIs require authentication.

**BR-02:** Firebase ID tokens must be verified server-side when Firebase authentication is used.

**BR-03:** Firebase UID must map to the corresponding MongoDB User.

**BR-04:** A user cannot follow themselves.

**BR-05:** Duplicate follows are forbidden.

**BR-06:** Duplicate likes are forbidden.

**BR-07:** Users can update only their own posts.

**BR-08:** Users can delete only their own posts.

**BR-09:** Every post must reference an existing user.

**BR-10:** Every comment must reference an existing post and user.

**BR-11:** Every like must reference an existing post and user.

**BR-12:** Every follow must reference existing users.

**BR-13:** Every client-provided input must be validated on the backend.

**BR-14:** Frontend validation does not replace backend validation.

**BR-15:** Passwords must never be stored in plaintext.

**BR-16:** Pagination limits must be enforced server-side.

**BR-17:** Password recovery responses must not expose whether an account exists.

**BR-18:** Refresh sessions must be revocable.

---

# 16. Security Requirements

The conceptual request pipeline is:

```text
Request
   ↓
Rate Limiter
   ↓
CORS
   ↓
Helmet / Security Headers
   ↓
Authentication Middleware
   ↓
Input Validation
   ↓
Authorization
   ↓
Business Rules
   ↓
Controller
   ↓
Service
   ↓
MongoDB
```

### Key Security Concepts

**Rate Limiting**

Controls how many requests a user or IP can make within a defined time window.

**CORS**

Controls which frontend origins are permitted to access the API.

**Helmet / Security Headers**

Configures commonly recommended HTTP security headers for the Express application.

**Authentication**

Determines who the requester is.

**Authorization**

Determines whether the authenticated user has permission to perform the requested action.

**Validation**

Ensures that incoming data matches the expected format and constraints.

**Ownership Checks**

Ensure that the requested resource actually belongs to the authenticated user when ownership is required.

---

# 17. Authentication Security

The authentication system should implement:

```text
Password Hashing
        ↓
Access Token
        +
Refresh Token
        ↓
Refresh Token Rotation
        ↓
Session Revocation
```

Additional protections:

* Password hashing using a secure password-hashing algorithm.
* Refresh-token rotation.
* Server-side session revocation.
* `HttpOnly` and `Secure` refresh-token cookies.
* Generic password-recovery responses.
* Login rate limiting.
* Verification-token expiration.
* Password-reset-token expiration.
* Password-reset token invalidation after use.
* Existing session revocation after successful password reset.
* Password hashes must never be returned through APIs.
* Frontend authorization must never be trusted as the only security mechanism.

---

# 18. Error Code Catalog

The API uses consistent error codes rather than arbitrary error messages.

### Authentication

```text
AUTHENTICATION_REQUIRED
INVALID_TOKEN
```

### Users

```text
USER_NOT_FOUND
INVALID_USER_ID
USERNAME_ALREADY_EXISTS
```

### Posts

```text
POST_NOT_FOUND
INVALID_POST_ID
POST_UPDATE_FORBIDDEN
POST_DELETE_FORBIDDEN
```

### Validation

```text
VALIDATION_ERROR
INVALID_REQUEST
INVALID_PAGINATION
```

### Likes

```text
POST_ALREADY_LIKED
LIKE_NOT_FOUND
```

### Follows

```text
ALREADY_FOLLOWING
CANNOT_FOLLOW_SELF
FOLLOW_NOT_FOUND
```

### Security / Infrastructure

```text
RATE_LIMIT_EXCEEDED
INTERNAL_SERVER_ERROR
```

---

# 19. API Request Lifecycle

A typical protected API request follows this lifecycle:

```text
Client
  ↓
HTTP Request
  ↓
Rate Limiting
  ↓
CORS / Security Headers
  ↓
Authentication
  ↓
Input Validation
  ↓
Authorization / Ownership Check
  ↓
Controller
  ↓
Service Layer
  ↓
Repository / Database Access
  ↓
MongoDB
  ↓
Service Result
  ↓
Controller
  ↓
Standardized Response
  ↓
Client
```

This separation keeps HTTP handling, business logic, and database access independent and maintainable.

---

# 20. API Versioning

All APIs are currently exposed under:

```text
/api/v1
```

Versioning allows future API changes to be introduced without unexpectedly breaking existing clients.

For example:

```text
/api/v1/posts
/api/v2/posts
```

A new major API version should only be introduced when there are breaking changes that cannot be handled compatibly within the existing version.

---

# 21. Future Scalability Considerations

The initial API uses page-based pagination for simplicity.

As the application grows, the following improvements can be introduced based on actual traffic and query patterns:

* Cursor-based pagination for large feeds.
* Caching for frequently accessed resources.
* Redis for distributed caching and rate limiting.
* Background jobs for email and notification processing.
* Search infrastructure for user/post discovery.
* Media processing and CDN delivery.
* Database query optimization.
* Read replicas where appropriate.
* Horizontal application scaling.
* Observability, metrics, structured logging, and distributed tracing.

These are intentionally not part of the initial MVP implementation unless required by the product scope.

---

# 22. Final API Structure

```text
/api/v1
│
├── /auth
│   ├── POST   /register
│   ├── POST   /login
│   ├── POST   /google
│   ├── POST   /refresh
│   ├── POST   /logout
│   ├── POST   /verify-email
│   ├── POST   /resend-verification
│   ├── POST   /forgot-password
│   ├── POST   /reset-password
│   └── PATCH  /password
│
├── /users
│   ├── GET    /me
│   ├── PATCH  /me
│   ├── GET    /:userId
│   ├── GET    /:userId/followers
│   ├── GET    /:userId/following
│   ├── POST   /:userId/follow
│   └── DELETE /:userId/follow
│
├── /posts
│   ├── POST   /
│   ├── GET    /:postId
│   ├── PATCH  /:postId
│   ├── DELETE /:postId
│   │
│   └── /:postId
│       ├── POST   /like
│       ├── DELETE /like
│       │
│       └── /comments
│           ├── POST /
│           └── GET  /
│
└── /feed
    └── GET /
```

---

# 23. API Design Status

## API Design v1.1 — Finalized ✅

The API design now covers:

* REST conventions
* API versioning
* Authentication
* Authorization
* User management
* Posts
* Feed
* Likes
* Comments
* Follows
* Email verification
* Password recovery
* Password reset
* Session management
* Access/refresh token flow
* Pagination
* Validation
* Error handling
* Business rules
* Security requirements
* Rate limiting
* Ownership checks
* Future scalability considerations

Overall application planning flow:

```text
SRS
 ↓
Requirements
 ↓
Architecture
 ↓
Database Design
 ↓
API Design
 ↓
Implementation
 ↓
Testing
 ↓
Deployment
 ↓
Monitoring & Iteration
```
