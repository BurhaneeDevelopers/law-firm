# LawFirm Management System - VAKIL OS

A comprehensive legal practice management application built with Next.js, designed specifically for Indian law firms and advocates. This system streamlines case management, client tracking, document handling, and includes AI-powered features for legal assistance and citation verification.

## 🚀 Features

### 📋 Case Management
- **Complete Case Tracking**: Manage cases with detailed information including case numbers, titles, types (Criminal, Divorce, Property, Civil), status tracking, and priority flags
- **Multiple Views**: Switch between table and kanban board views for flexible case organization
- **Advanced Filtering**: Search and filter cases by type, status, client, and case number
- **Status Workflow**: Track cases through stages - Active, Hearing Scheduled, Judgment Awaited, Won, Closed

### 👥 Client Management
- Comprehensive client profiles with contact information
- Link clients to multiple cases
- Track client-related documents and communications

### 📅 Calendar & Hearings
- Today's hearings dashboard with real-time status tracking
- Court room and hearing purpose tracking
- Visual timeline for daily hearings
- Upcoming deadlines with countdown indicators

### 📄 Document Management
- Upload and organize case-related documents
- Document type categorization
- Link documents to specific cases

### 📝 Legal Notices
- Generate and manage legal notices
- Template-based notice creation
- Track notice status and delivery

### 🤖 AI Legal Assistant (LexAI)
- **Powered by Google Gemini AI**: Intelligent legal research and drafting assistance
- **Context-Aware**: Use `/case [name]` or `/document [name]` for contextual queries
- **Suggested Prompts**: Quick access to common queries
- **Chat History**: Persistent conversation tracking
- **Copy & Export**: Copy AI responses or use them in legal notices

### 🛡️ AI Citation Verifier
- **Critical Feature**: Verify AI-generated legal citations against Indian court databases
- **Risk Assessment**: Get risk scores (0-100) and actionable verdicts
- **Multi-Stage Verification**:
  - Extract citations from documents
  - Cross-check with Supreme Court and High Court databases
  - Detect hallucinated or suspicious case citations
  - Generate comprehensive risk reports
- **Status Categories**: VERIFIED, SUSPICIOUS, HALLUCINATED, NOT_FOUND
- **Document Types**: Petitions, Bail Applications, Written Submissions, Legal Notices, Affidavits
- **Save & Export**: Save verification reports to cases and download as PDF
- **Dashboard Integration**: Citation health monitoring with alerts for unverified documents

### 📊 Dashboard Analytics
- Real-time statistics: Active cases, hearings, documents, citation health
- Case status breakdown with visual pie charts
- Recent activity feed
- Deadline tracking with risk indicators
- Quick action buttons for common tasks

### 🎨 Modern UI/UX
- Clean, professional interface designed for legal professionals
- Dark mode support
- Responsive design for desktop and mobile
- Smooth animations and transitions
- Toast notifications for user feedback
- Confirm dialogs for destructive actions

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI primitives
- **Charts**: Recharts
- **AI Integration**: Google Gemini AI (@google/generative-ai)
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **State Management**: Local storage with custom store utilities

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lawfirm-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and add it to your `.env.local` file

## 📁 Project Structure

```
lawfirm-app/
├── app/
│   ├── (app)/              # Main application routes
│   │   ├── dashboard/      # Dashboard page
│   │   ├── cases/          # Case management
│   │   ├── clients/        # Client management
│   │   ├── calendar/       # Calendar & hearings
│   │   ├── documents/      # Document management
│   │   ├── notices/        # Legal notices
│   │   ├── ai-assistant/   # AI chat assistant
│   │   ├── citation-check/ # Citation verification
│   │   └── settings/       # User settings
│   ├── api/                # API routes
│   │   └── gemini/         # Gemini AI integration
│   └── layout.tsx          # Root layout
├── components/
│   ├── layout/             # Layout components (sidebar, header)
│   └── ui/                 # Reusable UI components
├── lib/
│   ├── store.ts            # Main data store
│   ├── citation-store.ts   # Citation verification store
│   ├── gemini.ts           # Gemini AI client
│   ├── demo-data.ts        # Demo data for testing
│   └── utils.ts            # Utility functions
└── public/                 # Static assets
```

## 🎯 Key Features Explained

### Citation Verification Workflow
1. **Input**: Paste AI-generated legal document or upload PDF
2. **Extraction**: AI extracts all case citations from the document
3. **Verification**: Each citation is verified against Indian court databases
4. **Risk Analysis**: System generates overall risk score and verdict
5. **Report**: Detailed report with status for each citation
6. **Action**: Save to case or download PDF report

### AI Assistant Capabilities
- Summarize pending cases and hearings
- Draft legal notices and applications
- Research legal provisions and precedents
- Generate client update messages
- Answer questions about case law
- Provide legal research assistance

## 🚀 Deployment

### Deploy on Vercel

The easiest way to deploy this application is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import the project in Vercel
3. Add your environment variables (NEXT_PUBLIC_GEMINI_API_KEY)
4. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/lawfirm-app)

### Other Deployment Options
- **Netlify**: Follow [Next.js deployment guide](https://docs.netlify.com/frameworks/next-js/)
- **Self-hosted**: Build with `npm run build` and start with `npm start`

## 🔒 Security Considerations

- API keys should never be committed to version control
- Use environment variables for sensitive data
- Implement proper authentication before production use
- Add rate limiting for AI API calls
- Validate and sanitize all user inputs

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [Radix UI](https://www.radix-ui.com)
- AI powered by [Google Gemini](https://deepmind.google/technologies/gemini/)
- Icons by [Lucide](https://lucide.dev)

## 📧 Support

For support, please contact the development team or open an issue in the repository.

---

**Note**: This application includes demo data for testing purposes. In production, integrate with a proper database (PostgreSQL, MongoDB, etc.) and implement user authentication.
