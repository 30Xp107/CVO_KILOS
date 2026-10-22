import mongoose from "mongoose";

const householdMemberSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    relationship: { type: String, trim: true, default: "" },
    sex: { type: String, trim: true, default: "" },
    age: { type: String, trim: true, default: "" },
    ipAffiliation: { type: String, trim: true, default: "" },
    employmentStatus: { type: String, trim: true, default: "" },
    courseSkills: { type: String, trim: true, default: "" },
    assistanceNeeded: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    referenceNo: { type: String, required: true, unique: true, index: true },

    personal: {
      region: { type: String, trim: true, default: "" },
      interviewStartTime: { type: String, trim: true, default: "" },
      suffix: { type: String, trim: true, default: "" },
      cardHolderName: { type: String, trim: true, default: "" },
      householdId: { type: String, trim: true, default: "" },
      onboarded: { type: String, trim: true, default: "" },
      address: { type: String, trim: true, default: "" },
      beneficiaryType: { type: String, enum: ["", "head", "member"], default: "" },
      relationshipToHH: { type: String, trim: true, default: "" },
      memberName: { type: String, trim: true, default: "" },
      age: { type: String, trim: true, default: "" },
      sex: { type: String, trim: true, default: "" },
      birthday: { type: String, trim: true, default: "" },
      civilStatus: { type: String, trim: true, default: "" },
      contactNo: { type: String, trim: true, default: "" },
      citizenship: { type: String, trim: true, default: "" },
      religion: { type: String, trim: true, default: "" },
      highestEducation: { type: String, trim: true, default: "" },
      yearGraduated: { type: String, trim: true, default: "" },
      sectors: { type: [String], default: [] },
      sectorSpecify: { type: String, trim: true, default: "" },
      sectorOthers: { type: String, trim: true, default: "" },
      dialects: { type: [String], default: [] },
      dialectOthers: { type: String, trim: true, default: "" },
    },

    householdMembers: { type: [householdMemberSchema], default: [] },

    skills: {
      previouslyParticipated: { type: String, enum: ["", "yes", "no"], default: "" },
      participationSpecify: { type: String, trim: true, default: "" },
      competencyLevel: { type: String, trim: true, default: "" },
      experiences: { type: [String], default: [] },
      experiencesOthers: { type: String, trim: true, default: "" },
      involvement: { type: String, trim: true, default: "" },
      earningIncome: { type: String, trim: true, default: "" },
      monthlyIncome: { type: String, trim: true, default: "" },
      primaryIncomeSource: { type: String, trim: true, default: "" },
    },

    opportunities: {
      assistanceInterests: { type: [String], default: [] },
      priorities: {
        skillsTraining: { type: String, trim: true, default: "" },
        employment: { type: String, trim: true, default: "" },
        livelihood: { type: String, trim: true, default: "" },
        education: { type: String, trim: true, default: "" },
        other: { type: String, trim: true, default: "" },
      },
      otherAssistance: { type: String, trim: true, default: "" },
      skillsTraining: {
        duration: { type: String, trim: true, default: "" },
        weekdays: { type: [String], default: [] },
        weekends: { type: [String], default: [] },
        activities: { type: [String], default: [] },
        others: { type: String, trim: true, default: "" },
      },
      employment: {
        status: { type: [String], default: [] },
        statusOthers: { type: String, trim: true, default: "" },
        availability: { type: String, trim: true, default: "" },
        jobFair: { type: String, enum: ["", "yes", "no"], default: "" },
        documents: { type: [String], default: [] },
        sectors: { type: [String], default: [] },
        others: { type: String, trim: true, default: "" },
      },
      livelihood: {
        existing: { type: String, enum: ["", "yes", "no"], default: "" },
        existingSpecify: { type: String, trim: true, default: "" },
        type: { type: String, trim: true, default: "" },
        duration: { type: String, trim: true, default: "" },
        received: { type: String, enum: ["", "yes", "no"], default: "" },
        receivedSpecify: { type: String, trim: true, default: "" },
        agency: { type: String, trim: true, default: "" },
        yearReceived: { type: String, trim: true, default: "" },
        assistanceType: { type: String, trim: true, default: "" },
        interests: { type: [String], default: [] },
        others: { type: String, trim: true, default: "" },
      },
      education: {
        opportunities: { type: [String], default: [] },
        otherOpportunity: { type: String, trim: true, default: "" },
        interest12Months: { type: String, trim: true, default: "" },
        learningMode: { type: [String], default: [] },
        schedule: { type: [String], default: [] },
        alsAttended: { type: String, enum: ["", "yes", "no"], default: "" },
        alsProgram: { type: String, trim: true, default: "" },
        alsStatus: { type: String, trim: true, default: "" },
        alsStatusOther: { type: String, trim: true, default: "" },
      },
      specialized: {
        types: { type: [String], default: [] },
        others: { type: String, trim: true, default: "" },
      },
    },

    constraints: {
      types: { type: [String], default: [] },
      others: { type: String, trim: true, default: "" },
    },

    goals: {
      types: { type: [String], default: [] },
      others: { type: String, trim: true, default: "" },
      readiness: { type: String, trim: true, default: "" },
      readinessReason: { type: String, trim: true, default: "" },
    },

    consent: {
      agreed: { type: Boolean, default: false },
      signedName: { type: String, trim: true, default: "" },
      interviewEndTime: { type: String, trim: true, default: "" },
    },

    staff: {
      referralPathways: { type: [String], default: [] },
      partners: { type: [String], default: [] },
      partnerOthers: { type: String, trim: true, default: "" },
      remarks: { type: String, trim: true, default: "" },
      interviewedBy: { type: String, trim: true, default: "" },
      position: { type: String, trim: true, default: "" },
      dateProfiled: { type: String, trim: true, default: "" },
      office: { type: String, trim: true, default: "" },
      dateReferred: { type: String, trim: true, default: "" },
      agencyReferredTo: { type: String, trim: true, default: "" },
      referralStatus: { type: String, trim: true, default: "pending" },
    },

    status: {
      type: String,
      enum: ["new", "in_review", "referred", "completed"],
      default: "new",
      index: true,
    },

    submittedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

submissionSchema.index({ "personal.cardHolderName": "text", "personal.address": "text" });
submissionSchema.index({ "personal.contactNo": 1 });
submissionSchema.index({ submittedAt: -1 });

export const Submission =
  mongoose.models.Submission || mongoose.model("Submission", submissionSchema);

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "KILOS Administrator" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "staff"], default: "admin" },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);
