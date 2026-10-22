import {
  BriefcaseBusiness,
  ClipboardList,
  GraduationCap,
  HandHeart,
  Home,
  Pencil,
  ShieldCheck,
  Sparkles,
  Store,
  Target,
  Users,
  Wrench,
} from "lucide-react";
import {
  ChipList,
  DataGrid,
  DataItem,
  EmptyState,
  SectionCard,
  StatusBadge,
} from "./ui.jsx";
import {
  LABELS,
  formatBirthday,
  formatDate,
  label,
  labels,
  yesNo,
} from "../lib/helpers.js";
import { PRIORITY_KEYS } from "../lib/formConfig.js";

function EditButton({ onClick }) {
  if (!onClick) return null;
  return (
    <button type="button" className="text-btn" onClick={onClick}>
      <Pencil size={14} /> Edit
    </button>
  );
}

function DetailSection({ icon, title, subtitle, onEdit, children, className = "" }) {
  return (
    <SectionCard
      icon={icon}
      eyebrow={subtitle}
      title={title}
      className={`detail-section ${className}`}
      aside={<EditButton onClick={onEdit} />}
    >
      {children}
    </SectionCard>
  );
}

function PriorityList({ opportunities }) {
  const priorities = opportunities?.priorities || {};
  const list = (opportunities?.assistanceInterests || []).map((code) => {
    const rank = priorities[PRIORITY_KEYS[code]];
    return {
      code,
      label: LABELS.assistance[code] || code,
      rank,
    };
  });
  if (!list.length) return <span className="muted">No assistance selected</span>;
  return (
    <div className="priority-list">
      {list.map((item) => (
        <span className="priority-pill" key={item.code}>
          <strong>{item.rank ? `#${item.rank}` : "—"}</strong>
          {item.label}
        </span>
      ))}
    </div>
  );
}

export default function ProfileDetails({
  record,
  onEdit,
  showConsent = true,
  showStaff = false,
  showStatus = false,
}) {
  if (!record) return null;

  const p = record.personal || {};
  const s = record.skills || {};
  const o = record.opportunities || {};
  const st = o.skillsTraining || {};
  const emp = o.employment || {};
  const live = o.livelihood || {};
  const edu = o.education || {};
  const spec = o.specialized || {};
  const constraints = record.constraints || {};
  const goals = record.goals || {};
  const consent = record.consent || {};
  const staff = record.staff || {};
  const members = record.householdMembers || [];

  const selectedAssistance = o.assistanceInterests || [];
  const hasSkills = selectedAssistance.includes("skills_training");
  const hasEmployment = selectedAssistance.includes("employment");
  const hasLivelihood = selectedAssistance.includes("livelihood");
  const hasEducation = selectedAssistance.includes("education");

  return (
    <div className="profile-details">
      <DetailSection
        icon={Home}
        subtitle="Section A"
        title="Personal Information"
        onEdit={onEdit ? () => onEdit(0) : null}
      >
        <DataGrid columns={2}>
          <DataItem
            label="Card Holder / Household Head"
            value={[p.cardHolderName, p.suffix].filter(Boolean).join(", ")}
          />
          <DataItem label="Household ID No." value={p.householdId} />
          <DataItem label="Region" value={p.region} />
          <DataItem label="Month & Year Onboarded" value={p.onboarded} />
          <DataItem label="Address" value={p.address} wide />
          <DataItem
            label="Beneficiary to be Profiled"
            value={label("beneficiaryType", p.beneficiaryType)}
          />
          {p.beneficiaryType === "member" ? (
            <>
              <DataItem label="Relationship to HH Head" value={p.relationshipToHH} />
              <DataItem label="Household Member Name" value={p.memberName} />
            </>
          ) : null}
          <DataItem label="Age" value={p.age} />
          <DataItem label="Sex" value={p.sex} />
          <DataItem label="Birthday" value={p.birthday ? formatBirthday(p.birthday) : ""} />
          <DataItem label="Civil Status" value={p.civilStatus} />
          <DataItem label="Contact No." value={p.contactNo} />
          <DataItem label="Citizenship" value={p.citizenship} />
          <DataItem label="Religion" value={p.religion} />
          <DataItem label="Highest Educational Attainment" value={p.highestEducation} />
          <DataItem label="Year Graduated / Last Attended" value={p.yearGraduated} />
          <DataItem label="Interview Start Time" value={p.interviewStartTime} />
          <DataItem label="Sectoral / Vulnerability Group" wide>
            <ChipList values={labels("sectors", p.sectors)} />
            {p.sectorSpecify ? <p className="data-note">Specify: {p.sectorSpecify}</p> : null}
            {p.sectorOthers ? <p className="data-note">Others: {p.sectorOthers}</p> : null}
          </DataItem>
          <DataItem label="Dialect" wide>
            <ChipList values={labels("dialects", p.dialects)} />
            {p.dialectOthers ? <p className="data-note">Others: {p.dialectOthers}</p> : null}
          </DataItem>
        </DataGrid>

        <div className="subsection">
          <h3>
            <Users size={16} /> Other Household Members
          </h3>
          {members.length === 0 ? (
            <EmptyState icon={Users} title="No household members added">
              This section was left blank.
            </EmptyState>
          ) : (
            <div className="member-list">
              {members.map((member, index) => (
                <article className="member-card" key={`${member.name}-${index}`}>
                  <header>
                    <span className="member-number">{index + 1}</span>
                    <strong>{member.name || "Unnamed member"}</strong>
                    {member.relationship ? <span className="member-rel">{member.relationship}</span> : null}
                  </header>
                  <DataGrid columns={3}>
                    <DataItem label="Sex" value={member.sex} />
                    <DataItem label="Age" value={member.age} />
                    <DataItem label="IP Affiliation" value={member.ipAffiliation} />
                    <DataItem label="Employment / Education Status" value={member.employmentStatus} />
                    <DataItem label="Course / Skills Acquired" value={member.courseSkills} />
                    <DataItem label="Assistance Needed" value={member.assistanceNeeded} />
                  </DataGrid>
                </article>
              ))}
            </div>
          )}
        </div>
      </DetailSection>

      <DetailSection
        icon={Wrench}
        subtitle="Section B"
        title="Skills and Livelihood Experience"
        onEdit={onEdit ? () => onEdit(1) : null}
      >
        <DataGrid columns={2}>
          <DataItem
            label="Previously Participated in a Program"
            value={yesNo(s.previouslyParticipated)}
          />
          <DataItem label="Program / Training Details" value={s.participationSpecify} />
          <DataItem label="Competency Level" value={label("competency", s.competencyLevel)} />
          <DataItem label="Current Level of Involvement" value={label("involvement", s.involvement)} />
          <DataItem label="Currently Earning Income" value={label("earning", s.earningIncome)} />
          <DataItem label="Estimated Monthly Income" value={label("income", s.monthlyIncome)} />
          <DataItem label="Primary Source of Income" value={s.primaryIncomeSource} wide />
          <DataItem label="Work / Livelihood Experience" wide>
            <ChipList values={labels("experiences", s.experiences)} />
            {s.experiencesOthers ? <p className="data-note">Others: {s.experiencesOthers}</p> : null}
          </DataItem>
        </DataGrid>
      </DetailSection>

      <DetailSection
        icon={HandHeart}
        subtitle="Section C"
        title="Opportunities and Support Services"
        onEdit={onEdit ? () => onEdit(2) : null}
      >
        <DataItem label="Assistance Interested In" wide>
          <PriorityList opportunities={o} />
          {o.otherAssistance ? <p className="data-note">Other support: {o.otherAssistance}</p> : null}
        </DataItem>

        {hasSkills ? (
          <div className="subsection">
            <h3>
              <GraduationCap size={16} /> Skills Training
            </h3>
            <DataGrid columns={2}>
              <DataItem label="Preferred Duration" value={label("durations", st.duration)} />
              <DataItem
                label="Preferred Schedule"
                value={[
                  labels("timeOfDay", st.weekdays).join(", "),
                  labels("timeOfDay", st.weekends).join(", "),
                ]
                  .filter(Boolean)
                  .join(" | ")}
              />
              <DataItem label="Training Interests" wide>
                <ChipList values={labels("training", st.activities)} />
                {st.others ? <p className="data-note">Others: {st.others}</p> : null}
              </DataItem>
            </DataGrid>
          </div>
        ) : null}

        {hasEmployment ? (
          <div className="subsection">
            <h3>
              <BriefcaseBusiness size={16} /> Employment Profile
            </h3>
            <DataGrid columns={2}>
              <DataItem label="Current Employment Status" wide>
                <ChipList values={labels("employmentStatus", emp.status)} />
                {emp.statusOthers ? <p className="data-note">Others: {emp.statusOthers}</p> : null}
              </DataItem>
              <DataItem label="Availability" value={label("availability", emp.availability)} />
              <DataItem label="Willing to Attend Job Fairs" value={yesNo(emp.jobFair)} />
              <DataItem label="Documents Available" wide>
                <ChipList values={labels("documents", emp.documents)} />
              </DataItem>
              <DataItem label="Preferred Employment Sector" wide>
                <ChipList values={labels("employmentSectors", emp.sectors)} />
                {emp.others ? <p className="data-note">Others: {emp.others}</p> : null}
              </DataItem>
            </DataGrid>
          </div>
        ) : null}

        {hasLivelihood ? (
          <div className="subsection">
            <h3>
              <Store size={16} /> Livelihood Profile
            </h3>
            <DataGrid columns={2}>
              <DataItem label="Existing Livelihood / Business" value={yesNo(live.existing)} />
              <DataItem label="Details" value={live.existingSpecify} />
              <DataItem label="Type" value={live.type} />
              <DataItem label="Duration of Operation" value={live.duration} />
              <DataItem label="Received Livelihood Assistance" value={yesNo(live.received)} />
              <DataItem label="Assistance Details" value={live.receivedSpecify} />
              <DataItem label="Agency / Program Source" value={live.agency} />
              <DataItem label="Year Received" value={live.yearReceived} />
              <DataItem label="Type of Assistance Received" value={live.assistanceType} wide />
              <DataItem label="Livelihood Interests" wide>
                <ChipList values={labels("livelihood", live.interests)} />
                {live.others ? <p className="data-note">Others: {live.others}</p> : null}
              </DataItem>
            </DataGrid>
          </div>
        ) : null}

        {hasEducation ? (
          <div className="subsection">
            <h3>
              <GraduationCap size={16} /> Education Support
            </h3>
            <DataGrid columns={2}>
              <DataItem label="Education Opportunities" wide>
                <ChipList values={labels("education", edu.opportunities)} />
                {edu.otherOpportunity ? (
                  <p className="data-note">Others: {edu.otherOpportunity}</p>
                ) : null}
              </DataItem>
              <DataItem label="Interested Within 12 Months" value={label("interest", edu.interest12Months)} />
              <DataItem label="Preferred Learning Mode" value={labels("learningMode", edu.learningMode).join(", ")} />
              <DataItem label="Preferred Class Schedule" value={labels("schedule", edu.schedule).join(", ")} />
              <DataItem label="Attended ALS" value={yesNo(edu.alsAttended)} />
              <DataItem label="ALS Program / Level" value={edu.alsProgram} />
              <DataItem label="ALS Status" value={label("alsStatus", edu.alsStatus)} />
              <DataItem label="ALS Other Status" value={edu.alsStatusOther} />
            </DataGrid>
          </div>
        ) : null}
      </DetailSection>

      <DetailSection
        icon={Sparkles}
        subtitle="Sections D & E"
        title="Specialized Support, Needs, and Goals"
        onEdit={onEdit ? () => onEdit(3) : null}
      >
        <DataGrid columns={2}>
          <DataItem label="Specialized Support Needed" wide>
            <ChipList values={labels("specialized", spec.types)} />
            {spec.others ? <p className="data-note">Others: {spec.others}</p> : null}
          </DataItem>
          <DataItem label="Participation Constraints" wide>
            <ChipList values={labels("constraints", constraints.types)} />
            {constraints.others ? <p className="data-note">Others: {constraints.others}</p> : null}
          </DataItem>
          <DataItem label="Primary Long-term Goals" wide>
            <ChipList values={labels("goals", goals.types)} />
            {goals.others ? <p className="data-note">Others: {goals.others}</p> : null}
          </DataItem>
          <DataItem label="Commitment and Readiness" value={label("readiness", goals.readiness)} />
          <DataItem label="Reason / Support Needed" value={goals.readinessReason} />
        </DataGrid>
      </DetailSection>

      {showConsent ? (
        <DetailSection icon={ShieldCheck} subtitle="Consent" title="Data Privacy and Signature">
          <DataGrid columns={2}>
            <DataItem label="Consent Given" value={consent.agreed ? "Yes" : "No"} />
            <DataItem label="Signed Name" value={consent.signedName} />
            <DataItem label="Interview Start Time" value={p.interviewStartTime} />
            <DataItem label="Interview End Time" value={consent.interviewEndTime} />
          </DataGrid>
          {consent.signedName ? (
            <div className="signature-preview">
              <span>{consent.signedName}</span>
              <small>Pangalan at lagda ng Benepisyaryo</small>
            </div>
          ) : null}
        </DetailSection>
      ) : null}

      {showStatus ? (
        <DetailSection icon={ClipboardList} subtitle="Record" title="Submission Metadata">
          <DataGrid columns={2}>
            <DataItem label="Reference Number" value={record.referenceNo} />
            <DataItem label="Date Submitted" value={formatDate(record.submittedAt, true)} />
            <DataItem label="Record Status" value={<StatusBadge status={record.status} />} />
            <DataItem label="Last Updated" value={formatDate(record.updatedAt, true)} />
          </DataGrid>
        </DetailSection>
      ) : null}

      {showStaff ? (
        <DetailSection
          icon={Target}
          subtitle="For Staff Use Only"
          title="KILOS Profiling Result"
          className="staff-detail"
        >
          <DataGrid columns={2}>
            <DataItem label="Possible Referral Pathway(s)" wide>
              <ChipList values={labels("referralPathways", staff.referralPathways)} />
            </DataItem>
            <DataItem label="Potential Referral Partner(s)" wide>
              <ChipList values={labels("partners", staff.partners)} />
              {staff.partnerOthers ? <p className="data-note">Others: {staff.partnerOthers}</p> : null}
            </DataItem>
            <DataItem label="Interviewed / Profiled By" value={staff.interviewedBy} />
            <DataItem label="Position" value={staff.position} />
            <DataItem label="RPMO / Office" value={staff.office} />
            <DataItem label="Date Profiled" value={staff.dateProfiled} />
            <DataItem label="Date Referred" value={staff.dateReferred} />
            <DataItem label="Agency Referred To" value={staff.agencyReferredTo} />
            <DataItem label="Status of Referral" value={label("referralStatus", staff.referralStatus)} />
            <DataItem label="Remarks" value={staff.remarks} wide />
          </DataGrid>
        </DetailSection>
      ) : null}
    </div>
  );
}
