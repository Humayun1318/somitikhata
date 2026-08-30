export type Locale = 'en' | 'bn';

export const memberMetrics = {
  totalSavings: 125000,
  thisMonthDeposit: 6500,
  previousBalance: 118500,
  assetShare: 18500,
  activeLoan: 42000,
  nextInstallment: 4200,
};

export const publicFeatureCards = {
  en: [
    { title: 'Savings tracking', description: 'Track every monthly deposit, balance, and history without paper-ledger errors.' },
    { title: 'Loan workflow', description: 'Review applications, approvals, and repayments in one place.' },
    { title: 'Shared asset share', description: 'Calculate each member’s share from real contribution totals and current values.' },
    { title: 'Bilingual by design', description: 'Switch between Bangla and English without losing context or navigation.' },
  ],
  bn: [
    { title: 'সঞ্চয় অনুসরণ', description: 'কাগজের খাতা ছাড়াই প্রতিটি মাসের জমা, ব্যালেন্স ও ইতিহাস দেখে নিন।' },
    { title: 'ঋণ ব্যবস্থাপনা', description: 'আবেদন, অনুমোদন ও কিস্তি এক জায়গায় পরিচালনা করুন।' },
    { title: 'যৌথ সম্পদ শেয়ার', description: 'বাস্তব অবদান ও বর্তমান মূল্য অনুযায়ী সদস্যের অংশ গণনা করুন।' },
    { title: 'দ্বিভাষিক ডিজাইন', description: 'বাংলা ও ইংরেজি মধ্যে সহজে সুইচ করুন, নেভিগেশন হারাবেন না।' },
  ],
};

export const publicFaq = {
  en: [
    { question: 'Do members need internet access?', answer: 'Members can check their balance and savings history from a phone with internet; for deposit entry and admin actions, the system is designed for an online admin environment.' },
    { question: 'What if someone does not have a smartphone?', answer: 'Paper records can continue as a backup, and the system supports simple SMS-based updates to keep communication accessible.' },
    { question: 'Can we still keep a paper record?', answer: 'Yes. The platform is meant to complement the paper khata, not replace the committee’s recordkeeping practice entirely.' },
    { question: 'What does it cost?', answer: 'This prototype is a local review build. The real production setup is planned later after the approval process.' },
  ],
  bn: [
    { question: 'সদস্যদের ইন্টারনেট দরকার কি?', answer: 'সদস্যরা ফোন থেকেই ব্যালেন্স ও জমার ইতিহাস দেখতে পারবেন; জমা-নথিভুক্তি ও প্রশাসনিক কার্যক্রমের জন্য অনলাইন প্রশাসনিক পরিবেশের পরিকল্পনা আছে।' },
    { question: 'যদি কারও স্মার্টফোন না থাকে?', answer: 'কাগজের খাতা নিরাপদভাবে চলতে পারে, এবং যোগাযোগের জন্য SMS-ভিত্তিক সহায়তার পরিকল্পনা রয়েছে।' },
    { question: 'কাগজের রেকর্ড রাখা যাবে?', answer: 'হ্যাঁ। এই সিস্টেম কাগজের খাতার বিকল্প নয়, বরং তা সমর্থন করার জন্য ডিজাইন করা হয়েছে।' },
    { question: 'খরচ কেমন?', answer: 'এই প্রোটোটাইপটি স্থানীয় রিভিউর জন্য; প্রকৃত উৎপাদন সেটআপ পরবর্তী অনুমোদনের পরে ঠিক করা হবে।' },
  ],
};

export const adminStats = {
  en: [
    { title: 'Total members', value: '482', meta: '+12 this month' },
    { title: 'Savings collected', value: '৳8,45,000', meta: 'Across all active members' },
    { title: 'Active loans', value: '38', meta: '7 overdue' },
    { title: 'Deposit completion', value: '412 / 482', meta: 'This month' },
  ],
  bn: [
    { title: 'মোট সদস্য', value: '৪৮২', meta: 'এই মাসে ১২ জন' },
    { title: 'জমা সংগ্রহ', value: '৳৮,৪৫,০০০', meta: 'সকল সক্রিয় সদস্য' },
    { title: 'সক্রিয় ঋণ', value: '৩৮', meta: '৭টি বকেয়া' },
    { title: 'জমা সম্পূর্ণতা', value: '৪১২ / ৪৮২', meta: 'এই মাসে' },
  ],
};

export const adminMembers = [
  { id: 'SK-0042', name: 'Rahim Uddin', phone: '01711-222333', status: 'active', totalSavings: 124500 },
  { id: 'SK-0047', name: 'Nusrat Jahan', phone: '01822-449900', status: 'pending', totalSavings: 0 },
  { id: 'SK-0051', name: 'Kamal Hossain', phone: '01914-900112', status: 'active', totalSavings: 98000 },
  { id: 'SK-0058', name: 'Shirin Akter', phone: '01688-334455', status: 'inactive', totalSavings: 65000 },
];

export const adminDeposits = [
  { member: 'Rahim Uddin', month: '2026-08', amount: 5000, status: 'Recorded' },
  { member: 'Nusrat Jahan', month: '2026-08', amount: 3500, status: 'Pending' },
  { member: 'Kamal Hossain', month: '2026-08', amount: 4200, status: 'Recorded' },
  { member: 'Shirin Akter', month: '2026-08', amount: 0, status: 'Missing' },
];

export const adminLoans = [
  { member: 'Rahim Uddin', principal: 45000, due: '2026-09-15', status: 'active' },
  { member: 'Kamal Hossain', principal: 30000, due: '2026-09-08', status: 'overdue' },
  { member: 'Nusrat Jahan', principal: 17000, due: '2026-09-20', status: 'pending' },
];

export const assetRows = [
  { name: 'School plot', value: 2450000, share: '12.4%', memberCount: 42 },
  { name: 'Cattle shed', value: 870000, share: '5.7%', memberCount: 21 },
  { name: 'Community store', value: 1300000, share: '8.9%', memberCount: 30 },
];

export const memberDepositHistory = [
  { month: 'Jun 2026', amount: 3000, balance: 65000 },
  { month: 'Jul 2026', amount: 4500, balance: 69500 },
  { month: 'Aug 2026', amount: 5500, balance: 75000 },
  { month: 'Sep 2026', amount: 6500, balance: 81500 },
];

export const memberLoanSummary = {
  active: true,
  remaining: 42000,
  nextInstallment: 4200,
  dueDate: '2026-09-15',
};

export const memberAssetShare = {
  value: 18500,
  basis: '12.4% of land asset',
};

export const reportsSummary = [
  { label: 'Monthly collection', value: '৳1,82,500' },
  { label: 'Loan portfolio', value: '৳2,60,000' },
  { label: 'Asset value', value: '৳46,00,000' },
];

export const notifications = [
  { channel: 'SMS', message: 'Deposit recorded for August', status: 'sent' },
  { channel: 'SMS', message: 'Loan installment due reminder', status: 'pending' },
  { channel: 'In-app', message: 'Member share update published', status: 'sent' },
];

export const mockMembers = [
  { id: 'm-001', name: 'Rahim Uddin', role: 'member', status: 'active' },
  { id: 'm-002', name: 'Nusrat Jahan', role: 'member', status: 'active' },
];

export const mockDeposits = [
  { id: 'd-001', memberId: 'm-001', amount: 2500, date: '2026-08-15' },
  { id: 'd-002', memberId: 'm-001', amount: 5000, date: '2026-08-20' },
];
