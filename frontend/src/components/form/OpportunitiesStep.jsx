import {
  BriefcaseBusiness,
  GraduationCap,
  HandHeart,
  Info,
  Sparkles,
  Store,
  Wrench,
} from "lucide-react";
import {
  CheckChips,
  ChoiceGrid,
  FormField,
  GroupedChecklist,
  SectionCard,
  TextArea,
  TextInput,
} from "../ui.jsx";
import {
  ASSISTANCE,
  AVAILABILITY,
  DOCUMENTS,
  DURATIONS,
  EDUCATION_OPPORTUNITIES,
  EMPLOYMENT_SECTORS,
  EMPLOYMENT_STATUS,
  INTEREST,
  LEARNING_MODES,
  LIVELIHOOD_GROUPS,
  PRIORITY_KEYS,
  SCHEDULES,
  TIMES,
  TRAINING_GROUPS,
  ALS_STATUS,
} from "../../lib/formConfig.js";

const ASSISTANCE_ICONS = {
  skills_training: Wrench,
  employment: BriefcaseBusiness,
  livelihood: Store,
  education: GraduationCap,
  other: Sparkles,
};

const ASSISTANCE_DESCRIPTIONS = {
  skills_training: "Enroll in TESDA or partner-led skills training.",
  employment: "Get help finding a job or preparing for employment.",
  livelihood: "Start or grow a small business or livelihood.",
  education: "Continue schooling or alternative learning.",
  other: "Other support and referral services.",
};

export default function OpportunitiesStep({ form, update, errors }) {
  const o = form.opportunities;
  const selected = o.assistanceInterests;
  const priorities = o.priorities;

  const toggleAssistance = (code) => {
    const active = selected.includes(code);
    const nextInterests = active ? selected.filter((item) => item !== code) : [...selected, code];
    const key = PRIORITY_KEYS[code];
    const nextPriorities = { ...priorities, [key]: active ? "" : priorities[key] };

    if (!active && !nextPriorities[key]) {
      const used = Object.values(priorities).filter(Boolean);
      const available = ["1", "2", "3", "4", "5"].find((rank) => !used.includes(rank));
      nextPriorities[key] = available || "";
    }

    update("opportunities", {
      ...o,
      assistanceInterests: nextInterests,
      priorities: nextPriorities,
    });
  };

  const setPriority = (code, value) => {
    const key = PRIORITY_KEYS[code];
    const next = { ...priorities };
    if (value) {
      Object.keys(next).forEach((priorityKey) => {
        if (next[priorityKey] === value && priorityKey !== key) next[priorityKey] = "";
      });
    }
    next[key] = value;
    update("opportunities.priorities", next);
  };

  const selectedBy = (code) => selected.includes(code);
  const updateSkill = (field, value) => update(`opportunities.skillsTraining.${field}`, value);
  const updateEmployment = (field, value) => update(`opportunities.employment.${field}`, value);
  const updateLivelihood = (field, value) => update(`opportunities.livelihood.${field}`, value);
  const updateEducation = (field, value) => update(`opportunities.education.${field}`, value);

  return (
    <>
      <SectionCard
        icon={HandHeart}
        eyebrow="Section C"
        title="What assistance would you like to receive?"
        description="Select all that apply, then rank your choices. 1 is your highest priority."
      >
        {errors["opportunities.assistanceInterests"] ? (
          <p className="step-error">{errors["opportunities.assistanceInterests"]}</p>
        ) : null}

        <div className="assistance-grid">
          {ASSISTANCE.map((option) => {
            const Icon = ASSISTANCE_ICONS[option.value] || HandHeart;
            const active = selectedBy(option.value);
            const priorityKey = PRIORITY_KEYS[option.value];
            return (
              <article className={`assistance-card ${active ? "is-selected" : ""}`} key={option.value}>
                <button
                  type="button"
                  className="assistance-toggle"
                  onClick={() => toggleAssistance(option.value)}
                  aria-pressed={active}
                >
                  <span className="assistance-icon">
                    <Icon size={20} />
                  </span>
                  <span className="assistance-copy">
                    <strong>{option.label}</strong>
                    <small>{ASSISTANCE_DESCRIPTIONS[option.value]}</small>
                  </span>
                  <span className="check-box" aria-hidden="true">
                    {active ? "✓" : ""}
                  </span>
                </button>
                {active ? (
                  <div className="priority-select">
                    <label htmlFor={`priority-${option.value}`}>Priority</label>
                    <select
                      id={`priority-${option.value}`}
                      value={priorities[priorityKey] || ""}
                      onChange={(event) => setPriority(option.value, event.target.value)}
                    >
                      <option value="">Select</option>
                      {["1", "2", "3", "4", "5"].map((rank) => (
                        <option value={rank} key={rank}>
                          {rank === "1" ? "1 — Highest" : rank}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        {errors["opportunities.priorities"] ? (
          <p className="step-error form-gap-top">{errors["opportunities.priorities"]}</p>
        ) : null}

        {selected.includes("other") ? (
          <FormField
            label="Other support services (specify)"
            htmlFor="otherAssistance"
            className="form-gap-top"
          >
            <TextInput
              id="otherAssistance"
              value={o.otherAssistance}
              onChange={(event) => update("opportunities.otherAssistance", event.target.value)}
              placeholder="Describe the other support you need"
            />
          </FormField>
        ) : null}
      </SectionCard>

      {selected.length === 0 ? (
        <div className="empty-selection">
          <Info size={20} />
          <p>
            Select at least one assistance above. Relevant follow-up questions will appear here.
          </p>
        </div>
      ) : null}

      {selectedBy("skills_training") ? (
        <SectionCard
          icon={Wrench}
          eyebrow="Section C — I"
          title="Skills training"
          description="Tell us what training you would like and when you are available."
        >
          <div className="question-block">
            <FormField label="Preferred Training Duration">
              <CheckChips
                options={DURATIONS}
                values={o.skillsTraining.duration ? [o.skillsTraining.duration] : []}
                onChange={(values) =>
                  updateSkill(
                    "duration",
                    values.filter((v) => v !== o.skillsTraining.duration).slice(-1)[0] || ""
                  )
                }
                columns={4}
                ariaLabel="Preferred training duration"
              />
            </FormField>
          </div>

          <div className="question-block">
            <p className="field-label">Preferred Training Schedule</p>
            <div className="schedule-grid">
              <div className="schedule-panel">
                <span className="schedule-title">Weekdays</span>
                <CheckChips
                  options={TIMES}
                  values={o.skillsTraining.weekdays}
                  onChange={(values) => updateSkill("weekdays", values)}
                  columns={1}
                  ariaLabel="Weekday schedule"
                />
              </div>
              <div className="schedule-panel">
                <span className="schedule-title">Weekends</span>
                <CheckChips
                  options={TIMES}
                  values={o.skillsTraining.weekends}
                  onChange={(values) => updateSkill("weekends", values)}
                  columns={1}
                  ariaLabel="Weekend schedule"
                />
              </div>
            </div>
          </div>

          <div className="question-block">
            <FormField label="Training or capacity development activities interested in">
              <GroupedChecklist
                groups={TRAINING_GROUPS}
                values={o.skillsTraining.activities}
                onChange={(values) => updateSkill("activities", values)}
                columns={2}
              />
            </FormField>
          </div>

          <FormField label="Others (specify)" htmlFor="trainingOthers">
            <TextInput
              id="trainingOthers"
              value={o.skillsTraining.others}
              onChange={(event) => updateSkill("others", event.target.value)}
              placeholder="Other training you are interested in"
            />
          </FormField>
        </SectionCard>
      ) : null}

      {selectedBy("employment") ? (
        <SectionCard
          icon={BriefcaseBusiness}
          eyebrow="Section C — II"
          title="Employment profile"
          description="Help us understand your employment status and the kind of work you are looking for."
        >
          <div className="question-block">
            <FormField label="Current Employment Status">
              <CheckChips
                options={EMPLOYMENT_STATUS}
                values={o.employment.status}
                onChange={(values) => updateEmployment("status", values)}
                columns={3}
                ariaLabel="Current employment status"
              />
            </FormField>
            <FormField label="Others, please specify" htmlFor="employmentStatusOthers" className="form-gap-top">
              <TextInput
                id="employmentStatusOthers"
                value={o.employment.statusOthers}
                onChange={(event) => updateEmployment("statusOthers", event.target.value)}
                placeholder="Other employment status"
              />
            </FormField>
          </div>

          <div className="question-block">
            <FormField label="Availability for Employment">
              <CheckChips
                options={AVAILABILITY}
                values={o.employment.availability ? [o.employment.availability] : []}
                onChange={(values) =>
                  updateEmployment(
                    "availability",
                    values.filter((v) => v !== o.employment.availability).slice(-1)[0] || ""
                  )
                }
                columns={4}
                ariaLabel="Availability for employment"
              />
            </FormField>
          </div>

          <div className="question-block">
            <FormField label="Willing to attend job fairs and comply with employer requirements?">
              <ChoiceGrid
                name="jobFair"
                columns={2}
                value={o.employment.jobFair}
                onChange={(value) => updateEmployment("jobFair", value)}
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
              />
            </FormField>
          </div>

          <div className="question-block">
            <FormField label="Employment documents available">
              <CheckChips
                options={DOCUMENTS}
                values={o.employment.documents}
                onChange={(values) => updateEmployment("documents", values)}
                columns={4}
                ariaLabel="Employment documents available"
              />
            </FormField>
          </div>

          <div className="question-block">
            <FormField label="Preferred employment sector">
              <CheckChips
                options={EMPLOYMENT_SECTORS}
                values={o.employment.sectors}
                onChange={(values) => updateEmployment("sectors", values)}
                columns={3}
                ariaLabel="Preferred employment sector"
              />
            </FormField>
            <FormField label="Others (specify)" htmlFor="employmentSectorOthers" className="form-gap-top">
              <TextInput
                id="employmentSectorOthers"
                value={o.employment.others}
                onChange={(event) => updateEmployment("others", event.target.value)}
                placeholder="Other preferred sector"
              />
            </FormField>
          </div>
        </SectionCard>
      ) : null}

      {selectedBy("livelihood") ? (
        <SectionCard
          icon={Store}
          eyebrow="Section C — III"
          title="Livelihood profile"
          description="Tell us about any existing livelihood and the type of business support you want."
        >
          <div className="question-block">
            <FormField label="Do you currently have an existing livelihood or small business?">
              <ChoiceGrid
                name="existingLivelihood"
                columns={2}
                value={o.livelihood.existing}
                onChange={(value) => updateLivelihood("existing", value)}
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
              />
            </FormField>
            {o.livelihood.existing === "yes" ? (
              <div className="field-grid form-gap-top">
                <FormField label="If yes, please specify" htmlFor="existingSpecify" className="span-2">
                  <TextInput
                    id="existingSpecify"
                    value={o.livelihood.existingSpecify}
                    onChange={(event) => updateLivelihood("existingSpecify", event.target.value)}
                    placeholder="Describe your current livelihood or business"
                  />
                </FormField>
                <FormField label="Type of livelihood / business" htmlFor="livelihoodType">
                  <TextInput
                    id="livelihoodType"
                    value={o.livelihood.type}
                    onChange={(event) => updateLivelihood("type", event.target.value)}
                    placeholder="e.g. Sari-sari store"
                  />
                </FormField>
                <FormField label="Duration of operation" htmlFor="livelihoodDuration">
                  <TextInput
                    id="livelihoodDuration"
                    value={o.livelihood.duration}
                    onChange={(event) => updateLivelihood("duration", event.target.value)}
                    placeholder="e.g. 2 years"
                  />
                </FormField>
              </div>
            ) : null}
          </div>

          <div className="question-block">
            <FormField label="Have you previously received any livelihood assistance or support?">
              <ChoiceGrid
                name="receivedLivelihood"
                columns={2}
                value={o.livelihood.received}
                onChange={(value) => updateLivelihood("received", value)}
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
              />
            </FormField>
            {o.livelihood.received === "yes" ? (
              <div className="field-grid form-gap-top">
                <FormField label="If yes, please specify" htmlFor="receivedSpecify" className="span-2">
                  <TextInput
                    id="receivedSpecify"
                    value={o.livelihood.receivedSpecify}
                    onChange={(event) => updateLivelihood("receivedSpecify", event.target.value)}
                    placeholder="What assistance did you receive?"
                  />
                </FormField>
                <FormField label="Agency / Program source" htmlFor="livelihoodAgency">
                  <TextInput
                    id="livelihoodAgency"
                    value={o.livelihood.agency}
                    onChange={(event) => updateLivelihood("agency", event.target.value)}
                    placeholder="e.g. SLP, DTI, DA, LGU, NGO"
                  />
                </FormField>
                <FormField label="Year received" htmlFor="livelihoodYear">
                  <TextInput
                    id="livelihoodYear"
                    inputMode="numeric"
                    maxLength={4}
                    value={o.livelihood.yearReceived}
                    onChange={(event) => updateLivelihood("yearReceived", event.target.value)}
                    placeholder="e.g. 2024"
                  />
                </FormField>
                <FormField label="Type of assistance received" htmlFor="livelihoodAssistance" className="span-2">
                  <TextInput
                    id="livelihoodAssistance"
                    value={o.livelihood.assistanceType}
                    onChange={(event) => updateLivelihood("assistanceType", event.target.value)}
                    placeholder="e.g. Start-up capital, tools, training"
                  />
                </FormField>
              </div>
            ) : null}
          </div>

          <div className="question-block">
            <FormField label="What type of livelihood are you interested in?">
              <GroupedChecklist
                groups={LIVELIHOOD_GROUPS}
                values={o.livelihood.interests}
                onChange={(values) => updateLivelihood("interests", values)}
                columns={2}
              />
            </FormField>
            <FormField label="Others (specify)" htmlFor="livelihoodOthers" className="form-gap-top">
              <TextInput
                id="livelihoodOthers"
                value={o.livelihood.others}
                onChange={(event) => updateLivelihood("others", event.target.value)}
                placeholder="Other livelihood interest"
              />
            </FormField>
          </div>
        </SectionCard>
      ) : null}

      {selectedBy("education") ? (
        <SectionCard
          icon={GraduationCap}
          eyebrow="Section C — IV"
          title="Education support"
          description="Tell us about the learning opportunities you are interested in."
        >
          <div className="question-block">
            <FormField label="Type of educational or learning opportunity interested in">
              <CheckChips
                options={EDUCATION_OPPORTUNITIES}
                values={o.education.opportunities}
                onChange={(values) => updateEducation("opportunities", values)}
                columns={2}
                ariaLabel="Educational opportunities"
              />
            </FormField>
            <FormField label="Other educational opportunities" htmlFor="otherOpportunity" className="form-gap-top">
              <TextInput
                id="otherOpportunity"
                value={o.education.otherOpportunity}
                onChange={(event) => updateEducation("otherOpportunity", event.target.value)}
                placeholder="Specify other learning opportunity"
              />
            </FormField>
          </div>

          <div className="question-block">
            <FormField label="Interested in educational or learning opportunities within the next 12 months?">
              <ChoiceGrid
                name="interest12Months"
                columns={3}
                value={o.education.interest12Months}
                onChange={(value) => updateEducation("interest12Months", value)}
                options={INTEREST}
              />
            </FormField>
          </div>

          <div className="question-block">
            <FormField label="If given the chance to study again for free, which learning mode would you prefer?">
              <CheckChips
                options={LEARNING_MODES}
                values={o.education.learningMode}
                onChange={(values) => updateEducation("learningMode", values)}
                columns={4}
                ariaLabel="Preferred learning mode"
              />
            </FormField>
            <FormField label="Preferred class schedule" className="form-gap-top">
              <CheckChips
                options={SCHEDULES}
                values={o.education.schedule}
                onChange={(values) => updateEducation("schedule", values)}
                columns={2}
                ariaLabel="Preferred class schedule"
              />
            </FormField>
          </div>

          <div className="question-block">
            <FormField label="If interested in ALS, have you previously attended the Alternative Learning System?">
              <ChoiceGrid
                name="alsAttended"
                columns={2}
                value={o.education.alsAttended}
                onChange={(value) => updateEducation("alsAttended", value)}
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
              />
            </FormField>
            {o.education.alsAttended === "yes" ? (
              <FormField label="If yes, specify program / level" htmlFor="alsProgram" className="form-gap-top">
                <TextInput
                  id="alsProgram"
                  value={o.education.alsProgram}
                  onChange={(event) => updateEducation("alsProgram", event.target.value)}
                  placeholder="e.g. ALS Junior High School"
                />
              </FormField>
            ) : null}
          </div>

          <div className="question-block">
            <FormField label="Current status in the ALS">
              <CheckChips
                options={ALS_STATUS}
                values={o.education.alsStatus ? [o.education.alsStatus] : []}
                onChange={(values) =>
                  updateEducation(
                    "alsStatus",
                    values.filter((v) => v !== o.education.alsStatus).slice(-1)[0] || ""
                  )
                }
                columns={3}
                ariaLabel="Current ALS status"
              />
            </FormField>
            <FormField label="Other ALS status" htmlFor="alsStatusOther" className="form-gap-top">
              <TextInput
                id="alsStatusOther"
                value={o.education.alsStatusOther}
                onChange={(event) => updateEducation("alsStatusOther", event.target.value)}
                placeholder="Specify other status"
              />
            </FormField>
          </div>
        </SectionCard>
      ) : null}
    </>
  );
}
