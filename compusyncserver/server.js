const express = require('express');
const cors = require('cors');
const myschema = require('./compusyncdatabase/modal');  
const mysql2 = require('mysql2');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync('uploads')) {
        fs.mkdirSync('uploads');
    }
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

app.get("/",(req,res)=>{
    res.send("Hello from ramya");
    res.end();
});




// --- SETUP DB ROUTE ---
app.get("/setupdb", (req, res) => {
    const dropQueries = [
        "DROP TABLE IF EXISTS users",
        "DROP TABLE IF EXISTS student_files",
        "DROP TABLE IF EXISTS leavetable",
        "DROP TABLE IF EXISTS odtable",
        "DROP TABLE IF EXISTS issuestable",
        "DROP TABLE IF EXISTS announcementstable",
        "DROP TABLE IF EXISTS attendancetable",
        "DROP TABLE IF EXISTS cgpatable"
    ];
    
    const createLeaves = `CREATE TABLE leavetable (
        id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), reg VARCHAR(255),
        ltype VARCHAR(255), sdata VARCHAR(255), edata VARCHAR(255), lreason TEXT, 
        status VARCHAR(50) DEFAULT 'Pending', attendance INT DEFAULT 90, cgpa FLOAT DEFAULT 8.0,
        approved_by VARCHAR(255) DEFAULT NULL, approval_type VARCHAR(50) DEFAULT NULL, decision_reason TEXT DEFAULT NULL
    )`;
    const createODs = `CREATE TABLE odtable (
        id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), reg VARCHAR(255),
        odtype VARCHAR(255), oddate VARCHAR(255), odreason TEXT, 
        status VARCHAR(50) DEFAULT 'Pending', attendance INT DEFAULT 90, cgpa FLOAT DEFAULT 8.0,
        approved_by VARCHAR(255) DEFAULT NULL, approval_type VARCHAR(50) DEFAULT NULL, decision_reason TEXT DEFAULT NULL
    )`;
    const createIssues = `CREATE TABLE issuestable (
        id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), reg VARCHAR(255),
        issuetype VARCHAR(255), title VARCHAR(255), reason TEXT, 
        status VARCHAR(50) DEFAULT 'Open'
    )`;
    const createAnnouncements = `CREATE TABLE announcementstable (
        id INT AUTO_INCREMENT PRIMARY KEY, role VARCHAR(255), author VARCHAR(255),
        title VARCHAR(255), content TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    const createAttendance = `CREATE TABLE attendancetable (
        id INT AUTO_INCREMENT PRIMARY KEY, class_section VARCHAR(255), subject VARCHAR(255),
        date VARCHAR(255), period VARCHAR(255), present_count INT, absent_count INT, 
        total INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    const createCgpa = `CREATE TABLE cgpatable (
        id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), reg VARCHAR(255),
        semester INT, gpa FLOAT, total_credits INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    const createUsers = `CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        name VARCHAR(255), 
        email VARCHAR(255) UNIQUE, 
        reg VARCHAR(255), 
        employee_id VARCHAR(255), 
        department VARCHAR(255), 
        role VARCHAR(50), 
        password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    const createStudentFiles = `CREATE TABLE student_files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_identifier VARCHAR(255),
        filename VARCHAR(255),
        filepath VARCHAR(255),
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    try {
        dropQueries.forEach(q => myschema.query(q));
        myschema.query(createUsers);
        myschema.query(createStudentFiles);
        myschema.query(createLeaves);
        myschema.query(createODs);
        myschema.query(createIssues);
        myschema.query(createAnnouncements);
        myschema.query(createAttendance);
        myschema.query(createCgpa);
        res.status(200).json({ message: "Database tables created successfully! You can now use the app normally." });
    } catch(err) {
        res.status(500).json({ error: "Failed to setup DB." });
    }
});

// --- AUTH ENDPOINTS ---
app.post("/auth/signup", async (req, res) => {
    try {
        const { name, email, reg, employee_id, department, role, password } = req.body;
        
        if (!name || !password || !role) {
            return res.status(400).json({ error: 'Name, role, and password are required' });
        }

        const myquery = "INSERT INTO users (name, email, reg, employee_id, department, role, password) VALUES (?, ?, ?, ?, ?, ?, ?)";
        const fdata = [name, email || null, reg || null, employee_id || null, department || null, role, password];
        
        myschema.query(myquery, fdata, (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Email already exists' });
                }
                return res.status(500).json({ error: 'Failed to register user' });
            }
            res.status(200).json({ message: 'User registered successfully' });
        });
    } catch(err) {
        res.status(500).json({ error: 'System error' });
    }
});

app.post("/auth/login", async (req, res) => {
    try {
        const { identifier, password, role } = req.body;
        
        if (!identifier || !password || !role) {
            return res.status(400).json({ error: 'Credentials and role are required' });
        }

        // Identifier could be email, reg number, or employee ID depending on role
        let query = "SELECT * FROM users WHERE role = ? AND password = ? AND ";
        if (role === 'student') {
             query += "reg = ?";
        } else {
             query += "(email = ? OR employee_id = ?)";
        }
        
        const params = role === 'student' ? [role, password, identifier] : [role, password, identifier, identifier];

        myschema.query(query, params, (err, results) => {
            if (err) return res.status(500).json({ error: 'Login failed' });
            
            if (results.length > 0) {
                const user = results[0];
                // Don't send password back
                delete user.password;
                res.status(200).json({ message: 'Login successful', user });
            } else {
                res.status(401).json({ error: 'Invalid credentials or role' });
            }
        });
    } catch(err) {
        res.status(500).json({ error: 'System error' });
    }
});

// --- LEAVE ENDPOINTS ---
app.post("/leave", async(req,res)=>{
    try{
        const { name, reg, ltype, sdata, edata, lreason } = req.body;
        // Provide defaults if frontend hasn't been updated yet
        const stdName = name || 'Student';
        const stdReg = reg || '9123...001';

        if (!ltype || !sdata || !edata || !lreason) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }

        // Live Tracking Calculation
        myschema.query("SELECT * FROM leavetable WHERE name = ? AND status = 'Approved'", [stdName], (err, leaves) => {
            let stdAttendance = 100;
            if (!err && leaves) {
                stdAttendance = 100 - (leaves.length * 4);
            }

            let status = 'Pending';
            let approved_by = null;
            let approval_type = 'Manual';
            let decision_reason = null;

            if (stdAttendance >= 85) {
                status = 'Approved';
                approved_by = 'System';
                approval_type = 'Auto';
                decision_reason = `Auto-approved due to high attendance (${stdAttendance}%)`;
            } else if (stdAttendance >= 75) {
                status = 'Pending';
                approved_by = null;
                approval_type = 'Manual';
                decision_reason = `Requires manual approval (Attendance ${stdAttendance}%)`;
            } else {
                status = 'Rejected';
                approved_by = 'System';
                approval_type = 'Auto';
                decision_reason = `Auto-rejected due to low attendance (${stdAttendance}%)`;
            }

            const fdata = [stdName, stdReg, ltype, sdata, edata, lreason, status, stdAttendance, approved_by, approval_type, decision_reason];
            console.log("Received leave application:", fdata);
            
            const myquery = "INSERT INTO leavetable (name, reg, ltype, sdata, edata, lreason, status, attendance, approved_by, approval_type, decision_reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            myschema.query(myquery, fdata, (err, result) => {
                if (err) return res.status(500).json({ error: 'Failed to submit leave application' });
                res.status(200).json({ message: 'Leave application submitted successfully', status, approval_type, decision_reason });
            });
        });
    } catch(err) {
        res.status(500).json({ error: 'Database connection error' });
    }
});

app.get("/getleaves", (req, res) => {
    myschema.query("SELECT * FROM leavetable ORDER BY id DESC", (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch data' });
        res.status(200).json(results);
    });
});

app.put("/leave/:id/status", (req, res) => {
    const { status, approved_by, decision_reason } = req.body;
    const finalApprover = approved_by || 'Staff/HOD';
    const finalReason = decision_reason || 'Manual Review';
    myschema.query("UPDATE leavetable SET status = ?, approved_by = ?, approval_type = 'Manual', decision_reason = ? WHERE id = ?", [status, finalApprover, finalReason, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to update status' });
        res.status(200).json({ message: 'Status updated successfully' });
    });
});


// --- OD ENDPOINTS ---
app.post("/OD", async(req,res)=>{
    try{
        const { name, reg, odtype, oddate, odreason } = req.body;
        const stdName = name || 'Student';
        const stdReg = reg || '9123...001';

        if (!odtype || !oddate || !odreason) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }

        // Live Tracking Calculation
        myschema.query("SELECT * FROM leavetable WHERE name = ? AND status = 'Approved'", [stdName], (err, leaves) => {
            let stdAttendance = 100;
            if (!err && leaves) {
                stdAttendance = 100 - (leaves.length * 4);
            }

            let status = 'Pending';
            let approved_by = null;
            let approval_type = 'Manual';
            let decision_reason = null;

            if (stdAttendance >= 85) {
                status = 'Approved';
                approved_by = 'System';
                approval_type = 'Auto';
                decision_reason = `Auto-approved due to high attendance (${stdAttendance}%)`;
            } else if (stdAttendance >= 75) {
                status = 'Pending';
                approved_by = null;
                approval_type = 'Manual';
                decision_reason = `Requires manual approval (Attendance ${stdAttendance}%)`;
            } else {
                status = 'Rejected';
                approved_by = 'System';
                approval_type = 'Auto';
                decision_reason = `Auto-rejected due to low attendance (${stdAttendance}%)`;
            }

            const fdata = [stdName, stdReg, odtype, oddate, odreason, status, stdAttendance, approved_by, approval_type, decision_reason];
            console.log("Received on-duty application:", fdata);
            
            const myquery = "INSERT INTO odtable (name, reg, odtype, oddate, odreason, status, attendance, approved_by, approval_type, decision_reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            myschema.query(myquery, fdata, (err, result) => {
                if (err) return res.status(500).json({ error: 'Failed to submit on-duty application' });
                res.status(200).json({ message: 'On-Duty application submitted successfully', status, approval_type, decision_reason });
            });
        });
    } catch(err) {
        res.status(500).json({ error: 'Database connection error' });
    }
});

app.get("/getods", (req, res) => {
    myschema.query("SELECT * FROM odtable ORDER BY id DESC", (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch data' });
        res.status(200).json(results);
    });
});

app.put("/OD/:id/status", (req, res) => {
    const { status, approved_by, decision_reason } = req.body;
    const finalApprover = approved_by || 'Staff/HOD';
    const finalReason = decision_reason || 'Manual Review';
    myschema.query("UPDATE odtable SET status = ?, approved_by = ?, approval_type = 'Manual', decision_reason = ? WHERE id = ?", [status, finalApprover, finalReason, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to update status' });
        res.status(200).json({ message: 'Status updated successfully' });
    });
});


// --- ISSUES ENDPOINTS ---
app.post("/issues", async(req,res)=>{
    try{
        const { name, reg, issuetype, title, reason } = req.body;
        const stdName = name || 'Arun Kumar';
        const stdReg = reg || '9123...001';

        const fdata = [stdName, stdReg, issuetype, title, reason];
        console.log("Received issue report:", fdata);
        
        if (!issuetype || !title || !reason) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }

        const myquery = "INSERT INTO issuestable (name, reg, issuetype, title, reason) VALUES (?, ?, ?, ?, ?)";
        myschema.query(myquery, fdata, (err, result) => {
            if (err) return res.status(500).json({ error: 'Failed to submit issue report' });
            res.status(200).json({ message: 'Issue report submitted successfully' });
        });
    } catch(err) {
        res.status(500).json({ error: 'Database connection error' });
    }
});

app.get("/getissues", (req, res) => {
    myschema.query("SELECT * FROM issuestable ORDER BY id DESC", (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch data' });
        res.status(200).json(results);
    });
});

app.put("/issues/:id/status", (req, res) => {
    const { status } = req.body;
    myschema.query("UPDATE issuestable SET status = ? WHERE id = ?", [status, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to update status' });
        res.status(200).json({ message: 'Status updated successfully' });
    });
});


// --- ANNOUNCEMENTS ENDPOINTS ---
app.post("/announcements", async(req,res)=>{
    // Setup real Gmail SMTP Transport
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try{
        const { role, author, title, content } = req.body;
        const fdata = [role, author, title, content];
        
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and Content are required' });
        }

        const myquery = "INSERT INTO announcementstable (role, author, title, content) VALUES (?, ?, ?, ?)";
        myschema.query(myquery, fdata, async (err, result) => {
            if (err) return res.status(500).json({ error: 'Failed to post announcement' });
            
            // Notification logic
            let targetRoles = [];
            const safeRole = (role || "").toLowerCase();
            if (safeRole === 'staff') {
                targetRoles = ["student"];
            } else if (safeRole === 'hod') {
                targetRoles = ["student", "staff"];
            }

            if (targetRoles.length > 0) {
               const placeholders = targetRoles.map(() => "?").join(",");
               const emailQuery = `SELECT email FROM users WHERE role IN (${placeholders}) AND email IS NOT NULL`;
               myschema.query(emailQuery, targetRoles, async (eErr, eResults) => {
                   if (!eErr && eResults.length > 0) {
                       const emails = eResults.map(r => r.email).join(", ");
                       try {
                           let info = await transporter.sendMail({
                               from: `"CampusSync Admin" <${process.env.EMAIL_USER}>`,
                               to: emails,
                               subject: `New Announcement: ${title}`,
                               text: content,
                               html: `<h3>${title}</h3><p><strong>From:</strong> ${author} (${role})</p><p>${content}</p>`,
                           });
                           console.log("Emails sent successfully to: ", emails);
                       } catch (sendErr) {
                           console.error("Failed to send notification email", sendErr);
                       }
                   }
               });
            }

            res.status(200).json({ message: 'Announcement posted successfully' });
        });
    } catch(err) {
        res.status(500).json({ error: 'Database connection error' });
    }
});

app.get("/getannouncements", (req, res) => {
    myschema.query("SELECT * FROM announcementstable ORDER BY id DESC", (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch announcements' });
        res.status(200).json(results);
    });
});

app.delete("/announcements/:id", (req, res) => {
    myschema.query("DELETE FROM announcementstable WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to delete announcement' });
        res.status(200).json({ message: 'Announcement deleted successfully' });
    });
});

app.get("/clearannouncements", (req, res) => {
    myschema.query("TRUNCATE TABLE announcementstable", (err, result) => {
        if (err) return res.status(500).send("Oh no! Failed to clear announcements.");
        res.status(200).send("<h1>Successfully wiped all announcements from the database!</h1><p>You can close this tab and refresh your dashboard.</p>");
    });
});

// --- ATTENDANCE ENDPOINTS ---
app.post("/attendance", async(req,res)=>{
    try{
        const { class_section, subject, date, period, present_count, absent_count, total } = req.body;
        const fdata = [class_section, subject, date, period, present_count, absent_count, total];
        
        const myquery = "INSERT INTO attendancetable (class_section, subject, date, period, present_count, absent_count, total) VALUES (?, ?, ?, ?, ?, ?, ?)";
        myschema.query(myquery, fdata, (err, result) => {
            if (err) return res.status(500).json({ error: 'Failed to save attendance' });
            res.status(200).json({ message: 'Attendance saved successfully' });
        });
    } catch(err) {
        res.status(500).json({ error: 'Database connection error' });
    }
});

// --- CGPA ENDPOINTS ---
app.post("/savecgpa", async(req,res)=>{
    try{
        const { name, reg, semester, gpa, total_credits } = req.body;
        const fdata = [name, reg, semester, gpa, total_credits];
        
        const myquery = "INSERT INTO cgpatable (name, reg, semester, gpa, total_credits) VALUES (?, ?, ?, ?, ?)";
        myschema.query(myquery, fdata, (err, result) => {
            if (err) return res.status(500).json({ error: 'Failed to save CGPA' });
            res.status(200).json({ message: 'CGPA saved successfully' });
        });
    } catch(err) {
        res.status(500).json({ error: 'Database connection error' });
    }
});

app.get("/getcgpa", (req, res) => {
    // Note: this gets all CGPAs. In a realistic setup we'd filter by reg via /getcgpa/:reg
    myschema.query("SELECT * FROM cgpatable ORDER BY semester ASC", (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch CGPA' });
        res.status(200).json(results);
    });
});

// --- FILE UPLOAD ENDPOINTS ---
app.post("/upload", upload.single('file'), (req, res) => {
    const { user_identifier } = req.body;
    if (!req.file || !user_identifier) {
        return res.status(400).json({ error: 'File and user_identifier are required' });
    }

    const filename = req.file.originalname;
    const filepath = req.file.filename;

    const myquery = "INSERT INTO student_files (user_identifier, filename, filepath) VALUES (?, ?, ?)";
    myschema.query(myquery, [user_identifier, filename, filepath], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error while saving file info' });
        res.status(200).json({ message: 'File uploaded successfully', filepath });
    });
});

app.get("/files/:identifier", (req, res) => {
    myschema.query("SELECT * FROM student_files WHERE user_identifier = ? ORDER BY id DESC", [req.params.identifier], (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch files' });
        res.status(200).json(results);
    });
});

app.delete("/files/:id", (req, res) => {
    myschema.query("SELECT * FROM student_files WHERE id = ?", [req.params.id], (err, results) => {
        if (err || results.length === 0) return res.status(500).json({ error: 'File not found' });
        
        const fileRecord = results[0];
        const filePath = path.join(__dirname, 'uploads', fileRecord.filepath);
        
        // delete physically
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        // delete database record
        myschema.query("DELETE FROM student_files WHERE id = ?", [req.params.id], (delErr) => {
            if (delErr) return res.status(500).json({ error: 'Failed to delete file from DB' });
            res.status(200).json({ message: 'File deleted successfully' });
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    // Auto migration to add engine fields smoothly
    const altLeave = "ALTER TABLE leavetable ADD COLUMN approved_by VARCHAR(255) DEFAULT NULL, ADD COLUMN approval_type VARCHAR(50) DEFAULT NULL, ADD COLUMN decision_reason TEXT DEFAULT NULL";
    const altOD = "ALTER TABLE odtable ADD COLUMN approved_by VARCHAR(255) DEFAULT NULL, ADD COLUMN approval_type VARCHAR(50) DEFAULT NULL, ADD COLUMN decision_reason TEXT DEFAULT NULL";
    myschema.query(altLeave, (err) => { if (!err) console.log("Added new columns to leavetable"); });
    myschema.query(altOD, (err) => { if (!err) console.log("Added new columns to odtable"); });
});
