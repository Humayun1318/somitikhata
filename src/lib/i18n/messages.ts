export type Locale = 'en' | 'bn';

export const messages = {
  en: {
    site: {
      name: 'SomitiKhata',
      tagline: 'Digital savings, loans, and shared assets for cooperative communities.',
    },
    nav: {
      howItWorks: 'How it works',
      features: 'Features',
      faq: 'FAQ',
      login: 'Login',
      register: 'Create account',
      language: 'বাংলা',
    },
    hero: {
      eyebrow: 'Digital ledger for your cooperative',
      title: 'A clearer way to manage savings, loans, and shared assets.',
      description:
        'SomitiKhata helps committees track deposits, view member balances, and keep shared asset records organized with clarity and trust.',
      primaryCta: 'Create account',
      secondaryCta: 'Member login',
      statLabel: 'Total savings',
      statValue: '৳1,25,000',
      savings: 'Savings',
      loans: 'Loans',
      assetShare: 'Asset share',
    },
    sections: {
      howItWorksLabel: 'How it works',
      howItWorksTitle: 'A simple workflow designed for real committees',
      steps: [
        'Committee members verify each account before access is approved.',
        'Members register with a trusted phone or email identity.',
        'Committee staff log deposits and repayments in a single ledger.',
        'Members can view balances, shares, and loan status without confusion.',
      ],
      featuresLabel: 'Features',
      featuresTitle: 'Everything a cooperative needs to stay organized',
      features: [
        {
          title: 'Savings tracking',
          description: 'Monitor every deposit, current balance, and monthly history with less paperwork and fewer errors.',
          icon: '💰',
        },
        {
          title: 'Loan overview',
          description: 'Keep applications, approvals, repayment schedules, and outstanding balances in one clear place.',
          icon: '📄',
        },
        {
          title: 'Shared asset share',
          description: 'See each member’s contribution to shared property and understand asset value without manual calculations.',
          icon: '🏠',
        },
        {
          title: 'Bilingual access',
          description: 'Switch between English and Bangla without losing context, route flow, or important navigation.',
          icon: '🌐',
        },
      ],
      trustLabel: 'Why it matters',
      trustTitle: 'Built for transparency and accountability',
      trustPoints: [
        'Access is controlled for authorized members and committee staff only.',
        'Important events are recorded in a structured way so nothing is left ambiguous.',
        'The platform keeps records clear enough for a committee to review them with confidence.',
      ],
      faqLabel: 'FAQ',
      faqTitle: 'Common questions from committees and members',
      faq: [
        {
          question: 'Do members need internet access?',
          answer:
            'Yes, members can check balances and savings activity from a phone with internet access. Committee-side deposit and review work is designed for the online administration flow.',
        },
        {
          question: 'Can paper records still be kept?',
          answer:
            'Yes. The system is designed to support the committee’s day-to-day recordkeeping rather than replace it entirely.',
        },
        {
          question: 'Can members self-register?',
          answer:
            'The intended flow is approval-based. New members are added through a committee-controlled pre-approval setup before full access is granted.',
        },
        {
          question: 'Is this secure?',
          answer:
            'This phase focuses on a reviewable, trustworthy UI and route structure. Security hardening and real backend logic are planned for the later implementation stages.',
        },
      ],
      ctaTitle: 'Bring your cooperative into a cleaner digital workflow.',
      ctaDescription:
        'Use SomitiKhata to simplify savings tracking, reduce manual confusion, and provide members with a more transparent view of shared finances.',
      ctaButton: 'Create account',
    },
    footer: {
      brand: 'SomitiKhata',
      tagline: 'Digital savings ledger for cooperative communities',
      login: 'Login',
      register: 'Register',
      language: 'বাংলা',
    },
  },
  bn: {
    site: {
      name: 'সোমিতিখাতা',
      tagline: 'সমবায়ের জন্য ডিজিটাল সঞ্চয়, ঋণ ও যৌথ সম্পদ ব্যবস্থাপনা।',
    },
    nav: {
      howItWorks: 'কীভাবে কাজ করে',
      features: 'ফিচার',
      faq: 'প্রশ্ন',
      login: 'লগইন',
      register: 'একাউন্ট তৈরি',
      language: 'English',
    },
    hero: {
      eyebrow: 'আপনার সমিতির ডিজিটাল খাতা',
      title: 'সঞ্চয়, ঋণ ও যৌথ সম্পদ সহজভাবে পরিচালনা করার একটি পরিষ্কার উপায়।',
      description:
        'সোমিতিখাতা কমিটি ও সদস্যদের জন্য জমা, ব্যালেন্স, ও যৌথ সম্পদ রেকর্ড দ্রুত, স্পষ্ট ও নির্ভরযোগ্যভাবে দেখার সুযোগ দেয়।',
      primaryCta: 'একাউন্ট তৈরি',
      secondaryCta: 'সদস্য লগইন',
      statLabel: 'মোট সঞ্চয়',
      statValue: '৳১,২৫,০০০',
      savings: 'সঞ্চয়',
      loans: 'ঋণ',
      assetShare: 'সম্পদ শেয়ার',
    },
    sections: {
      howItWorksLabel: 'কীভাবে কাজ করে',
      howItWorksTitle: 'বাস্তব কমিটির জন্য সহজ ও পরিষ্কার ওয়ার্কফ্লো',
      steps: [
        'কমিটি সদস্যগণ অ্যাক্সেসের আগে প্রতিটি অ্যাকাউন্ট যাচাই করে নেন।',
        'সদস্যরা নির্ভরযোগ্য ফোন বা ইমেইল দিয়ে রেজিস্ট্রেশন করেন।',
        'কমিটি কর্মীরা একসাথে জমা এবং কিস্তি রেকর্ড রাখেন।',
        'সদস্যরা ব্যালেন্স, শেয়ার ও ঋণের অবস্থা সহজেই দেখতে পান।',
      ],
      featuresLabel: 'ফিচার',
      featuresTitle: 'সমিতির জন্য প্রয়োজনীয় সবকিছু একসাথে',
      features: [
        {
          title: 'সঞ্চয় ব্যবস্থাপনা',
          description: 'প্রতি মাসের জমা, বর্তমান ব্যালেন্স ও ইতিহাস কাগজের খাতা ছাড়াই সহজে দেখুন।',
          icon: '💰',
        },
        {
          title: 'ঋণ ও কিস্তি',
          description: 'আবেদন, অনুমোদন, পরিশোধের সময়সূচি ও বকেয়া এক নজরে নিরীক্ষণ করুন।',
          icon: '📄',
        },
        {
          title: 'যৌথ সম্পদ শেয়ার',
          description: 'প্রতিটি সদস্যের অবদান ও সম্পদের মূল্য সহজে বুঝুন, হাতে-কলমে হিসাবের ঝামেলা ছাড়াই।',
          icon: '🏠',
        },
        {
          title: 'দ্বিভাষিক ব্যবহার',
          description: 'ইংরেজি ও বাংলা মুঠোফোনের একসাথে ব্যবহার করুন—নেভিগেশন বা প্রসঙ্গ হারাবেন না।',
          icon: '🌐',
        },
      ],
      trustLabel: 'কেন গুরুত্বপূর্ণ',
      trustTitle: 'স্বচ্ছতা ও জবাবদিহিতার জন্য ডিজাইন',
      trustPoints: [
        'অনুমোদিত সদস্য ও কমিটি কর্মীদের জন্যই অ্যাক্সেস সীমিত রাখা হয়।',
        'গুরুত্বপূর্ণ কাজগুলো স্ট্রাকচার্ডভাবে রেকর্ড করা হয়, যাতে কিছুই অস্পষ্ট থাকে না।',
        'কমিটি চাইলে সহজে রেকর্ড পরীক্ষা করে সিদ্ধান্ত নিতে পারে।',
      ],
      faqLabel: 'প্রশ্ন',
      faqTitle: 'কমিটি ও সদস্যদের সাধারণ প্রশ্ন',
      faq: [
        {
          question: 'সদস্যদের ইন্টারনেট দরকার কি?',
          answer:
            'হ্যাঁ, সদস্যরা ফোনে ইন্টারনেট ব্যবহার করে ব্যালেন্স ও সঞ্চয়ের ইতিহাস দেখতে পারেন। কমিটি পক্ষে জমা-দাখিল ও পর্যালোচনা অনলাইন প্রশাসনিক ফ্লোতে করা হয়।',
        },
        {
          question: 'কাগজের রেকর্ড রাখা যাবে কি?',
          answer:
            'হ্যাঁ। এই সিস্টেম কাগজের খাতাকে পুরোপুরি বাতিল করে না, বরং তা সমর্থন করে আরও পরিষ্কার ও দ্রুত রেকর্ড ব্যবস্থাপনা নিশ্চিত করে।',
        },
        {
          question: 'সদস্যরা নিজে নিজে রেজিস্ট্রেশন করতে পারবে?',
          answer:
            'প্রকল্পের ধারণা অনুযায়ী, সদস্যদের প্রি-অ্যাপ্রুভাল ভিত্তিক অনুমোদনের মাধ্যমে প্রবেশ প্রদান করা হয়, যাতে কমিটি-নিয়ন্ত্রিত নিরাপত্তা বজায় থাকে।',
        },
        {
          question: 'এটি কি নিরাপদ?',
          answer:
            'এই ধাপটি UI/UX ও রুট স্ট্রাকচারের ওপর ফোকাস করে। নিরাপত্তা শক্তিশালীকরণ ও বাস্তব ব্যাকএন্ড লজিক পরে বাস্তবায়নের পর্যায়ে যুক্ত হবে।',
        },
      ],
      ctaTitle: 'আপনার সমিতিকে একটি পরিষ্কার ডিজিটাল ওয়ার্কফ্লোতে নিয়ে আসুন।',
      ctaDescription:
        'সোমিতিখাতা ব্যবহার করে সঞ্চয় ট্র্যাকিং সহজ করুন, কাগজের ভুল কমান এবং সদস্যদের জন্য স্পষ্ট, স্বচ্ছ আর্থিক দৃশ্য তৈরি করুন।',
      ctaButton: 'একাউন্ট তৈরি',
    },
    footer: {
      brand: 'সোমিতিখাতা',
      tagline: 'সমবায়ের জন্য ডিজিটাল সঞ্চয় খাতা',
      login: 'লগইন',
      register: 'রেজিস্ট্রেশন',
      language: 'English',
    },
  },
} as const;

export function resolveLocale(locale?: string): Locale {
  return locale === 'en' ? 'en' : 'bn';
}
