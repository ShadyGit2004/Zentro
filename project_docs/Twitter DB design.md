# 🗄️ Database Design — Twitter/X Clone

## 1. What is Database Design?

In the SRS, we defined requirements such as:

* Users can create posts.
* Users can like posts.
* Users can comment on posts.
* Users can follow other users.

The database needs to determine:

* Where will user data be stored?
* Which user owns a particular post?
* Who liked a post?
* Who commented and on which post?
* Who follows whom?
* How will duplicate likes/follows be prevented?
* How will data be queried efficiently?

All of these decisions are part of **Database Design**.

---

## 2. Why MongoDB?

We are using MongoDB, which is a document-oriented NoSQL database.

Basic structure:

```text
Database
   ↓
Collections
   ↓
Documents
   ↓
Fields
```

In SQL databases:

```text
Database
   ↓
Tables
   ↓
Rows
   ↓
Columns
```

MongoDB example:

```text
MongoDB
   ↓
users
   ↓
{
   username: "...",
   email: "..."
}
```

---

## 3. Initial Collections

Based on the P0 requirements, the initial database will contain:

```text
twitter_clone
│
├── users
├── posts
├── comments
├── likes
└── follows
```

Additional collections can be introduced later for P1/P2 features:

```text
notifications
bookmarks
hashtags
reposts
media
```

We will avoid creating unnecessary schemas for future features until those requirements are finalized.

---

## 4. Most Important Concept — Relationships

In relational databases, relationships are represented using tables and foreign keys.

MongoDB also supports relationships, but there are multiple ways to represent them.

### Option A — Embed

Store related data directly inside the document.

### Option B — Reference

Store the `_id` of another document.

Example:

```js
Post
{
   author: ObjectId("...")
}
```

The complete User object is not stored inside the Post.

Only the User's reference is stored.

---

## 5. User and Post Relationship

Requirement:

> One user can create many posts.

Therefore:

```text
User
  │
  ├──── Post
  ├──── Post
  ├──── Post
  └──── Post
```

This is a **One-to-Many relationship**.

In the database:

```text
Post.author → User._id
```

Conceptually:

```text
users
   │
   │ _id
   ▼
posts.author
```

### Why use a reference?

If we copied the complete User object into every Post:

```js
{
   author: {
      username: "...",
      bio: "...",
      profileImage: "..."
   }
}
```

the same user data would be stored repeatedly.

Instead:

```js
{
   author: ObjectId(...)
}
```

This avoids unnecessary duplication.

---

## 6. User Collection

Conceptual User document:

```text
User
├── _id
├── firebaseUid
├── username
├── displayName
├── email
├── bio
├── profileImage
├── createdAt
└── updatedAt
```

### Important

Firebase Authentication handles the user's identity and authentication.

The MongoDB User document represents the application's user profile.

```text
Firebase
   ↓
Identity / Authentication

MongoDB
   ↓
Application-level User Profile
```

This separation should be maintained.

---

## 7. Why is `firebaseUid` Required?

Suppose the Firebase user has:

```text
firebaseUid = abc123
```

MongoDB can store:

```js
{
   firebaseUid: "abc123",
   username: "rajat"
}
```

The backend verifies the Firebase token and obtains the Firebase UID.

Then:

```text
Firebase UID
      ↓
MongoDB User
```

Therefore, `firebaseUid` is an important field.

A unique index should also be considered for this field.

---

## 8. User Email

The user's email may come from Firebase Authentication.

We can also store the email in MongoDB for application-level use cases:

```text
email
```

However:

> Passwords should not be stored in MongoDB when Firebase Authentication is responsible for password authentication.

Firebase handles password authentication.

---

## 9. Followers / Following

Now we have a more interesting relationship.

Requirement:

> User A can follow User B.

This is a **Many-to-Many relationship**.

For example:

```text
User A → follows → User B
User A → follows → User C

User B → follows → User A
User B → follows → User D
```

A user can follow multiple users, and a user can also be followed by multiple users.

---

## 10. Follow Collection

A dedicated collection is appropriate for this relationship:

```text
follows
```

Conceptually:

```text
Follow
├── _id
├── follower
├── following
└── createdAt
```

Example:

```js
{
   follower: UserA,
   following: UserB
}
```

Meaning:

> User A follows User B.

---

## 11. Preventing Duplicate Follows

Suppose:

```text
User A → User B
```

already exists.

If User A presses the Follow button again, the database should not contain:

```text
A → B
A → B
A → B
```

Therefore, the following combination must be unique:

```text
follower + following
```

At the database level, this can be enforced using a **compound unique index**.

This is an important real-world database design principle.

Frontend button disabling alone is not sufficient for enforcing data integrity.

---

## 12. Self-Follow

The following relationship should not be allowed:

```text
A → A
```

This is a business rule:

```text
follower !== following
```

The rule should be enforced at the backend/service layer.

---

## 13. Post Collection

Conceptually:

```text
Post
├── _id
├── author
├── content
├── media
├── createdAt
└── updatedAt
```

Example:

```js
{
   author: ObjectId(...),
   content: "Learning backend architecture!",
   media: [],
   createdAt: ...
}
```

---

## 14. Post → User Relationship

Relationship:

```text
User
  │
  │ creates
  ▼
Post
```

Database representation:

```text
posts.author
       ↓
   users._id
```

This allows us to efficiently query:

> Retrieve all posts created by a particular user.

---

## 15. Comment Collection

Requirement:

> A user can comment on a post.

A Comment has two important relationships:

```text
Comment
   │
   ├── author → User
   │
   └── post → Post
```

Conceptually:

```text
Comment
├── _id
├── author
├── post
├── content
├── createdAt
└── updatedAt
```

Example:

```js
{
   author: UserA,
   post: Post123,
   content: "Nice post!"
}
```

---

## 16. Like Collection

Initially, likes will be stored in a separate collection.

```text
Like
├── _id
├── user
├── post
└── createdAt
```

Example:

```js
{
   user: UserA,
   post: Post123
}
```

Meaning:

> User A liked Post 123.

---

## 17. Preventing Duplicate Likes

The same user should not be able to like the same post multiple times.

Therefore:

```text
user + post
```

must be a unique combination.

Conceptually:

```text
unique(user, post)
```

This can be enforced using a **compound unique index**.

---

## 18. Complete Relationship Diagram

The overall database relationship can be represented as:

```text
                    ┌─────────────┐
                    │    USER     │
                    └──────┬──────┘
                           │
             ┌─────────────┼──────────────┐
             │             │              │
             │ creates     │ comments     │ likes
             ▼             ▼              ▼
        ┌─────────┐   ┌──────────┐   ┌─────────┐
        │  POST   │   │ COMMENT  │   │  LIKE   │
        └────┬────┘   └─────┬────┘   └────┬────┘
             │              │             │
             │              │             │
             └──────────────┼─────────────┘
                            │
                         references
                            │
                            ▼
                           POST
```

Follow relationship:

```text
USER ─────── follower ──────> USER
          via FOLLOW
```

More formally:

```text
User 1 ──────── * Post
User 1 ──────── * Comment
User 1 ──────── * Like
User 1 ──────── * Follow (as follower)
User 1 ──────── * Follow (as following)

Post 1 ──────── * Comment
Post 1 ──────── * Like
```

---

## 19. Why Store Likes in a Separate Collection?

An alternative approach would be:

```js
Post
{
   content: "...",
   likes: [
      userId1,
      userId2,
      userId3
   ]
}
```

This looks simple initially.

However, a separate `likes` collection provides better flexibility for a production-style system:

```text
likes
├── user
├── post
└── createdAt
```

We can efficiently query:

> Has User A liked Post B?

We can also efficiently determine:

> How many likes does Post B have?

with appropriate indexes.

It also makes it easier to expand like-related functionality later.

---

## 20. Why Store Comments in a Separate Collection?

An alternative would be:

```js
Post
{
   comments: [
      {...},
      {...},
      {...}
   ]
}
```

The problem is that a popular post could potentially receive thousands or more comments, making a single Post document unnecessarily large.

Instead:

```text
posts
comments
```

are stored separately.

This also allows pagination:

```text
GET /posts/:id/comments?page=1
```

---

## 21. Database Indexing

Indexing is a very important database concept.

An index can be thought of as a **lookup structure that helps the database find frequently queried data faster**.

For example, a feed may frequently require:

```text
posts
ORDER BY createdAt DESC
```

Therefore, an index involving `createdAt` can be useful.

Similarly:

```text
likes:
(user, post) → unique

follows:
(follower, following) → unique
```

Additional indexes should be designed according to actual query patterns.

Indexes should not be added blindly to every field.

Why?

Indexes can improve read performance, but they also introduce:

* Additional storage requirements
* Additional write/update overhead

Understanding this trade-off is an important part of real-world database design.

---

## 22. Initial Index Strategy

Conceptually:

### Users

```text
firebaseUid → unique
username → unique
```

### Posts

Likely:

```text
author + createdAt
createdAt
```

depending on actual query patterns.

### Likes

```text
user + post → unique
post + createdAt
```

### Follows

```text
follower + following → unique
follower
following
```

### Comments

```text
post + createdAt
author
```

This is an initial indexing strategy. Exact indexes should be finalized based on actual API queries and access patterns.

---

## 23. Data Duplication vs References

MongoDB does not require every relationship to be referenced, nor should everything be embedded.

The decision depends on:

* Data size
* Access patterns
* Update frequency
* Relationship type
* Pagination requirements
* Scalability requirements

For our application:

```text
Post → User
Comment → User + Post
Like → User + Post
Follow → User + User
```

References are appropriate.

---

## 24. Complete Initial Schema Overview

### USERS

```text
_id
firebaseUid
username
displayName
email
bio
profileImage
createdAt
updatedAt
```

### POSTS

```text
_id
author → User
content
media
createdAt
updatedAt
```

### COMMENTS

```text
_id
author → User
post → Post
content
createdAt
updatedAt
```

### LIKES

```text
_id
user → User
post → Post
createdAt
```

### FOLLOWS

```text
_id
follower → User
following → User
createdAt
```

---

## 25. Important Decision: Should We Store Like Count?

A common question is:

> Should we store `likesCount: 100` in the Post document, or count documents in the Likes collection every time?

### Option A — Count the Likes Collection

This can provide accurate counts but may become expensive when performed frequently at scale.

### Option B — Store a Counter

Store:

```text
likesCount
```

directly in the Post document.

This makes reads faster, but consistency must be maintained when likes are added or removed.

For this project, denormalized counters can be introduced deliberately later as a performance optimization.

The same approach can apply to:

```text
commentsCount
followersCount
followingCount
```

We will not add these fields blindly.

First, we establish a correct basic data model and then introduce performance optimizations based on actual requirements.

---

## 26. Soft Delete

There are two common approaches to deleting a Post.

### Hard Delete

Permanently remove the document from the database.

```text
DELETE
```

### Soft Delete

Store:

```text
deletedAt
```

The data remains in the database but is excluded from normal queries.

Soft deletes can be useful in real-world systems, especially when moderation or audit requirements exist.

For the initial MVP, hard delete is simpler unless future requirements require soft deletion.

---

## 27. Database Security Rules

Database design is not only about defining fields and collections.

The system must also enforce rules such as:

* A user cannot modify another user's profile.
* A user cannot edit another user's post.
* A user cannot delete another user's post.
* A user cannot create duplicate likes.
* A user cannot create duplicate follows.
* A user cannot follow themselves.
* A comment must reference an existing post.
* A like must reference an existing post.
* A follow must reference existing users.

These rules should primarily be enforced at the backend/service layer, while database constraints and indexes provide additional data-integrity protection.

---

# 28. Final Database Architecture

```text
                       MongoDB
                          │
              ┌───────────┴───────────┐
              │                       │
         Application              Relationships
           Data
              │                       │
      ┌───────┼────────┐              │
      ▼       ▼        ▼              ▼
    Users   Posts   Comments       Follows
              │
              ▼
            Likes
```

Actual relationships:

```text
User
 │
 ├───────────────> Posts
 │                    │
 │                    ├──────> Comments
 │                    │
 │                    └──────> Likes
 │
 └───────────────> Follows ───────────> User
```

---

# 🎯 Database Design Status

## Initial Database Design — Completed ✅

### Collections

```text
users
posts
comments
likes
follows
```

### Relationships

```text
References
```

### Uniqueness

```text
likes(user + post)
follows(follower + following)
```

### Authentication Identity

```text
firebaseUid
```

### Media

```text
Cloudinary URL / reference
```

Mongoose schemas will be defined in the next phase.

The next logical step is:

# 🔌 API Design

The database will be connected to the application through APIs:

```text
Requirement
     ↓
Database
     ↓
API Endpoint
     ↓
Request
     ↓
Validation
     ↓
Controller
     ↓
Service
     ↓
Database
     ↓
Response
```

---

# Database Design v1.1

## 1. Collections

```text
users
posts
comments
likes
follows
sessions
```

---

## 2. Users

```text
User
├── _id
├── email
├── username
├── displayName
├── bio
├── profileImage
├── passwordHash
├── firebaseUid
├── authProviders
├── emailVerifiedAt
├── role
├── status
├── createdAt
└── updatedAt
```

Important fields:

```text
email → unique, normalized lowercase
username → unique
passwordHash → only for Email/Password users
firebaseUid → Google/Firebase identity; optional
authProviders → ["password"], ["google"], or ["password","google"]
emailVerifiedAt → null until verified
role → initially user
status → active, suspended, etc.
```

Indexes:

```text
email → unique
username → unique
firebaseUid → unique + sparse
```

---

## 3. Sessions

A new collection for refresh-token/session management.

```text
Session
├── _id
├── user
├── refreshTokenHash
├── expiresAt
├── revokedAt
├── createdAt
├── lastUsedAt
├── userAgent
└── ipAddress
```

Relationship:

```text
User 1 ──────── * Sessions
```

`refreshTokenHash` stores the hash of the refresh token, never the actual refresh token.

`expiresAt` allows expired sessions to be automatically cleaned up.

---

## 4. Posts

```text
Post
├── _id
├── author → User
├── content
├── media
├── createdAt
└── updatedAt
```

Indexes:

```text
author + createdAt
createdAt
```

---

## 5. Comments

```text
Comment
├── _id
├── author → User
├── post → Post
├── content
├── createdAt
└── updatedAt
```

Indexes:

```text
post + createdAt
author
```

---

## 6. Likes

```text
Like
├── _id
├── user → User
├── post → Post
└── createdAt
```

Indexes:

```text
user + post → UNIQUE
post + createdAt
```

The unique compound index prevents duplicate likes.

---

## 7. Follows

```text
Follow
├── _id
├── follower → User
├── following → User
└── createdAt
```

Indexes:

```text
follower + following → UNIQUE
follower
following
```

Business rule:

```text
follower !== following
```

Self-following is not allowed.

---

# Relationships

```text
                    ┌───────────┐
                    │   User    │
                    └─────┬─────┘
                          │
          ┌───────────────┼────────────────┐
          ↓               ↓                ↓
        Posts          Comments          Sessions
          │               │
          ↓               ↓
         Likes           Post
          
User ──< Follows >── User
```

---

# Authentication Data Flow

### Email/Password

```text
Email/Password
      ↓
passwordHash
      ↓
User
      ↓
Session
      ↓
Refresh Token
```

### Google Authentication

```text
Google
  ↓
Firebase UID
  ↓
User.firebaseUid
  ↓
Session```
