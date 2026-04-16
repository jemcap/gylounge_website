export type PolicyContact = {
  email: string;
  organisation: string;
  location: string;
};

export type PolicySectionData = {
  id: string;
  number: number;
  title: string;
  description: string[];
  items: string[];
  additionalInfo?: string;
  contact?: PolicyContact;
};

export type PrivacyPolicyContent = {
  title: string;
  lastUpdated: string;
  introLead: {
    organisation: string;
    aliases: string;
  };
  intro: string[];
  sections: PolicySectionData[];
};

export const privacyPolicyContent: PrivacyPolicyContent = {
  title: "Privacy Policy",
  lastUpdated: "20/11/2026",
  introLead: {
    organisation: "Golden Years Lounge",
    aliases: '("GYL", "we", "our", or "us")',
  },
  intro: [
    "is committed to protecting your privacy and handling your personal data responsibly.",
    "This Privacy Policy explains how we collect, use, store, and protect personal information in accordance with the Data Protection Act, 2012 (Act 843) of Ghana.",
    "By using our website, services, or engaging with us, you consent to the practices described in this policy.",
  ],
  sections: [
    {
      id: "information-we-collect",
      number: 1,
      title: "Information We Collect",
      description: [
        "We may collect the following types of personal information:",
        
      ],
      items: [
        "Name",
        "Email address",
        "Phone number",
        "Any information you submit via contact forms, sign-ups, bookings, or enquiries",
        "Technical data such as IP address, browser type, and device information (via analytics tools)",
      ],
      additionalInfo: "We only collect information that is necessary and relevant to our services.",
    },
    {
      id: "how-we-use-your-information",
      number: 2,
      title: "How We Use Your Information",
      description: ["We use your personal data to:"],
      items: [
        "Respond to enquiries and communications",
        "Manage bookings, events, or community activities",
        "Improve our website and services",
        "Send relevant updates or information (where consent has been given)",
        "Meet legal or regulatory obligations",
      ],
      additionalInfo: "We do not sell or misuse your personal data.",
    },
    {
      id: "legal-basis-for-processing",
      number: 3,
      title: "Legal Basis for Processing",
      description: [
        "We process personal data based on one or more of the following:",
      ],
      items: [
        "Your consent",
        "The necessity to provide a service you have requested",
        "Compliance with legal obligations under Ghanaian law",
      ],
    },
    {
      id: "data-sharing-and-disclosure",
      number: 4,
      title: "Data Sharing and Disclosure",
      description: [
        "We do not share your personal data with third parties except:",
      ],
      items: [
        "Where required by law or regulatory authorities",
        "With trusted service providers (e.g. hosting or analytics services) who are bound by confidentiality and data protection obligations",
      ],
    },
    {
      id: "data-security",
      number: 5,
      title: "Data Security",
      description: [
        "We take reasonable technical and organisational measures to protect your personal data against:",
      ],
      items: ["Unauthorised access", "Loss", "Misuse", "Disclosure"],
      additionalInfo:
        "While no system is 100% secure, we actively work to safeguard your information.",
    },
    {
      id: "data-retention",
      number: 6,
      title: "Data Retention",
      description: [
        "We retain personal data only for as long as necessary to fulfil the purposes for which it was collected, unless a longer retention period is required by law.",
      ],
      items: [],
    },
    {
      id: "your-rights",
      number: 7,
      title: "Your Rights",
      description: [
        "Under Ghana's Data Protection Act, you have the right to:",
      ],
      items: [
        "Access your personal data",
        "Request correction or deletion of inaccurate data",
        "Withdraw consent where processing is based on consent",
        "Object to the processing of your personal data",
        "To exercise any of these rights, please contact us using the details below.",
      ],
    },
    {
      id: "cookies-and-analytics",
      number: 8,
      title: "Cookies and Analytics",
      description: [
        "Our website may use cookies or analytics tools to improve functionality and user experience. These tools do not personally identify you unless you voluntarily provide personal information.",
        "You can adjust your browser settings to refuse cookies if you prefer.",
      ],
      items: [],
    },
    {
      id: "changes-to-this-policy",
      number: 9,
      title: "Changes to This Policy",
      description: [
        "We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.",
      ],
      items: [],
    },
    {
      id: "contact-us",
      number: 10,
      title: "Contact Us",
      description: [
        "If you have any questions about this Privacy Policy or how your data is handled, please contact us:",
      ],
      items: [],
      contact: {
        email: "admin@goldenlounge.co.uk",
        organisation: "Golden Years Lounge",
        location: "Ghana",
      },
    },
  ],
};
