# Authentication & Authorization Architecture — v1.1

## 1. Objective

The purpose of the authentication and authorization architecture is to securely establish:

> **Who is the user?**

and subsequently determine:

> **What is the user allowed to do?**

The system separates **Authentication** from **Authorization** and treats the Express backend as the primary security boundary for application resources.

The application supports two authentication methods:

* Email & Password
* Google Sign-In through Firebase Authentication

For Email & Password authentication, the application implements the authentication fundamentals directly, including password hashing, password verification, JWTs, access tokens, refresh tokens, authentication middleware, and protected routes.

For Google Sign-In, Firebase Authentication is used as the external identity provider. The Express backend verifies the Firebase identity token and maps the external identity to the application's MongoDB user account.

---

# 2. Authentication Methods

The system supports the following authentication methods:

```text
Authentication
├── Email + Password
└── Google Sign-In
```

### Email & Password

The application backend is responsible for:

* Password hashing
* Password verification
* User authentication
* Access token generation
* Refresh token management
* Authentication middleware
* Protected API access

Passwords are never stored in plaintext.

### Google Sign-In

Google authentication is delegated to Firebase Authentication.

The high-level flow is:

```text
Google
   ↓
Firebase Authentication
   ↓
Firebase ID Token
   ↓
Express Backend
   ↓
Firebase Admin SDK
   ↓
Verified Firebase Identity
```

Firebase handles the Google identity-provider complexity, while the application's Express backend remains responsible for application-level authentication, authorization, business rules, and resource access.

---

# 3. High-Level Authentication Architecture

```text
                         USER
                          │
             ┌────────────┴────────────┐
             │                         │
             ▼                         ▼
      Email + Password            Google Sign-In
             │                         │
             ▼                         ▼
      Express Backend          Firebase Authentication
             │                         │
       bcrypt hashing                  │
             │                         ▼
             │                  Firebase ID Token
             │                         │
             └────────────┬────────────┘
                          ▼
                   Express Backend
                          │
                          ▼
              Authentication Layer
                          │
                          ▼
                  User Identity
                          │
                          ▼
              Authorization Layer
                          │
                          ▼
               Controller / Service
                          │
                          ▼
                       MongoDB
```

The important architectural principle is:

> **Firebase verifies Google identity; the application's backend controls application access.**

---

# 4. Email & Password Registration

## 4.1 Registration Inputs

A registration request may contain:

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!",
  "username": "rajat",
  "displayName": "Rajat Pandey"
}
```

## 4.2 Registration Flow

```text
User
  ↓
POST /api/v1/auth/register
  ↓
Express API
  ↓
Validate Request
  ↓
Normalize Input
  ↓
Check Existing Account
  ↓
Hash Password
  ↓
Create User
  ↓
Create Session
  ↓
Generate Access Token
  ↓
Generate Refresh Token
  ↓
Set Refresh Token Cookie
  ↓
Return Authentication Result
```

### Important Security Rule

Plaintext passwords must never be stored in MongoDB.

Instead:

```text
Plain Password
      ↓
     bcrypt
      ↓
Password Hash
      ↓
MongoDB
```

Example:

```json
{
  "email": "user@example.com",
  "passwordHash": "$2b$10$..."
}
```

The original password cannot and should not be retrieved from the database.

---

# 5. Password Hashing with bcrypt

Passwords should not be stored using a simple general-purpose hash.

The system uses **bcrypt**, which is specifically designed for password hashing and incorporates a salt into the hashing process.

Conceptually:

```text
"mypassword"
      ↓
    bcrypt
      ↓
"$2b$10$..."
```

Two users with the same password can have different password hashes because bcrypt uses unique salts.

### Password Verification

During login:

```text
Login Password
      ↓
bcrypt.compare()
      ↓
Stored Password Hash
      ↓
Match?
```

The backend does not decrypt the password.

Instead, it verifies whether the supplied password matches the stored password hash.

---

# 6. Email & Password Login

## 6.1 Login Request

```http
POST /api/v1/auth/login
```

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!"
}
```

## 6.2 Login Flow

```text
User
 ↓
Email + Password
 ↓
POST /api/v1/auth/login
 ↓
Validate Input
 ↓
Find User
 ↓
Compare Password with bcrypt
 ↓
Valid?
 ├── NO → 401 Unauthorized
 │
 └── YES
       ↓
Create / Update Session
       ↓
Generate Access Token
       ↓
Generate Refresh Token
       ↓
Set Refresh Cookie
       ↓
Return Authentication Result
```

### Generic Authentication Error

The API should not reveal whether an email address exists.

Instead of:

```text
Email exists but password is incorrect.
```

the API should return a generic response such as:

```text
Invalid email or password.
```

This reduces the possibility of user-enumeration attacks.

---

# 7. JWT Authentication Architecture

The application uses JWT-based authentication for application-level authentication.

```text
Successful Login
      ↓
Server Generates Access Token
      ↓
Client Uses Access Token
      ↓
Protected API Request
      ↓
Backend Verifies JWT
      ↓
User Identity Established
```

JWT claims should contain only the information required for authentication and authorization.

Example:

```json
{
  "sub": "user_id",
  "type": "access",
  "iat": 1750000000,
  "exp": 1750000900
}
```

Where:

* `sub` — application user identifier
* `type` — token type
* `iat` — issued-at timestamp
* `exp` — expiration timestamp

Sensitive information such as passwords or secrets must never be placed inside the JWT payload.

---

# 8. Access Token

The access token is intentionally short-lived.

A conceptual configuration is:

```text
Access Token Lifetime: ~15 minutes
```

The exact value should remain configurable through environment-specific configuration.

Protected requests use:

```http
Authorization: Bearer <access-token>
```

The backend performs:

```text
Receive Request
      ↓
Extract Bearer Token
      ↓
Verify JWT Signature
      ↓
Validate Expiration
      ↓
Validate Token Type
      ↓
Extract User ID
      ↓
Attach Authenticated User Context
```

Example application context:

```text
req.user
   ├── id
   └── role
```

Only trusted server-side authentication results should populate this context.

---

# 9. Refresh Token

Because access tokens are short-lived, users should not be required to log in repeatedly.

The application therefore uses:

```text
Access Token
+
Refresh Token
```

When the access token expires:

```text
Access Token Expired
        ↓
POST /api/v1/auth/refresh
        ↓
Refresh Token Validation
        ↓
Session Validation
        ↓
Issue New Access Token
        ↓
Rotate Refresh Token
```

A conceptual refresh-token lifetime may be:

```text
7 days
```

The actual lifetime should be configurable.

### Refresh Token Rotation

Refresh tokens should be rotated when they are successfully used.

```text
Refresh Token A
      ↓
Refresh Endpoint
      ↓
Validate Session
      ↓
Issue Refresh Token B
      ↓
Invalidate Token A
```

This reduces the security impact of refresh-token reuse.

The database should store a **hash of the refresh token**, rather than the raw refresh token.

---

# 10. Token Storage

Authentication tokens should not be casually stored in `localStorage`.

The preferred architecture is:

```text
Access Token
→ Short-lived
→ Used for API authorization

Refresh Token
→ HttpOnly Cookie
→ Secure Cookie
→ SameSite policy
→ Server-controlled lifecycle
```

### HttpOnly

An `HttpOnly` cookie cannot be directly accessed by normal client-side JavaScript.

This reduces exposure to token theft through client-side JavaScript.

### Secure

The `Secure` attribute ensures that the cookie is transmitted only over HTTPS.

### SameSite

The `SameSite` policy should be configured according to the application's deployment architecture and cross-origin requirements.

Production cookie configuration should be environment-specific.

---

# 11. Google Authentication Architecture

Google authentication is handled through Firebase Authentication.

```text
User
 ↓
Continue with Google
 ↓
Firebase Authentication
 ↓
Google Authentication
 ↓
Firebase ID Token
 ↓
Next.js
 ↓
POST /api/v1/auth/google
 ↓
Express Backend
 ↓
Firebase Admin SDK
 ↓
Verify Firebase ID Token
 ↓
Extract Firebase UID
 ↓
Find / Create Application User
 ↓
Create Application Session
 ↓
Issue Application Access Token
 ↓
Issue Refresh Token
```

### Important Architectural Rule

The Firebase ID token is **not the application's long-term authorization mechanism**.

It is used by the Google login endpoint to establish the user's external identity.

After successful verification, the application creates its own authenticated session/token context.

Therefore:

```text
Firebase
   ↓
Google Identity Verification

Our Backend
   ↓
Application Authentication
   ↓
Authorization
   ↓
Business Rules
   ↓
Resource Access
```

---

# 12. Google Login API

Endpoint:

```http
POST /api/v1/auth/google
```

Request:

```json
{
  "idToken": "<firebase-id-token>"
}
```

Backend processing:

```text
Firebase ID Token
       ↓
Firebase Admin SDK
       ↓
verifyIdToken()
       ↓
Verified Firebase UID
       ↓
Find MongoDB User
       ↓
Create User if required
       ↓
Create Application Session
       ↓
Issue Access Token
       ↓
Issue Refresh Token
```

The backend must never trust a Firebase UID or identity supplied directly by the client without cryptographic verification of the Firebase ID token.

---

# 13. Firebase UID to Application User Mapping

Firebase provides an external identity identifier.

The application maintains its own user identity in MongoDB.

Example:

```text
Firebase
UID = abc123
```

MongoDB:

```json
{
  "_id": "mongo456",
  "firebaseUid": "abc123",
  "email": "rajat@example.com",
  "username": "rajat",
  "displayName": "Rajat Pandey"
}
```

The relationship is:

```text
Firebase UID
     ↓
MongoDB User
     ↓
Application User ID
```

This allows the application to remain independent of Firebase for application-level resources.

Posts, comments, likes, follows, permissions, and other application resources reference the application's MongoDB user identity.

---

# 14. Authentication Middleware

All protected APIs pass through authentication middleware.

Example:

```http
GET /api/v1/feed
Authorization: Bearer <access-token>
```

Pipeline:

```text
Request
   ↓
Authentication Middleware
   ↓
Extract Token
   ↓
Verify JWT
   ↓
Validate Claims
   ↓
Identify Application User
   ↓
Attach User Context
   ↓
Controller / Service
```

If the token is:

* Missing
* Invalid
* Expired
* Malformed
* Revoked where applicable

the API returns:

```http
401 Unauthorized
```

### Important Principle

A frontend variable such as:

```javascript
isLoggedIn === true
```

is never sufficient proof of authentication.

The backend must independently verify authentication credentials for every protected request.

---

# 15. Authorization Architecture

Authentication answers:

> **Who are you?**

Authorization answers:

> **What are you allowed to do?**

Example:

```text
User A
   ↓
DELETE /api/v1/posts/123
   ↓
Authenticated?
   ↓
YES
   ↓
Post Exists?
   ↓
YES
   ↓
Is User A the Owner?
   ↓
YES
   ↓
Allow Operation
```

For another user:

```text
User B
   ↓
DELETE /api/v1/posts/123
   ↓
Authenticated?
   ↓
YES
   ↓
Post Exists?
   ↓
YES
   ↓
Owner?
   ↓
NO
   ↓
403 Forbidden
```

---

# 16. Ownership-Based Authorization

The initial authorization model primarily uses **resource ownership**.

Examples:

### Edit Post

```text
post.authorId === currentUser.id
```

### Delete Post

```text
post.authorId === currentUser.id
```

### Edit Profile

```text
currentUser.id === targetUser.id
```

The backend must perform these checks server-side.

Frontend UI restrictions are useful for user experience but are not security controls.

---

# 17. Role-Based Access Control (RBAC)

The architecture is designed to support role-based authorization.

Initial roles:

```text
USER
ADMIN
```

Future roles may include:

```text
USER
MODERATOR
ADMIN
```

Example permissions:

```text
USER
 ├── Create Post
 ├── Like Post
 ├── Comment
 └── Follow Users

ADMIN / MODERATOR
 ├── Moderate Content
 ├── Manage Users
 └── Perform Administrative Actions
```

For the initial Zentro implementation, unnecessary administrative functionality should not be introduced solely for architectural complexity.

However, the data model and authorization layer should remain extensible.

---

# 18. Authentication vs Authorization

This distinction is fundamental.

```text
AUTHENTICATION
"Who are you?"
       ↓
Password + JWT
or
Firebase Identity Verification
```

```text
AUTHORIZATION
"What are you allowed to do?"
       ↓
Ownership
Roles
Permissions
Business Rules
```

Example:

```text
Rajat Logs In
      ↓
Authentication ✅
      ↓
Rajat Attempts to Delete John's Post
      ↓
Authorization Check
      ↓
Ownership = FALSE
      ↓
403 Forbidden
```

Being authenticated does not automatically grant permission to perform every operation.

---

# 19. Logout Architecture

## 19.1 Application Authentication

For email/password authentication:

```text
Client
   ↓
POST /api/v1/auth/logout
   ↓
Validate Session
   ↓
Revoke Refresh Token / Session
   ↓
Clear Refresh Token Cookie
   ↓
Authenticated Session Terminated
```

The short-lived access token may remain technically valid until expiration unless a separate access-token revocation mechanism is implemented.

For this reason, access tokens should remain short-lived.

## 19.2 Google / Firebase Session

The frontend should also sign out from the Firebase client session.

```text
Firebase Sign-Out
        +
Application Session Logout
```

Server-side protected APIs still require valid application authentication.

---

# 20. Authentication API Endpoints

| Method | Endpoint                           | Authentication | Purpose                              |
| ------ | ---------------------------------- | -------------- | ------------------------------------ |
| POST   | `/api/v1/auth/register`            | Public         | Create account                       |
| POST   | `/api/v1/auth/login`               | Public         | Authenticate with password           |
| POST   | `/api/v1/auth/google`              | Public         | Authenticate through Firebase/Google |
| POST   | `/api/v1/auth/refresh`             | Refresh Cookie | Issue new access token               |
| POST   | `/api/v1/auth/logout`              | Authenticated  | Revoke current session               |
| POST   | `/api/v1/auth/verify-email`        | Depends        | Verify email                         |
| POST   | `/api/v1/auth/resend-verification` | Depends        | Resend verification                  |
| POST   | `/api/v1/auth/forgot-password`     | Public         | Start password recovery              |
| POST   | `/api/v1/auth/reset-password`      | Recovery Token | Reset password                       |
| PATCH  | `/api/v1/auth/password`            | Authenticated  | Change password                      |
| GET    | `/api/v1/users/me`                 | Authenticated  | Retrieve current user                |

---

# 21. Account Linking

Account linking is an important real-world identity-management problem.

Consider:

```text
Existing Account
email = rajat@gmail.com
```

The same person later attempts:

```text
Continue with Google
email = rajat@gmail.com
```

The system must avoid blindly creating:

```text
User A
User B
```

for the same application identity.

The identity-resolution strategy should consider:

```text
Firebase UID
+
Verified Email
+
Authentication Provider
+
Existing Application User
```

The implementation should define explicit account-linking rules before enabling automatic linking based solely on email.

### Target Principle

```text
One Real Application Identity
          ↓
One Application User
          ↓
Multiple Supported Authentication Providers
```

This prevents accidental duplicate accounts while maintaining a clear identity model.

---

# 22. Security Middleware Pipeline

The complete API security pipeline is:

```text
                    REQUEST
                       ↓
                Rate Limiting
                       ↓
                     CORS
                       ↓
                    Helmet
                       ↓
            Authentication
                Middleware
                       ↓
                  Validation
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

Each layer has a specific responsibility.

### Rate Limiting

Protects APIs against excessive requests and abuse.

### CORS

Restricts browser-based cross-origin access to approved origins.

### Helmet

Provides commonly required HTTP security headers.

### Authentication

Establishes the identity of the requester.

### Validation

Validates request body, parameters, query parameters, and data types.

### Authorization

Determines whether the authenticated user may perform the requested operation.

### Business Rules

Enforces application-specific constraints.

### Controller

Handles HTTP-level concerns.

### Service

Contains application/business logic.

### Database

Persists application data.

---

# 23. Protected Request Example

Consider:

```http
DELETE /api/v1/posts/abc123
Authorization: Bearer <access-token>
```

The complete flow is:

```text
HTTP Request
     ↓
Rate Limiter
     ↓
CORS / Security Headers
     ↓
JWT Verification
     ↓
Authenticated User
     ↓
Validate postId
     ↓
Find Post
     ↓
Check Ownership
     ↓
Business Rules
     ↓
Delete Post
     ↓
Return Response
```

Authorization decision:

```text
Owner?
 ├── YES → Continue
 └── NO  → 403 Forbidden
```

---

# 24. Complete Email & Password Flow

## Registration

```text
              REGISTER
                  │
                  ▼
        Email + Password
                  │
                  ▼
             Express API
                  │
                  ▼
              Validation
                  │
                  ▼
          Normalize Email
                  │
                  ▼
           Check Existing User
                  │
                  ▼
           bcrypt(password)
                  │
                  ▼
             MongoDB User
                  │
                  ▼
             Create Session
                  │
                  ▼
          Access + Refresh
                  │
                  ▼
            Authenticated
```

## Login

```text
Email + Password
       ↓
Express API
       ↓
Validate Input
       ↓
Find User
       ↓
bcrypt.compare()
       ↓
Valid?
       ↓
Create Session
       ↓
Access + Refresh Token
       ↓
Authenticated
```

---

# 25. Complete Google Authentication Flow

```text
Google
   ↓
Firebase Authentication
   ↓
Firebase ID Token
   ↓
Next.js
   ↓
POST /api/v1/auth/google
   ↓
Express Backend
   ↓
Firebase Admin SDK
   ↓
Verify Firebase Token
   ↓
Firebase UID
   ↓
Find / Create MongoDB User
   ↓
Create Application Session
   ↓
Issue Application Tokens
   ↓
Application Identity
   ↓
Authorization
```

The Firebase token is therefore an **identity verification input**, while application authorization remains under backend control.

---

# 26. Complete Protected Resource Flow

Example:

```http
DELETE /api/v1/posts/abc123
Authorization: Bearer <access-token>
```

Processing:

```text
Request
  ↓
JWT Verification
  ↓
User Identified
  ↓
Request Validation
  ↓
Post Retrieved
  ↓
Ownership Check
  ↓
Business Rule Check
  ↓
Delete
  ↓
Response
```

Possible outcomes:

```text
Missing / Invalid Token
        ↓
      401

Authenticated but Not Owner
        ↓
      403

Post Does Not Exist
        ↓
      404

Valid Request + Authorized User
        ↓
      204
```

---

# 27. Password Recovery Security

Password recovery must not reveal whether an account exists.

Example:

```http
POST /api/v1/auth/forgot-password
```

Regardless of whether the email exists, the response should remain generic.

Conceptually:

```text
Request Password Reset
        ↓
Generic Response
        ↓
If Account Exists
        ↓
Generate Secure Recovery Token
        ↓
Send Recovery Email
```

Additional requirements:

* Recovery tokens must be short-lived.
* Recovery tokens should be single-use.
* Password reset should invalidate existing sessions where appropriate.
* Password reset tokens must not be stored in plaintext when persistence is required.
* Sensitive recovery information must not be logged.

---

# 28. Session Management

The application maintains server-side session records for refresh-token lifecycle management.

Conceptual session structure:

```text
Session
├── userId
├── refreshTokenHash
├── expiresAt
├── revokedAt
├── createdAt
├── lastUsedAt
├── userAgent
└── ipAddress
```

The raw refresh token should never be stored in MongoDB.

Instead:

```text
Refresh Token
      ↓
Hash
      ↓
Database
```

This allows the server to:

* Revoke sessions
* Rotate refresh tokens
* Track active sessions
* Detect token reuse
* Expire sessions
* Invalidate sessions after security-sensitive events

---

# 29. Security Requirements

The authentication system must enforce the following principles:

### Password Security

* Never store plaintext passwords.
* Use bcrypt or another appropriate password hashing mechanism.
* Never log passwords.
* Never return password hashes in API responses.

### Token Security

* Access tokens should be short-lived.
* Refresh tokens should be protected using secure cookies.
* Refresh tokens should be rotated.
* Refresh-token hashes should be stored rather than raw tokens.
* Tokens must be signed using secure server-side secrets/keys.
* Secrets must be stored in environment/configuration management, not source control.

### API Security

* Validate all incoming requests.
* Enforce server-side authorization.
* Apply rate limiting.
* Restrict CORS origins.
* Use HTTPS in production.
* Apply security headers.
* Restrict request body sizes.
* Avoid exposing stack traces in production responses.

---

# 30. Authentication Error Handling

Authentication errors should use consistent API responses.

Example:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Authentication token is invalid or expired."
  }
}
```

Authorization failure:

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You are not authorized to perform this action."
  }
}
```

The API should avoid exposing internal security details such as:

* JWT verification internals
* Database errors
* Stack traces
* Password comparison details
* Firebase verification internals

---

# 31. Authentication Status Codes

| Status | Meaning                                    | Example                  |
| ------ | ------------------------------------------ | ------------------------ |
| `200`  | Successful operation                       | Login / Refresh          |
| `201`  | Resource created                           | Registration             |
| `204`  | Successful operation without response body | Logout / Delete          |
| `400`  | Malformed request                          | Invalid request format   |
| `401`  | Authentication required/failed             | Missing or invalid token |
| `403`  | Authenticated but not authorized           | Ownership failure        |
| `404`  | Resource not found                         | User/Post not found      |
| `409`  | Resource conflict                          | Duplicate account        |
| `422`  | Validation failure                         | Invalid field value      |
| `429`  | Rate limit exceeded                        | Excessive requests       |
| `500`  | Unexpected server error                    | Internal failure         |

The distinction between `401 Unauthorized` and `403 Forbidden` should be maintained consistently:

```text
401 → Identity could not be authenticated
403 → Identity is known, but action is not permitted
```

---

# 32. Authentication Architecture Principles

The following principles govern the design:

### Principle 1 — Backend Is the Security Boundary

The frontend should never be trusted to enforce security.

### Principle 2 — Authenticate Every Protected Request

Protected resources require valid server-side authentication.

### Principle 3 — Authorization Is Server-Side

UI restrictions do not replace authorization checks.

### Principle 4 — Least Privilege

Users should receive only the permissions required for their role and operation.

### Principle 5 — Short-Lived Access Tokens

Access tokens should have limited lifetime.

### Principle 6 — Secure Refresh Sessions

Refresh tokens should be protected, rotated, revocable, and stored as hashes server-side.

### Principle 7 — External Identity ≠ Application Identity

Firebase identifies the Google user; MongoDB represents the application user.

### Principle 8 — Never Trust Client-Supplied Identity

Identity must be derived from verified authentication credentials.

---

# 33. Important Learning Objectives

This project provides practical implementation experience with:

* Authentication
* Authorization
* Password hashing
* bcrypt
* Password verification
* JWT
* Access tokens
* Refresh tokens
* Token expiration
* Refresh-token rotation
* HttpOnly cookies
* Secure cookies
* Authentication middleware
* Protected routes
* Ownership-based authorization
* RBAC
* OAuth / Google Sign-In concepts
* Firebase Authentication
* Firebase Admin SDK
* Firebase ID-token verification
* Identity mapping
* Account linking
* Session management
* Rate limiting
* Authentication error handling
* Security boundaries

---

# 34. Architecture Decision Record

## Decision

Email & Password authentication will be implemented through the application's Express backend so that authentication fundamentals and security concepts are implemented directly.

Google Sign-In will use Firebase Authentication as the external identity provider.

The Express backend will remain responsible for:

* Application authentication
* Application sessions
* Access tokens
* Refresh tokens
* Authorization
* Ownership checks
* Roles and permissions
* Business rules
* Protected resource access

## Architectural Boundary

```text
Firebase
   ↓
Google Identity
   ↓
Identity Verification
```

```text
Application Backend
   ↓
Application Authentication
   ↓
Session Management
   ↓
Authorization
   ↓
Business Rules
   ↓
Application Resources
```

Firebase therefore does **not** replace the application's authorization layer.

---

# 35. Final Authentication & Authorization Architecture

```text
                         NEXT.JS
                            │
             ┌──────────────┴──────────────┐
             │                             │
       Email/Password                    Google
             │                             │
             ▼                             ▼
       EXPRESS API                 Firebase Authentication
             │                             │
             │                       Firebase ID Token
             │                             │
             └──────────────┬──────────────┘
                            ▼
                    EXPRESS BACKEND
                            │
                  ┌─────────┴─────────┐
                  │                   │
          Authentication        Authorization
                  │                   │
          ┌───────┴───────┐     ┌────┴────┐
          │               │     │         │
         JWT          Firebase   Ownership  RBAC
          │            Verify
          │
          └──────────────┬──────────────┘
                         ▼
                    Business Rules
                         │
                         ▼
                      Services
                         │
                         ▼
                      Mongoose
                         │
                         ▼
                      MongoDB
```

---

# 36. Architecture Status

| Project Artifact                            | Status      |
| ------------------------------------------- | ----------- |
| Software Requirements Specification (SRS)   | ✅ Completed |
| System Architecture                         | ✅ Completed |
| Database Design                             | ✅ Completed |
| API Design v1.x                             | ✅ Completed |
| Authentication & Authorization Architecture | ✅ Completed |
| Session Management Design                   | ✅ Defined   |
| Security Model                              | ✅ Defined   |
| Ownership Authorization                     | ✅ Defined   |
| RBAC Extensibility                          | ✅ Defined   |
| Google/Firebase Identity Integration        | ✅ Defined   |

---

## Final Architectural Summary

Zentro follows a **hybrid authentication architecture**:

```text
Email/Password
      ↓
Express
      ↓
bcrypt
      ↓
Application Session
      ↓
JWT Access Token
+
Refresh Token
```

and:

```text
Google
   ↓
Firebase Authentication
   ↓
Firebase ID Token
   ↓
Express + Firebase Admin SDK
   ↓
MongoDB Application User
   ↓
Application Session
   ↓
JWT Access Token
+
Refresh Token
```

Both authentication paths ultimately converge on the same application security model:

```text
Authenticated User
       ↓
Authorization
       ↓
Ownership / Roles / Permissions
       ↓
Business Rules
       ↓
Protected Resource
```

This separation ensures that **identity verification, application authentication, authorization, and business logic remain clearly defined responsibilities within the Zentro architecture.**
