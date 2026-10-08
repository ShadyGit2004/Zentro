# Software Architecture Design — v1

**Project:** Zentro — Twitter/X-Inspired Social Media Platform
**Document Type:** Software Architecture Design (SAD)
**Architecture Style:** Client–Server, REST API, Layered Architecture
**Frontend:** Next.js, React, TypeScript
**Backend:** Node.js, Express.js, TypeScript
**Database:** MongoDB
**Authentication:** Firebase Authentication + Application-Level Session Management
**Server-State Management:** TanStack Query
**HTTP Client:** Axios
**Validation:** Zod
**Media Storage:** Cloudinary

---

## 1. Purpose

The purpose of this document is to define Zentro's software architecture, including its major components, their responsibilities, interactions, security boundaries, and data flows.

The **Software Requirements Specification (SRS)** defines what the system must do, while the **Software Architecture Design (SAD)** describes how the system is structured to satisfy those requirements.

For example, the requirement may state:

> Users must be able to create posts.

The architecture defines the expected implementation flow:

```text
Next.js UI
    ↓
TanStack Query
    ↓
Axios
    ↓
Express REST API
    ↓
Authentication Middleware
    ↓
Request Validation
    ↓
Post Controller
    ↓
Post Service
    ↓
Mongoose
    ↓
MongoDB
    ↓
API Response
    ↓
TanStack Query Cache
    ↓
UI Update
```

This document serves as the architectural reference for implementation, testing, maintenance, and future enhancements.

## 2. Architectural Goals

Zentro's architecture is designed around the following goals:

* Separation of concerns
* Maintainability and readability
* Scalability and performance
* Security by design
* Type safety
* Reusable components
* Clear API boundaries
* Testability
* Consistent error handling
* Independent frontend and backend development
* Centralized business logic
* Production-oriented engineering practices

The architecture should remain understandable as new features and requirements are introduced.

## 3. High-Level System Architecture

Zentro follows a client–server architecture in which the Next.js frontend communicates with the Express backend through HTTPS-based REST APIs.

```text
┌──────────────────────────────┐
│            User              │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│        Next.js Frontend      │
│                              │
│  UI Components               │
│  Feature Modules             │
│  TanStack Query              │
│  Axios                       │
│  Firebase Client SDK          │
└──────────────┬───────────────┘
               │
               │ HTTPS / REST / JSON
               ▼
┌──────────────────────────────┐
│        Express Backend       │
│                              │
│  Routes                      │
│  Middleware                  │
│  Controllers                 │
│  Services                    │
│  Validators                  │
│  Mongoose Models             │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│            MongoDB           │
│       Persistent Data        │
└──────────────────────────────┘
```

### Supporting Services

**Firebase Authentication**

* Provides identity authentication, including Google sign-in.
* The frontend obtains a Firebase ID token during the authentication flow.
* The backend verifies that token through the Firebase Admin SDK before establishing an application session.

**Cloudinary**

* Provides media storage, delivery, and image transformation.
* The backend controls or validates the association between uploaded media and application resources.

**Application Observability**

* Supports structured logging, request correlation, error tracking, and operational monitoring.

## 4. Major System Components

The major components of Zentro are:

1. Next.js frontend
2. TanStack Query
3. Axios HTTP client
4. Firebase Authentication
5. Express backend
6. Authentication middleware
7. Authorization layer
8. Request validation layer
9. Controllers
10. Services
11. Mongoose models
12. MongoDB
13. Cloudinary
14. Application logging and monitoring

Each component has a defined responsibility to reduce coupling and simplify maintenance.

## 5. Frontend Architecture

### 5.1 Responsibilities

The frontend is responsible for:

* Rendering the user interface
* Handling user interactions
* Managing local UI state
* Managing forms and client-side validation
* Initiating authentication flows
* Calling backend APIs
* Managing server-state caching
* Displaying loading, success, and error states
* Supporting optimistic updates where appropriate
* Providing responsive and accessible interactions

The frontend must not connect directly to MongoDB or bypass backend authorization rules.

**Preferred architecture:**

```text
Next.js Frontend
       ↓
Express REST API
       ↓
MongoDB
```

The Express backend remains the primary API and security boundary for application data.

## 6. Frontend Internal Structure

Zentro uses a feature-oriented Next.js structure.

```text
frontend/
├── app/
├── components/
├── features/
├── hooks/
├── lib/
├── providers/
├── types/
└── utils/
```

### `app/`

Responsible primarily for:

* Application routes
* Pages and layouts
* Route-level composition
* Loading states
* Error boundaries
* Route-specific UI

Example:

```text
app/
├── login/
├── register/
├── home/
├── profile/
└── post/
```

The Next.js App Router manages application routing and route-level rendering.

## 7. Reusable Component Architecture

Reusable UI components are organized separately from feature-specific business logic.

Example structure:

```text
components/
├── ui/
├── layout/
├── navbar/
├── post/
├── feed/
├── profile/
└── comments/
```

Example components include:

* `Button`
* `Modal`
* `Input`
* `PostCard`
* `CommentList`
* `LikeButton`
* `FollowButton`
* `Navbar`
* `Sidebar`

The objective is to reduce duplication and establish consistent UI behavior.

Reusable components should focus on presentation and reusable interaction patterns rather than accumulating unrelated business logic.

## 8. Feature-Based Architecture

Application functionality is grouped into feature modules.

```text
features/
├── auth/
├── users/
├── posts/
├── comments/
├── likes/
├── follows/
└── feed/
```

Example:

```text
features/posts/
├── api.ts
├── hooks.ts
├── types.ts
├── components/
└── utils/
```

Each feature can contain its API functions, query hooks, types, components, and feature-specific utilities.

This structure improves discoverability and limits unnecessary dependencies between unrelated features.

For example, a post-creation issue can primarily be investigated within the posts feature and its corresponding backend modules.

## 9. Server-State Architecture

Zentro uses TanStack Query to manage data originating from the backend.

Examples of server state include:

* Posts and feeds
* Comments
* User profiles
* Followers and following
* Likes
* Notifications

Typical data flow:

```text
React Component
       ↓
TanStack Query
       ↓
Axios
       ↓
Express REST API
       ↓
Backend Services
       ↓
MongoDB
```

TanStack Query manages concerns such as:

* Fetching and caching
* Refetching and synchronization
* Mutation lifecycle
* Loading and error states
* Query invalidation
* Cache updates
* Optimistic updates where appropriate

TanStack Query does not replace backend validation, authorization, or database consistency controls.

## 10. Server State vs. Local UI State

Zentro distinguishes between server state and local UI state.

| State Type             | Examples                                               | Primary Management                                                           |
| ---------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Server state           | Posts, feed, comments, profiles, followers             | TanStack Query                                                               |
| Local UI state         | Modal visibility, dropdown state, temporary selections | React state and hooks                                                        |
| Form state             | Input values, validation messages, submission status   | React state or an appropriate form library                                   |
| Persistent preferences | Theme or other user preferences                        | Appropriate client storage or backend persistence, depending on requirements |

The same server data should not be unnecessarily duplicated across local component state and TanStack Query caches.

## 11. API Communication

The frontend and backend communicate through HTTPS-based REST APIs using JSON.

Example request:

```http
POST /api/v1/posts
Content-Type: application/json
Authorization: Bearer <application-access-token>
```

Example response:

```json
{
  "success": true,
  "data": {
    "id": "post_123"
  }
}
```

The exact endpoint paths, request schemas, authentication requirements, status codes, and response structures are defined in the API Design document.

The API contract must remain consistent across frontend and backend implementations.

## 12. Backend Architecture

The backend follows a layered architecture.

```text
Incoming HTTP Request
         ↓
        Route
         ↓
     Middleware
         ↓
     Controller
         ↓
       Service
         ↓
   Mongoose Model
         ↓
      MongoDB
```

Each layer has a distinct responsibility.

This separation improves:

* Maintainability
* Testability
* Reusability
* Debugging
* Code organization
* Long-term extensibility

## 13. Route Layer

The route layer maps HTTP requests to the appropriate middleware and controller.

Example resource routes:

```http
GET    /api/v1/posts/:postId
POST   /api/v1/posts
PATCH  /api/v1/posts/:postId
DELETE /api/v1/posts/:postId
```

Example authentication routes:

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/google
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

Example interaction routes:

```http
POST   /api/v1/posts/:postId/like
DELETE /api/v1/posts/:postId/like

POST   /api/v1/posts/:postId/comments

POST   /api/v1/users/:userId/follow
DELETE /api/v1/users/:userId/follow
```

These routes are illustrative. The final paths and semantics must match the API Design specification.

The route layer should define request handling and middleware composition rather than implement complex business logic.

## 14. Middleware Architecture

Middleware processes requests before they reach the controller.

A typical protected-request pipeline is:

```text
Incoming Request
       ↓
Rate Limiting
       ↓
CORS / Security Headers
       ↓
Authentication
       ↓
Request Validation
       ↓
Authorization
       ↓
Controller
```

The exact ordering of middleware should be determined by the responsibility of each middleware and the requirements of the application.

### Authentication

Authentication answers:

**Who is making this request?**

The backend verifies the application's authentication credentials and establishes the authenticated user context.

For Google sign-in, the Firebase Admin SDK verifies the Firebase ID token during the authentication exchange.

### Authorization

Authorization answers:

**Is this authenticated user allowed to perform this operation?**

Example:

```text
User A requests deletion of User B's post
                    ↓
          Authentication succeeds
                    ↓
          Ownership check fails
                    ↓
              403 Forbidden
```

Authentication alone does not grant permission to access every resource.

## 15. Controller Layer

Controllers handle HTTP-level responsibilities.

Example:

```text
POST /api/v1/posts
          ↓
postController.createPost()
```

A controller is responsible for:

* Reading validated request data
* Reading authenticated user context
* Calling the appropriate service
* Selecting the appropriate HTTP status code
* Returning the standardized API response
* Passing errors to centralized error handling

Controllers should remain lightweight.

**Preferred:**

```text
Controller
    ↓
Post Service
    ↓
Persistence Layer
```

**Avoid:**

```text
Controller
    ↓
Large amounts of business logic
    ↓
Multiple database operations
    ↓
Complex authorization decisions
    ↓
Response formatting
```

## 16. Service Layer

The service layer contains application and business logic.

Example:

```text
postService.createPost()
```

A service may be responsible for:

* Applying business rules
* Checking resource relationships
* Performing business-level permission checks
* Preparing data for persistence
* Coordinating related database operations
* Calling external services when required

Example workflow:

```text
Create Post
    ↓
Validate Business Rules
    ↓
Verify Relevant User / Resource Conditions
    ↓
Prepare Post Data
    ↓
Persist Post
    ↓
Return Domain Result
```

Request-shape validation belongs in the validation layer, while business-rule validation belongs in the appropriate service or domain logic.

The service layer makes business logic easier to test independently of HTTP handling.

## 17. Validation Layer

Request validation must occur before untrusted input is used by business logic.

Validation may apply to:

* Request bodies
* Query parameters
* Route parameters
* Relevant headers

Conceptual flow:

```text
Incoming Request
       ↓
Schema Validation
       ↓
   Is Valid?
     /    \
   No      Yes
   ↓        ↓
400/422   Controller
```

Zod can provide schema-based validation and TypeScript type inference.

### Security Principle

Client-side validation improves user experience. Server-side validation is mandatory.

```text
Frontend Validation
        ↓
User Experience

Backend Validation
        ↓
Security Boundary
```

The backend must not trust request data merely because the frontend has validated it.

## 18. Database Architecture

The initial logical data model includes the following MongoDB collections:

* `users`
* `posts`
* `comments`
* `likes`
* `follows`
* `sessions`

The exact schema definitions, indexes, constraints, and relationship details belong in the Database Design document.

Conceptual relationships:

```text
User
 ├── creates ──────── Posts
 ├── writes ───────── Comments
 ├── likes ────────── Posts
 └── follows ──────── Users
```

The `sessions` collection may support application session lifecycle management and refresh-token rotation, depending on the final authentication implementation.

Sensitive session credentials must be stored and handled according to the Authentication Design document.

## 19. User Identity Architecture

Firebase identity and application identity are separate concepts.

```text
Firebase Identity
       │
       │ firebaseUid
       ▼
Application User
       │
       ▼
MongoDB User Document
```

Example Firebase identity:

```text
firebaseUid = abc123
```

Illustrative MongoDB document:

```json
{
  "_id": "mongo456",
  "firebaseUid": "abc123",
  "email": "user@example.com",
  "username": "sample_user",
  "displayName": "Sample User"
}
```

The example values are placeholders.

The MongoDB user identifier is the application's internal identity and is used for relationships involving:

* Posts
* Comments
* Likes
* Follows
* Sessions

The application must enforce uniqueness and consistency for identity mappings. Firebase UID, email, and username constraints must align with the authentication and database specifications.

## 20. Authentication Architecture

Zentro uses a hybrid authentication model in which Firebase handles Google identity verification and the backend controls application-level access.

### 20.1 Email and Password

Conceptual flow:

```text
Next.js
   ↓
Express Authentication API
   ↓
Credential Verification
   ↓
Application Session Creation
   ↓
Access Credential + Refresh Mechanism
```

Password storage and verification must use an appropriate password-hashing algorithm and secure credential-handling practices.

### 20.2 Google Authentication

Conceptual flow:

```text
Next.js
   ↓
Firebase Authentication
   ↓
Firebase ID Token
   ↓
Express Authentication API
   ↓
Firebase Admin SDK Verification
   ↓
Resolve / Create Application User
   ↓
Create Application Session
   ↓
Issue Application Access Credential
   +
Establish Refresh Mechanism
```

Firebase ID tokens are used to establish the Google-authenticated identity during the exchange.

After that exchange, protected application APIs use the application's defined authentication mechanism. They should not treat a Firebase ID token as a substitute for the application's long-lived session mechanism.

The exact access-token format, refresh strategy, expiry, storage, rotation, revocation, and logout behavior must be specified in the Authentication Design document.

## 21. Post Creation — End-to-End Flow

Post creation demonstrates how the major architectural layers interact.

```text
User
  ↓
Create Post Form
  ↓
Next.js UI
  ↓
TanStack Mutation
  ↓
Axios
  ↓
POST /api/v1/posts
  ↓
Express Route
  ↓
Authentication Middleware
  ↓
Request Validation
  ↓
Post Controller
  ↓
Post Service
  ↓
Mongoose Model
  ↓
MongoDB
  ↓
API Response
  ↓
TanStack Query Cache Update / Invalidation
  ↓
UI Update
```

This flow separates presentation, server-state management, HTTP communication, authentication, validation, business logic, and persistence.

## 22. Feed Architecture

When a user opens the home feed, the request follows this conceptual flow:

```text
User Opens Home
       ↓
Next.js Feed Page
       ↓
TanStack Query
       ↓
GET /api/v1/feed
       ↓
Axios
       ↓
Express Backend
       ↓
Authentication
       ↓
Feed Controller
       ↓
Feed Service
       ↓
MongoDB
       ↓
Feed Data
       ↓
API Response
       ↓
TanStack Query Cache
       ↓
Feed UI
```

### Initial Feed Strategy

The initial implementation uses a chronological feed:

```text
Newest Posts
     ↓
Older Posts
```

A complex recommendation algorithm is not required for the initial version.

Future enhancements may include:

* Relevance-based ranking
* Engagement signals
* Personalized recommendations
* Cursor-based feed retrieval
* Feed caching and query optimization

These improvements should be introduced when justified by product requirements and performance measurements.

## 23. Like Architecture

Conceptual flow:

```text
User Clicks Like
       ↓
TanStack Mutation
       ↓
POST /api/v1/posts/:postId/like
       ↓
Express Backend
       ↓
Authentication
       ↓
Validation
       ↓
Like Service
       ↓
MongoDB
       ↓
API Response
       ↓
Query Cache Update / Invalidation
       ↓
UI Update
```

Business rules:

* The user must be authenticated.
* The target post must exist.
* Duplicate likes must not be created.
* The database should enforce the appropriate uniqueness constraint.

For example, if the data model stores one like per user and post, a compound unique index on the user and post identifiers can prevent duplicate records.

## 24. Comment Architecture

Conceptual flow:

```text
Comment Form
     ↓
TanStack Mutation
     ↓
POST /api/v1/posts/:postId/comments
     ↓
Express Backend
     ↓
Authentication
     ↓
Validation
     ↓
Comment Controller
     ↓
Comment Service
     ↓
MongoDB
     ↓
API Response
     ↓
Comments Query Update
     ↓
UI
```

The backend must verify that the target post exists and that the request satisfies the application's comment rules before persisting the comment.

Additional rules, such as edit and delete permissions, must be defined in the relevant requirements and API specifications.

## 25. Follow Architecture

Conceptual flow:

```text
Follow Button
     ↓
TanStack Mutation
     ↓
POST /api/v1/users/:userId/follow
     ↓
Authentication
     ↓
Validation
     ↓
Authorization / Business Rules
     ↓
Follow Service
     ↓
MongoDB
     ↓
API Response
     ↓
Relevant Query Update
     ↓
UI
```

Business rules:

* The user must be authenticated.
* A user cannot follow themselves.
* The target user must exist.
* Duplicate follow relationships must be prevented.
* Database-level uniqueness should protect against concurrent duplicate requests.

## 26. Media Architecture

Cloudinary provides media storage and delivery for profile images and post media.

A backend-controlled upload flow may follow this pattern:

```text
User Selects Media
       ↓
Next.js Frontend
       ↓
Upload Authorization / Validation
       ↓
Cloudinary Upload
       ↓
Media Identifier / URL
       ↓
Backend Associates Media with Resource
       ↓
MongoDB Stores Reference and Metadata
```

The implementation may use a backend-mediated upload or a securely authorized direct-to-Cloudinary upload. The selected strategy must define how upload permissions and ownership are enforced.

MongoDB stores media references and relevant metadata rather than the binary media files themselves.

Illustrative example:

```json
{
  "profileImage": "https://res.cloudinary.com/example/image/upload/sample.jpg"
}
```

### Why External Media Storage?

An external media service provides dedicated capabilities for:

* Media storage
* Content delivery
* Image transformation
* CDN-based access
* Image optimization
* Upload management

Implementation requirements should define file-type validation, file-size limits, upload permissions, signed upload strategies where appropriate, and cleanup of unused media.

## 27. Error Handling Architecture

The backend uses a consistent error-handling model.

Common HTTP status codes include:

| Status Code | Meaning               | Example                             |
| ----------- | --------------------- | ----------------------------------- |
| `400`       | Bad Request           | Malformed request                   |
| `401`       | Unauthorized          | Missing or invalid authentication   |
| `403`       | Forbidden             | Authenticated user lacks permission |
| `404`       | Not Found             | Requested resource does not exist   |
| `409`       | Conflict              | Duplicate or conflicting operation  |
| `422`       | Unprocessable Entity  | Request fails validation rules      |
| `429`       | Too Many Requests     | Rate limit exceeded                 |
| `500`       | Internal Server Error | Unexpected server failure           |

Example scenarios:

* Deleting another user's post without permission → `403 Forbidden`
* Requesting a nonexistent post → `404 Not Found`
* Creating a duplicate relationship → `409 Conflict`
* Submitting invalid request data → `400` or `422`, according to the API contract

Production error responses must not expose:

* Stack traces
* Database internals
* Secrets or credentials
* Password information
* Raw authentication tokens
* Sensitive internal implementation details

Unexpected errors should be logged securely and returned through centralized error-handling middleware.

## 28. Standard API Response

Successful API responses use a consistent response envelope.

### Single Resource

```json
{
  "success": true,
  "data": {
    "id": "post_123"
  }
}
```

### Collection with Pagination

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "hasNextPage": true
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": {}
  }
}
```

These examples illustrate the response structure. The API Design specification defines the actual response schemas, pagination metadata, error codes, and field requirements.

## 29. Security Architecture

The primary protected-request pipeline is:

```text
Incoming API Request
         ↓
Rate Limiting
         ↓
CORS / Security Headers
         ↓
Authentication
         ↓
Request Validation
         ↓
Authorization
         ↓
Business Rules
         ↓
Service Layer
         ↓
Persistence Layer
```

### Rate Limiting

Limits excessive requests and helps mitigate abuse, brute-force attempts, and resource exhaustion.

### CORS

Restricts browser-based cross-origin access to configured origins. CORS is not a replacement for authentication or authorization.

### Security Headers

Helmet or equivalent middleware can configure appropriate HTTP security headers.

### Authentication

Verifies the credentials used to establish the requester's identity.

### Authorization

Determines whether the authenticated user may perform the requested operation.

### Validation

Ensures incoming data conforms to the expected schema and constraints.

## 30. Authentication and Authorization Boundary

Authentication and authorization are separate security responsibilities.

**Authentication:** Who are you?

**Authorization:** What are you allowed to do?

Example:

```text
User A Logs In
      ↓
Authentication Succeeds
      ↓
User A Attempts to Delete User B's Post
      ↓
Backend Checks Ownership / Permissions
      ↓
Permission Denied
      ↓
403 Forbidden
```

Being logged in does not automatically grant access to every resource.

Resource ownership, account roles, and other applicable permission rules must be enforced by the backend.

## 31. API Security Rules

The backend must follow these principles.

### Never Trust the Client

Client-side restrictions and validation can be bypassed. Security-critical checks must run on the server.

### Authenticate Protected Requests

Protected endpoints require valid application authentication.

### Authorize Resource Operations

Ownership checks and permission rules must be enforced server-side for operations involving posts, comments, profiles, and other protected resources.

### Validate All Input

Validate request bodies, route parameters, query parameters, and other relevant input before processing them.

### Enforce Database Constraints

Reinforce application-level checks with appropriate database indexes and constraints, especially for unique relationships.

### Protect Secrets

Database credentials, signing secrets, Firebase service-account credentials, and Cloudinary secrets must not be committed to source control.

### Use HTTPS

Production communication between clients and backend services must use HTTPS.

### Protect Sessions and Tokens

Token expiry, refresh-token handling, rotation, revocation, secure cookie settings where applicable, and logout behavior must follow the Authentication Design specification.

## 32. Observability Architecture

Zentro should provide basic observability to support debugging and operational monitoring.

### Structured Logging

Logs should capture useful operational fields, such as:

* Timestamp
* Request ID
* HTTP method
* Route or path
* Status code
* Request duration
* User ID, where appropriate
* Error code

Sensitive information—including passwords, raw tokens, and secrets—must never be logged.

### Request Correlation

A request ID should make it possible to correlate events across the request lifecycle:

```text
Client
  ↓
API
  ↓
Controller / Service
  ↓
Database or External Service
```

### Metrics

Future monitoring may track:

* Request volume
* Error rate
* API latency
* Database latency
* Authentication failures
* Rate-limit events
* External service failures

Monitoring capabilities should evolve with application requirements.

## 33. Database Access Architecture

Services access persistent data through Mongoose models.

```text
Controller
    ↓
Service
    ↓
Mongoose Model
    ↓
MongoDB
```

Controllers should not accumulate large amounts of database logic.

**Avoid:**

```text
Controller
 ├── Complex queries
 ├── Multiple database updates
 ├── Business rules
 ├── Authorization decisions
 └── Response formatting
```

**Prefer:**

```text
Controller
    ↓
Post Service
    ↓
Post Model
    ↓
MongoDB
```

This separation improves readability, testability, and consistency.

## 34. Pagination Architecture

List endpoints must not return unlimited records.

Pagination applies to resources such as:

* Feed posts
* Comments
* Followers
* Following
* Other potentially large collections

### Initial Pagination

A page-based API may use:

```http
GET /api/v1/posts?page=1&limit=20
```

The server must validate pagination parameters and enforce a maximum page size.

### Future Cursor-Based Pagination

For high-volume feeds, cursor-based pagination may be more appropriate.

```text
First Request
     ↓
No Cursor
     ↓
Return Feed Data + nextCursor
     ↓
Next Request with Cursor
     ↓
Return Next Batch
```

Cursor-based pagination can provide more stable traversal of changing datasets, depending on the cursor and sorting strategy.

The choice of pagination method should be defined per endpoint in the API Design document.

## 35. Frontend–Backend Contract

The frontend must not depend on undocumented backend behavior.

The API contract defines:

* Endpoint
* HTTP method
* Authentication requirements
* Request schema
* Response schema
* HTTP status codes
* Error codes
* Pagination behavior
* Authorization requirements

Conceptually:

```text
             API CONTRACT
                  │
          ┌───────┴───────┐
          ▼               ▼
      Next.js           Express
      Consumer          Provider
```

A stable API contract allows frontend and backend development to proceed independently and reduces integration errors.

## 36. Project Folder Architecture

The proposed repository structure is:

```text
zentro/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── lib/
│   ├── providers/
│   ├── types/
│   └── utils/
│
├── backend/
│   └── src/
│       ├── config/
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       ├── models/
│       ├── middleware/
│       ├── validators/
│       ├── utils/
│       ├── types/
│       └── app.ts
│
├── docs/
│   ├── SRS.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE-DESIGN.md
│   ├── API-DESIGN.md
│   └── AUTH-DESIGN.md
│
├── README.md
└── .gitignore
```

This is a proposed logical structure. The actual repository may differ, and the directory structure should be updated as the implementation evolves.

The architecture's responsibilities should remain clear even if directories or module boundaries change.

## 37. Why Separate the Frontend and Backend?

Next.js can expose API routes and support database-backed application architectures. However, Zentro intentionally uses a separate Express backend.

### Architectural Reasons

This approach provides practical experience with:

* REST API design
* Middleware composition
* Authentication and authorization
* Controllers and services
* Request validation
* MongoDB integration
* Backend security
* API testing
* Independent deployment
* Service boundaries

Alternative architecture:

```text
Next.js
   ↓
Next.js API Routes
   ↓
MongoDB
```

This can also be a valid production architecture.

For Zentro, the separate Express backend provides a clear boundary between the frontend and backend and supports the project's learning and engineering objectives.

## 38. Technology Responsibility Map

| Technology              | Responsibility                                         |
| ----------------------- | ------------------------------------------------------ |
| Next.js                 | Frontend framework, routing, and application rendering |
| React                   | UI composition and component behavior                  |
| TypeScript              | Static type safety and maintainability                 |
| Tailwind CSS            | Utility-first styling                                  |
| shadcn/ui               | Reusable UI component foundations                      |
| TanStack Query          | Server-state caching and synchronization               |
| Axios                   | HTTP communication with backend APIs                   |
| Firebase Authentication | Identity authentication, including Google sign-in      |
| Firebase Admin SDK      | Server-side Firebase token verification                |
| Express.js              | REST API server and middleware                         |
| Mongoose                | MongoDB object modeling and data access                |
| MongoDB                 | Persistent application data                            |
| Cloudinary              | Media storage and delivery                             |
| Zod                     | Schema validation and type inference                   |

The table describes intended technology responsibilities; actual usage should be verified against the repository.

## 39. Deployment Architecture

The intended production deployment architecture is:

```text
                USER
                  │
                  ▼
        ┌──────────────────┐
        │      Vercel      │
        │    Next.js App   │
        └────────┬─────────┘
                 │
                 │ HTTPS / REST
                 ▼
        ┌──────────────────┐
        │ Backend Hosting  │
        │   Express API    │
        └────────┬─────────┘
                 │
                 ▼
        ┌──────────────────┐
        │   MongoDB Atlas  │
        │    Database      │
        └──────────────────┘
```

Supporting services:

* **Firebase Authentication:** Identity authentication
* **Cloudinary:** Media storage and delivery

Environment-specific configuration should cover:

* Database connection strings
* Application signing secrets
* Firebase configuration and server credentials
* Cloudinary credentials
* Allowed CORS origins
* Frontend and backend URLs
* Cookie and session configuration

Secrets must never be committed to Git.

The deployment diagram represents the intended architecture and does not independently verify the current deployment configuration.

## 40. Scalability Considerations

The initial architecture is intentionally simple while providing extension points for future scaling.

### API Scaling

If demand increases, multiple backend instances can be deployed behind a load balancer.

```text
             Load Balancer
                   │
          ┌────────┼────────┐
          ▼        ▼        ▼
        API 1    API 2    API 3
```

The application must be designed appropriately for multi-instance operation, including shared session state where required.

### Caching

Redis or another suitable caching mechanism may be introduced for frequently accessed data when measurements justify it.

### Database Optimization

Potential improvements include:

* Appropriate indexes
* Query optimization
* Field projection
* Pagination
* Aggregation optimization
* Monitoring slow queries

### Feed Optimization

Initial strategy:

```text
Chronological Feed Query
```

Potential future strategy:

```text
Candidate Generation
        ↓
Ranking
        ↓
Personalized Feed
```

### Background Jobs

Asynchronous workloads may eventually include:

* Notifications
* Email delivery
* Media processing
* Feed fan-out
* Analytics

These workloads can be moved to background workers when justified by operational and product requirements.

## 41. Architectural Principles

### 41.1 Separation of Concerns

Each layer must have a clearly defined responsibility.

### 41.2 Single Responsibility

A component should not accumulate unrelated responsibilities.

### 41.3 Do Not Trust the Client

Frontend validation and UI restrictions are not security boundaries.

### 41.4 Authentication Is Not Authorization

A logged-in user does not automatically have permission to perform every operation.

### 41.5 Keep Controllers Focused

Controllers handle HTTP concerns; services own application and business logic.

### 41.6 Separate Server State from UI State

Server data belongs primarily in TanStack Query, while temporary UI state belongs in the frontend's local state management.

### 41.7 API-First Thinking

The API contract should be defined and understood before tightly coupling frontend behavior to backend implementation details.

### 41.8 Security by Design

Security must be considered throughout design, implementation, testing, and deployment.

### 41.9 Database Constraints Matter

Application-level checks should be reinforced by suitable database constraints and indexes.

### 41.10 Design for Evolution

Keep the initial architecture as simple as possible while providing clear extension points for future requirements.

## 42. Architecture Decision Summary

| Area           | Decision                                    | Rationale                                                               |
| -------------- | ------------------------------------------- | ----------------------------------------------------------------------- |
| Frontend       | Next.js                                     | React-based application framework                                       |
| Language       | TypeScript                                  | Type safety and maintainability                                         |
| Backend        | Express.js                                  | Clear REST API and layered backend                                      |
| Database       | MongoDB                                     | Document-oriented persistence                                           |
| ODM            | Mongoose                                    | Schema/model definitions and database interaction                       |
| Authentication | Firebase + application-level authentication | Google identity verification with backend-controlled application access |
| API Style      | REST                                        | Clear HTTP-based communication                                          |
| Server State   | TanStack Query                              | Caching and server-state synchronization                                |
| HTTP Client    | Axios                                       | Centralized API communication                                           |
| Validation     | Zod                                         | Schema validation and type inference                                    |
| Media          | Cloudinary                                  | Dedicated media storage and delivery                                    |
| Architecture   | Layered architecture                        | Separation of concerns and maintainability                              |
| Deployment     | Vercel + backend hosting + MongoDB Atlas    | Independent frontend/backend deployment                                 |

These decisions describe the intended architecture. They should be revisited when requirements, implementation constraints, or operational needs change.

## 43. Final End-to-End Architecture

```text
                         USER
                           │
                           ▼
                 ┌──────────────────┐
                 │   Next.js App    │
                 │                  │
                 │ UI Components    │
                 │ Feature Modules  │
                 │ TanStack Query   │
                 │ Axios            │
                 │ Firebase Client  │
                 └────────┬─────────┘
                          │
                          │ HTTPS / REST
                          ▼
                 ┌──────────────────┐
                 │   Express API    │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ Middleware Layer │
                 │                  │
                 │ Rate Limiting    │
                 │ Authentication   │
                 │ Validation       │
                 │ Authorization    │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │    Controllers   │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │     Services     │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ Mongoose Models  │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │     MongoDB      │
                 └──────────────────┘
```

Supporting authentication flow:

```text
Firebase Authentication
          ↓
Firebase ID Token
          ↓
Express Authentication Endpoint
          ↓
Firebase Admin SDK Verification
          ↓
Application User Resolution
          ↓
Application Session
          ↓
Application Access Credential
+ Refresh Mechanism
```

Supporting media flow:

```text
Frontend Upload Flow
        ↓
Upload Authorization
        ↓
Cloudinary
        ↓
Media Reference
        ↓
Backend Resource Association
        ↓
MongoDB
```

## 44. Complete Request Lifecycle

A typical protected API request follows this lifecycle:

```text
User Interaction
       ↓
React / Next.js
       ↓
TanStack Query
       ↓
Axios
       ↓
HTTPS Request
       ↓
Rate Limiting
       ↓
CORS / Security Headers
       ↓
Authentication
       ↓
Request Validation
       ↓
Authorization
       ↓
Controller
       ↓
Service
       ↓
Mongoose
       ↓
MongoDB
       ↓
Service Result
       ↓
Controller Response
       ↓
Axios
       ↓
TanStack Query Cache
       ↓
React UI Update
```

This lifecycle represents the primary request-processing model for Zentro. Actual middleware ordering may vary according to endpoint requirements and implementation details.

## 45. Feature Development Lifecycle

Every major feature should follow a consistent engineering process.

```text
Requirement
    ↓
Use Case
    ↓
Architecture Impact
    ↓
Database Design
    ↓
API Contract
    ↓
Backend Implementation
    ↓
Validation
    ↓
Authorization
    ↓
Testing
    ↓
Frontend Integration
    ↓
TanStack Query Integration
    ↓
UI / UX
    ↓
Error Handling
    ↓
Security Review
    ↓
Deployment
    ↓
Monitoring
    ↓
Documentation
```

The objective is to prevent features from being developed as disconnected pieces of code.

Each feature should be traceable to a requirement and verified through appropriate testing.

## 46. Project Engineering Sequence

The recommended implementation sequence is:

1. Software Requirements Specification (SRS)
2. System Architecture Design
3. Database Design
4. API Design
5. Authentication and Authorization Design
6. Project setup and configuration
7. Backend foundation
8. Database connection and models
9. Authentication and session management
10. User and profile functionality
11. Post APIs
12. TanStack Query fundamentals
13. Post creation UI
14. Feed implementation
15. Likes
16. Comments
17. Follow system
18. Profile functionality
19. Media upload
20. Pagination
21. Automated testing
22. Security review
23. Performance review
24. Deployment
25. Monitoring
26. Documentation updates

This sequence is a recommended plan, not a statement that every step has already been implemented.

Dependencies between features may require adjustments during development.

## 47. Architecture Status

The status below should reflect the actual state of project artifacts, not merely the existence of document drafts.

| Artifact / Area                         | Status                                                                |
| --------------------------------------- | --------------------------------------------------------------------- |
| Software Requirements Specification     | Reported completed; verify current version                            |
| System Architecture Design              | Document prepared                                                     |
| Database Design                         | Defined in the project documentation; implementation must be verified |
| API Design                              | Defined in the project documentation; implementation must be verified |
| Authentication and Authorization Design | Defined in the project documentation; implementation must be verified |
| Session Management Design               | Design approach defined; implementation must be verified              |
| Security Architecture                   | Principles and controls documented                                    |
| Feature Development Lifecycle           | Defined                                                               |
| Deployment Architecture                 | Target architecture documented                                        |
| Scalability Strategy                    | Future extension points documented                                    |

**Status principle:** A documented design does not prove that a feature is implemented, tested, deployed, or production-ready. Implementation status should be confirmed against the source code, tests, and deployed environment.

## 48. Final Architectural Statement

Zentro follows a client–server, REST-based, layered architecture that separates presentation, API communication, business logic, authentication, authorization, and persistence.

The Next.js frontend is responsible for user interaction and server-state management. The Express backend serves as the primary API and security boundary. Business logic is organized into service layers, while Mongoose provides structured access to MongoDB.

Firebase Authentication provides Google identity verification, while application-level session management, access credentials, refresh behavior, authorization, and business rules remain under backend control.

The architecture is designed to remain practical for the initial implementation while providing extension points for:

* Advanced authorization
* Cursor-based pagination
* Caching
* Background jobs
* Notifications
* Feed ranking
* Media processing
* Horizontal API scaling
* Observability
* Performance optimization

This document establishes the intended architectural foundation for developing Zentro as a maintainable and secure social media application.

The architecture must continue to evolve alongside the implementation. Any significant changes to authentication, API contracts, data models, deployment, or component responsibilities should be reflected in the relevant engineering documents.
