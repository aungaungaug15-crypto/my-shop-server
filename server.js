const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Temp Phone Number ပို့ပေးမည့် API Endpoint
app.get('/api/get-number', (req, res) => {
  // နမူနာ ဖုန်းနံပါတ် (လက်တွေ့တွင် SMS API နှင့် ချိတ်ဆက်နိုင်သည်)
  const randomNum = Math.floor(100000000 + Math.random() * 900000000);
  res.json({
    success: true,
    phone: "+959" + randomNum
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
