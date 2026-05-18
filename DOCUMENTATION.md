# ApexForge Gym Platform — System Documentation

This document describes the **ApexForge Gym** web application: a modern, fully responsive gym and fitness platform. It covers purpose, architecture, actors, and behavioral models using standard diagrams.

---

## 1. Project Overview

| Item | Description |
|------|-------------|
| **Name** | ApexForge Gym Platform |
| **Type** | Full-stack web application |
| **Frontend** | HTML, CSS, Vanilla JavaScript (static pages in `client/public`) |
| **Backend** | Node.js, Express.js REST API |
| **Database** | MongoDB with Mongoose ODM |
| **Auth** | JWT (JSON Web Tokens) + bcrypt password hashing |
| **Default URL** | `http://localhost:5000` |

### Main capabilities

- User registration, login, password reset, and profile management
- Membership plan browsing and subscription
- BMI calculator with personalized advice and history (logged-in users)
- Trainer directory, subscription, and personalized “check plans” (machines + nutrition)
- Gym machine catalog with search and filters
- Supplement shop: browse, wishlist, cart, and checkout
- Contact form and newsletter subscription
- Admin dashboard: stats, users, orders, and CRUD for plans, trainers, supplements, and machines

### Pages (client)

| Page | Path | Purpose |
|------|------|---------|
| Home | `/index.html` | Landing, stats, newsletter |
| Plans | `/plans.html` | Membership tiers |
| BMI | `/bmi.html` | BMI calculator |
| Trainers | `/trainers.html` | Trainer listings and booking |
| Machines | `/machines.html` | Equipment catalog |
| Supplements | `/supplements.html` | Product shop and cart |
| Auth | `/auth.html` | Login, register, forgot/reset password |
| Profile | `/profile.html` | User dashboard |
| Admin | `/admin.html` | Admin panel |
| Contact | `/contact.html` | Contact form |

---

## 2. Context Diagram

A **context diagram** (Level 0 DFD) shows the system as one process and its interactions with external entities.

```mermaid
flowchart LR
    subgraph External["External Entities"]
        Visitor["Visitor / Guest"]
        Member["Registered Member"]
        Admin["Administrator"]
        MongoDB[("MongoDB Database")]
    end

    subgraph System["ApexForge Gym Platform"]
        WebApp["Web Client\n(HTML/CSS/JS)"]
        API["Express REST API\n+ JWT Auth"]
    end

    Visitor -->|"Browse catalog, BMI,\ncontact, newsletter"| WebApp
    Member -->|"Login, profile, cart,\norders, subscriptions"| WebApp
    Admin -->|"Manage content &\nview analytics"| WebApp

    WebApp <-->|"HTTP / JSON"| API
    API <-->|"Read / Write"| MongoDB
```

**Boundary:** Everything inside the box is the ApexForge system. Visitors use public features without authentication; members and admins use protected API routes via JWT.

---

## 3. Use Case Diagram

Actors and their primary use cases.

```mermaid
flowchart TB
    subgraph Actors
        Guest((Guest))
        User((Member))
        Admin((Admin))
    end

    subgraph Public["Public Use Cases"]
        UC1[Browse Home & Content]
        UC2[View Membership Plans]
        UC3[Calculate BMI]
        UC4[Browse Trainers]
        UC5[Browse Machines]
        UC6[Browse Supplements]
        UC7[Submit Contact Form]
        UC8[Subscribe to Newsletter]
    end

    subgraph Auth["Authentication"]
        UC9[Register Account]
        UC10[Login]
        UC11[Forgot Password]
        UC12[Reset Password]
    end

    subgraph Member["Member Use Cases"]
        UC13[View Profile]
        UC14[Subscribe to Membership Plan]
        UC15[Save BMI History]
        UC16[Subscribe to Trainer]
        UC17[Manage Wishlist]
        UC18[Manage Cart]
        UC19[Checkout Order]
        UC20[View Order History]
    end

    subgraph AdminUC["Admin Use Cases"]
        UC21[View Dashboard Stats]
        UC22[Manage Users & Orders]
        UC23[CRUD Plans]
        UC24[CRUD Trainers]
        UC25[CRUD Supplements]
        UC26[CRUD Machines]
    end

    Guest --> UC1 & UC2 & UC3 & UC4 & UC5 & UC6 & UC7 & UC8
    Guest --> UC9 & UC10 & UC11

    User --> UC10 & UC12 & UC13 & UC14 & UC15 & UC16 & UC17 & UC18 & UC19 & UC20
    User -.->|extends| UC3 & UC4 & UC5 & UC6

    Admin --> UC21 & UC22 & UC23 & UC24 & UC25 & UC26
    Admin -.->|inherits| User
```

### Use case summary

| ID | Use case | Actor | API / Notes |
|----|----------|-------|-------------|
| UC9 | Register | Guest | `POST /api/auth/register` |
| UC10 | Login | Guest, Member, Admin | `POST /api/auth/login` |
| UC14 | Subscribe to plan | Member | `POST /api/plans/subscribe` |
| UC15 | Save BMI | Member | `POST /api/auth/bmi` |
| UC16 | Subscribe to trainer | Member | `POST /api/trainers/subscribe` |
| UC18–19 | Cart & checkout | Member | `/api/cart/*`, `POST /api/orders/create` |
| UC21–26 | Admin operations | Admin | `/api/admin/*` (requires `role: admin`) |

---

## 4. Activity Diagrams

### 4.1 User registration and login

```mermaid
flowchart TD
    Start([Start]) --> Choice{Action?}

    Choice -->|Register| R1[Fill registration form]
    R1 --> R2{Password strong?}
    R2 -->|No| R3[Show strength feedback]
    R3 --> R1
    R2 -->|Yes| R4[POST /api/auth/register]
    R4 --> R5{Valid & unique email?}
    R5 -->|No| R6[Show error toast]
    R6 --> R1
    R5 -->|Yes| R7[Hash password, save User]
    R7 --> R8[Return JWT + user]
    R8 --> R9[Store token in localStorage]
    R9 --> Profile[/Redirect to profile.html/]

    Choice -->|Login| L1[Fill login form]
    L1 --> L2[POST /api/auth/login]
    L2 --> L3{Credentials valid?}
    L3 -->|No| L4[Show error]
    L4 --> L1
    L3 -->|Yes| L5[Issue JWT]
    L5 --> L6[Store session]
    L6 --> L7{Role admin?}
    L7 -->|Yes| Admin[/admin.html/]
    L7 -->|No| Profile

    Choice -->|Forgot password| F1[Submit email]
    F1 --> F2[Generate reset token]
    F2 --> F3[Return reset code - dev mode]
    F3 --> F4[Submit new password + code]
    F4 --> F5[POST /api/auth/reset-password]
    F5 --> Profile

    Profile --> End([End])
    Admin --> End
```

### 4.2 Supplement purchase flow

```mermaid
flowchart TD
    Start([Member on supplements page]) --> Browse[Search / filter products]
    Browse --> Select{Action?}

    Select -->|Add to cart| Auth1{Logged in?}
    Auth1 -->|No| Login[/Redirect to auth.html/]
    Auth1 -->|Yes| Add[POST /api/cart/add]
    Add --> CartPanel[Open cart panel]

    Select -->|Wishlist| Auth2{Logged in?}
    Auth2 -->|No| Login
    Auth2 -->|Yes| Wish[POST /api/supplements/wishlist]

    CartPanel --> Review[Review items & total]
    Review --> Checkout[POST /api/orders/create]
    Checkout --> Order[Create Order, clear cart]
    Order --> Toast[Show confirmation]
    Toast --> History[Visible in profile order history]
    History --> End([End])
```

### 4.3 Trainer subscription flow

```mermaid
flowchart TD
    Start([Member opens trainers page]) --> List[GET /api/trainers]
    List --> Filter[Optional specialty filter]
    Filter --> Card[Select trainer card]
    Card --> Modal[Open booking modal]
    Modal --> Plan[View Trainer Check Plan preview]
    Plan --> Form[Choose date + notes]
    Form --> Auth{Logged in?}
    Auth -->|No| Login[/auth.html/]
    Auth -->|Yes| Sub[POST /api/trainers/subscribe]
    Sub --> Save[Save trainerSubscriptions on User]
    Save --> Copy[Copy trainer checkPlan to user profile]
    Copy --> Profile[View on profile.html]
    Profile --> End([End])
```

---

## 5. Sequence Diagrams

### 5.1 Login (authentication)

```mermaid
sequenceDiagram
    actor User
    participant Browser as Web Client (app.js)
    participant API as Express API
    participant Auth as authController
    participant DB as MongoDB (User)

    User->>Browser: Submit login form
    Browser->>API: POST /api/auth/login { email, password }
    API->>Auth: login(req, res)
    Auth->>DB: User.findOne({ email }).select(+password)
    DB-->>Auth: user document
    Auth->>Auth: comparePassword(password)
    alt Invalid credentials
        Auth-->>Browser: 401 { message }
        Browser-->>User: Error toast
    else Valid
        Auth->>Auth: jwt.sign({ id }, JWT_SECRET)
        Auth-->>Browser: 200 { token, user }
        Browser->>Browser: localStorage.setItem(token, user)
        Browser-->>User: Redirect profile or admin
    end
```

### 5.2 Protected request (e.g. profile)

```mermaid
sequenceDiagram
    actor User
    participant Browser as Web Client
    participant API as Express API
    participant MW as protect middleware
    participant Auth as authController
    participant DB as MongoDB

    User->>Browser: Open profile.html
    Browser->>API: GET /api/auth/profile<br/>Authorization: Bearer {token}
    API->>MW: protect(req, res, next)
    MW->>MW: jwt.verify(token)
    MW->>DB: User.findById(decoded.id)
    DB-->>MW: req.user
    MW->>Auth: profile(req, res)
    Auth->>DB: populate plan, wishlist, subscriptions
    DB-->>Auth: full user profile
    Auth-->>Browser: 200 user JSON
    Browser-->>User: Render profile cards
```

### 5.3 Add to cart and checkout

```mermaid
sequenceDiagram
    actor Member
    participant Browser as Web Client
    participant CartAPI as cartRoutes / cartController
    participant OrderAPI as orderRoutes / orderController
    participant DB as MongoDB

    Member->>Browser: Click Add to Cart
    Browser->>CartAPI: POST /api/cart/add { productId, quantity }
    CartAPI->>DB: Find/create Cart for user
    CartAPI->>DB: Push/update cart item, recalc totalPrice
    DB-->>CartAPI: updated cart
    CartAPI-->>Browser: 200 cart

    Member->>Browser: Click Checkout
    Browser->>OrderAPI: POST /api/orders/create
    OrderAPI->>DB: Load Cart + Supplement details
    OrderAPI->>DB: Create Order document
    OrderAPI->>DB: Clear cart products
    DB-->>OrderAPI: order
    OrderAPI-->>Browser: 200 { total, order }
    Browser-->>Member: Toast confirmation
```

### 5.4 Admin CRUD (example: create supplement)

```mermaid
sequenceDiagram
    actor Admin
    participant Browser as Web Client
    participant API as /api/admin
    participant MW as protect + adminOnly
    participant AdminCtrl as adminController
    participant DB as MongoDB

    Admin->>Browser: Submit new supplement form
    Browser->>API: POST /api/admin/supplements<br/>Bearer token
    API->>MW: Verify JWT & role === admin
    alt Not admin
        MW-->>Browser: 403 Forbidden
    else Admin
        MW->>AdminCtrl: createSupplement()
        AdminCtrl->>DB: Supplement.create(data)
        DB-->>AdminCtrl: new supplement
        AdminCtrl-->>Browser: 201 supplement
        Browser-->>Admin: Refresh admin UI
    end
```

---

## 6. Class Diagram

Domain models (Mongoose schemas) and main server components.

```mermaid
classDiagram
    class User {
        +String fullName
        +String email
        +String password
        +Number age
        +String gender
        +ObjectId selectedMembershipPlan
        +String subscriptionStatus
        +BmiEntry[] bmiHistory
        +ObjectId[] favoriteTrainers
        +TrainerSubscription[] trainerSubscriptions
        +ObjectId[] wishlist
        +String role
        +comparePassword(candidate) bool
    }

    class BmiEntry {
        +Number bmi
        +String category
        +Number height
        +Number weight
        +Date createdAt
    }

    class TrainerSubscription {
        +ObjectId trainer
        +String trainerName
        +String date
        +String status
        +CheckPlan plan
    }

    class Plan {
        +String name
        +Number price
        +String[] features
        +String duration
        +Number activeSubscribersCount
        +Boolean highlighted
    }

    class Trainer {
        +String name
        +String specialty
        +Number experience
        +Number rating
        +String[] availableSchedule
        +CheckPlan checkPlan
        +Booking[] bookings
    }

    class Booking {
        +ObjectId user
        +String date
        +String notes
        +String status
    }

    class CheckPlan {
        +String title
        +String summary
        +Exercise[] machines
        +Food[] foods
    }

    class Machine {
        +String name
        +String category
        +String muscleGroup
        +Number quantity
        +String status
        +String[] specs
    }

    class Supplement {
        +String name
        +String category
        +Number price
        +Number rating
        +Number stockQuantity
    }

    class Cart {
        +ObjectId user
        +CartItem[] products
        +Number totalPrice
    }

    class CartItem {
        +ObjectId product
        +Number quantity
    }

    class Order {
        +ObjectId user
        +Object userInfo
        +PurchasedProduct[] purchasedProducts
        +ObjectId selectedPlan
        +String paymentStatus
        +Number total
    }

    class Contact {
        +String name
        +String email
        +String phone
        +String message
    }

    class Newsletter {
        +String email
    }

  class AuthController {
        +register()
        +login()
        +forgotPassword()
        +resetPassword()
        +profile()
        +saveBmi()
    }

    class AuthMiddleware {
        +protect()
        +adminOnly()
    }

    User "1" --> "*" BmiEntry : embeds
    User "1" --> "*" TrainerSubscription : embeds
    User "0..1" --> "1" Plan : subscribes
    User "1" --> "*" Supplement : wishlist
    User "1" --> "0..1" Cart : owns
    User "1" --> "*" Order : places
    Cart "1" --> "*" CartItem : contains
    CartItem --> Supplement : references
    Order --> Supplement : purchasedProducts
    Trainer "1" --> "*" Booking : has
    Booking --> User : references
    Trainer --> CheckPlan : embeds
    TrainerSubscription --> CheckPlan : copies

    AuthController ..> User : uses
    AuthMiddleware ..> User : loads
```

### API route map (logical layer)

| Module | Base path | Auth |
|--------|-----------|------|
| Auth | `/api/auth` | Mixed |
| Plans | `/api/plans` | Subscribe: protected |
| Trainers | `/api/trainers` | Subscribe: protected |
| Supplements | `/api/supplements` | Wishlist: protected |
| Machines | `/api/machines` | Public read |
| Cart | `/api/cart` | Protected |
| Orders | `/api/orders` | Protected |
| Contact | `/api/contact` | Public |
| Newsletter | `/api/newsletter` | Public |
| Admin | `/api/admin` | Protected + admin |

---

## 7. System Architecture

```mermaid
flowchart TB
    subgraph Client["Presentation Layer"]
        HTML[Static HTML Pages]
        JS[app.js - API client, UI state]
        CSS[styles.css - responsive layout]
    end

    subgraph Server["Application Layer"]
        Express[Express Server]
        Routes[Routes]
        Controllers[Controllers]
        Middleware[auth.js - JWT protect / adminOnly]
        Utils[asyncHandler, passwordStrength]
    end

    subgraph Data["Data Layer"]
        Mongoose[Mongoose Models]
        Mongo[(MongoDB)]
    end

    HTML --> JS
    JS -->|fetch JSON + JWT| Express
    Express --> Routes --> Controllers --> Middleware
    Controllers --> Mongoose --> Mongo
    Express -->|express.static| HTML
```

### Security model

1. Passwords hashed with **bcrypt** (12 rounds) on `User` pre-save.
2. **JWT** issued on login/register/reset; sent as `Authorization: Bearer <token>`.
3. `protect` middleware validates token and attaches `req.user`.
4. `adminOnly` restricts admin routes to `role: 'admin'`.
5. Client stores token in `localStorage` (`app.js` state).

---

## 8. Data Flow Summary

| User action | Client | Server | Persistence |
|-------------|--------|--------|-------------|
| Register | `POST /auth/register` | Hash password, create User | `users` |
| Login | `POST /auth/login` | Verify, return JWT | — |
| Choose plan | `POST /plans/subscribe` | Link plan to user | `users`, `plans` |
| BMI save | `POST /auth/bmi` | Push to `bmiHistory` | `users` |
| Trainer subscribe | `POST /trainers/subscribe` | Embed subscription + booking | `users`, `trainers` |
| Add to cart | `POST /cart/add` | Upsert cart line | `carts` |
| Checkout | `POST /orders/create` | Order from cart | `orders`, `carts` |
| Contact | `POST /contact` | Save message | `contacts` |
| Newsletter | `POST /newsletter/subscribe` | Save email | `newsletters` |

---

## 9. Environment & Deployment Notes

| Variable | Purpose |
|----------|---------|
| `PORT` | Server port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Token signing secret |
| `CLIENT_URL` | CORS origin |

**Run:** `npm install` → configure `.env` → `npm run seed` → `npm run dev`

**Seeded admin:** `admin@apexforge.test` / `Admin123!`

---

## 10. Diagram Index

| Diagram | Section | Purpose |
|---------|---------|---------|
| Context diagram | §2 | System boundary and external actors |
| Use case diagram | §3 | Functional requirements by actor |
| Activity diagrams | §4 | Workflows: auth, shop, trainers |
| Sequence diagrams | §5 | Message order between components |
| Class diagram | §6 | Domain model and relationships |
| Architecture diagram | §7 | Layered structure |

---

*Generated for the ApexForge Gym Platform codebase. Diagrams use [Mermaid](https://mermaid.js.org/) syntax and render in GitHub, GitLab, VS Code (with extension), and many Markdown viewers.*
