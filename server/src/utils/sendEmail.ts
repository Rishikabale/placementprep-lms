import nodemailer from 'nodemailer';

interface SendEmailOptions {
    email: string;
    subject: string;
    message: string;
}

const sendEmail = async (options: SendEmailOptions) => {
    // 1. Create a test account (Ethereal)
    const testAccount = await nodemailer.createTestAccount();

    // 2. Create a transporter
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });

    // 3. Send email with defined transport object
    const info = await transporter.sendMail({
        from: '"Placement LMS Admin" <admin@placementlms.com>', // sender address
        to: options.email, // list of receivers
        subject: options.subject, // Subject line
        text: options.message, // plain text body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
};

export default sendEmail;
