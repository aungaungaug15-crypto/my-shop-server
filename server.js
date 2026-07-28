const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Temporary OTP Storage
const otpStore = {};

// မေးလ်ပို့ရန် Transporter Setup (Gmail App Password ထည့်ရန်)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'yourgmail@gmail.com', // သင့် Gmail
    pass: process.env.GMAIL_PASS || 'your-app-password'   // Gmail App Password
  }
});

// ၁။ OTP ပို့ပေးသည့် API
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email လိုအပ်ပါသည်။' });

  // OTP ၆ လုံး ထုတ်ယူခြင်း
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = otp;

  const mailOptions = {
    from: '"Temp OTP Service" <no-reply@gmail.com>',
    to: email,
    subject: 'Your Account Verification OTP Code',
    text: `သင့်ရဲ့ အကောင့်ဖွင့်ရန် OTP စာကုဒ်မှာ [ ${otp} ] ဖြစ်ပါတယ်။`
  };

  try {
    // Vercel မှာ App Password မထည့်ရသေးရင် Demo အနေဖြင့် OTP ကို Response ထဲတွင် ပြန်ပြပေးမည်
    if (!process.env.GMAIL_USER) {
      console.log(`Demo OTP for ${email}: ${otp}`);
      return res.json({ success: true, message: 'OTP Sent (Demo Mode)', demoOtp: otp });
    }

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'OTP ကုဒ်ကို Gmail ထို့ ပို့ပေးလိုက်ပါပြီ။' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Email ပို့ရန် မအောင်မြင်ပါ။' });
  }
});

// ၂။ OTP စစ်ဆေးသည့် API
app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (otpStore[email] && otpStore[email] === otp) {
    delete otpStore[email]; // သုံးပြီးသား OTP ကို ဖျက်ခြင်း
    return res.json({ success: true, message: 'အကောင့်ဝင်ရောက်မှု အောင်မြင်ပါသည်။' });
  } else {
    return res.status(400).json({ success: false, message: 'OTP ကုဒ် မှားယွင်းနေပါသည်။' });
  }
});

// Temp Phone Number ပို့ပေးမည့် API
app.get('/api/get-number', (req, res) => {
  const randomNum = Math.floor(100000000 + Math.random() * 900000000);
  res.json({ success: true, phone: "+959" + randomNum });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
