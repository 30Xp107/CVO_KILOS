import { z } from "zod";

const str = (max = 1000) => z.string().trim().max(max).optional().default("");
const strArray = (max = 100) =>
  z.array(z.string().trim().max(200)).max(max).optional().default([]);
const yesNo = z.enum(["", "yes", "no"]).optional().default("");
const priority = z
  .string()
  .trim()
  .max(10)
  .refine((value) => !value || /^([1-9]|1[0-9]|20)$/.test(value), {
    message: "Priority must be a number from 1 to 20",
  })
  .optional()
  .default("");

const PRIORITY_KEYS = {
  skills_training: "skillsTraining",
  employment: "employment",
  livelihood: "livelihood",
  education: "education",
  other: "other",
};

const householdMember = z.object({
  name: str(200),
  relationship: str(120),
  sex: str(40),
  age: str(20),
  ipAffiliation: str(120),
  employmentStatus: str(200),
  courseSkills: str(200),
  assistanceNeeded: str(300),
});

export const submissionSchema = z.object({
  personal: z
    .object({
      region: str(120),
      interviewStartTime: str(50),
      suffix: str(30),
      cardHolderName: z.string().trim().min(2, "Card holder / household head name is required").max(200),
      householdId: str(80),
      onboarded: str(40),
      address: z
        .string()
        .trim()
        .min(1, "Please enter your complete address")
        .max(500),
      beneficiaryType: z.enum(["head", "member"], {
        errorMap: () => ({ message: "Select who is being profiled." }),
      }),
      relationshipToHH: str(120),
      memberName: str(200),
      age: z
        .string()
        .trim()
        .regex(/^\d{1,3}$/, "Enter a valid age")
        .refine((value) => Number(value) >= 1 && Number(value) <= 120, {
          message: "Enter an age between 1 and 120",
        }),
      sex: z.string().trim().min(1, "Select sex").max(30),
      birthday: str(30),
      civilStatus: str(60),
      contactNo: str(40),
      citizenship: str(80),
      religion: str(80),
      highestEducation: str(120),
      yearGraduated: str(40),
      sectors: strArray(20),
      sectorSpecify: str(200),
      sectorOthers: str(200),
      dialects: strArray(20),
      dialectOthers: str(200),
    })
    .optional()
    .default({})
    .superRefine((personal, ctx) => {
      if (personal.beneficiaryType !== "member") return;
      if (!personal.relationshipToHH) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["relationshipToHH"],
          message: "Relationship to the household head is required for a member.",
        });
      }
      if (!personal.memberName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["memberName"],
          message: "Member name is required when profiling a household member.",
        });
      }
    }),
  householdMembers: z.array(householdMember).max(20).optional().default([]),
  skills: z
    .object({
      previouslyParticipated: z.enum(["yes", "no"], {
        errorMap: () => ({
          message: "Select whether you have previously participated in a KILOS program.",
        }),
      }),
      participationSpecify: str(300),
      competencyLevel: str(80),
      experiences: strArray(100),
      experiencesOthers: str(300),
      involvement: z
        .string()
        .trim()
        .min(1, "Select your current level of involvement")
        .max(80),
      earningIncome: str(50),
      monthlyIncome: str(80),
      primaryIncomeSource: str(300),
    })
    .optional()
    .default({}),
  opportunities: z
    .object({
      assistanceInterests: strArray(20),
      priorities: z
        .object({
          skillsTraining: priority,
          employment: priority,
          livelihood: priority,
          education: priority,
          other: priority,
        })
        .optional()
        .default({}),
      otherAssistance: str(300),
      skillsTraining: z
        .object({
          duration: str(80),
          weekdays: strArray(10),
          weekends: strArray(10),
          activities: strArray(100),
          others: str(300),
        })
        .optional()
        .default({}),
      employment: z
        .object({
          status: strArray(20),
          statusOthers: str(300),
          availability: str(80),
          jobFair: yesNo,
          documents: strArray(20),
          sectors: strArray(40),
          others: str(300),
        })
        .optional()
        .default({}),
      livelihood: z
        .object({
          existing: yesNo,
          existingSpecify: str(300),
          type: str(200),
          duration: str(100),
          received: yesNo,
          receivedSpecify: str(300),
          agency: str(200),
          yearReceived: str(20),
          assistanceType: str(300),
          interests: strArray(40),
          others: str(300),
        })
        .optional()
        .default({}),
      education: z
        .object({
          opportunities: strArray(20),
          otherOpportunity: str(300),
          interest12Months: str(50),
          learningMode: strArray(10),
          schedule: strArray(10),
          alsAttended: yesNo,
          alsProgram: str(200),
          alsStatus: str(80),
          alsStatusOther: str(300),
        })
        .optional()
        .default({}),
      specialized: z
        .object({
          types: strArray(20),
          others: str(300),
        })
        .optional()
        .default({}),
    })
    .optional()
    .default({})
    .superRefine((opportunities, ctx) => {
      const selected = opportunities.assistanceInterests || [];
      if (selected.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["assistanceInterests"],
          message: "Select at least one assistance or support service.",
        });
        return;
      }

      const priorities = opportunities.priorities || {};
      const missing = selected.filter((code) => !priorities[PRIORITY_KEYS[code]]);
      if (missing.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["priorities"],
          message: "Assign a priority to every selected assistance or support service.",
        });
        return;
      }

      const ranks = selected.map((code) => priorities[PRIORITY_KEYS[code]]);
      if (new Set(ranks).size !== ranks.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["priorities"],
          message: "Each priority number must be unique.",
        });
      }
    }),
  constraints: z
    .object({
      types: strArray(40),
      others: str(300),
    })
    .optional()
    .default({}),
  goals: z
    .object({
      types: strArray(20),
      others: str(300),
      readiness: str(80),
      readinessReason: str(500),
    })
    .optional()
    .default({}),
  consent: z.object({
    agreed: z.literal(true, {
      errorMap: () => ({ message: "Consent is required before submitting." }),
    }),
    signedName: z.string().trim().min(2, "Please type your full name as signature").max(200),
    interviewEndTime: str(50),
  }),
  website: z.string().trim().max(200).optional().default(""),
});

export const staffUpdateSchema = z.object({
  status: z.enum(["new", "in_review", "referred", "completed"]).optional(),
  staff: z
    .object({
      referralPathways: strArray(20).optional(),
      partners: strArray(20).optional(),
      partnerOthers: str(200),
      remarks: str(2000),
      interviewedBy: str(200),
      position: str(200),
      dateProfiled: str(40),
      office: str(200),
      dateReferred: str(40),
      agencyReferredTo: str(200),
      referralStatus: str(40),
    })
    .partial()
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(200),
  password: z.string().min(1, "Password is required").max(200),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required").max(200),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .max(200),
});
