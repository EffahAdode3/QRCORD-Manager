import express from 'express';
import session from 'express-session';
import sequelize from './db/config.js';
import nodemailer from 'nodemailer';
import qr from 'qrcode';
import User from './model/user.js';
import bodyParser from 'body-parser';
import { Parser as Json2csvParser } from 'json2csv';
import Admin from './model/admin.js';
import bcrypt from 'bcryptjs';

const app = express();
const PORT =  4000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(bodyParser.json());

const sessionSecret = 'qwewertr';
app.use(session({ secret: sessionSecret, resave: true, saveUninitialized: true, cookie: { maxAge: 60 * 60 * 1000 } }));

// Admin authentication middleware
function requireAdmin(req, res, next) {
    if (req.session && req.session.isAdmin) {
        return next();
    } else {
        return res.redirect('/admin/login');
    }
}

// Admin login page
app.get('/admin/login', (req, res) => {
    res.render('login', { error: null });
});
// Admin login handler
app.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await Admin.findOne({ where: { username } });
        if (!admin) return res.render('login', { error: 'Invalid username or password' });
        const match = await bcrypt.compare(password, admin.password);
        if (!match) return res.render('login', { error: 'Invalid username or password' });
        req.session.isAdmin = true;
        req.session.adminUsername = admin.username;
        return res.redirect('/admin');
    } catch (err) {
        return res.render('login', { error: 'Login failed' });
    }
});
// Admin logout
app.get('/admin/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/admin/login');
    });
});

// Admin registration page
app.get('/admin/register', (req, res) => {
    res.render('adminRegister', { error: null, success: null });
});
// Admin registration handler
app.post('/admin/register', async (req, res) => {
    const { username, password, confirmPassword } = req.body;
    if (!username || !password || !confirmPassword) {
        return res.render('adminRegister', { error: 'All fields are required.', success: null });
    }
    if (password !== confirmPassword) {
        return res.render('adminRegister', { error: 'Passwords do not match.', success: null });
    }
    try {
        const existing = await Admin.findOne({ where: { username } });
        if (existing) {
            return res.render('adminRegister', { error: 'Username already exists.', success: null });
        }
        const hashed = await bcrypt.hash(password, 10);
        await Admin.create({ username, password: hashed });
        return res.render('adminRegister', { error: null, success: 'Admin registered successfully! You can now log in.' });
    } catch (err) {
        return res.render('adminRegister', { error: 'Registration failed.', success: null });
    }
});

// Protect all /admin routes (except login/logout)
app.use('/admin', (req, res, next) => {
    if (req.path === '/login' || req.path === '/logout') return next();
    requireAdmin(req, res, next);
});

app.get('/', (req, res) => {
    res.render('index');
  });
  app.get('/checkNumber', (req, res) => {
    res.render('checkNumber');
  });
  app.get('/admin', async (req, res) => {
    try {
        const users = await User.findAll();
        const totalUsers = await User.count();
        res.render('admin', { users, totalUsers });
    } catch (error) {
        res.status(500).send('Error loading admin panel');
    }
});
  app.get('/admin/export/csv', async (req, res) => {
    try {
        const users = await User.findAll({ raw: true });
        const fields = ['id', 'f_name', 'm_name', 'l_name', 'email', 'identificationNumber', 'numberField'];
        const opts = { fields };
        const parser = new Json2csvParser(opts);
        const csv = parser.parse(users);
        res.header('Content-Type', 'text/csv');
        res.attachment('users.csv');
        return res.send(csv);
    } catch (err) {
        res.status(500).send('Could not export users');
    }
});
  

  function generateUniqueIdentifier() {
    return Math.floor(100000 + Math.random() * 900000); 
  }
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'maximnyansa75@gmail.com',
      pass: 'uqpo lean remu tzjb' 
    }
  });
  app.post('/', async (req, res) => {
    try {
        const identificationNumber = generateUniqueIdentifier();
        const { f_name,  l_name, m_name, email, numberField } = req.body;
        // check if email exist
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        // check if email contain plus
        let cleanEmail = email;
        if (email.includes('+')) {
            const parts = email.split('+');
            if (parts.length === 2) {
                cleanEmail = parts[0] + '@' + parts[1].split('@')[1];
            }
        }
        const existingUser = await User.findOne({ where: { email: cleanEmail } });
        if (existingUser) {
            return res.status(400).json({ message: '+ + Email already in use' });
        }
        // check if number exist
        const existingNumber = await User.findOne({ where: { numberField } });
        if (existingNumber) {
            return res.status(400).json({ message: 'Number already in use' });
        }
        // store in the database before sending the email.
        await User.create({
            f_name,
            l_name,
            m_name,
            email: cleanEmail,
            numberField,
            identificationNumber
        });
        const mailOptions = {
            from: 'maximnyansa75@gmail.com', 
            to: email,
            subject: 'Identification Number',
            html: `
                <div style="font-family: Arial, sans-serif; background: #f8f9fa; padding: 24px; border-radius: 8px; max-width: 480px; margin: auto;">
                    <h2 style="color: #007bff;">Welcome to QR Code App!</h2>
                    <p>Dear <strong>${f_name} ${l_name}</strong>,</p>
                    <p>Thank you for registering. Your unique identification number is:</p>
                    <div style="font-size: 2rem; color: #28a745; font-weight: bold; margin: 16px 0;">${identificationNumber}</div>
                    <p>Keep this number safe. You can use it to check your registration and generate your QR code at any time.</p>
                    <hr style="margin: 24px 0;">
                    <p style="font-size: 0.9em; color: #888;">This is an automated message from QR Code App.</p>
                </div>
            `
        }; 
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        return res.status(200).json({ message: 'successfully' });
    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).send('Internal Server Error');
    }
});
  app.post('/checkNumber', async (req, res) => { 
    try {
        const { identificationNumber } = req.body;
        const user = await User.findOne({ where: { identificationNumber } });
        if (!user) {
          return res.status(404).send('User not found');
        }
        const googleLink = `https://www.google.com/search?q=${identificationNumber}`;
        const qrCodeData = JSON.stringify(googleLink);
        const qrCode = await qr.toDataURL(qrCodeData);
   
      return res.status(200).send({message:"Successfully", qrCode,  
        identificationNumber: user.identificationNumber,
        user: user.f_name, userq: user.l_name, users:user.m_name,
         email:user.email, numberField:user.numberField
       })
      } catch (error) {
        console.error('Error retrieving QR code:', error);
        res.status(500).send('Internal Server Error');
      }
  })

app.put('/admin/user/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { f_name, m_name, l_name, email, identificationNumber, numberField } = req.body;
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        await user.update({ f_name, m_name, l_name, email, identificationNumber, numberField });
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user' });
    }
});

app.delete('/admin/user/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        await user.destroy();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// Sync Admin model
sequelize.sync().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  });