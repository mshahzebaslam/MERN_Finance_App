import cron from 'node-cron';
import Bill from '../models/Bill.js';
import { sendReminderEmail } from '../utils/sendEmail.js';

// cron.schedule('* * * * *', async () => {
cron.schedule('0 9 * * *', async () => {
    const today = new Date();
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);

    try {
        const bills = await Bill.find({
            isPaid: false,
            dueDate: { $lte: threeDaysLater }
        }).populate('userId', 'email');

        for (let bill of bills) {
            if (bill?.userId?.email) {
                await sendReminderEmail({
                    to: bill.userId.email,
                    subject: `Upcoming Bill Reminder: ${bill.name}`,
                    text: `Hi! Just a reminder that your bill "${bill.name}" of $${bill.amount} is due on ${bill.dueDate.toDateString()}. Please make sure to pay on time.`
                });
            }
        }

        console.log('Bill reminders sent successfully');
    } catch (err) {
        console.error('Error sending reminders:', err);
    }
});
