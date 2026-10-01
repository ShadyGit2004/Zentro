# Zentro

> A production-oriented full-stack social media platform inspired by
> modern microblogging applications, built with Next.js, TypeScript,
> Node.js, Express, MongoDB, Firebase Authentication, Cloudinary, and
> Razorpay.

Zentro is a full-stack social platform where users can create and
interact with short-form posts, follow users, discover trending content,
manage notifications, upload media, subscribe to plans, and use
multilingual content translation.

The project follows a modular client-server architecture with a REST
API, feature-based frontend organization, service-oriented backend
business logic, and security-focused middleware.

------------------------------------------------------------------------

## ✨ Highlights

-   🔐 Email/password authentication with JWT sessions
-   🔵 Google authentication through Firebase
-   📧 Email verification and password reset flows
-   👤 User profiles and profile image management
-   📝 Create, edit, delete, and repost content
-   🖼️ Image posts with Cloudinary media storage
-   🎧 Audio posts with validation and Cloudinary storage
-   ❤️ Like/unlike posts
-   💬 Comments with delete support
-   🔁 Reposts
-   🔖 Bookmarks
-   👥 Follow/unfollow users
-   📰 Personalized feed
-   🔎 User and hashtag search
-   📈 Trending hashtags/content
-   🔔 Notifications
-   🌐 Browser keyword notifications
-   🕒 Login history and session security
-   💳 Subscription plans with Razorpay
-   🔄 Razorpay webhook handling and payment idempotency
-   🌍 UI localization in 7 languages
-   🗣️ Post and comment translation with DeepL
-   ⚡ Translation caching to reduce repeated provider calls
-   🛡️ Rate limiting, Helmet, CORS, validation, and protected routes
-   📱 Responsive UI built with Tailwind CSS and shadcn/ui

------------------------------------------------------------------------

## 🌍 Supported Languages

Zentro currently supports exactly these seven UI languages:

  Code   Language
  ------ ------------
  `en`   English
  `hi`   Hindi
  `es`   Spanish
  `fr`   French
  `ru`   Russian
  `pt`   Portuguese
  `zh`   Chinese

User-generated post and comment translation uses the same supported
language set.

------------------------------------------------------------------------

## 🏗️ Architecture

Zentro uses a client-server architecture:

``` text
┌──────────────────────────────┐
│          Next.js             │
│       React + TypeScript     │
│                              │
│  Pages / Components / Hooks  │
│  Feature Modules / API Layer │
└──────────────┬───────────────┘
               │
               │ REST API / JSON
               ▼
┌──────────────────────────────┐
│        Express Server        │
│       Node.js + TypeScript   │
│                              │
│ Routes                       │
│   ↓                          │
│ Middleware                   │
│   ↓                          │
│ Controllers                  │
│   ↓                          │
│ Services                     │
│   ↓                          │
│ Models / External Providers  │
└───────┬──────────┬───────────┘
        │          │
        ▼          ▼
   ┌─────────┐  ┌──────────────────┐
   │ MongoDB │  │ External Services│
   │ Mongoose│  │ Firebase         │
   └─────────┘  │ Cloudinary       │
                │ Razorpay         │
                │ Email / DeepL    │
                └──────────────────┘
```

### Backend request flow

``` text
Request
  ↓
Route
  ↓
Authentication / Authorization Middleware
  ↓
Validation Middleware
  ↓
Controller
  ↓
Service
  ↓
Model / External Provider
  ↓
Response
```

This separation keeps HTTP handling, business logic, data access, and
third-party integrations independently maintainable.

------------------------------------------------------------------------

## 🛠️ Tech Stack

### Frontend

  Technology        Purpose
  ----------------- -----------------------------------------
  Next.js 16        React framework and application routing
  React 19          UI development
  TypeScript        Type safety
  Tailwind CSS 4    Styling
  shadcn/ui         Reusable UI components
  TanStack Query    Server-state management
  Axios             HTTP client
  React Hook Form   Form handling
  Zod               Validation
  next-intl         UI localization
  Firebase          Client-side authentication
  React Razorpay    Payment checkout
  Sonner            Toast notifications
  Lucide React      Icons

### Backend

  Technology           Purpose
  -------------------- ---------------------------------
  Node.js              Runtime
  Express 5            REST API
  TypeScript           Type safety
  MongoDB              Database
  Mongoose             MongoDB ODM
  Firebase Admin SDK   Authentication verification
  JWT                  Access/refresh session handling
  bcrypt               Password hashing
  Multer               Multipart media handling
  Cloudinary           Image/audio storage
  Nodemailer           Email delivery
  Razorpay SDK         Payment integration
  Helmet               HTTP security headers
  CORS                 Cross-origin access control
  express-rate-limit   Rate limiting
  Zod                  Request validation
  UA Parser            Login/session metadata

### Translation

-   Translation provider abstraction
-   DeepL translation provider
-   MongoDB translation cache
-   SHA-256 based translation cache keys
-   Language-aware frontend cache
-   In-flight request protection to prevent duplicate translation calls

------------------------------------------------------------------------

## 📁 Project Structure

``` text
Zentro/
├── backend/
│   ├── scripts/
│   │   └── bootstrap-admin.ts
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── features/
│   │   ├── auth/
│   │   ├── bookmarks/
│   │   ├── comments/
│   │   ├── feed/
│   │   ├── follows/
│   │   ├── hashtags/
│   │   ├── login-history/
│   │   ├── notification-preferences/
│   │   ├── notifications/
│   │   ├── payment/
│   │   ├── posts/
│   │   ├── profile/
│   │   ├── search/
│   │   ├── trending/
│   │   └── users/
│   ├── i18n/
│   ├── lib/
│   ├── messages/
│   ├── providers/
│   ├── public/
│   ├── package.json
│   └── next.config.ts
│
├── project_docs/
│   ├── SRS.md
│   ├── Twitter architecture design.txt
│   ├── Twitter API Desgin & Structure.txt
│   ├── Twitter DB design.txt
│   ├── Twitter auth architecture.txt
│   ├── Twitter tech stack.txt
│   └── Zentro_Design_System.md
│
└── README.md
```

------------------------------------------------------------------------

## 🚀 Getting Started

### Prerequisites

Install the following before running Zentro locally:

-   Node.js 20+ recommended
-   npm
-   MongoDB / MongoDB Atlas
-   Firebase project
-   Cloudinary account
-   SMTP/email credentials
-   Razorpay account for payment features
-   DeepL API access for content translation

------------------------------------------------------------------------

## 1. Clone the repository

``` bash
git clone <your-repository-url>
cd Zentro
```

------------------------------------------------------------------------

## 2. Install backend dependencies

``` bash
cd backend
npm install
```

------------------------------------------------------------------------

## 3. Install frontend dependencies

Open another terminal:

``` bash
cd frontend
npm install
```

------------------------------------------------------------------------

# 🔐 Environment Variables

Zentro uses separate environment configuration for the frontend and
backend.

> Never commit `.env`, `.env.local`, API keys, private keys, JWT
> secrets, payment secrets, or service credentials.

------------------------------------------------------------------------

## Backend `.env`

Create:

``` text
backend/.env
```

Example:

``` env
# Application
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>

# Authentication
JWT_SECRET=replace_with_a_long_random_secret

# Firebase Admin
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"

# Email
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Payments
PAYMENT_PROVIDER=razorpay
PAYMENT_CURRENCY=INR
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# Translation
TRANSLATION_PROVIDER=deepl
TRANSLATE_API_KEY=your_deepl_api_key
DEEPL_API_URL=https://api-free.deepl.com
```

### Important

`RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `JWT_SECRET`,
`CLOUDINARY_API_SECRET`, Firebase private key, and translation API
credentials must remain server-side.

------------------------------------------------------------------------

## Frontend `.env.local`

Create:

``` text
frontend/.env.local
```

Example:

``` env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Razorpay public key
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

Only values that are safe to expose to the browser should use the
`NEXT_PUBLIC_` prefix.

------------------------------------------------------------------------

# ▶️ Running Locally

## Start the backend

``` bash
cd backend
npm run dev
```

Backend:

``` text
http://localhost:5000
```

API base:

``` text
http://localhost:5000/api/v1
```

## Start the frontend

In another terminal:

``` bash
cd frontend
npm run dev
```

Frontend:

``` text
http://localhost:3000
```

------------------------------------------------------------------------

# 📦 Production Build

## Backend

``` bash
cd backend
npm run build
npm start
```

The TypeScript backend is compiled into `backend/dist`.

## Frontend

``` bash
cd frontend
npm run build
npm start
```

------------------------------------------------------------------------

# 🧪 Available Scripts

## Frontend

  Command           Description
  ----------------- ----------------------------------
  `npm run dev`     Start Next.js development server
  `npm run build`   Create production build
  `npm start`       Start production server
  `npm run lint`    Run ESLint

## Backend

  Command                     Description
  --------------------------- -------------------------------------------------
  `npm run dev`               Start Express server with TypeScript watch mode
  `npm run build`             Compile TypeScript
  `npm start`                 Start compiled production server
  `npm run admin:bootstrap`   Bootstrap the admin account

------------------------------------------------------------------------

# 🔌 API Overview

Base URL:

``` text
/api/v1
```

### Authentication

``` text
POST   /auth/register
POST   /auth/login
POST   /auth/google
POST   /auth/verify-email
POST   /auth/resend-verification
POST   /auth/forgot-password
POST   /auth/reset-password
PATCH  /auth/password
POST   /auth/refresh
POST   /auth/logout
```

### Users

``` text
GET    /users/me
GET    /users/:userId
PATCH  /users/me
PATCH  /users/me/profile-image
GET    /users/search
GET    /users/me/login-history
```

### Posts

``` text
POST   /posts
GET    /posts/:postId
PATCH  /posts/:postId
DELETE /posts/:postId
```

### Feed

``` text
GET    /feed
```

### Comments

``` text
POST   /posts/:postId/comments
GET    /posts/:postId/comments
DELETE /posts/:postId/comments/:commentId
```

### Social interactions

``` text
POST   /posts/:postId/like
DELETE /posts/:postId/like

POST   /users/:userId/follow
DELETE /users/:userId/follow

POST   /posts/:postId/repost
DELETE /posts/:postId/repost
```

### Notifications

``` text
GET   /notifications
PATCH /notifications/:notificationId/read
PATCH /notifications/read-all
```

### Discovery

``` text
GET /hashtags/search
GET /trending
```

### Payments

``` text
POST /payments/order
POST /payments/verify
GET  /payments/subscription
GET  /payments/plans
POST /payments/webhook
```

### Health

``` text
GET /api/v1/health
```

> Exact request/response schemas are maintained in the backend
> validators, controllers, services, and project documentation.

------------------------------------------------------------------------

# 💳 Subscription & Razorpay

Zentro supports subscription-based plans:

  Plan       Monthly Price   Post Limit
  -------- --------------- ------------
  Free                  ₹0            3
  Bronze              ₹100            5
  Silver              ₹300           15
  Gold               ₹1000    Unlimited

Payment processing includes:

-   Razorpay order creation
-   Client-side checkout
-   Server-side payment verification
-   Webhook signature verification
-   Idempotent payment handling
-   Subscription state management
-   Payment records

### Payment security

The Razorpay secret and webhook secret are never exposed to the
frontend.

Payment verification and webhook processing are handled on the backend.

------------------------------------------------------------------------

# 🎧 Media Uploads

Zentro supports user-generated media through Cloudinary.

### Post media

A post can contain:

``` text
Text only       ✅
Text + image    ✅
Text + audio    ✅
Image + audio   ❌
```

Audio uploads include:

-   File type validation
-   File size validation
-   Preview/playback
-   Create post support
-   Edit post support
-   Cloudinary storage

Media upload handling uses Multer with memory storage before sending the
file to Cloudinary.

------------------------------------------------------------------------

# 🌍 Content Translation

Zentro provides translation for user-generated:

-   Posts
-   Comments

Supported languages:

``` text
English
Hindi
Spanish
French
Russian
Portuguese
Chinese
```

### Translation flow

``` text
User selects language
        ↓
Frontend checks local cache
        ↓
Cached translation?
   ┌────┴────┐
  Yes       No
   ↓         ↓
Show       API request
cached        ↓
text       Backend
             ↓
       Translation cache
             ↓
        DeepL provider
             ↓
       Store translation
             ↓
       Return translation
```

The frontend also protects against duplicate in-flight requests so
repeated clicks do not create unnecessary provider requests.

------------------------------------------------------------------------

# 🌐 Internationalization

The UI uses `next-intl` with locale files stored in:

``` text
frontend/messages/
```

Current locale files:

``` text
en.json
hi.json
es.json
fr.json
ru.json
pt.json
zh.json
```

The selected locale is persisted through a locale cookie and loaded
through the application's i18n request configuration.

------------------------------------------------------------------------

# 🔐 Security

Zentro includes several application-level security measures:

-   JWT-based access/refresh session handling
-   HTTP-only cookie usage where applicable
-   Firebase Admin token verification
-   bcrypt password hashing
-   Protected routes
-   Active-user checks
-   Email verification checks
-   Zod request validation
-   Express rate limiting
-   Helmet security headers
-   CORS configuration
-   Server-side payment verification
-   Razorpay webhook signature verification
-   Payment idempotency
-   Secure environment variable handling
-   Login history/session tracking
-   Password reset protection
-   Media type and size validation

Security-sensitive business logic remains on the backend rather than
relying on frontend checks alone.

------------------------------------------------------------------------

# 🗂️ Data Model

MongoDB is accessed through Mongoose.

Core collections/models include:

``` text
User
Post
Comment
Like
Follow
Repost
Bookmark
Notification
Hashtag
Session
PasswordResetToken
VerificationToken
Payment
Subscription
```

Translation caching uses a dedicated translation-cache model.

------------------------------------------------------------------------

# 🧩 Frontend Architecture

The frontend uses a feature-based structure.

Example:

``` text
features/
├── auth/
├── posts/
├── comments/
├── feed/
├── follows/
├── bookmarks/
├── notifications/
├── notification-preferences/
├── payment/
├── profile/
├── search/
├── trending/
├── hashtags/
└── login-history/
```

A typical feature is organized around:

``` text
feature/
├── api.ts
├── hooks.ts
├── types.ts
├── schemas.ts
└── components/
```

This keeps feature-specific API calls, types, hooks, validation, and UI
components close together.

------------------------------------------------------------------------

# 🧱 Backend Architecture

The backend follows a layered structure:

``` text
routes/
    ↓
middlewares/
    ↓
controllers/
    ↓
services/
    ↓
models / providers
```

### Routes

Define API endpoints and middleware composition.

### Middleware

Handles concerns such as:

-   Authentication
-   Authorization
-   Validation
-   Rate limiting
-   File uploads
-   Error handling
-   Logging

### Controllers

Handle HTTP-level request/response behavior.

### Services

Contain business logic and integrations.

### Models

Define MongoDB/Mongoose data structures and indexes.

------------------------------------------------------------------------

# 🧪 Testing & Validation

The current development workflow validates changes through:

-   Frontend production builds
-   Backend TypeScript builds
-   ESLint checks
-   Feature-level manual testing
-   API behavior testing
-   Authentication flow testing
-   Payment flow testing
-   Media upload testing
-   Translation and caching testing
-   Regression testing after feature integration

Recent completed areas have been build-tested and manually verified
before integration.

> The backend package currently does not contain a full automated
> unit/integration test suite; `npm test` is not the project's primary
> validation mechanism yet.

------------------------------------------------------------------------

# 🚢 Deployment

Zentro can be deployed as two independently hosted applications.

### Frontend

Recommended deployment options include platforms supporting Next.js
production deployments, such as Vercel.

Configure:

``` text
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_FIREBASE_*
NEXT_PUBLIC_RAZORPAY_KEY_ID
```

### Backend

Deploy the Express/Node.js application on a Node-compatible hosting
platform.

Configure all server-side environment variables:

``` text
MONGODB_URI
JWT_SECRET
FIREBASE_*
CLOUDINARY_*
EMAIL_*
RAZORPAY_*
PAYMENT_*
TRANSLATION_*
FRONTEND_URL
PORT
```

### Production checklist

Before deployment:

-   [ ] Use production MongoDB credentials
-   [ ] Use strong random JWT secret
-   [ ] Configure production frontend origin
-   [ ] Configure Firebase production credentials
-   [ ] Configure Cloudinary production credentials
-   [ ] Configure SMTP credentials
-   [ ] Configure Razorpay live credentials
-   [ ] Configure Razorpay webhook URL and secret
-   [ ] Configure translation provider credentials
-   [ ] Verify CORS configuration
-   [ ] Verify rate limits
-   [ ] Run frontend production build
-   [ ] Run backend production build
-   [ ] Test authentication
-   [ ] Test media upload
-   [ ] Test payments/webhooks
-   [ ] Test translation
-   [ ] Verify logs and error handling

------------------------------------------------------------------------

# 📚 Project Documentation

Additional technical documentation is available in:

``` text
project_docs/
```

Important documents:

-   `SRS.md` --- software requirements
-   `Twitter architecture design.txt` --- system architecture
-   `Twitter API Desgin & Structure.txt` --- REST API design
-   `Twitter DB design.txt` --- database design
-   `Twitter auth architecture.txt` --- authentication architecture
-   `Twitter tech stack.txt` --- technology stack
-   `Zentro_Design_System.md` --- UI and design guidelines

------------------------------------------------------------------------

# 🤝 Development Workflow

For feature development:

``` text
Requirement
    ↓
Design / Architecture
    ↓
Backend or Frontend Implementation
    ↓
Build / Lint
    ↓
Manual Testing
    ↓
Commit
    ↓
Pull Request
    ↓
Review
    ↓
Merge
```

Feature branches should keep unrelated changes isolated.

Recommended commit style:

``` text
feat(frontend): add post translation
feat(backend): add translation cache
fix(frontend): prevent duplicate translation requests
fix(backend): validate webhook signature
```

------------------------------------------------------------------------

# 📝 Contributing

1.  Fork the repository.
2.  Create a feature branch.

``` bash
git checkout -b feature/your-feature
```

3.  Make focused changes.
4.  Run the relevant build/lint checks.
5.  Test the feature manually.
6.  Commit using a descriptive message.

``` bash
git commit -m "feat: add your feature"
```

7.  Push the branch.

``` bash
git push origin feature/your-feature
```

8.  Open a Pull Request.

Please keep pull requests focused and avoid mixing unrelated refactors
with feature work.

------------------------------------------------------------------------

# 📄 License

This project currently uses the ISC license as defined by the backend
package configuration.

------------------------------------------------------------------------

## 👨‍💻 Author

**Rajat Pandey**

Full-Stack / Backend-focused developer working with:

-   TypeScript
-   Node.js
-   Express.js
-   React
-   Next.js
-   MongoDB
-   REST APIs
-   Authentication & Authorization
-   Cloudinary
-   Razorpay

------------------------------------------------------------------------

## ⭐ Project Status

Zentro is an actively developed full-stack social media platform.

Current major capabilities include authentication, social interactions,
media posts, notifications, login/session security, subscriptions and
payments, multilingual UI, and user-generated content translation.
