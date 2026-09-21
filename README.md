# ☁️ CloudVault

CloudVault is a cloud-based file storage web application that allows users to securely register, log in, upload, view and manage their files using Amazon Web Services.

The project demonstrates how a web application can be deployed on AWS using Amazon EC2, Amazon S3, IAM and CloudWatch.

---

## 🚀 Features

- User Registration
- User Login
- JWT-based Authentication
- Secure Password Hashing using bcrypt
- File Upload
- File Storage using Amazon S3
- File Management
- File Delete
- Dashboard Authentication Protection
- Logout
- AWS IAM Role-based S3 Access
- CloudWatch Monitoring
- EC2 CPU Utilization Alarm

---

## 🏗️ Architecture


                 ┌─────────────────┐
                 │      User       │
                 │   Web Browser   │
                 └────────┬────────┘
                          │
                          │ HTTP / HTTPS
                          ▼
                 ┌─────────────────┐
                 │    Frontend     │
                 │ HTML/CSS/JS     │
                 └────────┬────────┘
                          │
                          ▼
              ┌─────────────────────────┐
              │      Amazon EC2         │
              │                         │
              │  Node.js + Express.js   │
              │  JWT + bcrypt           │
              │  Multer / Multer-S3     │
              └───────────┬─────────────┘
                          │
                     IAM Role
                          │
                          ▼
                 ┌─────────────────┐
                 │   Amazon S3     │
                 │                 │
                 │  cloudvault-jay │
                 │                 │
                 │  File Storage   │
                 └─────────────────┘
                          ▲
                          │
                    Monitoring
                          │
                 ┌─────────────────┐
                 │  CloudWatch     │
                 │ CPU Monitoring  │
                 │   & Alarm       │
                 └─────────────────┘

🛠️ Technologies Used

**FRONTEND**
HTML5
CSS3
JavaScript

**BACKEND**
Node.js
Express.js
JWT
bcrypt
Multer
Multer-S3

**AWS SERVICES**
Amazon EC2
Amazon S3
AWS IAM
Amazon CloudWatch

**DATA STORAGE**
JSON files for application metadata
Amazon S3 for file storage

🔐 Security

CloudVault uses multiple security mechanisms:

**JWT Authentication**

-JWT tokens are used to authenticate users after login.

-Protected APIs verify the JWT token before allowing access.

**Password Hashing**

-User passwords are hashed using bcrypt before being stored.

-Plain-text passwords are not stored.

**IAM Role**

-The EC2 instance uses an IAM Role to access the S3 bucket.

-AWS Access Keys are not stored inside the application.

-The IAM role provides limited S3 permissions:

s3:ListBucket

s3:GetObject

s3:PutObject

s3:DeleteObject

☁️ AWS Infrastructure

**Amazon EC2**

-EC2 hosts the CloudVault Node.js/Express backend application.

**Amazon S3**

-S3 is used as the cloud storage service for uploaded files.

**AWS IAM**

-IAM controls what the EC2 instance is allowed to do with the S3 bucket.

**Amazon CloudWatch**

-CloudWatch monitors the EC2 instance.

-A CPU utilization alarm was configured to monitor high CPU usage.


📁 Project Structure

CloudVault/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── data/
│   │   ├── users.json
│   │   └── files.json
│   └── uploads/
│
├── css/
│   └── style.css
│
├── index.html
├── register.html
├── login.html
├── dashboard.html
├── upload.html
├── script.js
│
└── README.md

🔄 How CloudVault Works

1.User opens the CloudVault website.

2.User registers an account.

3.Password is hashed using bcrypt.

4.User logs in.

5.Backend generates a JWT token.

6.JWT is used to access protected APIs.

7.User uploads a file.

8.Node.js/Express receives the file.

9.Multer/Multer-S3 handles the upload.

10.File is stored in Amazon S3.

11.EC2 accesses S3 using its IAM Role.

12.CloudWatch monitors the EC2 instance.


▶️ Running the Project Locally

1. Clone the repository
  git clone https://github.com/JaySanakare7/CloudVault.git

2. Open the project
  cd CloudVault

3. Install backend dependencies
   cd backend
   npm install

4. Start the backend
   node server.js

  The backend runs on:
    http://localhost:3000

5. Open the frontend

Open the frontend using VS Code Live Server or another local web server.


🌐 AWS Deployment

The backend is deployed on an Amazon EC2 instance.

Amazon S3 is used for cloud file storage.

The EC2 instance accesses S3 through an IAM Role instead of storing AWS credentials inside the application.



📊 Monitoring

Amazon CloudWatch is used to monitor EC2 CPU utilization.

Example alarm:

Metric: CPU Utilization

Statistic: Average

Period: 5 minutes

Threshold: > 70%


🎯 Project Objective

The main objective of CloudVault is to understand how a real-world web application can be deployed and connected with AWS cloud services.

The project provides practical experience with:

Cloud deployment
EC2
S3
IAM
CloudWatch
REST APIs
Authentication
File handling
Cloud storage


⭐ Future Improvements
Amazon RDS / DynamoDB for database storage

File sharing using secure links

Presigned S3 URLs

Docker deployment

Advanced monitoring

Improved UI/UX

File search and filtering


👨‍💻 Author

Jay Sanakare

Computer Engineering Student
