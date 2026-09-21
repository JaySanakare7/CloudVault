const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const multerS3 = require("multer-s3");
const {
  S3Client,
  GetObjectCommand
} = require("@aws-sdk/client-s3");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const {
  GetObjectCommand,
  DeleteObjectCommand
} = require("@aws-sdk/client-s3");
const crypto = require("crypto");
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'cloudvault-secret-key';

const projectRoot = path.join(__dirname, '..');
const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'uploads');
const usersFile = path.join(dataDir, 'users.json');
const filesFile = path.join(dataDir, 'files.json');

fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });

function loadJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) {
      return fallback;
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

let users = loadJson(usersFile, []);
let files = loadJson(filesFile, []);



const s3 = new S3Client({
  region: "ap-south-1"
});

const storage = multerS3({
  s3: s3,
  bucket: "cloudvault-jay",
  key: function (req, file, cb) {
    const uniqueName =
      `uploads/${Date.now()}-${crypto.randomBytes(6).toString("hex")}-${file.originalname}`;

    cb(null, uniqueName);
  }
});


const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(projectRoot));

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      fullname: user.fullname
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access token is required.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CloudVault API is running.' });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({ message: 'fullname, email, and password are required.' });
    }

    const emailLower = email.toLowerCase();
    const existingUser = users.find((user) => user.email === emailLower);

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: `user_${Date.now()}`,
      fullname,
      email: emailLower,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveJson(usersFile, users);

    const token = generateToken(newUser);

    return res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: {
        id: newUser.id,
        fullname: newUser.fullname,
        email: newUser.email
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required.' });
    }

    const emailLower = email.toLowerCase();
    const user = users.find((entry) => entry.email === emailLower);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = generateToken(user);

    return res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed.', error: error.message });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = users.find((entry) => entry.id === req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  return res.json({
    id: user.id,
    fullname: user.fullname,
    email: user.email
  });
});

app.post('/api/files/upload', authenticateToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
  return res.status(400).json({ message: 'No file uploaded.' });
}

console.log("MULTER FILE:", req.file);

const record = {
  id: `file_${Date.now()}`,
  userId: req.user.id,
  originalName: req.file.originalname,
  filename: req.file.key,
  size: req.file.size,
  mimetype: req.file.mimetype,
  uploadedAt: new Date().toISOString()
};

    files.push(record);
    saveJson(filesFile, files);

    return res.status(201).json({ message: 'File uploaded successfully.', file: record });
  } catch (error) {
    return res.status(500).json({ message: 'File upload failed.', error: error.message });
  }
});

app.get('/api/files/:id/download', authenticateToken, async (req, res) => {
  try {
    const file = files.find((entry) => entry.id === req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found.' });
    }

    if (file.userId !== req.user.id) {
      return res.status(403).json({
        message: 'You do not have access to this file.'
      });
    }

    const command = new GetObjectCommand({
      Bucket: 'cloudvault-jay',
      Key: file.filename
    });

    const response = await s3.send(command);

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${file.originalName}"`
    );

    res.setHeader(
      'Content-Type',
      file.mimetype || 'application/octet-stream'
    );

    response.Body.pipe(res);

  } catch (error) {
    console.error('S3 Download Error:', error);

    return res.status(500).json({
      message: 'File download failed.'
    });
  }
});
app.delete('/api/files/:id', authenticateToken, (req, res) => {
  const index = files.findIndex((entry) => entry.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'File not found.' });
  }

  const file = files[index];

  if (file.userId !== req.user.id) {
    return res.status(403).json({ message: 'You do not have access to this file.' });
  }

  try {
    if (fs.existsSync(file.storedPath)) {
      fs.unlinkSync(file.storedPath);
    }
  } catch (error) {
    // ignore cleanup errors
  }

  files.splice(index, 1);
  saveJson(filesFile, files);

  return res.json({ message: 'File deleted successfully.' });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`CloudVault backend running on port ${PORT}`);
});
