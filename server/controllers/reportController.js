import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';
import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import Goal from '../models/Goal.js';
import Bill from '../models/Bill.js';

const formatDateForFilename = () => moment().format('YYYY-MM-DD_HH-mm-ss');

const generateCSV = (sections) => {
    let csv = '';
    for (const section of sections) {
        csv += `\n${section.title}\n`;
        if (section.data.length > 0) {
            csv += Object.keys(section.data[0]).join(',') + '\n';
            section.data.forEach(row => {
                csv += Object.values(row).map(value =>
                    `"${String(value).replace(/"/g, '""')}"`
                ).join(',') + '\n';
            });
        } else {
            csv += 'No data available\n';
        }
    }
    return csv;
};

export const exportReport = async (req, res) => {
    try {
        const { format, startDate, endDate } = req.query;
        const userId = req.user._id;

        const dateFilter = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);

        const sections = [];

        // Transactions Section
        const transactions = await Transaction.find({
            userId,
            ...(Object.keys(dateFilter).length ? { date: dateFilter } : {})
        }).sort({ date: -1 });

        const transactionsData = transactions.map(t => ({
            Date: moment(t.date).format('YYYY-MM-DD'),
            Description: t.description,
            Type: t.type,
            Category: t.category,
            Amount: t.amount,
            Account: t.accountId || 'N/A'
        }));

        sections.push({ title: 'Transactions', data: transactionsData });

        const expenses = await Transaction.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    type: 'expense',
                    ...(Object.keys(dateFilter).length ? { date: dateFilter } : {})
                }
            },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' }
                }
            },
            {
                $project: {
                    Category: '$_id',
                    'Total Amount': '$total',
                    _id: 0
                }
            }
        ]);

        sections.push({ title: 'Expenses Summary', data: expenses });

        const goals = await Goal.find({ userId });
        const goalsData = goals.map(g => ({
            Name: g.name,
            'Target Amount': g.targetAmount,
            'Current Amount': g.currentAmount,
            Progress: `${Math.round((g.currentAmount / g.targetAmount) * 100)}%`,
            'Target Date': g.targetDate ? moment(g.targetDate).format('YYYY-MM-DD') : 'N/A',
            Status: g.currentAmount >= g.targetAmount ? 'Achieved' : 'In Progress'
        }));

        sections.push({ title: 'Goals', data: goalsData });

       
        const bills = await Bill.find({ userId });
        const billsData = bills.map(b => ({
            Name: b.name,
            Amount: b.amount,
            'Due Date': moment(b.dueDate).format('YYYY-MM-DD'),
            Frequency: b.frequency,
            Status: b.isPaid ? 'Paid' : 'Pending',
            'Last Paid': b.lastPaidDate ? moment(b.lastPaidDate).format('YYYY-MM-DD') : 'N/A'
        }));

        sections.push({ title: 'Bills', data: billsData });

        const filename = `financial-summary_${formatDateForFilename()}`;

            res.json({
                success: true,
                reportType: 'financial-summary',
                data: sections,
                generatedAt: new Date()
            });
        

    } catch (error) {
        console.error('Financial summary export error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate financial summary',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
