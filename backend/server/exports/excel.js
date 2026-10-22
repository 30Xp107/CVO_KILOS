import ExcelJS from "exceljs";
import {
  LABELS,
  joinLabels,
  label,
  labels,
  yesNo,
} from "../../shared/labels.js";
import { toManilaString } from "../time.js";

const BRAND_BLUE = "FF0B4EA2";
const BRAND_GOLD = "FFF2B705";
const LIGHT_BLUE = "FFEAF2FC";
const BORDER = "FFD6E0EE";

function safe(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "number" || typeof value === "boolean") return value;
  const text = String(value);
  // Prevent CSV/Excel formula injection from user supplied text.
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function dateTime(value) {
  if (!value) return "";
  return toManilaString(value, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function assistanceWithPriority(opportunities = {}) {
  const priorities = opportunities.priorities || {};
  const keys = {
    skills_training: "skillsTraining",
    employment: "employment",
    livelihood: "livelihood",
    education: "education",
    other: "other",
  };
  const selected = opportunities.assistanceInterests || [];
  return selected
    .map((code) => {
      const rank = priorities[keys[code]];
      return rank ? `${label("assistance", code)} (Priority ${rank})` : label("assistance", code);
    })
    .join("; ");
}

function householdSummary(members = []) {
  return (members || [])
    .filter((member) => member.name || member.relationship)
    .map((member, index) => {
      const bits = [
        `${index + 1}. ${member.name || "Unnamed"}`,
        member.relationship && `Relationship: ${member.relationship}`,
        member.sex && `Sex: ${member.sex}`,
        member.age && `Age: ${member.age}`,
        member.ipAffiliation && `IP: ${member.ipAffiliation}`,
        member.employmentStatus && `Status: ${member.employmentStatus}`,
        member.courseSkills && `Skills: ${member.courseSkills}`,
        member.assistanceNeeded && `Assistance: ${member.assistanceNeeded}`,
      ].filter(Boolean);
      return bits.join(" | ");
    })
    .join("\n");
}

export function flattenSubmission(record) {
  const p = record.personal || {};
  const s = record.skills || {};
  const o = record.opportunities || {};
  const st = o.skillsTraining || {};
  const emp = o.employment || {};
  const live = o.livelihood || {};
  const edu = o.education || {};
  const spec = o.specialized || {};
  const c = record.constraints || {};
  const g = record.goals || {};
  const consent = record.consent || {};
  const staff = record.staff || {};

  return {
    "Reference No.": record.referenceNo || "",
    "Date Submitted": dateTime(record.submittedAt),
    Status: label("status", record.status),
    Region: p.region || "",
    "Interview Start Time": p.interviewStartTime || "",
    "Card Holder / Household Head": p.cardHolderName || "",
    Suffix: p.suffix || "",
    "Household ID No.": p.householdId || "",
    "Month & Year Onboarded": p.onboarded || "",
    Address: p.address || "",
    "Beneficiary Type": label("beneficiaryType", p.beneficiaryType),
    "Relationship to HH Head": p.relationshipToHH || "",
    "Member Name": p.memberName || "",
    Age: p.age || "",
    Sex: p.sex || "",
    Birthday: p.birthday || "",
    "Civil Status": p.civilStatus || "",
    "Contact No.": p.contactNo || "",
    Citizenship: p.citizenship || "",
    Religion: p.religion || "",
    "Highest Educational Attainment": p.highestEducation || "",
    "Year Graduated / Last Attended": p.yearGraduated || "",
    "Sectoral / Vulnerability Group": joinLabels("sectors", p.sectors),
    "Sector Specify": p.sectorSpecify || "",
    "Sector Others": p.sectorOthers || "",
    Dialects: joinLabels("dialects", p.dialects),
    "Dialect Others": p.dialectOthers || "",
    "Household Members": householdSummary(record.householdMembers),
    "Household Member Count": (record.householdMembers || []).length,

    "Previously Participated in Program": yesNo(s.previouslyParticipated),
    "Program Specify": s.participationSpecify || "",
    "Competency Level": label("competency", s.competencyLevel),
    "Work / Livelihood Experience": joinLabels("experiences", s.experiences),
    "Experience Others": s.experiencesOthers || "",
    "Current Involvement": label("involvement", s.involvement),
    "Currently Earning": label("earning", s.earningIncome),
    "Estimated Monthly Income": label("income", s.monthlyIncome),
    "Primary Income Source": s.primaryIncomeSource || "",

    "Assistance Interested In": assistanceWithPriority(o),
    "Other Assistance (Specify)": o.otherAssistance || "",
    "Preferred Training Duration": label("durations", st.duration),
    "Training Weekdays": joinLabels("timeOfDay", st.weekdays),
    "Training Weekends": joinLabels("timeOfDay", st.weekends),
    "Training Activities": joinLabels("training", st.activities),
    "Training Others": st.others || "",

    "Current Employment Status": joinLabels("employmentStatus", emp.status),
    "Employment Status Others": emp.statusOthers || "",
    "Availability for Employment": label("availability", emp.availability),
    "Willing to Attend Job Fairs": yesNo(emp.jobFair),
    "Employment Documents Available": joinLabels("documents", emp.documents),
    "Preferred Employment Sector": joinLabels("employmentSectors", emp.sectors),
    "Employment Sector Others": emp.others || "",

    "Existing Livelihood / Business": yesNo(live.existing),
    "Existing Livelihood Specify": live.existingSpecify || "",
    "Type of Livelihood / Business": live.type || "",
    "Duration of Operation": live.duration || "",
    "Previously Received Livelihood Assistance": yesNo(live.received),
    "Livelihood Assistance Specify": live.receivedSpecify || "",
    "Agency / Program Source": live.agency || "",
    "Year Received": live.yearReceived || "",
    "Type of Assistance Received": live.assistanceType || "",
    "Livelihood Interests": joinLabels("livelihood", live.interests),
    "Livelihood Others": live.others || "",

    "Education Opportunities": joinLabels("education", edu.opportunities),
    "Education Other Specify": edu.otherOpportunity || "",
    "Interested Within 12 Months": label("interest", edu.interest12Months),
    "Preferred Learning Mode": joinLabels("learningMode", edu.learningMode),
    "Preferred Class Schedule": joinLabels("schedule", edu.schedule),
    "Attended ALS": yesNo(edu.alsAttended),
    "ALS Program / Level": edu.alsProgram || "",
    "ALS Status": label("alsStatus", edu.alsStatus),
    "ALS Status Other": edu.alsStatusOther || "",

    "Specialized Support Needed": joinLabels("specialized", spec.types),
    "Specialized Support Others": spec.others || "",

    "Participation Constraints": joinLabels("constraints", c.types),
    "Constraints Others": c.others || "",

    "Long-term Goals": joinLabels("goals", g.types),
    "Goals Others": g.others || "",
    "Commitment & Readiness": label("readiness", g.readiness),
    "Readiness Reason": g.readinessReason || "",

    "Consent Given": consent.agreed ? "Yes" : "No",
    "Signed Name": consent.signedName || "",
    "Interview End Time": consent.interviewEndTime || "",

    "Referral Pathway(s)": joinLabels("referralPathways", staff.referralPathways),
    "Referral Partner(s)": joinLabels("partners", staff.partners),
    "Partner Others": staff.partnerOthers || "",
    Remarks: staff.remarks || "",
    "Interviewed / Profiled By": staff.interviewedBy || "",
    Position: staff.position || "",
    "Date Profiled": staff.dateProfiled || "",
    "RPMO / Office": staff.office || "",
    "Date Referred": staff.dateReferred || "",
    "Agency Referred To": staff.agencyReferredTo || "",
    "Referral Status": label("referralStatus", staff.referralStatus),
  };
}

const COLUMN_WIDTHS = {
  "Reference No.": 20,
  "Date Submitted": 20,
  Status: 12,
  Region: 14,
  Address: 34,
  "Card Holder / Household Head": 28,
  "Household Members": 48,
  "Work / Livelihood Experience": 48,
  "Assistance Interested In": 40,
  "Training Activities": 44,
  "Preferred Employment Sector": 36,
  "Livelihood Interests": 36,
  "Participation Constraints": 44,
  "Long-term Goals": 36,
  Remarks: 36,
};

export async function buildWorkbook(submissions = []) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "KILOS Profiling System";
  workbook.company = "DSWD Walang Gutom Program";
  workbook.created = new Date();

  const rows = submissions.map(flattenSubmission);
  const headers = rows.length
    ? Object.keys(rows[0])
    : Object.keys(flattenSubmission({}));

  const sheet = workbook.addWorksheet("KILOS Responses", {
    views: [{ state: "frozen", ySplit: 1 }],
    properties: { tabColor: { argb: BRAND_BLUE } },
  });

  sheet.columns = headers.map((header) => ({
    header: safe(header),
    key: header,
    width: COLUMN_WIDTHS[header] || Math.min(28, Math.max(14, header.length + 4)),
  }));

  rows.forEach((row) => sheet.addRow(row));

  const headerRow = sheet.getRow(1);
  headerRow.height = 34;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10, name: "Calibri" };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_BLUE } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: BORDER } },
      left: { style: "thin", color: { argb: BORDER } },
      bottom: { style: "thin", color: { argb: BORDER } },
      right: { style: "thin", color: { argb: BORDER } },
    };
  });

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.height = 30;
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = { size: 9, name: "Calibri", color: { argb: "FF17233A" } };
      cell.alignment = { vertical: "top", wrapText: true };
      cell.border = {
        top: { style: "hair", color: { argb: BORDER } },
        left: { style: "hair", color: { argb: BORDER } },
        bottom: { style: "hair", color: { argb: BORDER } },
        right: { style: "hair", color: { argb: BORDER } },
      };
      if (rowNumber % 2 === 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FBFF" } };
      }
      if (headers[colNumber - 1] === "Status") {
        cell.font = { size: 9, bold: true, color: { argb: BRAND_BLUE }, name: "Calibri" };
      }
    });
  });

  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: Math.max(1, rows.length + 1), column: headers.length },
  };

  /* ----------------------------- Members sheet ---------------------------- */
  const memberSheet = workbook.addWorksheet("Household Members", {
    views: [{ state: "frozen", ySplit: 1 }],
    properties: { tabColor: { argb: BRAND_GOLD } },
  });
  memberSheet.columns = [
    { header: "Reference No.", key: "referenceNo", width: 20 },
    { header: "Card Holder / Household Head", key: "head", width: 30 },
    { header: "Name", key: "name", width: 28 },
    { header: "Relationship to Cardholder", key: "relationship", width: 26 },
    { header: "Sex", key: "sex", width: 10 },
    { header: "Age", key: "age", width: 8 },
    { header: "IP Affiliation", key: "ipAffiliation", width: 22 },
    { header: "Current Employment / Education Status", key: "employmentStatus", width: 34 },
    { header: "Course / Skills Acquired", key: "courseSkills", width: 28 },
    { header: "Assistance Needed", key: "assistanceNeeded", width: 34 },
  ];
  submissions.forEach((record) => {
    (record.householdMembers || []).forEach((member) => {
      if (!member.name && !member.relationship) return;
      memberSheet.addRow({
        referenceNo: safe(record.referenceNo),
        head: safe(record.personal?.cardHolderName),
        name: safe(member.name),
        relationship: safe(member.relationship),
        sex: safe(member.sex),
        age: safe(member.age),
        ipAffiliation: safe(member.ipAffiliation),
        employmentStatus: safe(member.employmentStatus),
        courseSkills: safe(member.courseSkills),
        assistanceNeeded: safe(member.assistanceNeeded),
      });
    });
  });
  memberSheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_BLUE } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  });
  memberSheet.getRow(1).height = 30;
  memberSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.font = { size: 9 };
    row.alignment = { vertical: "top", wrapText: true };
    row.height = 22;
    if (rowNumber % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT_BLUE } };
      });
    }
  });

  /* ----------------------------- Summary sheet ---------------------------- */
  const summary = workbook.addWorksheet("Summary", {
    properties: { tabColor: { argb: "FF16A34A" } },
  });
  summary.columns = [
    { key: "label", width: 45 },
    { key: "count", width: 18 },
  ];

  summary.mergeCells("A1:B1");
  summary.getCell("A1").value = "KILOS PROFILING — RESPONSE SUMMARY";
  summary.getCell("A1").font = { bold: true, size: 16, color: { argb: BRAND_BLUE } };
  summary.getCell("A1").alignment = { vertical: "middle" };
  summary.getRow(1).height = 34;

  summary.mergeCells("A2:B2");
  summary.getCell("A2").value = `Generated ${toManilaString(new Date(), {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })}  •  ${submissions.length} record(s)`;
  summary.getCell("A2").font = { size: 10, color: { argb: "FF5A6B85" } };

  const summaryLines = [];
  const section = (title) => summaryLines.push({ section: title });
  const item = (labelText, count) => summaryLines.push({ label: labelText, count });

  const countBy = (getter) => {
    const map = new Map();
    submissions.forEach((record) => {
      const values = getter(record);
      (Array.isArray(values) ? values : [values]).filter(Boolean).forEach((value) => {
        map.set(value, (map.get(value) || 0) + 1);
      });
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  };

  section("Records by status");
  Object.entries(LABELS.status).forEach(([key, text]) => {
    item(text, submissions.filter((r) => r.status === key).length);
  });

  section("Records by sector");
  countBy((r) => r.personal?.sectors).forEach(([key, count]) => {
    item(label("sectors", key), count);
  });

  section("Assistance requested");
  countBy((r) => r.opportunities?.assistanceInterests).forEach(([key, count]) => {
    item(label("assistance", key), count);
  });

  section("Record total");
  item("Total submissions", submissions.length);

  let cursor = 4;
  summaryLines.forEach((entry) => {
    if (entry.section) {
      summary.getCell(`A${cursor}`).value = entry.section;
      summary.getCell(`B${cursor}`).value = "";
      summary.mergeCells(`A${cursor}:B${cursor}`);
      summary.getCell(`A${cursor}`).font = { bold: true, size: 10.5, color: { argb: BRAND_BLUE } };
      summary.getCell(`A${cursor}`).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: LIGHT_BLUE },
      };
      summary.getRow(cursor).height = 20;
    } else {
      summary.getCell(`A${cursor}`).value = `   ${entry.label}`;
      summary.getCell(`B${cursor}`).value = entry.count;
      summary.getCell(`A${cursor}`).font = { size: 10, color: { argb: "FF17233A" } };
      summary.getCell(`B${cursor}`).font = { size: 10, bold: true, color: { argb: BRAND_BLUE } };
      summary.getCell(`B${cursor}`).alignment = { horizontal: "right" };
      summary.getCell(`A${cursor}`).border = {
        bottom: { style: "hair", color: { argb: BORDER } },
      };
      summary.getCell(`B${cursor}`).border = {
        bottom: { style: "hair", color: { argb: BORDER } },
      };
    }
    cursor += 1;
  });

  return workbook;
}
