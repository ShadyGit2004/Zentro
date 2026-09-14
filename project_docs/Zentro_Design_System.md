# Zentro — Product Design System & UI Guidelines

> Version: 1.0  
> Status: Active  
> Project: Zentro — Full-Stack Social Media Platform

---

## 1. Purpose

This document defines the visual language, UI principles, reusable components, interaction patterns, and frontend design rules for Zentro.

The goal is to keep the product:

- Modern
- Clean
- Consistent
- Responsive
- Accessible
- Production-oriented
- Easy to extend as new features are added

**Rule:** New UI should follow this document instead of introducing one-off styles.

---

# 2. Product Design Direction

## Overall Feel

Zentro should feel like a modern social platform rather than a basic CRUD application.

### Design keywords

- Minimal
- Modern
- Editorial
- Social
- Calm
- Premium
- Responsive
- Content-first

### Avoid

- Excessive gradients
- Heavy shadows
- Over-rounded everything
- Random colors
- Default browser controls
- Excessive animations
- Tiny text
- Crowded layouts
- Inconsistent button/input styles

---

# 3. Visual Identity

## Brand

**Product name:** Zentro

Zentro's visual identity should communicate:

> A focused place for people to share, discover, and interact.

## Color Philosophy

Use a neutral-first palette.

### Primary

Use a dark neutral/black for primary actions and important text.

```text
Primary       #18181B
Primary Hover #27272A
```

### Background

```text
Page Background #FAFAFA
Surface         #FFFFFF
Muted Surface   #F4F4F5
```

### Text

```text
Primary Text    #18181B
Secondary Text  #71717A
Muted Text      #A1A1AA
```

### Border

```text
Default Border  #E4E4E7
Strong Border   #D4D4D8
```

### Semantic colors

```text
Success         #16A34A
Warning         #D97706
Error           #DC2626
Info            #2563EB
```

> These values are starting design tokens. Prefer semantic Tailwind/shadcn tokens in implementation rather than scattering hex values throughout components.

---

# 4. Typography

## Font

Use **Geist** as the primary UI font.

Fallback:

```text
Geist → system-ui → sans-serif
```

Next.js should load the font through `next/font`.

## Type Scale

| Usage | Size | Weight |
|---|---:|---:|
| Page title | 30–36px | 700 |
| Section title | 22–24px | 600 |
| Card title | 17–18px | 600 |
| Body | 14–16px | 400 |
| Secondary text | 13–14px | 400 |
| Caption | 12px | 400 |
| Button | 14px | 500–600 |

### Typography rules

- Keep body text readable.
- Use font weight to establish hierarchy.
- Do not use many font sizes on one screen.
- Avoid all-caps except for small labels/badges.

---

# 5. Spacing System

Use a consistent spacing scale.

```text
4px   — micro spacing
8px   — tight spacing
12px  — small spacing
16px  — default spacing
20px  — medium spacing
24px  — section spacing
32px  — large spacing
48px  — major section spacing
64px  — page-level spacing
```

### Rule

Prefer Tailwind spacing utilities and design tokens over arbitrary values.

---

# 6. Border Radius

Use moderate rounding.

```text
sm  → 6px
md  → 8px
lg  → 12px
xl  → 16px
```

### Recommended

- Inputs: `md`
- Buttons: `md`
- Cards: `lg`
- Dialogs: `lg/xl`
- Avatar: fully circular

Avoid making every component extremely rounded.

---

# 7. Shadows

Zentro should use subtle elevation.

### Default

```text
shadow-sm
```

### Elevated

```text
shadow-md
```

Use shadows mainly for:

- Dialogs
- Dropdowns
- Popovers
- Floating elements

Cards should generally rely more on borders and spacing than heavy shadows.

---

# 8. Icons

Use **Lucide React** as the standard icon library.

Examples:

- Home → `House`
- Search → `Search`
- Notifications → `Bell`
- Profile → `User`
- Settings → `Settings`
- Like → `Heart`
- Comment → `MessageCircle`
- Share → `Share2`
- Bookmark → `Bookmark`
- More → `MoreHorizontal`
- Delete → `Trash2`
- Edit → `Pencil`
- Follow → `UserPlus`
- Back → `ArrowLeft`

## Icon rules

- Use icons consistently.
- Do not mix multiple icon libraries.
- Default icon size: `16–20px`.
- Icon-only buttons must have accessible labels/tooltips.
- Icons should support the action, not replace important text unnecessarily.

---

# 9. Buttons

Use shadcn/ui Button as the base component.

## Variants

### Primary

Used for:

- Create post
- Login
- Register
- Save profile
- Confirm important action

### Secondary

Used for:

- Cancel
- Less important actions

### Outline

Used for:

- Follow
- Secondary navigation
- Alternative actions

### Destructive

Used for:

- Delete post
- Delete comment
- Delete account

### Ghost

Used for:

- Like
- Comment
- Share
- More actions
- Toolbar actions

---

# 10. Forms

All forms should follow the same structure.

```text
Label
Input
Helper/Error message
```

## Form rules

- Use React Hook Form for complex forms.
- Use Zod for validation.
- Show validation errors close to the field.
- Use `aria-invalid` where appropriate.
- Disable submit while submitting.
- Never rely only on frontend validation.
- Backend validation remains authoritative.

## Input states

Every input should support:

```text
Default
Focus
Filled
Error
Disabled
Loading
```

---

# 11. Notifications

Use **Sonner** for transient notifications.

### Success

Examples:

```text
Profile updated successfully.
Post created successfully.
Email verified successfully.
```

### Error

Examples:

```text
Unable to update profile.
Something went wrong. Please try again.
```

### Important rule

Use inline validation for field-level problems.

Use Sonner for operation-level feedback.

Do not show the same error both inline and as a toast unless there is a strong UX reason.

---

# 12. Loading States

Avoid blank screens while data is loading.

Use:

- Skeletons for content
- Spinner for short actions
- Disabled buttons during mutations

### Example

Feed loading:

```text
Post skeleton
Post skeleton
Post skeleton
```

Button loading:

```text
[ Creating... ]
```

Do not make the whole application freeze for a small request.

---

# 13. Error States

Errors should be understandable and actionable.

### General structure

```text
[Icon]

Something went wrong

We couldn't load this content.

[ Try again ]
```

### Rules

- Never expose raw backend errors to users.
- Log technical errors separately.
- Use meaningful user-facing messages.
- Provide retry actions where appropriate.

---

# 14. Empty States

Every list-based feature should have an intentional empty state.

Examples:

## Feed

```text
No posts yet

Follow people to start building your feed.
```

## Notifications

```text
You're all caught up

New activity will appear here.
```

## Followers

```text
No followers yet
```

Empty states should not look like broken pages.

---

# 15. Authentication UI

Authentication pages:

```text
/login
/register
/forgot-password
/verify-email
```

## Layout

Desktop:

```text
┌────────────────────────────────────────────┐
│                                            │
│              Zentro                        │
│                                            │
│       ┌──────────────────────┐             │
│       │ Authentication card  │             │
│       │                      │             │
│       │ Form                 │             │
│       │                      │             │
│       └──────────────────────┘             │
│                                            │
└────────────────────────────────────────────┘
```

### Design rules

- Keep auth screens focused.
- Use generous whitespace.
- Clearly show validation errors.
- Password visibility toggle.
- Loading state on submit.
- Google Sign-In button should be visually distinct but consistent.
- Provide navigation between login/register/recovery.

---

# 16. Application Shell

After authentication, Zentro should use a persistent application layout.

Desktop:

```text
┌──────────────────────────────────────────────────────┐
│ Zentro                                Search   Avatar │
├───────────────┬───────────────────────┬──────────────┤
│ Home          │                       │              │
│ Explore       │       Main Feed       │ Suggestions  │
│ Notifications │                       │              │
│ Profile       │                       │              │
│               │                       │              │
│ + Post        │                       │              │
└───────────────┴───────────────────────┴──────────────┘
```

Mobile:

```text
┌──────────────────────┐
│ Zentro               │
├──────────────────────┤
│                      │
│       Feed           │
│                      │
├──────────────────────┤
│ Home Search Bell Me  │
└──────────────────────┘
```

---

# 17. Navigation

## Desktop

Use a left navigation/sidebar.

Primary navigation:

- Home
- Explore/Search
- Notifications
- Profile

Primary CTA:

- Create Post

## Mobile

Use bottom navigation.

Keep navigation limited to the most important destinations.

---

# 18. Feed Design

The feed is the primary product experience.

## Post Card

```text
┌────────────────────────────────────────────┐
│ Avatar  Rajat Pandey              •••      │
│         @rajatpandey · 2h                  │
│                                            │
│ This is a post on Zentro.                  │
│                                            │
│        [ optional media ]                  │
│                                            │
│ ♡ 24     💬 8      ↗ Share      🔖         │
└────────────────────────────────────────────┘
```

### Post hierarchy

1. Avatar
2. Display name
3. Username/time
4. Post content
5. Media
6. Engagement actions

### Rules

- Content is the visual priority.
- Avoid excessive card decoration.
- Preserve readable line length.
- Use subtle separators between feed items.

---

# 19. Post Composer

The composer should feel lightweight.

```text
┌─────────────────────────────────────┐
│ Avatar  What's happening?           │
│                                     │
│                                     │
│                                     │
│ 📷                         [ Post ] │
└─────────────────────────────────────┘
```

Features:

- Character count
- Image upload
- Preview
- Remove image
- Submit loading state
- Validation error

---

# 20. Like / Comment / Share Actions

Actions should be easy to scan.

Recommended:

```text
♡ Like
💬 Comment
↗ Share
🔖 Bookmark
```

Use Lucide icons instead of emoji in actual UI.

### Interaction

- Like should update immediately when safe.
- Use optimistic updates with TanStack Query where appropriate.
- Prevent duplicate requests.
- Show counts clearly.
- Preserve accessible labels.

---

# 21. Profile Page

Profile structure:

```text
┌──────────────────────────────────────┐
│              Cover                  │
│          Avatar                      │
│                                      │
│ Rajat Pandey                         │
│ @rajatpandey                         │
│ Bio                                  │
│                                      │
│ 120 Following     340 Followers      │
│                                      │
│ [ Edit Profile ]                     │
├──────────────────────────────────────┤
│ Posts | Replies | Media              │
├──────────────────────────────────────┤
│ Post                                 │
│ Post                                 │
└──────────────────────────────────────┘
```

## Profile image

Use a circular avatar with consistent sizing.

Recommended sizes:

```text
Navbar      32px
Post        40px
Profile     96–128px
```

---

# 22. Search

Search should support:

- Users
- Posts

Search UI:

```text
┌──────────────────────────────────┐
│ 🔍 Search Zentro...              │
└──────────────────────────────────┘
```

Results should be grouped clearly when multiple result types are shown.

---

# 23. Notifications

Notification item:

```text
Avatar  Rajat liked your post
        5 minutes ago
```

Types:

- Like
- Comment
- Follow

Unread notifications should have a subtle visual distinction.

Avoid aggressive notification colors.

---

# 24. Dialogs & Confirmation

Use dialogs for destructive or high-impact actions.

Examples:

- Delete post
- Delete comment
- Delete account

Example:

```text
Delete this post?

This action cannot be undone.

[Cancel] [Delete]
```

Never make destructive actions easy to trigger accidentally.

---

# 25. Responsive Design

Zentro must work at:

```text
Mobile
Tablet
Desktop
Large Desktop
```

## Breakpoint philosophy

Do not design desktop first and simply shrink it.

Important layouts should be intentionally adapted for mobile.

### Mobile rules

- Bottom navigation
- Full-width content
- Smaller spacing
- Touch-friendly controls
- Avoid hover-only interactions
- Keep important actions visible

---

# 26. Accessibility

Follow basic WCAG principles.

## Requirements

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Sufficient color contrast
- Labels for form fields
- `aria-label` for icon-only buttons
- `alt` text for meaningful images
- Do not communicate state only through color

Example:

Bad:

```text
[red circle]
```

Better:

```text
[Error icon] Invalid email address
```

---

# 27. Motion & Animation

Animation should communicate state, not decorate the UI.

Use subtle transitions:

```text
150–200ms
ease-out
```

Good uses:

- Button hover
- Like interaction
- Dropdown appearance
- Dialog opening
- Loading state

Avoid:

- Constant bouncing
- Excessive page transitions
- Long animations
- Animation that blocks interaction

Respect reduced-motion preferences.

---

# 28. Component Architecture

UI components should be reusable.

Recommended structure:

```text
src/
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── avatar.tsx
│   │   └── ...
│   │
│   ├── common/
│   │   ├── EmptyState.tsx
│   │   ├── ErrorState.tsx
│   │   └── LoadingState.tsx
│   │
│   ├── post/
│   ├── feed/
│   └── profile/
│
├── features/
│   ├── auth/
│   ├── posts/
│   ├── comments/
│   ├── likes/
│   ├── follows/
│   ├── users/
│   └── feed/
│
└── lib/
```

### Separation rule

`components/ui` should contain generic reusable UI.

Feature-specific business UI belongs inside its feature.

---

# 29. Design Tokens

Prefer centralized tokens through Tailwind/shadcn.

Conceptual token categories:

```text
--background
--foreground
--card
--card-foreground
--primary
--primary-foreground
--secondary
--secondary-foreground
--muted
--muted-foreground
--accent
--accent-foreground
--destructive
--border
--input
--ring
```

Do not hardcode unrelated colors throughout the application.

---

# 30. Dark Mode

Dark mode should be supported by the design system even if it is not implemented immediately.

Dark theme should preserve:

- Contrast
- Hierarchy
- Semantic colors
- Readability
- Border visibility

Do not simply invert colors.

---

# 31. TanStack Query UI Rules

TanStack Query is responsible for server-state management.

Use it for:

- Feed data
- Posts
- Comments
- Profile data
- Followers/following
- Notifications

UI should represent query states:

```text
isPending
isError
data
isFetching
```

For mutations:

```text
isPending
isError
isSuccess
```

Use Sonner for mutation feedback where appropriate.

---

# 32. Optimistic UI

Use optimistic updates selectively.

Good candidates:

- Like/unlike
- Follow/unfollow
- Mark notification read

Avoid optimistic updates when:

- The operation is destructive
- The server response significantly changes the data
- Rollback is difficult

Every optimistic update must have an error rollback strategy.

---

# 33. Content Rules

Zentro is content-first.

Post content:

```text
Maximum: 280 characters
```

Display:

- Preserve readable whitespace.
- Avoid extremely small text.
- Long content should wrap naturally.
- URLs should not break the layout.

---

# 34. Media Rules

Post media and profile images use Cloudinary.

UI should provide:

```text
Upload
Preview
Loading
Success
Failure
Remove
```

Images should:

- Have proper aspect handling.
- Avoid layout shift where possible.
- Use meaningful alt text.
- Show fallback states when loading fails.

---

# 35. Error Message Style

Use human-readable messages.

### Bad

```text
MongoServerError: E11000 duplicate key error
```

### Good

```text
That username is already taken.
```

### Bad

```text
Request failed with status code 409
```

### Good

```text
This action conflicts with your current account state.
```

Technical details belong in logs, not user-facing UI.

---

# 36. Toast Rules

Use Sonner when:

- A mutation succeeds
- A server operation fails
- A background operation needs feedback

Do not use toast for:

- Every form validation error
- Static information
- Content that should remain visible

### Recommended duration

Keep normal notifications short and non-blocking.

---

# 37. UI State Checklist

Every feature should consider:

```text
□ Initial state
□ Loading state
□ Success state
□ Empty state
□ Error state
□ Disabled state
□ Hover state
□ Focus state
□ Mobile state
□ Permission/authorization state
```

For destructive actions:

```text
□ Confirmation
□ Loading
□ Error
□ Success feedback
```

---

# 38. Performance Rules

UI quality includes performance.

Avoid:

- Unnecessary client components
- Large image payloads
- Repeated API requests
- Unnecessary rerenders
- Loading entire feeds at once

Prefer:

- Next.js Server Components where suitable
- TanStack Query caching
- Pagination/cursor pagination
- Optimized images
- Lazy loading where appropriate
- Stable component boundaries

---

# 39. UX Consistency Rules

If the same action appears in multiple places, it should behave the same way.

Examples:

**Follow**

```text
Follow → Following → Unfollow
```

**Like**

```text
Like → Unlike
```

**Delete**

```text
Delete → Confirmation → Loading → Success/Error
```

**Save**

```text
Save → Saving → Saved
```

---

# 40. Zentro UI Quality Bar

Before considering a screen complete, ask:

### Visual

- Does it look like a real product?
- Is spacing consistent?
- Is typography hierarchical?
- Are icons consistent?
- Are borders and shadows subtle?

### UX

- Is the main action obvious?
- Are loading and error states handled?
- Is the empty state intentional?
- Does the interaction provide feedback?

### Responsive

- Does it work on mobile?
- Are touch targets large enough?
- Does content remain readable?

### Accessibility

- Can it be used with keyboard?
- Are controls labeled?
- Is focus visible?
- Is contrast sufficient?

### Engineering

- Is reusable UI extracted?
- Are design tokens used?
- Is business logic separated from presentation?
- Is server state handled through TanStack Query?

---

# 41. Implementation Stack

Zentro UI should use:

```text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
Lucide React
Sonner
React Hook Form
Zod
TanStack Query
```

### Responsibilities

| Tool | Responsibility |
|---|---|
| Tailwind | Layout and styling |
| shadcn/ui | Reusable UI primitives |
| Lucide | Icons |
| Sonner | Toast notifications |
| React Hook Form | Form state |
| Zod | Validation |
| TanStack Query | Server state |

---

# 42. Golden Rule

> **Build the design system once, then build features using it.**

Do not create a new button, input, card, toast style, icon style, spacing pattern, or color for every feature.

Zentro should feel like **one product**, not a collection of separately designed pages.

---

## Document Change Log

### v1.0

- Initial Zentro design system
- Typography guidelines
- Color system
- Spacing system
- Component guidelines
- Authentication UI
- Feed/post UI
- Profile UI
- Responsive rules
- Accessibility rules
- Loading/error/empty states
- Notification rules
- Frontend architecture guidelines
