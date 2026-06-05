require('dotenv').config({ path: '.env' })
const connectDB = require('./db');

const User = require('../models/User.model');
const Case = require('../models/Case.model');
const Hearing = require('../models/Hearing.model');
const CaseDocument = require('../models/Document.model');
const AIAnalysis = require('../models/AIAnalysis.model');
const Appointment = require('../models/Appointment.model');
const Expense = require('../models/Expense.model');
const Invoice = require('../models/Invoice.model');
const Notification = require('../models/Notification.model');
const SavedJudgement = require('../models/SavedJudgement.model');

const bcrypt = require('bcryptjs');

const runSeed = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Case.deleteMany({}),
    Hearing.deleteMany({}),
    CaseDocument.deleteMany({}),
    AIAnalysis.deleteMany({}),
    Appointment.deleteMany({}),
    Expense.deleteMany({}),
    Invoice.deleteMany({}),
    Notification.deleteMany({}),
    SavedJudgement.deleteMany({}),
  ]);

  const adminPass = await bcrypt.hash('Admin@123', 10);
  const lawyerPass = await bcrypt.hash('Lawyer@123', 10);
  const clientPass = await bcrypt.hash('Client@123', 10);

  const users = await User.create([
    {
      name: 'Sunita Sharma',
      email: 'admin@legaldesk.com',
      password: adminPass,
      role: 'admin',
    },
    {
      name: 'Adv. Rajesh Mehta',
      email: 'mehta@legaldesk.com',
      password: lawyerPass,
      role: 'lawyer',
      barCouncilNumber: 'MH/2018/34521',
      specialization: 'Criminal',
      hourlyRate: 2000,
    },
    {
      name: 'Adv. Priya Desai',
      email: 'desai@legaldesk.com',
      password: lawyerPass,
      role: 'lawyer',
      barCouncilNumber: 'MH/2020/67843',
      specialization: 'Civil',
      hourlyRate: 1500,
    },
    {
      name: 'Amit Kumar',
      email: 'amit@example.com',
      password: clientPass,
      role: 'client',
      phone: '9823001122',
    },
    {
      name: 'Priya Patel',
      email: 'priyap@example.com',
      password: clientPass,
      role: 'client',
      phone: '9823003344',
    },
    {
      name: 'Ravi Singh',
      email: 'ravi@example.com',
      password: clientPass,
      role: 'client',
      phone: '9823005566',
    },
  ]);

  const admin = users[0];
  const mehta = users[1];
  const desai = users[2];
  const amit = users[3];
  const priya = users[4];
  const ravi = users[5];

  const case1 = new Case({
    title: 'Kumar vs State of Maharashtra',
    caseType: 'criminal',
    status: 'active',
    client: amit._id,
    lawyers: [mehta._id],
    createdBy: admin._id,
    court: 'Pune District Court',
    nextHearing: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
  await case1.save();

  const case2 = new Case({
    title: 'Patel Property Dispute',
    caseType: 'property',
    status: 'urgent',
    client: priya._id,
    lawyers: [mehta._id, desai._id],
    createdBy: admin._id,
    court: 'Bombay High Court',
    nextHearing: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  });
  await case2.save();

  const case3 = new Case({
    title: 'Ravi Singh vs Horizon Builders',
    caseType: 'civil',
    status: 'hearing_soon',
    client: ravi._id,
    lawyers: [desai._id],
    createdBy: admin._id,
    court: 'Pune District Court',
    nextHearing: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  await case3.save();

  console.log('✅ Seed complete');
  console.log('Admin:   admin@legaldesk.com / Admin@123');
  console.log('Lawyer:  mehta@legaldesk.com / Lawyer@123');
  console.log('Lawyer:  desai@legaldesk.com / Lawyer@123');
  console.log('Client:  amit@example.com   / Client@123');
  process.exit(0);
};

runSeed().catch((err) => {
  console.error(err);
  process.exit(1);
});
