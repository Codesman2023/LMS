# TechBlog - Learning Platform

A comprehensive e-learning platform built with Next.js 16, featuring blogs, courses, tutorials, user authentication, and payment integration.

## 🚀 Features

- **Blog System**: Create and manage technical blog posts
- **Course Management**: Full e-learning platform with courses, lectures, and progress tracking
- **Tutorial Library**: Organized tutorials on various programming topics
- **User Authentication**: Secure login/signup with NextAuth.js
- **Admin Dashboard**: Complete admin panel for content management
- **Payment Integration**: Razorpay integration for course purchases
- **Notes System**: Personal note-taking functionality
- **Search Functionality**: Full-text search across content
- **Dark/Light Theme**: Theme switching support
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Cloud Storage**: Cloudinary integration for media uploads
- **Email Notifications**: Automated email sending with Nodemailer

## 🛠 Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Payments**: Razorpay
- **Styling**: Tailwind CSS, Radix UI components
- **Content Processing**: Gray Matter, Rehype, Remark
- **Icons**: Lucide React, React Icons
- **Charts**: Recharts
- **Email**: Nodemailer
- **Cloud Storage**: Cloudinary

## 📁 Project Structure

```
blog/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── blog/              # Blog pages
│   ├── courses/           # Course pages
│   ├── tutorial/          # Tutorial pages
│   └── ...                # Other public pages
├── components/            # Reusable React components
│   ├── ui/               # UI components (shadcn/ui)
│   ├── admin/            # Admin-specific components
│   └── public/           # Public components
├── content/              # Markdown content files
├── db/                   # Database connection
├── lib/                  # Utility libraries
├── models/               # MongoDB schemas
└── public/               # Static assets
```

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database
- Razorpay account (for payments)
- Cloudinary account (for media uploads)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd blog
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
Create a `.env.local` file in the project root with the following variables:

```env
# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.example.mongodb.net/techblog

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Razorpay (for payments)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_public_key_here
RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here

# Cloudinary (for media uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (optional, for notifications)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🔧 Configuration

### Database Models

The application uses the following MongoDB collections:
- **User**: User accounts and profiles
- **Course**: Course information and metadata
- **Lecture**: Individual course lectures
- **Section**: Course sections grouping lectures
- **Order**: Purchase orders and transactions
- **Note**: User notes
- **Support**: Support tickets
- **CourseProgress**: User progress tracking
- **CourseFeedback**: Course reviews and ratings
- **LectureRating**: Individual lecture ratings

### Authentication

The app uses NextAuth.js with the following providers:
- Credentials (email/password)
- Email verification for new accounts

### Content Management

- **Blogs**: Markdown files in `/content` directory
- **Tutorials**: Organized tutorial content
- **Courses**: Full course management with video lectures

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@techblog.com or create an issue in this repository.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- All contributors and open-source libraries used

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
