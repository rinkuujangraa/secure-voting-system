# Secure Online Voting System

A comprehensive, production-ready secure online voting platform built with Next.js 14, featuring role-based access control, end-to-end encryption, and real-time results.

## 🚀 Features

### Security Features
- **AES-256-CBC Encryption**: All votes are encrypted before storage
- **JWT Authentication**: Secure token-based authentication with HTTP-only cookies
- **Role-Based Access Control (RBAC)**: Separate user and admin interfaces
- **Duplicate Vote Prevention**: Database-level constraints and backend validation
- **Input Validation**: Comprehensive Zod validation on all endpoints
- **Secure Middleware**: Route protection and authentication verification

### User Panel
- **Dashboard**: Overview of active and upcoming elections
- **Election Browsing**: Search and filter available elections
- **Secure Voting**: Encrypted vote casting with confirmation
- **Real-time Results**: Live result viewing for active elections
- **Vote History**: Track participation status

### Admin Panel
- **Election Management**: Create, start, stop, and delete elections
- **Candidate Management**: Add and manage candidates for elections
- **Real-time Analytics**: Detailed voting statistics and turnout data
- **Results Dashboard**: Comprehensive result analysis and export
- **System Monitoring**: Election status and health monitoring

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with HTTP-only cookies, bcrypt password hashing
- **Encryption**: AES-256-CBC for vote data
- **Validation**: Zod schema validation
- **UI Components**: Lucide React icons, custom Tailwind components

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd secure-voting-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/voting-system
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-32-chars-minimum
   ENCRYPTION_KEY=12345678901234567890123456789012
   NEXTAUTH_URL=http://localhost:3000
   NODE_ENV=development
   ```

4. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas (update MONGODB_URI)
   ```

5. **Run the application**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open http://localhost:3000
   - Register as admin or user
   - Start creating elections!

## 🗄️ Database Models

### User
```typescript
{
  name: string,
  email: string,
  password: string, // bcrypt hashed
  role: "user" | "admin",
  hasVoted: boolean
}
```

### Election
```typescript
{
  title: string,
  description: string,
  startDate: Date,
  endDate: Date,
  status: "upcoming" | "active" | "completed"
}
```

### Candidate
```typescript
{
  name: string,
  party: string,
  electionId: ObjectId,
  voteCount: number
}
```

### Vote
```typescript
{
  voterId: ObjectId,
  electionId: ObjectId,
  candidateId: ObjectId,
  encryptedVote: string // AES-256-CBC encrypted
}
```

## 🔐 Security Architecture

### Authentication Flow
1. User registers/logs in with email and password
2. Password is hashed using bcrypt (salt rounds: 12)
3. JWT token is generated and stored in HTTP-only cookie
4. Middleware validates token on each protected request
5. Role-based routing prevents unauthorized access

### Vote Encryption
1. User selects candidate in UI
2. Candidate ID is encrypted using AES-256-CBC
3. Encrypted vote is stored in database
4. Vote counting uses encrypted data
5. Results are calculated without exposing individual votes

### Duplicate Vote Prevention
1. Database compound unique index on (voterId + electionId)
2. Backend validation checks existing votes
3. Atomic transactions ensure data consistency
4. User hasVoted flag provides additional protection

## 📁 Project Structure

```
├── app/
│   ├── (admin)/admin/          # Admin-only pages
│   │   ├── dashboard/
│   │   ├── elections/
│   │   ├── candidates/
│   │   └── results/
│   ├── (user)/user/            # User pages
│   │   ├── dashboard/
│   │   ├── elections/
│   │   ├── vote/
│   │   └── results/
│   ├── api/                    # API routes
│   │   ├── auth/
│   │   ├── admin/
│   │   ├── elections/
│   │   ├── candidates/
│   │   ├── vote/
│   │   └── results/
│   ├── login/
│   ├── register/
│   ├── layout.tsx
│   └── page.tsx
├── components/                 # Reusable UI components
├── lib/                       # Utility functions
│   ├── mongodb.ts
│   ├── jwt.ts
│   ├── encryption.ts
│   ├── validations.ts
│   └── response.ts
├── models/                    # Mongoose models
│   ├── User.ts
│   ├── Election.ts
│   ├── Candidate.ts
│   └── Vote.ts
└── middleware.ts              # Next.js middleware
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `DELETE /api/auth/login` - User logout

### User Endpoints
- `GET /api/elections` - Get available elections
- `GET /api/candidates?electionId=` - Get election candidates
- `POST /api/vote` - Cast encrypted vote
- `GET /api/results?electionId=` - Get election results

### Admin Endpoints
- `POST /api/admin/elections` - Create election
- `GET /api/admin/elections` - Get all elections
- `PUT /api/admin/elections/[id]` - Update election
- `DELETE /api/admin/elections/[id]` - Delete election
- `POST /api/admin/candidates` - Add candidate
- `DELETE /api/admin/candidates/[id]` - Delete candidate
- `GET /api/admin/results?electionId=` - Get detailed results

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Environment Variables**
   Set in Vercel dashboard:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/voting
   JWT_SECRET=production-jwt-secret-32-characters-minimum
   ENCRYPTION_KEY=production-encryption-key-exactly-32-chars
   NEXTAUTH_URL=https://your-domain.vercel.app
   NODE_ENV=production
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### MongoDB Atlas Setup

1. Create MongoDB Atlas account
2. Create new cluster
3. Add database user
4. Whitelist IP addresses
5. Get connection string
6. Update MONGODB_URI in environment

## 🧪 Testing

### Manual Testing Checklist

**Authentication**
- [ ] User registration works
- [ ] Login/logout functionality
- [ ] Role-based redirections
- [ ] JWT token validation

**User Features**
- [ ] Dashboard loads correctly
- [ ] Elections list and filtering
- [ ] Vote casting (once per election)
- [ ] Results viewing
- [ ] Duplicate vote prevention

**Admin Features**
- [ ] Election creation/management
- [ ] Candidate addition/removal
- [ ] Election start/stop functionality
- [ ] Detailed analytics
- [ ] Results export

**Security**
- [ ] Unauthorized access prevention
- [ ] Vote encryption/decryption
- [ ] Input validation
- [ ] XSS protection

## 📊 Production Considerations

### Performance
- Database indexing on frequently queried fields
- Connection pooling for MongoDB
- Optimized API responses
- Image optimization with Next.js

### Security
- Rate limiting (implement with middleware)
- CORS configuration
- Content Security Policy headers
- Input sanitization
- Audit logging

### Monitoring
- Error tracking (Sentry integration)
- Performance monitoring
- Database query optimization
- User activity logging

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔒 Security Disclosure

If you discover a security vulnerability, please send an email to security@votingsystem.com. All security vulnerabilities will be promptly addressed.

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Email: support@votingsystem.com
- Documentation: [Project Wiki]

---

**Built with ❤️ using Next.js 14, TypeScript, and modern security practices.**