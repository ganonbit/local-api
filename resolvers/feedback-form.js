import { sendFeedbackFormEmail } from '../utils/email';

const Mutation = {
  submitFeedbackForm: async (
    root,
    { input: { firstName, lastName, email, feedback, feedbackReason } }
  ) => {
    const mailOptions = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      feedbackReason: feedbackReason,
      feedback: feedback,
    };

    try {
      await sendFeedbackFormEmail(mailOptions);
    } catch (error) {
      console.log('The following Error ocurred while trying to send an email:');
      console.error(error);
      throw new Error(error);
    }

    return {
      message: 'Your feedback has been submitted.',
    };
  },
};

export default { Mutation };
