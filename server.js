const express = require('express');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = "admin123";
const NUMBERS_FILE = path.join('/tmp', 'numbers.json');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const otpStore = {};

function getStoredNumbers() {
  if (!fs.existsSync(NUMBERS_FILE)) {
    fs.writeFileSync(NUMBERS_FILE, JSON.stringify({ MM: [], US: [] }));
  }
  try {
    return JSON.parse(fs.readFileSync(NUMBERS_FILE));
  } catch (e) {
    return { MM: [], US: [] };
  }
}

function saveStoredNumbers(numbers) {
  fs.writeFileSync(NUMBERS_FILE, JSON.stringify(numbers, null, 2));
}

// ---------------- Admin Routes ----------------
app.get('/my-secret-admin-99', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/api/admin/numbers', (req, res) => {
  res.json(getStoredNumbers());
});

app.post('/api/admin/add-number', (req, res) => {
  const { passkey, country, phone } = req.body;
  if (passkey !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: "Admin Password မှားယွင်းနေပါသည်။" });
  }
  if (!phone || !country) {
    return res.status(400).json({ success: false, message: "အချက်အလက် ပြည့်စုံစွာ ဖြည့်ပါ။" });
  }

  const numbers = getStoredNumbers();
  if (!numbers[country]) numbers[country] = [];
  
  numbers[country].push({ id: Date.now(), phone });
  saveStoredNumbers(numbers);

  res.json({ success: true, message: "ဖုန်းနံပါတ် အသစ် သိမ်းဆည်းပြီးပါပြီ။" });
});

app.delete('/api/admin/delete-number/:country/:id', (req, res) => {
  const passkey = req.headers['x-passkey'];
  if (passkey !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: "Admin Password မှားယွင်းနေပါသည်။" });
  }

  const { country, id } = req.params;
  const numbers = getStoredNumbers();
  if (numbers[country]) {
    numbers[country] = numbers[country].filter(item => item.id !== parseInt(id));
    saveStoredNumbers(numbers);
  }

  res.json({ success: true, message: "ဖုန်းနံပါတ် ဖျက်လိုက်ပါပြီ။" });
});

// ---------------- OTP & Auth Routes ----------------
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || '',
    pass: process.env.GMAIL_PASS || ''
  }
});

app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email လိုအပ်ပါသည်။' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = otp;

  try {
    if (!process.env.GMAIL_USER) {
      return res.json({ success: true, message: 'OTP Sent (Demo Mode)', demoOtp: otp });
    }
    await transporter.sendMail({
      from: '"Temp OTP Service" <no-reply@gmail.com>',
      to: email,
      subject: 'Verification OTP Code',
      text: `Your OTP code is: ${otp}`
    });
    res.json({ success: true, message: 'OTP ကုဒ်ကို Gmail သို့ ပို့ပေးလိုက်ပါပြီ။' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Email ပို့ရန် မအောင်မြင်ပါ။' });
  }
});

app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (otpStore[email] && otpStore[email] === otp) {
    delete otpStore[email];
    return res.json({ success: true, message: 'အကောင့်ဝင်ရောက်မှု အောင်မြင်ပါသည်။' });
  }
  return res.status(400).json({ success: false, message: 'OTP ကုဒ် မှားယွင်းနေပါသည်။' });
});

// Admin တင်ထားသော နံပါတ်များကို User ဘက်သို့ ပို့ပေးခြင်း
app.get('/api/get-number', (req, res) => {
  const country = req.query.country || 'MM';
  const numbers = getStoredNumbers();
  const countryNumbers = numbers[country] || [];

  if (countryNumbers.length === 0) {
    return res.json({ success: false, phone: "လောလောဆယ် နံပါတ် မရှိသေးပါ" });
  }

  const randomItem = countryNumbers[Math.floor(Math.random() * countryNumbers.length)];
  res.json({ success: true, phone: randomItem.phone });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
