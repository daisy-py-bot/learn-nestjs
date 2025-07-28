const nodemailer = require('nodemailer');

// Create transporter with your Mailtrap credentials
const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: '7670263d7d188f',
    pass: '365ef6a5cc2dde'
  }
});

// Test email
async function testEmail() {
  try {
    console.log('Testing email configuration...');
    
    const result = await transporter.sendMail({
      from: 'no-reply@example.com',
      to: 'test@example.com',
      subject: 'Test Email',
      html: '<h1>Test Email</h1><p>This is a test email to verify the configuration.</p>'
    });
    
    console.log('Email sent successfully!');
    console.log('Message ID:', result.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

testEmail(); 