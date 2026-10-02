Software Architecture Design — v1.1

Project: Zentro — Twitter/X Inspired Social Media Platform
Architecture Style: Client–Server + REST API + Layered Architecture
Frontend: Next.js + TypeScript
Backend: Node.js + Express + TypeScript
Database: MongoDB
Authentication: Firebase Authentication + Application Session/JWT
Server State: TanStack Query
HTTP Client: Axios
Validation: Zod
Media Storage: Cloudinary

1. Purpose

The purpose of this architecture document is to define how the major components of Zentro interact, how responsibilities are distributed, and how data flows through the system.

The Software Requirements Specification (SRS) defines:

WHAT the system should do.

The architecture defines:

HOW the system is structured to deliver those requirements.

For example, the requirement may state:

Users can create posts.

The architecture defines the implementation flow:

Next.js UI ↓ TanStack Query ↓ Axios ↓ Express REST API ↓ Authentication Middleware ↓ Validation ↓ Post Controller ↓ Post Service ↓ Mongoose ↓ MongoDB ↓ API Response ↓ TanStack Query ↓ UI Update 

2. Architectural Goals

The architecture is designed around the following goals:

Separation of concerns

Maintainability

Scalability

Security

Type safety

Reusable components

Clear API boundaries

Testability

Consistent error handling

Independent frontend and backend development

Clear ownership of business logic

Production-oriented engineering practices

The system should remain understandable as new features are added.

3. High-Level System Architecture

USER │ ▼ ┌─────────────────────┐ │ Next.js │ │ Frontend │ │ │ │ UI Components │ │ Feature Modules │ │ TanStack Query │ │ Axios │ │ Firebase Client │ └──────────┬──────────┘ │ HTTPS / REST │ ▼ ┌─────────────────────┐ │ Express.js │ │ Backend │ │ │ │ Routes │ │ Middleware │ │ Controllers │ │ Services │ │ Validators │ │ Mongoose │ └──────────┬──────────┘ │ ▼ ┌─────────────────────┐ │ MongoDB │ │ Persistence │ └─────────────────────┘ 

Supporting services:

Firebase Authentication ↑ │ Next.js Client Firebase Admin SDK ↑ │ Express Backend Cloudinary ↑ │ Next.js / Express 

4. Major System Components

The major components of Zentro are:

Next.js Frontend

TanStack Query

Axios HTTP Client

Firebase Authentication

Express Backend

Authentication Middleware

Authorization Layer

Validation Layer

Controllers

Services

Mongoose Models

MongoDB

Cloudinary

Application Logging and Monitoring

Each component has a clearly defined responsibility.

5. Frontend Architecture

5.1 Responsibility

The frontend is responsible for:

Rendering the user interface

Handling user interactions

Managing local UI state

Managing forms

Initiating authentication

Calling backend APIs

Managing server-state cache

Displaying loading states

Displaying error states

Handling optimistic UI where appropriate

The frontend does not directly access MongoDB.

Correct

Next.js ↓ Express API ↓ MongoDB 

Incorrect

Next.js ↓ MongoDB 

The backend remains the application's primary API and security boundary.

6. Frontend Internal Structure

A feature-oriented Next.js structure is preferred:

frontend/ │ ├── app/ ├── components/ ├── features/ ├── hooks/ ├── lib/ ├── providers/ ├── types/ └── utils/ 

app/

Responsible primarily for:

Routes

Layouts

Pages

Loading states

Error boundaries

Route-level composition

Example:

app/ ├── login/ ├── register/ ├── home/ ├── profile/ └── post/ 

The Next.js App Router manages application routing.

7. Reusable Component Architecture

Reusable UI components are organized separately from business features.

components/ ├── ui/ ├── layout/ ├── navbar/ ├── post/ ├── feed/ ├── profile/ └── comments/ 

Examples:

Button

Modal

Input

PostCard

CommentList

LikeButton

FollowButton

Navbar

Sidebar

The goal is to keep UI components reusable and reduce duplication.

A component should avoid becoming responsible for unrelated business logic.

8. Feature-Based Architecture

Application functionality is grouped into feature modules.

features/ ├── auth/ ├── users/ ├── posts/ ├── comments/ ├── likes/ ├── follows/ └── feed/ 

Example:

features/posts/ ├── api.ts ├── hooks.ts ├── types.ts ├── components/ └── utils/ 

This provides feature-level separation.

For example, if a problem occurs in post creation, the developer can primarily inspect the posts feature instead of searching the entire frontend codebase.

9. Server State Architecture

Zentro uses TanStack Query for server-state management.

Server state includes data originating from the backend:

Posts

Feed

Comments

User profiles

Followers

Following

Likes

Notifications

Architecture:

React Component ↓ TanStack Query ↓ Axios ↓ Express API ↓ MongoDB 

TanStack Query is responsible for concerns such as:

Fetching

Caching

Refetching

Synchronization

Mutation lifecycle

Loading states

Error states

Query invalidation

10. Server State vs Local UI State

The architecture separates server state from local UI state.

Server State

Managed primarily through TanStack Query:

Posts Feed Comments Profile Followers Following Notifications 

Local UI State

Managed through React state/hooks where appropriate:

Modal open/close Input values Dropdown state Theme preference Temporary UI state 

This prevents unnecessary duplication of server data inside local component state.

11. API Communication

Frontend and backend communicate through:

HTTPS + REST + JSON 

Example:

POST /api/v1/posts Content-Type: application/json Authorization: Bearer <access-token> 

Example response:

{ "success": true, "data": { "id": "post_123" } } 

The complete API contract is defined separately in the API Design document.

12. Backend Architecture

The backend follows a layered architecture:

HTTP Request ↓ Route ↓ Middleware ↓ Controller ↓ Service ↓ Mongoose Model ↓ MongoDB 

Each layer has a defined responsibility.

This separation improves:

Maintainability

Testability

Reusability

Debugging

Scalability

13. Route Layer

Routes map HTTP requests to the appropriate middleware and controller.

Example:

GET /api/v1/posts/:postId POST /api/v1/posts PATCH /api/v1/posts/:postId DELETE /api/v1/posts/:postId 

Authentication:

POST /api/v1/auth/login POST /api/v1/auth/register POST /api/v1/auth/google POST /api/v1/auth/refresh POST /api/v1/auth/logout 

Interactions:

POST /api/v1/posts/:postId/like DELETE /api/v1/posts/:postId/like POST /api/v1/posts/:postId/comments POST /api/v1/users/:userId/follow DELETE /api/v1/users/:userId/follow 

The final API contract is maintained independently so that frontend and backend teams can work against a stable interface.

14. Middleware Architecture

Middleware operates between the incoming request and the controller.

A typical protected request pipeline is:

Request ↓ Rate Limiter ↓ CORS ↓ Security Headers ↓ Authentication ↓ Validation ↓ Authorization ↓ Controller 

Authentication

Authentication answers:

Who is making this request?

The backend verifies the application's access token.

For Google authentication, Firebase Admin SDK is used to verify the Firebase ID token during the Google authentication flow.

Authorization

Authorization answers:

Is this authenticated user allowed to perform this operation?

Example:

User A ↓ DELETE User B's Post ↓ Authenticated? YES ↓ Authorized? NO ↓ 403 Forbidden 

15. Controller Layer

Controllers handle HTTP-level concerns.

Example:

POST /api/v1/posts ↓ postController.createPost() 

The controller is responsible for:

Reading request data

Reading authenticated user context

Calling the appropriate service

Selecting the HTTP status code

Returning the standardized API response

The controller should not contain large amounts of business logic.

Preferred

Controller ↓ Service ↓ Database 

Avoid

Controller ↓ 100+ lines of business logic ↓ Multiple database operations ↓ Complex authorization 

16. Service Layer

The service layer contains application and business logic.

Example:

postService.createPost() 

A service may be responsible for:

Applying business rules

Checking resource relationships

Performing authorization-related business checks

Preparing data for persistence

Coordinating multiple database operations

Calling external services when required

Example:

Create Post ↓ Validate Business Rules ↓ Verify User ↓ Prepare Post Data ↓ Create Post ↓ Return Domain Result 

This keeps controllers lightweight and makes business logic easier to test.

17. Validation Layer

Request validation occurs before business logic is executed.

Validation applies to:

Request body

Query parameters

Route parameters

Headers where applicable

Conceptually:

Request ↓ Schema Validation ↓ Valid? ├── NO → 400 / 422 │ └── YES ↓ Controller 

Zod may be used to provide type-safe request schemas.

Important Security Principle

Frontend validation improves user experience.

Backend validation is mandatory for security.

Frontend Validation ↓ UX Improvement Backend Validation ↓ Security Boundary 

The backend must never trust data simply because the frontend already validated it.

18. Database Architecture

Initial MongoDB collections:

users posts comments likes follows sessions 

Conceptual relationships:

User │ ├──── creates ──────► Posts │ ├──── writes ───────► Comments │ ├──── likes ────────► Posts │ └──── follows ──────► Users 

The sessions collection supports refresh-token/session lifecycle management.

19. User Identity Architecture

Firebase identity and application identity are separate concepts.

Firebase Identity │ │ firebaseUid ▼ Application User │ ▼ MongoDB 

Example:

Firebase UID = abc123 

MongoDB:

{ "_id": "mongo456", "firebaseUid": "abc123", "email": "rajat@example.com", "username": "rajat", "displayName": "Rajat Pandey" } 

The application uses the MongoDB user identity when creating relationships with:

Posts

Comments

Likes

Follows

Sessions

20. Authentication Architecture

Zentro uses a hybrid authentication model.

Email & Password

Next.js ↓ Express ↓ Password Verification ↓ Application Session ↓ Access Token + Refresh Token 

Google

Next.js ↓ Firebase Authentication ↓ Firebase ID Token ↓ Express ↓ Firebase Admin SDK ↓ Verified Firebase Identity ↓ Application User ↓ Application Session ↓ Access Token + Refresh Token 

Firebase therefore provides Google identity verification, while application-level access remains controlled by the Express backend.

21. Post Creation — End-to-End Flow

Post creation is an example of the complete architecture working together.

User ↓ Create Post Form ↓ Next.js ↓ TanStack Mutation ↓ Axios ↓ POST /api/v1/posts ↓ Express Route ↓ Authentication Middleware ↓ Validation ↓ Post Controller ↓ Post Service ↓ Mongoose Model ↓ MongoDB ↓ API Response ↓ TanStack Query ↓ Invalidate / Update Relevant Query ↓ UI Updated 

This flow demonstrates the separation between:

UI

Server state

HTTP

Authentication

Validation

Business logic

Persistence

22. Feed Architecture

When the user opens the home feed:

User Opens Home ↓ Next.js Feed Page ↓ TanStack Query ↓ GET /api/v1/feed ↓ Axios ↓ Express ↓ Authentication ↓ Feed Controller ↓ Feed Service ↓ MongoDB ↓ Feed Data ↓ API Response ↓ TanStack Query Cache ↓ Feed UI 

Initial Feed Strategy

The initial implementation uses a chronological feed.

Newest ↓ Older 

The system does not initially implement a complex recommendation algorithm.

Future versions may introduce:

Ranking

Relevance

Engagement signals

Personalized recommendations

Cursor-based feed retrieval

23. Like Architecture

User Clicks Like ↓ TanStack Mutation ↓ POST /api/v1/posts/:postId/like ↓ Express ↓ Authentication ↓ Validation ↓ Like Service ↓ MongoDB ↓ Success ↓ Invalidate / Update Query ↓ UI 

Business rules:

A user must be authenticated.

The target post must exist.

A user cannot create a duplicate like.

The like relationship should be uniquely constrained at the database level.

24. Comment Architecture

Comment Form ↓ TanStack Mutation ↓ POST /api/v1/posts/:postId/comments ↓ Express ↓ Authentication ↓ Validation ↓ Comment Controller ↓ Comment Service ↓ MongoDB ↓ API Response ↓ Comments Query Update ↓ UI 

The backend verifies that the target post exists before creating the comment.

25. Follow Architecture

Follow Button ↓ TanStack Mutation ↓ POST /api/v1/users/:userId/follow ↓ Authentication ↓ Validation ↓ Authorization / Business Rules ↓ Follow Service ↓ MongoDB ↓ Response ↓ Relevant Query Update ↓ UI 

Business rules:

A user must be authenticated.

A user cannot follow themselves.

The target user must exist.

Duplicate follow relationships are not allowed.

Database-level uniqueness should protect against race-condition duplicates.

26. Media Architecture

Cloudinary is used for profile and post media.

A typical flow is:

User Selects Image ↓ Next.js ↓ Cloudinary Upload ↓ Media URL ↓ Backend ↓ MongoDB 

MongoDB stores metadata or URLs rather than the actual media file.

Example:

{ "profileImage": "https://res.cloudinary.com/..." } 

Why External Media Storage?

Storing large media files directly inside the application database can unnecessarily increase database storage and operational complexity.

An external media service provides dedicated capabilities for:

Media storage

Delivery

Transformation

CDN-based access

Image optimization

Security

Upload permissions, file-type validation, size limits, and signed upload strategies should be defined during implementation.

27. Error Handling Architecture

The backend uses a standardized error model.

Common status codes:

400 Bad Request 401 Unauthorized 403 Forbidden 404 Not Found 409 Conflict 422 Unprocessable Entity 429 Too Many Requests 500 Internal Server Error 

Examples:

Delete another user's post ↓ 403 Forbidden Post does not exist ↓ 404 Not Found Duplicate follow ↓ 409 Conflict Invalid request data ↓ 422 Validation Error 

Production error responses should not expose:

Stack traces

Database internals

Secrets

Password information

Internal implementation details

28. Standard API Response

Successful responses follow a consistent envelope:

{ "success": true, "data": {} } 

Collection responses may include pagination:

{ "success": true, "data": [], "pagination": { "page": 1, "limit": 20, "hasNextPage": true } } 

Error responses:

{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Request validation failed.", "details": {} } } 

The complete response contract is maintained in the API Design specification.

29. Security Architecture

The primary API security pipeline is:

API REQUEST │ ▼ Rate Limiting │ ▼ CORS │ ▼ Security Headers │ ▼ Authentication │ ▼ Validation │ ▼ Authorization │ ▼ Business Rules │ ▼ Service │ ▼ MongoDB 

Rate Limiting

Limits excessive requests and helps reduce abuse.

CORS

Restricts browser-based cross-origin access to approved origins.

Security Headers

Helmet or equivalent middleware can be used to configure security-related HTTP headers.

Authentication

Verifies the identity of the requester.

Authorization

Determines whether the authenticated user can perform the requested action.

Validation

Ensures incoming data conforms to the expected schema.

30. Authentication and Authorization Boundary

A critical architectural distinction is:

Authentication "Who are you?" 

versus:

Authorization "What are you allowed to do?" 

Example:

User A Logs In ↓ Authentication ✓ ↓ Attempts to Delete User B's Post ↓ Ownership Check ↓ Authorization ✗ ↓ 403 Forbidden 

Authentication does not automatically grant access to every resource.

31. API Security Rules

The backend must follow these principles:

Never Trust the Client

Client-side checks can be bypassed.

Authenticate Protected Requests

Protected endpoints require valid application authentication.

Authorize Resource Operations

Ownership and role checks must happen server-side.

Validate All Input

Every request must be validated before entering business logic.

Enforce Database Constraints

Application checks should be reinforced by database-level unique constraints where appropriate.

Protect Secrets

API keys, database credentials, JWT secrets, Firebase credentials, and Cloudinary secrets must not be committed to source control.

Use HTTPS

Production API communication must use HTTPS.

32. Observability Architecture

Production-oriented systems should provide basic observability.

The backend should support:

Structured Logging

Record useful information such as:

timestamp requestId method path statusCode duration userId (where appropriate) errorCode 

Sensitive information such as passwords and raw tokens must never be logged.

Request Correlation

A request ID should allow a request to be traced across:

Client ↓ API ↓ Service ↓ Database 

Metrics

Future monitoring can track:

Request count

Error rate

API latency

Database latency

Authentication failures

Rate-limit events

This becomes increasingly important as the application grows.

33. Database Access Architecture

The service layer should interact with persistence through Mongoose models.

Controller ↓ Service ↓ Mongoose Model ↓ MongoDB 

Controllers should not directly perform large amounts of database logic.

Example:

Avoid

Controller ↓ find() update() populate() business rules authorization response formatting 

Prefer

Controller ↓ Post Service ↓ Post Model ↓ MongoDB 

This keeps persistence and business logic more maintainable.

34. Pagination Architecture

List APIs should not return unlimited records.

Examples:

Feed Comments Followers Following 

Initial pagination can use:

?page=1&limit=20 

The server must enforce maximum limits.

For high-volume feeds, cursor-based pagination can be introduced later.

Example future architecture:

First Request ↓ Cursor = null ↓ Feed Data ↓ nextCursor ↓ Next Request ↓ Cursor-Based Retrieval 

This provides a migration path toward larger-scale feed retrieval.

35. Frontend–Backend Contract

The frontend should not depend on undocumented backend behavior.

The API contract defines:

Endpoint

HTTP method

Authentication requirement

Request schema

Response schema

Error codes

Pagination

Authorization rules

Conceptually:

API CONTRACT │ ┌─────────┴─────────┐ ▼ ▼ Next.js Express Consumer Provider 

This allows frontend and backend development to remain loosely coupled.

36. Project Folder Architecture

Overall project structure:

zentro/ │ ├── frontend/ │ ├── app/ │ ├── components/ │ ├── features/ │ ├── hooks/ │ ├── lib/ │ ├── providers/ │ ├── types/ │ └── utils/ │ ├── backend/ │ └── src/ │ ├── config/ │ ├── routes/ │ ├── controllers/ │ ├── services/ │ ├── models/ │ ├── middleware/ │ ├── validators/ │ ├── utils/ │ ├── types/ │ └── app.ts │ ├── docs/ │ ├── SRS.md │ ├── ARCHITECTURE.md │ ├── DATABASE-DESIGN.md │ ├── API-DESIGN.md │ └── AUTH-DESIGN.md │ ├── README.md └── .gitignore 

The exact directory structure may evolve as the project grows, but responsibilities should remain consistent.

37. Why Separate Frontend and Backend?

Next.js can expose API routes and communicate directly with a database.

However, Zentro intentionally uses a separate Express backend.

Architectural Reasons

This approach provides practical experience with:

REST API design

Middleware

Authentication

Authorization

Controllers

Services

Validation

MongoDB integration

API security

Backend testing

Deployment

Service boundaries

Alternative:

Next.js ↓ Next.js API Routes ↓ MongoDB 

This can be a valid production architecture.

However, the separate Express architecture provides a clearer backend boundary for the current project's engineering and learning objectives.

38. Technology Responsibility Map

TechnologyResponsibilityNext.jsFrontend framework and routingTypeScriptStatic type safetyTailwind CSSStylingshadcn/uiReusable UI componentsTanStack QueryServer-state managementAxiosHTTP communicationFirebase AuthenticationGoogle identity authenticationFirebase Admin SDKServer-side Firebase token verificationExpressREST API serverMongooseMongoDB object modelingMongoDBPersistent application dataCloudinaryMedia storage and deliveryZodRequest/schema validation

39. Deployment Architecture

The production architecture is:

USER │ ▼ ┌─────────────┐ │ Vercel │ │ Next.js │ └──────┬──────┘ │ HTTPS │ ▼ ┌─────────────────┐ │ Backend Hosting │ │ Express │ └────────┬────────┘ │ ▼ ┌─────────────┐ │ MongoDB │ │ Atlas │ └─────────────┘ 

Supporting services:

Firebase └── Authentication Cloudinary └── Media Storage / Delivery 

Environment-specific configuration should be used for:

Database connection strings

Authentication secrets

Firebase configuration

Cloudinary credentials

CORS origins

API URLs

Cookie configuration

Secrets must never be committed to Git.

40. Scalability Considerations

The initial architecture is intentionally simple but provides a path for future scaling.

Potential future improvements include:

API Scaling

Load Balancer ↓ ┌─────┼─────┐ API API API 

Caching

Redis or another cache can be introduced for frequently accessed data.

Database Optimization

Proper indexes

Query optimization

Projection

Pagination

Aggregation optimization

Feed Optimization

Initial:

Chronological Query 

Future:

Candidate Generation ↓ Ranking ↓ Personalized Feed 

Background Jobs

Future asynchronous workloads may include:

Notifications

Email delivery

Media processing

Feed fan-out

Analytics

These can be moved to background workers as system requirements increase.

41. Architectural Principles

1. Separation of Concerns

Each layer should have a clearly defined responsibility.

2. Single Responsibility

A component should avoid taking responsibility for unrelated operations.

3. Don't Trust the Client

Frontend validation and UI restrictions are not security mechanisms.

4. Authentication ≠ Authorization

A logged-in user does not automatically have permission to perform every operation.

5. Business Logic in Services

Controllers should remain focused on HTTP concerns.

6. Server State ≠ UI State

Server data belongs primarily to TanStack Query, while temporary UI state belongs to the UI layer.

7. API-First Thinking

API contracts should be understood and designed before tightly coupling frontend implementation to backend internals.

8. Security by Design

Security should be considered from the beginning rather than added after the application is completed.

9. Database Constraints Matter

Application-level checks should be reinforced with appropriate database constraints.

10. Design for Evolution

The initial architecture should remain simple while providing clear extension points for future requirements.

42. Architecture Decision Summary

AreaDecisionReasonFrontendNext.jsReact-based full-stack-capable frontend frameworkLanguageTypeScriptType safety and maintainabilityBackendExpressClear REST and layered backend architectureDatabaseMongoDBDocument-oriented application dataODMMongooseSchema/model and MongoDB interactionAuthenticationFirebase + Application AuthManaged Google identity with application-controlled sessionsAPIRESTSimple and widely adopted communication modelServer StateTanStack QueryCaching and server-state synchronizationHTTP ClientAxiosCentralized API communicationValidationZodType-safe schema validationMediaCloudinaryDedicated media storage and deliveryArchitectureLayeredSeparation of concerns and maintainabilityDeploymentVercel + Backend Hosting + MongoDB AtlasIndependent frontend/backend deployment

43. Final End-to-End Architecture

USER │ ▼ ┌────────────────────┐ │ Next.js │ │ Frontend │ │ │ │ UI Components │ │ Feature Modules │ │ TanStack Query │ │ Axios │ │ Firebase Client │ └─────────┬──────────┘ │ HTTPS / REST API │ ▼ ┌────────────────────┐ │ Express.js │ │ Backend │ └─────────┬──────────┘ │ ┌──────────┴──────────┐ │ │ ▼ ▼ Middleware Layer API Routes │ │ └──────────┬──────────┘ ▼ Controllers │ ▼ Services │ ▼ Mongoose │ ▼ ┌──────────┐ │ MongoDB │ └──────────┘ Authentication │ ▼ Firebase Authentication │ ▼ Firebase ID Token │ ▼ Firebase Admin SDK │ ▼ Application User │ ▼ Application Session │ ▼ Access + Refresh Tokens Media │ ▼ Cloudinary │ ▼ Media URL │ ▼ MongoDB 

44. Complete Request Lifecycle

A typical protected request follows:

User Interaction ↓ React / Next.js ↓ TanStack Query ↓ Axios ↓ HTTPS Request ↓ Rate Limiting ↓ CORS / Security Headers ↓ Authentication ↓ Validation ↓ Authorization ↓ Controller ↓ Service ↓ Mongoose ↓ MongoDB ↓ Service Result ↓ Controller Response ↓ Axios ↓ TanStack Query Cache ↓ React UI 

This represents the core architectural lifecycle of Zentro.

45. Feature Development Lifecycle

Every major feature should follow the same engineering process:

Requirement ↓ Use Case ↓ Architecture Impact ↓ Database Design ↓ API Contract ↓ Backend Implementation ↓ Validation ↓ Authorization ↓ Testing ↓ Frontend Integration ↓ TanStack Query Integration ↓ UI / UX ↓ Error Handling ↓ Security Review ↓ Deployment ↓ Monitoring ↓ Documentation 

This process is intended to prevent features from being implemented as isolated pieces of code.

46. Project Engineering Sequence

The recommended implementation sequence for Zentro is:

SRS ↓ System Architecture ↓ Database Design ↓ API Design ↓ Authentication & Authorization Design ↓ Project Setup ↓ Backend Foundation ↓ Database Connection ↓ Authentication ↓ User/Profile ↓ Post API ↓ TanStack Query Fundamentals ↓ Post Creation UI ↓ Feed ↓ Likes ↓ Comments ↓ Follow System ↓ Profile ↓ Media Upload ↓ Pagination ↓ Testing ↓ Security Review ↓ Performance Review ↓ Deployment ↓ Monitoring ↓ Documentation 

47. Architecture Status

Project ArtifactStatusSoftware Requirements Specification (SRS)✅ CompletedSystem Architecture Design✅ CompletedDatabase Design✅ CompletedAPI Design✅ CompletedAuthentication & Authorization Design✅ CompletedSession Management Design✅ DefinedSecurity Architecture✅ DefinedFeature Development Lifecycle✅ DefinedDeployment Architecture✅ DefinedScalability Strategy✅ Defined

48. Final Architectural Statement

Zentro follows a client–server, REST-based, layered architecture with a clear separation between presentation, API, business logic, authentication, authorization, and persistence.

The frontend is responsible for user interaction and server-state management. The Express backend acts as the application's primary API and security boundary. Business logic is isolated within service layers, while Mongoose provides structured access to MongoDB.

Firebase Authentication provides external Google identity verification, while application-level sessions, access tokens, refresh tokens, authorization, and business rules remain under backend control.

The architecture is intentionally designed to be simple enough for the initial implementation while providing clear extension points for:

Advanced authorization

Cursor-based pagination

Caching

Background jobs

Notifications

Feed ranking

Media processing

Horizontal API scaling

Observability

Performance optimization

The architecture therefore provides a structured foundation for developing Zentro as a maintainable, secure, and scalable social media application.

