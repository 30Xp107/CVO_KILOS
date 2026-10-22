import { LABELS } from "../../shared/labels.js";

export const STEPS = [
  {
    id: "personal",
    number: 1,
    title: "Personal Information",
    short: "Personal",
    description: "Basic details and household information",
  },
  {
    id: "skills",
    number: 2,
    title: "Skills & Experience",
    short: "Skills",
    description: "Work, livelihood, and training background",
  },
  {
    id: "opportunities",
    number: 3,
    title: "Opportunities & Support",
    short: "Support",
    description: "Assistance you would like to receive",
  },
  {
    id: "needs",
    number: 4,
    title: "Needs & Goals",
    short: "Goals",
    description: "Challenges, specialized support, and goals",
  },
  {
    id: "review",
    number: 5,
    title: "Review & Consent",
    short: "Review",
    description: "Check your answers and submit",
  },
];

const opts = (map) => Object.entries(map).map(([value, label]) => ({ value, label }));

export const SECTORS = opts(LABELS.sectors);
export const DIALECTS = opts(LABELS.dialects);
export const COMPETENCIES = opts(LABELS.competency);
export const INVOLVEMENT = opts(LABELS.involvement);
export const EARNING = opts(LABELS.earning);
export const INCOME = opts(LABELS.income);
export const ASSISTANCE = opts(LABELS.assistance);
export const DURATIONS = opts(LABELS.durations);
export const TIMES = opts(LABELS.timeOfDay);
export const EMPLOYMENT_STATUS = opts(LABELS.employmentStatus);
export const AVAILABILITY = opts(LABELS.availability);
export const DOCUMENTS = opts(LABELS.documents);
export const EMPLOYMENT_SECTORS = opts(LABELS.employmentSectors);
export const EDUCATION_OPPORTUNITIES = opts(LABELS.education);
export const INTEREST = opts(LABELS.interest);
export const LEARNING_MODES = opts(LABELS.learningMode);
export const SCHEDULES = opts(LABELS.schedule);
export const ALS_STATUS = opts(LABELS.alsStatus);
export const SPECIALIZED = opts(LABELS.specialized);
export const GOALS = opts(LABELS.goals);
export const READINESS = opts(LABELS.readiness);
export const REFERRAL_PATHWAYS = opts(LABELS.referralPathways);
export const PARTNERS = opts(LABELS.partners);
export const REFERRAL_STATUS = opts(LABELS.referralStatus);

export const SEX_OPTIONS = ["Male", "Female"].map((v) => ({ value: v, label: v }));
export const CIVIL_STATUS_OPTIONS = [
  "Single",
  "Married",
  "Separated",
  "Widowed",
  "Annulled",
].map((v) => ({ value: v, label: v }));
export const EDUCATION_OPTIONS = [
  "No formal education",
  "Elementary level",
  "Elementary graduate",
  "High school level",
  "High school graduate",
  "Senior high school level",
  "Senior high school graduate",
  "Vocational / Technical",
  "College level",
  "College graduate",
  "Post-graduate",
].map((v) => ({ value: v, label: v }));

export const EXPERIENCE_GROUPS = [
  {
    title: "Agriculture and Natural Resources",
    icon: "sprout",
    items: [
      { value: "farming", label: "Farming" },
      { value: "fishing", label: "Fishing" },
      { value: "livestock", label: "Livestock Raising" },
      { value: "gardening", label: "Gardening" },
    ],
  },
  {
    title: "Skilled Trades and Construction",
    icon: "hammer",
    items: [
      { value: "construction", label: "Construction Work" },
      { value: "carpentry", label: "Carpentry" },
      { value: "electrical", label: "Electrical Work" },
      { value: "welding", label: "Welding" },
      { value: "repair", label: "Repair and Maintenance Services" },
    ],
  },
  {
    title: "Food, Hospitality, and Service",
    icon: "utensils",
    items: [
      { value: "food_vending", label: "Food Vending" },
      { value: "cooking", label: "Cooking and Food Preparation" },
      { value: "bread_pastry", label: "Bread and Pastry Production" },
      { value: "housekeeping", label: "Housekeeping" },
      { value: "food_beverage", label: "Food and Beverage Service" },
    ],
  },
  {
    title: "Transportation and Logistics",
    icon: "truck",
    items: [
      { value: "driving", label: "Driving" },
      { value: "delivery", label: "Delivery Services" },
    ],
  },
  {
    title: "Household and Personal Services",
    icon: "home",
    items: [
      { value: "laundry", label: "Laundry and Ironing Services" },
      { value: "house_cleaning", label: "House Cleaning Services" },
      { value: "childcare", label: "Childcare and Caregiving" },
      { value: "beauty", label: "Beauty and Personal Care Services" },
      { value: "massage", label: "Massage and Wellness Services" },
      { value: "sewing", label: "Sewing and Dressmaking" },
    ],
  },
  {
    title: "Office and Administrative Services",
    icon: "briefcase",
    items: [
      { value: "admin_work", label: "Office / Administrative Work" },
      { value: "cashier", label: "Cashier" },
      { value: "customer_service", label: "Customer Services" },
      { value: "gov_staff", label: "Government Office Staff" },
      { value: "private_staff", label: "Private Company Office Staff" },
      { value: "computer", label: "Computer-related Services" },
    ],
  },
  {
    title: "Selling and Business Activities",
    icon: "store",
    items: [
      { value: "online_seller", label: "Online Seller" },
      { value: "selling_marketing", label: "Selling and Marketing" },
      { value: "sari_sari", label: "Sari-Sari Store" },
    ],
  },
  {
    title: "Community and Other Services",
    icon: "users",
    items: [
      { value: "street_sweeping", label: "Street Sweeping" },
      { value: "waste", label: "Waste Collection and Recycling" },
      { value: "janitor", label: "Janitor" },
      { value: "security", label: "Security Guard" },
    ],
  },
];

export const TRAINING_GROUPS = [
  {
    title: "Tourism, Hospitality & Services",
    items: [
      { value: "housekeeping_training", label: "Housekeeping" },
      { value: "fbs_training", label: "Food and Beverage Services" },
      { value: "table_skirting", label: "Table Skirting" },
    ],
  },
  {
    title: "Information Technology",
    items: [
      { value: "computer_system", label: "Computer System Servicing" },
      { value: "animation", label: "Animation" },
      { value: "contact_center", label: "Contact Center Services" },
    ],
  },
  {
    title: "Agriculture and Natural Resources",
    items: [
      { value: "organic_agri", label: "Organic Agriculture Production" },
      { value: "crops_training", label: "Agricultural Crops Production" },
      { value: "animal_production", label: "Animal Production" },
      { value: "landscaping", label: "Landscaping" },
    ],
  },
  {
    title: "Construction & Automotive",
    items: [
      { value: "smaw", label: "Shield Metal Arc Welding (SMAW)" },
      { value: "carpentry_training", label: "Carpentry" },
      { value: "masonry", label: "Masonry" },
      { value: "electrical_installation", label: "Electrical Installation & Maintenance" },
      { value: "automotive", label: "Automotive Servicing" },
      { value: "driving_training", label: "Driving" },
      { value: "construction_painting", label: "Construction Painting" },
    ],
  },
  {
    title: "Food Production and Processing",
    items: [
      { value: "food_processing", label: "Food Processing" },
      { value: "bread_pastry_production", label: "Bread and Pastry Production" },
      { value: "cookery", label: "Cookery" },
    ],
  },
  {
    title: "Household and Personal Services",
    items: [
      { value: "dressmaking_training", label: "Dressmaking" },
      { value: "massage_therapy", label: "Massage Therapy" },
      { value: "cosmetology", label: "Cosmetology" },
    ],
  },
  {
    title: "Entrepreneurship and Business",
    items: [
      { value: "financial_literacy", label: "Financial Literacy" },
      { value: "bookkeeping", label: "Bookkeeping" },
    ],
  },
];

export const LIVELIHOOD_GROUPS = [
  {
    title: "Retail and Trading",
    items: [
      { value: "sari_sari_livelihood", label: "Sari-Sari Store" },
      { value: "agri_supplies", label: "Agricultural Supplies" },
      { value: "crop_production_business", label: "Crop Production / Farming" },
      { value: "startup_capital", label: "Start-up Capital" },
      { value: "expansion", label: "Expansion of Existing Business" },
    ],
  },
  {
    title: "Food and Services",
    items: [
      { value: "street_vending", label: "Street Vending" },
      { value: "catering", label: "Catering Services" },
      { value: "baking_pastry", label: "Baking and Pastry Production" },
      { value: "food_processing_livelihood", label: "Food Processing" },
      { value: "food_stall", label: "Food Stall" },
    ],
  },
  {
    title: "Agriculture and Livestock",
    items: [
      { value: "poultry", label: "Poultry Raising" },
      { value: "crop_farming", label: "Crop Farming" },
      { value: "vegetable_gardening", label: "Vegetable Gardening" },
      { value: "fishing_livelihood", label: "Fishing" },
      { value: "hog_raising", label: "Hog Raising" },
    ],
  },
  {
    title: "Production and Handicrafts",
    items: [
      { value: "dressmaking_livelihood", label: "Dressmaking" },
      { value: "handicraft", label: "Handicraft Making" },
      { value: "furniture", label: "Furniture or Woodcraft Production" },
      { value: "tailoring", label: "Tailoring" },
      { value: "soap_candle", label: "Soap or Candle Making" },
    ],
  },
];

export const CONSTRAINT_GROUPS = [
  {
    title: "Financial and Material Barriers",
    items: [
      { value: "capital", label: "Lack of capital or starting funds" },
      { value: "transport", label: "High cost of transportation to training/work sites" },
      { value: "allowance", label: "Lack of allowance for daily food or school supplies" },
      { value: "tools", label: "No access to tools, equipment, or laptops/smartphones" },
    ],
  },
  {
    title: "Personal and Family Constraints",
    items: [
      { value: "childcare", label: "Childcare responsibilities or lack of a helper at home" },
      { value: "caretaker", label: "Caretaker duties for an elderly or sick family member" },
      { value: "family_responsibilities", label: "Family responsibilities affecting participation" },
      { value: "health", label: "Health conditions or physical limitations" },
    ],
  },
  {
    title: "Community and Environmental Barriers",
    items: [
      { value: "remote", label: "Remote location / lack of accessible public transport" },
      { value: "internet", label: "Unstable internet connection or frequent power outages" },
      { value: "safety", label: "Safety or security concerns in the community" },
      { value: "disasters", label: "Affected by recent natural disasters or calamities" },
      { value: "opportunities", label: "Lack of available opportunities nearby" },
    ],
  },
  {
    title: "Skills and Institutional Barriers",
    items: [
      { value: "documents", label: "Lack of required documents (e.g. IDs, PSA, NBI)" },
      { value: "education_barrier", label: "Low educational attainment or lack of official certifications" },
      { value: "language", label: "Language barrier or difficulty in reading/writing" },
    ],
  },
];

export const hhMemberTemplate = () => ({
  name: "",
  relationship: "",
  sex: "",
  age: "",
  ipAffiliation: "",
  employmentStatus: "",
  courseSkills: "",
  assistanceNeeded: "",
});

export const createInitialForm = () => ({
  personal: {
    region: "",
    interviewStartTime: "",
    suffix: "",
    cardHolderName: "",
    householdId: "",
    onboarded: "",
    address: "",
    beneficiaryType: "",
    relationshipToHH: "",
    memberName: "",
    age: "",
    sex: "",
    birthday: "",
    civilStatus: "",
    contactNo: "",
    citizenship: "Filipino",
    religion: "",
    highestEducation: "",
    yearGraduated: "",
    sectors: [],
    sectorSpecify: "",
    sectorOthers: "",
    dialects: [],
    dialectOthers: "",
  },
  householdMembers: [],
  skills: {
    previouslyParticipated: "",
    participationSpecify: "",
    competencyLevel: "",
    experiences: [],
    experiencesOthers: "",
    involvement: "",
    earningIncome: "",
    monthlyIncome: "",
    primaryIncomeSource: "",
  },
  opportunities: {
    assistanceInterests: [],
    priorities: {
      skillsTraining: "",
      employment: "",
      livelihood: "",
      education: "",
      other: "",
    },
    otherAssistance: "",
    skillsTraining: {
      duration: "",
      weekdays: [],
      weekends: [],
      activities: [],
      others: "",
    },
    employment: {
      status: [],
      statusOthers: "",
      availability: "",
      jobFair: "",
      documents: [],
      sectors: [],
      others: "",
    },
    livelihood: {
      existing: "",
      existingSpecify: "",
      type: "",
      duration: "",
      received: "",
      receivedSpecify: "",
      agency: "",
      yearReceived: "",
      assistanceType: "",
      interests: [],
      others: "",
    },
    education: {
      opportunities: [],
      otherOpportunity: "",
      interest12Months: "",
      learningMode: [],
      schedule: [],
      alsAttended: "",
      alsProgram: "",
      alsStatus: "",
      alsStatusOther: "",
    },
    specialized: {
      types: [],
      others: "",
    },
  },
  constraints: { types: [], others: "" },
  goals: { types: [], others: "", readiness: "", readinessReason: "" },
  consent: {
    agreed: false,
    signedName: "",
    interviewEndTime: "",
  },
  website: "",
});

export const PRIORITY_KEYS = {
  skills_training: "skillsTraining",
  employment: "employment",
  livelihood: "livelihood",
  education: "education",
  other: "other",
};
