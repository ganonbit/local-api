import nodemailer from 'nodemailer';

const { SENDGRID_USER, MAIL_USER, SENDGRID_PASS } = process.env;

/**
 * Creates transporter object that will help us to send emails
 */

let transporter = nodemailer.createTransport({
  service: 'SendGrid',
  auth: {
    user: SENDGRID_USER,
    pass: SENDGRID_PASS,
  },
});

/**
 *  Sends an email to user
 *
 * @param {string} to email address where to send mail
 * @param {string} subject of the email
 * @param {string} html content of the email
 */
export const sendEmail = async ({ to, subject, html }) => {
  let info = await transporter.sendMail({
    from: `"Avocado Nation 🥑" <${MAIL_USER}>`, // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    html: html // html body
  });
  console.log("Verification Email sent: %s", info.messageId);
};
