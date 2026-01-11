# 🌱 AgriNXT

**Next-Generation Agricultural Management Platform**

![AgriNXT Banner](https://placehold.co/1200x400/2ecc71/ffffff?text=AgriNXT+Platform)

## 📖 About The Project

**AgriNXT** is a comprehensive full-stack platform designed to modernize the agricultural supply chain. It bridges the gap between farmers and buyers while providing administrators with powerful tools to manage logistics, pricing, and operations.

### ❓ Why AgriNXT?
Traditional agricultural markets suffer from opacity, inefficient logistics, and lack of fair pricing. AgriNXT solves this by:
- **Digitizing Transactions**: Eliminating paper trails and manual errors.
- **Optimizing Logistics**: Smart route planning for collections and deliveries.
- **Transparent Pricing**: Fair, zone-based pricing models for farmers and buyers.
- **Validation & Security**: Strict verification processes for all participants.

---

## ✨ Key Features

### 👨‍💼 Admin Portal
The command center for platform operations:
- **Dashboard & Analytics**: AI-powered insights (Gemini) on profitability and trends.
- **User Management**: Approve/Reject farmer and buyer registrations.
- **Logistics**: Visual route planning and zone mapping.
- **Finance**: Automated invoice generation and payment tracking.
- **Content Management**: Manage vegetable inputs and daily pricing.

### 👨‍🌾 Farmer Portal
Empowering creators of produce:
- **Easy Onboarding**: Simple mobile-friendly registration.
- **Notifications**: WhatsApp updates for collection confirmations (Twilio).
- **Transparency**: View daily prices and payment history.

### 🛒 Buyer Portal
Streamlining procurement:
- **Order Management**: Track orders and delivery status.
- **Route Tracking**: View delivery routes in real-time.
- **Digital Invoicing**: Access and download verified invoices.

---

## 🛠️ Tech Stack

This project uses a modern, robust architecture ensuring scalability and performance:

| Component | Technology |
|-----------|------------|
| **Frontend** | React, Vite, TailwindCSS, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL, Prisma ORM |
| **Authentication** | JWT (JSON Web Tokens), BCrypt |
| **AI Integration** | Google Gemini API |
| **Notifications** | Twilio (WhatsApp/SMS) |
| **DevOps** | Docker, Docker Compose |
| **Deployment** | Render (Cloud / Static Sites) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- Git

### 🔧 Installation (Local Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/sanjaysunil14/AgriNXT.git
   cd AgriNXT
   ```

2. **Setup Environment Variables**
   Create `.env` files in both `backend/` and `frontend/` directories (see `.env.example`).

3. **Run with Docker (Recommended)**
   ```bash
   docker-compose up --build
   ```
   This will start:
   - Backend API: `http://localhost:5000`
   - Frontend App: `http://localhost:5173`
   - PostgreSQL DB: `localhost:5432`

4. **Run Manually**
   *Backend:*
   ```bash
   cd backend
   npm install
   npx prisma migrate dev
   npm run seed  # Creates Super Admin (9999999999 / admin)
   npm start
   ```
   *Frontend:*
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## ☁️ Deployment

This project is configured for automated deployment on **Render.com**.

- **Backend**: Deployed as a Dockerized Web Service.
- **Frontend**: Deployed as a Static Site.
- **Database**: Managed PostgreSQL on Render.

**Live Demo**: [https://agrinxt-frontend.onrender.com](https://agrinxt-frontend.onrender.com)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Built with 💚 for the future of farming.**
