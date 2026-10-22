import { CalendarDays, HeartHandshake, Home, Languages, Plus, Trash2, UserRound, Users } from "lucide-react";
import {
  CheckChips,
  ChoiceGrid,
  FormField,
  SectionCard,
  Select,
  TextArea,
  TextInput,
} from "../ui.jsx";
import {
  CIVIL_STATUS_OPTIONS,
  DIALECTS,
  EDUCATION_OPTIONS,
  SECTORS,
  SEX_OPTIONS,
  hhMemberTemplate,
} from "../../lib/formConfig.js";

export default function PersonalStep({ form, update, errors }) {
  const p = form.personal;
  const err = (field) => errors[`personal.${field}`];

  const setPersonal = (field, value) => update(`personal.${field}`, value);

  const updateMember = (index, field, value) => {
    const members = form.householdMembers.map((member, i) =>
      i === index ? { ...member, [field]: value } : member
    );
    update("householdMembers", members);
  };

  const addMember = () => {
    if (form.householdMembers.length >= 10) return;
    update("householdMembers", [...form.householdMembers, hhMemberTemplate()]);
  };

  const removeMember = (index) => {
    update(
      "householdMembers",
      form.householdMembers.filter((_, i) => i !== index)
    );
  };

  return (
    <>
      <SectionCard
        icon={Home}
        eyebrow="Section A"
        title="Household head and address"
        description="Tell us who the cardholder is and where the household is located."
      >
        <div className="field-grid">
          <FormField
            label="Card Holder / Household Head Name"
            htmlFor="cardHolderName"
            required
            hint="Format: Last Name, First Name, M.I."
            error={err("cardHolderName")}
            className="span-2"
          >
            <TextInput
              id="cardHolderName"
              value={p.cardHolderName}
              onChange={(event) => setPersonal("cardHolderName", event.target.value)}
              placeholder="e.g. Dela Cruz, Maria S."
              autoComplete="name"
            />
          </FormField>
          <FormField label="Suffix" htmlFor="suffix">
            <TextInput
              id="suffix"
              value={p.suffix}
              onChange={(event) => setPersonal("suffix", event.target.value)}
              placeholder="Sr., Jr."
            />
          </FormField>
          <FormField label="Household ID No." htmlFor="householdId">
            <TextInput
              id="householdId"
              value={p.householdId}
              onChange={(event) => setPersonal("householdId", event.target.value)}
              placeholder="e.g. 1234567890"
            />
          </FormField>
          <FormField label="Month & Year Onboarded" htmlFor="onboarded">
            <TextInput
              id="onboarded"
              value={p.onboarded}
              onChange={(event) => setPersonal("onboarded", event.target.value)}
              placeholder="e.g. January 2026"
            />
          </FormField>
          <FormField label="Region" htmlFor="region">
            <TextInput
              id="region"
              value={p.region}
              onChange={(event) => setPersonal("region", event.target.value)}
              placeholder="e.g. Region IV-A (CALABARZON)"
            />
          </FormField>
          <FormField
            label="Address"
            htmlFor="address"
            required
            error={err("address")}
            className="span-3"
          >
            <TextArea
              id="address"
              rows={2}
              value={p.address}
              onChange={(event) => setPersonal("address", event.target.value)}
              placeholder="House no., street, barangay, city/municipality, province"
            />
          </FormField>
          <FormField label="Interview Start Time" htmlFor="interviewStartTime">
            <TextInput
              id="interviewStartTime"
              type="time"
              value={p.interviewStartTime}
              onChange={(event) => setPersonal("interviewStartTime", event.target.value)}
            />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard
        icon={UserRound}
        eyebrow="Beneficiary"
        title="Who is being profiled?"
        description="Select whether the respondent is the household head or a household member."
      >
        <FormField required error={err("beneficiaryType")}>
          <ChoiceGrid
            name="beneficiaryType"
            columns={2}
            value={p.beneficiaryType}
            onChange={(value) => setPersonal("beneficiaryType", value)}
            options={[
              {
                value: "head",
                label: "Household Head / Cardholder",
                description: "The respondent is the 4Ps / Walang Gutom cardholder.",
              },
              {
                value: "member",
                label: "Household Member",
                description: "The respondent is a member of the cardholder's household.",
              },
            ]}
          />
        </FormField>

        {p.beneficiaryType === "member" ? (
          <div className="field-grid form-gap-top">
            <FormField
              label="Relationship to HH Head"
              htmlFor="relationshipToHH"
              required
              error={err("relationshipToHH")}
            >
              <TextInput
                id="relationshipToHH"
                value={p.relationshipToHH}
                onChange={(event) => setPersonal("relationshipToHH", event.target.value)}
                placeholder="e.g. Daughter, Spouse, Son"
              />
            </FormField>
            <FormField
              label="Name of Household Member"
              htmlFor="memberName"
              required
              error={err("memberName")}
              className="span-2"
            >
              <TextInput
                id="memberName"
                value={p.memberName}
                onChange={(event) => setPersonal("memberName", event.target.value)}
                placeholder="Last Name, First Name, M.I."
              />
            </FormField>
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        icon={CalendarDays}
        eyebrow="Respondent"
        title="Personal details"
        description="Your answers help us match you with the right programs and services."
      >
        <div className="field-grid">
          <FormField label="Age" htmlFor="age" required error={err("age")}>
            <TextInput
              id="age"
              type="number"
              min="0"
              max="120"
              inputMode="numeric"
              value={p.age}
              onChange={(event) => setPersonal("age", event.target.value)}
              placeholder="e.g. 35"
            />
          </FormField>
          <FormField label="Sex" htmlFor="sex" required error={err("sex")}>
            <Select
              id="sex"
              value={p.sex}
              onChange={(event) => setPersonal("sex", event.target.value)}
            >
              <option value="">Select sex</option>
              {SEX_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Birthday" htmlFor="birthday">
            <TextInput
              id="birthday"
              type="date"
              min="1900-01-01"
              max={new Date().toISOString().slice(0, 10)}
              value={p.birthday}
              onChange={(event) => setPersonal("birthday", event.target.value)}
            />
          </FormField>
          <FormField label="Civil Status" htmlFor="civilStatus">
            <Select
              id="civilStatus"
              value={p.civilStatus}
              onChange={(event) => setPersonal("civilStatus", event.target.value)}
            >
              <option value="">Select civil status</option>
              {CIVIL_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Contact No." htmlFor="contactNo">
            <TextInput
              id="contactNo"
              type="tel"
              value={p.contactNo}
              onChange={(event) => setPersonal("contactNo", event.target.value)}
              placeholder="e.g. 0917 123 4567"
              autoComplete="tel"
            />
          </FormField>
          <FormField label="Citizenship" htmlFor="citizenship">
            <TextInput
              id="citizenship"
              value={p.citizenship}
              onChange={(event) => setPersonal("citizenship", event.target.value)}
              placeholder="Filipino"
            />
          </FormField>
          <FormField label="Religion" htmlFor="religion">
            <TextInput
              id="religion"
              value={p.religion}
              onChange={(event) => setPersonal("religion", event.target.value)}
              placeholder="Optional"
            />
          </FormField>
          <FormField
            label="Highest Educational Attainment"
            htmlFor="highestEducation"
            className="span-2"
          >
            <Select
              id="highestEducation"
              value={p.highestEducation}
              onChange={(event) => setPersonal("highestEducation", event.target.value)}
            >
              <option value="">Select educational attainment</option>
              {EDUCATION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Year Graduated / Last Attended" htmlFor="yearGraduated">
            <TextInput
              id="yearGraduated"
              inputMode="numeric"
              maxLength={4}
              value={p.yearGraduated}
              onChange={(event) => setPersonal("yearGraduated", event.target.value)}
              placeholder="e.g. 2018"
            />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard
        icon={HeartHandshake}
        eyebrow="Sectoral group"
        title="Sectoral or vulnerability group"
        description="Check all that apply. This helps identify appropriate support and referrals."
      >
        <CheckChips
          options={SECTORS}
          values={p.sectors}
          onChange={(values) => setPersonal("sectors", values)}
          columns={3}
          ariaLabel="Sectoral or vulnerability group"
        />
        <div className="field-grid form-gap-top">
          <FormField label="Specify (if applicable)" htmlFor="sectorSpecify">
            <TextInput
              id="sectorSpecify"
              value={p.sectorSpecify}
              onChange={(event) => setPersonal("sectorSpecify", event.target.value)}
              placeholder="e.g. Person with Disability - visual"
            />
          </FormField>
          <FormField label="Others" htmlFor="sectorOthers">
            <TextInput
              id="sectorOthers"
              value={p.sectorOthers}
              onChange={(event) => setPersonal("sectorOthers", event.target.value)}
              placeholder="Specify other sector"
            />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard
        icon={Languages}
        eyebrow="Dialect"
        title="Dialects spoken"
        description="Select all dialects you can comfortably use."
      >
        <CheckChips
          options={DIALECTS}
          values={p.dialects}
          onChange={(values) => setPersonal("dialects", values)}
          columns={4}
          ariaLabel="Dialects spoken"
        />
        <FormField label="Other dialect(s)" htmlFor="dialectOthers" className="form-gap-top">
          <TextInput
            id="dialectOthers"
            value={p.dialectOthers}
            onChange={(event) => setPersonal("dialectOthers", event.target.value)}
            placeholder="Specify other dialect"
          />
        </FormField>
      </SectionCard>

      <SectionCard
        icon={Users}
        eyebrow="Optional"
        title="Other household members"
        description="List household members who may be interested in or require opportunities and support services."
        aside={<span className="count-pill">{form.householdMembers.length} / 10</span>}
      >
        {form.householdMembers.length === 0 ? (
          <div className="add-member-empty">
            <Users size={26} />
            <p>No household members added yet. You may skip this section if not applicable.</p>
            <button type="button" className="btn btn-outline btn-sm" onClick={addMember}>
              <Plus size={16} /> Add household member
            </button>
          </div>
        ) : (
          <div className="member-editor-list">
            {form.householdMembers.map((member, index) => (
              <article className="member-editor" key={index}>
                <header>
                  <span className="member-number">{index + 1}</span>
                  <strong>Household member {index + 1}</strong>
                  <button
                    type="button"
                    className="icon-btn danger"
                    onClick={() => removeMember(index)}
                    aria-label={`Remove household member ${index + 1}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </header>
                <div className="field-grid">
                  <FormField label="Name" htmlFor={`member-name-${index}`} className="span-2">
                    <TextInput
                      id={`member-name-${index}`}
                      value={member.name}
                      onChange={(event) => updateMember(index, "name", event.target.value)}
                      placeholder="Last Name, First Name, M.I."
                    />
                  </FormField>
                  <FormField label="Relationship to Cardholder" htmlFor={`member-rel-${index}`}>
                    <TextInput
                      id={`member-rel-${index}`}
                      value={member.relationship}
                      onChange={(event) => updateMember(index, "relationship", event.target.value)}
                      placeholder="e.g. Son"
                    />
                  </FormField>
                  <FormField label="Sex" htmlFor={`member-sex-${index}`}>
                    <Select
                      id={`member-sex-${index}`}
                      value={member.sex}
                      onChange={(event) => updateMember(index, "sex", event.target.value)}
                    >
                      <option value="">Select sex</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </Select>
                  </FormField>
                  <FormField label="Age" htmlFor={`member-age-${index}`}>
                    <TextInput
                      id={`member-age-${index}`}
                      type="number"
                      min="0"
                      max="120"
                      value={member.age}
                      onChange={(event) => updateMember(index, "age", event.target.value)}
                    />
                  </FormField>
                  <FormField label="IP Affiliation" htmlFor={`member-ip-${index}`}>
                    <TextInput
                      id={`member-ip-${index}`}
                      value={member.ipAffiliation}
                      onChange={(event) => updateMember(index, "ipAffiliation", event.target.value)}
                      placeholder="If applicable"
                    />
                  </FormField>
                  <FormField
                    label="Employment / Education Status"
                    htmlFor={`member-status-${index}`}
                    className="span-2"
                  >
                    <TextInput
                      id={`member-status-${index}`}
                      value={member.employmentStatus}
                      onChange={(event) => updateMember(index, "employmentStatus", event.target.value)}
                      placeholder="e.g. Grade 10 student, unemployed"
                    />
                  </FormField>
                  <FormField label="Course / Skills Acquired" htmlFor={`member-skills-${index}`}>
                    <TextInput
                      id={`member-skills-${index}`}
                      value={member.courseSkills}
                      onChange={(event) => updateMember(index, "courseSkills", event.target.value)}
                      placeholder="e.g. Computer literacy"
                    />
                  </FormField>
                  <FormField label="Assistance Needed" htmlFor={`member-assist-${index}`}>
                    <TextInput
                      id={`member-assist-${index}`}
                      value={member.assistanceNeeded}
                      onChange={(event) => updateMember(index, "assistanceNeeded", event.target.value)}
                      placeholder="e.g. Educational support"
                    />
                  </FormField>
                </div>
              </article>
            ))}
            {form.householdMembers.length < 10 ? (
              <button type="button" className="add-member-btn" onClick={addMember}>
                <Plus size={17} /> Add another household member
              </button>
            ) : null}
          </div>
        )}
      </SectionCard>
    </>
  );
}
