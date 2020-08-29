import nodemailer from 'nodemailer';
import nodemailerSendgrid from 'nodemailer-sendgrid';

const { MAIL_USER, SENDGRID_API_KEY, HIJACK_EMAIL_ADDRESS, FRONTEND_URL } = process.env;

/**
 * Creates transporter object that will help us to send emails
 */

const transporter = nodemailer.createTransport(
  nodemailerSendgrid({
      apiKey: SENDGRID_API_KEY
  })
);

/**
 *  Sends an email to user
 *
 * @param {string} to email address where to send mail
 * @param {string} subject of the email
 * @param {string} html content of the email
 */
export const sendEmail = async ({ to, subject, html }) => {
  let hijackedEmailAddress = null
  let senderAddress = `"Social 🐧" <${MAIL_USER}>`
  if(HIJACK_EMAIL_ADDRESS) {
    hijackedEmailAddress = HIJACK_EMAIL_ADDRESS
    senderAddress = `"TESTMODE Social 🐧" <${MAIL_USER}>`
  }

  transporter
    .sendMail({
      from: senderAddress,
      to: hijackedEmailAddress || to, // list of receivers
      subject: subject, // Subject line
      html: html // html body
    })
    .then(([res]) => {
      console.log('Message delivered with code %s %s', res.statusCode, res.statusMessage);
    })
    .catch(err => {
        console.log('Errors occurred, failed to deliver message');

        if (err.response && err.response.body && err.response.body.errors) {
            err.response.body.errors.forEach(error => console.log('%s: %s', error.field, error.message));
        } else {
            console.log(err);
        }
    });
};

export const sendFeedbackFormEmail = async ({ firstName, lastName, email, feedbackReason, feedback }) => {
  let hijackedEmailAddress = null
  let subjectLine = `Feedback Submission: ${feedbackReason} from ${firstName} ${lastName}`
  if(HIJACK_EMAIL_ADDRESS) {
    hijackedEmailAddress = HIJACK_EMAIL_ADDRESS
    subjectLine = `TESTMODE Feedback Submission: ${feedbackReason} from ${firstName} ${lastName}`
  }

  transporter
    .sendMail({
      from: email,
      to: hijackedEmailAddress || FRONTEND_URL,
      subject: subjectLine,
      text: feedback // text body
    })
    .then(([res]) => {
      console.log('Message delivered with code %s %s', res.statusCode, res.statusMessage);
    })
    .catch(err => {
        console.log('Errors occurred, failed to deliver message');

        if (err.response && err.response.body && err.response.body.errors) {
            err.response.body.errors.forEach(error => console.log('%s: %s', error.field, error.message));
        } else {
            console.log(err);
        }
    });
};
