# PlacementPrep
> A Placement-Oriented AI Learning Management System bridging the gap between academia and corporate expectations.

##  Features

**Learning Module**
- Role-based access for Admins, Instructors, and Students.
- Video-based course delivery with structured, sequential modules.
- Topic-level quizzes to unlock progressive content.

**AI Mock Test Engine**
- Dynamic, adaptive mock test generation using Google Generative AI.
- Covers Quantitative Aptitude, Logical Reasoning, Verbal, and Coding Logic.

**Company-Based Tests**
- Tailored mock exams mimicking real corporate placement patterns.
- Standardized templates for companies like TCS, Infosys, and Accenture.

**Resume Analyzer**
- AI-assisted PDF resume evaluation.
- Provides actionable scoring and personalized improvement suggestions.

**Career Recommendations**
- AI-driven suggestions for remedial courses and topics to revise.
- Career path mapping based on historical mock test performance.

**Analytics Dashboard**
- Interactive visual tracking using Recharts.
- Granular performance profiling and week-over-week improvement metrics.

##  Key Highlights

- **Placement-Focused LMS:** Uniquely designed to target campus recruitment patterns rather than general academics.
- **AI + Analytics Integration:** Leverages generative AI to personalize the learning journey and dynamically generate content.
- **Adaptive Testing:** Moving beyond static question banks to provide a tailored, responsive examination experience.
- **Resume Scoring:** Actionable feedback on resumes to ensure students are corporate-ready before the interview phase.

##  Tech Stack

**Frontend**
- Next.js (App Router)
- TypeScript
- Tailwind CSS

**Backend**
- Node.js
- Express.js

**Database**
- MongoDB (Mongoose)

**Authentication**
- JWT-based Auth
- bcryptjs for password hashing

##  Folder Structure

**Frontend (`/client`)**
- `app/`: Next.js App Router pages (Dashboards, Tests, Authentication).
- `components/`: Reusable UI components and layouts.
- `context/`: React context providers (e.g., AuthContext).
- `lib/`: Utility functions and API configurations.

**Backend (`/server`)**
- `src/controllers/`: Business logic for API endpoints.
- `src/models/`: Mongoose database schemas.
- `src/routes/`: Express route definitions.
- `src/middleware/`: Authentication and file upload middlewares.
- `src/utils/`: Helper functions (e.g., email dispatch, AI integration).

##  Installation & Setup

1. **Clone repo**
   ```bash
   git clone https://github.com/yourusername/placementprep.git
   cd placementprep
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Setup environment variables**
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_google_gemini_api_key
   FRONTEND_URL=http://localhost:3000
   ```
   Create a `.env.local` file in the `client` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Run frontend & backend**
   ```bash
   # In the server directory
   npm run dev

   # In the client directory
   npm run dev
   ```

## Deployment

- **Frontend:** Deployed seamlessly on Vercel.
- **Backend:** Hosted on Render for reliable Node.js execution.
- **Database:** Managed via MongoDB Atlas for scalable cloud storage.

##  Authentication

The platform utilizes a secure, stateless JWT-based login system. Upon successful login, the server generates a JSON Web Token which is stored securely on the client. This token is attached to the `Authorization` header of all subsequent API requests to verify the user's role (Admin, Instructor, or Student) and grant access to protected routes.

##  System Architecture

The architecture follows a standard decoupled full-stack pattern:
1. **Frontend (Next.js):** Renders the UI and captures user interactions.
2. **API:** Sends HTTP requests carrying JWT payloads.
3. **Backend (Express):** Validates the token, processes business logic, and communicates with AI models.
4. **DB (MongoDB):** Retrieves or updates persistent records.
5. **Response:** The backend returns formatted JSON data, which the frontend visualizes on the dashboard.

##  Screenshots
![Resume Analyzer](assets/images/Resumeanalyzerresults.png)
![company pattern](assets/images/companypatterns.png)
![Ai Mock Tests](assets/images/aimock.png)
![Questions](assets/images/questionbank.png)

- *[Placeholder: Mock Test Interface]*
- *[Placeholder: Resume Analyzer Results]*

##  Future Improvements

- **Real Coding Environment:** Integration of an interactive code execution sandbox (e.g., Judge0) for live algorithmic testing.
- **Advanced AI Models:** Upgrading to multi-modal AI for analyzing student video interviews.
- **Company Integrations:** Direct ATS (Applicant Tracking System) API integrations to forward high-performing student profiles to recruiters.

