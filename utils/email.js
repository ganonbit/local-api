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
  let hijackedEmailAddress = null
  let senderAddress = `"Avocado Nation 🥑" <${MAIL_USER}>`
  if(process.env.HIJACK_EMAIL_ADDRESS) {
    hijackedEmailAddress = process.env.HIJACK_EMAIL_ADDRESS
    senderAddress = `"TESTMODE Avocado Nation 🥑" <${MAIL_USER}>`
  }

  let info = await transporter.sendMail({
    from: senderAddress,
    to: hijackedEmailAddress || to, // list of receivers
    subject: subject, // Subject line
    html: html // html body
  });
  console.log("Verification Email sent: %s", info.messageId);
};

export const sendFeedbackFormEmail = async ({ firstName, lastName, email, feedbackReason, feedback }) => {
  let hijackedEmailAddress = null
  let subjectLine = `Feedback Submission: ${feedbackReason} from ${firstName} ${lastName}`
  if(process.env.HIJACK_EMAIL_ADDRESS) {
    hijackedEmailAddress = process.env.HIJACK_EMAIL_ADDRESS
    subjectLine = `TESTMODE Feedback Submission: ${feedbackReason} from ${firstName} ${lastName}`
  }

  let info = await transporter.sendMail({
    from: email,
    to: hijackedEmailAddress || 'hello@theavocadonation.com',
    subject: subjectLine,
    text: feedback // text body
  });
  console.log("Verification Email sent: %s", info.messageId);
};
