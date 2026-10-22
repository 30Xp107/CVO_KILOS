import { BadgeCheck, Coins, Sparkles, TrendingUp, Wrench } from "lucide-react";
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
  COMPETENCIES,
  EARNING,
  EXPERIENCE_GROUPS,
  INCOME,
  INVOLVEMENT,
} from "../../lib/formConfig.js";

export default function SkillsStep({ form, update, errors }) {
  const s = form.skills;
  const set = (field, value) => update(`skills.${field}`, value);

  return (
    <>
      <SectionCard
        icon={BadgeCheck}
        eyebrow="Section B"
        title="Training participation and competency"
        description="Share any previous training and the level of skills you have developed."
      >
        <div className="question-block">
          <FormField
            label="Have you previously participated in any livelihood, employment, educational, or skills training program?"
            required
            error={errors["skills.previouslyParticipated"]}
          >
            <ChoiceGrid
              name="previouslyParticipated"
              columns={2}
              value={s.previouslyParticipated}
              onChange={(value) => set("previouslyParticipated", value)}
              options={[
                { value: "yes", label: "Yes", description: "I have joined a program or training before." },
                { value: "no", label: "No", description: "I have not joined any program or training yet." },
              ]}
            />
          </FormField>
          {s.previouslyParticipated === "yes" ? (
            <FormField
              label="Please specify the program or training"
              htmlFor="participationSpecify"
              className="form-gap-top"
            >
              <TextInput
                id="participationSpecify"
                value={s.participationSpecify}
                onChange={(event) => set("participationSpecify", event.target.value)}
                placeholder="e.g. TESDA Cookery NC II, 2023"
              />
            </FormField>
          ) : null}
        </div>

        <div className="question-block">
          <FormField label="Competency Level">
            <CheckChips
              options={COMPETENCIES}
              values={s.competencyLevel ? [s.competencyLevel] : []}
              onChange={(values) =>
                set("competencyLevel", values.filter((v) => v !== s.competencyLevel).slice(-1)[0] || "")
              }
              columns={4}
              ariaLabel="Competency level"
            />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard
        icon={Wrench}
        eyebrow="Work experience"
        title="What work or livelihood activities have you done?"
        description="Check all activities you have experience in, including informal work and home-based livelihood."
      >
        <GroupedChecklist
          groups={EXPERIENCE_GROUPS}
          values={s.experiences}
          onChange={(values) => set("experiences", values)}
          columns={2}
        />
        <FormField label="Others (please specify)" htmlFor="experiencesOthers" className="form-gap-top">
          <TextArea
            id="experiencesOthers"
            rows={2}
            value={s.experiencesOthers}
            onChange={(event) => set("experiencesOthers", event.target.value)}
            placeholder="Tell us about other work or livelihood activities not listed above"
          />
        </FormField>
      </SectionCard>

      <SectionCard
        icon={TrendingUp}
        eyebrow="Income"
        title="Current involvement and income"
        description="This information helps us understand your current situation. You may skip questions that do not apply."
      >
        <div className="question-block">
          <FormField
            label="For the activities selected above, which best describes your current level of involvement?"
            required
            error={errors["skills.involvement"]}
          >
            <ChoiceGrid
              name="involvement"
              columns={3}
              value={s.involvement}
              onChange={(value) => set("involvement", value)}
              options={INVOLVEMENT}
            />
          </FormField>
        </div>

        <div className="question-block">
          <FormField label="Are you currently earning income from any of these activities?">
            <ChoiceGrid
              name="earningIncome"
              columns={3}
              value={s.earningIncome}
              onChange={(value) => set("earningIncome", value)}
              options={EARNING}
            />
          </FormField>
        </div>

        <div className="question-block">
          <FormField label="Estimated average monthly income">
            <CheckChips
              options={INCOME}
              values={s.monthlyIncome ? [s.monthlyIncome] : []}
              onChange={(values) =>
                set("monthlyIncome", values.filter((v) => v !== s.monthlyIncome).slice(-1)[0] || "")
              }
              columns={3}
              ariaLabel="Estimated average monthly income"
            />
          </FormField>
        </div>

        <FormField
          label="If yes, which activity is your primary source of income?"
          htmlFor="primaryIncomeSource"
        >
          <TextInput
            id="primaryIncomeSource"
            value={s.primaryIncomeSource}
            onChange={(event) => set("primaryIncomeSource", event.target.value)}
            placeholder="e.g. Sari-sari store"
          />
        </FormField>
      </SectionCard>

      <div className="soft-note">
        <Sparkles size={17} />
        <p>
          There are no wrong answers. Your responses are used only to identify suitable training,
          employment, livelihood, and education opportunities.
        </p>
      </div>
    </>
  );
}
