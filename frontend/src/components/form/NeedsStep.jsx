import { CircleCheckBig, LifeBuoy, ShieldAlert, Target } from "lucide-react";
import {
  CheckChips,
  ChoiceGrid,
  FormField,
  GroupedChecklist,
  SectionCard,
  TextArea,
  TextInput,
} from "../ui.jsx";
import { CONSTRAINT_GROUPS, GOALS, READINESS, SPECIALIZED } from "../../lib/formConfig.js";

export default function NeedsStep({ form, update }) {
  const specialized = form.opportunities.specialized;
  const constraints = form.constraints;
  const goals = form.goals;

  return (
    <>
      <SectionCard
        icon={LifeBuoy}
        eyebrow="Section C — V"
        title="Specialized support services"
        description="Check all support or referral needs that apply to you. This helps us connect you with the proper agency."
      >
        <CheckChips
          options={SPECIALIZED}
          values={specialized.types}
          onChange={(values) => update("opportunities.specialized.types", values)}
          columns={2}
          ariaLabel="Specialized support services"
        />
        <FormField label="Others (specify)" htmlFor="specializedOthers" className="form-gap-top">
          <TextInput
            id="specializedOthers"
            value={specialized.others}
            onChange={(event) => update("opportunities.specialized.others", event.target.value)}
            placeholder="Other assistance, support, or referral needed"
          />
        </FormField>
      </SectionCard>

      <SectionCard
        icon={ShieldAlert}
        eyebrow="Section D"
        title="Challenges and support needs"
        description="What are the main challenges or barriers you face in participating in training, employment, or livelihood opportunities?"
      >
        <GroupedChecklist
          groups={CONSTRAINT_GROUPS}
          values={constraints.types}
          onChange={(values) => update("constraints.types", values)}
          columns={2}
        />
        <FormField label="Others (specify)" htmlFor="constraintsOthers" className="form-gap-top">
          <TextArea
            id="constraintsOthers"
            rows={2}
            value={constraints.others}
            onChange={(event) => update("constraints.others", event.target.value)}
            placeholder="Tell us about other challenges not listed above"
          />
        </FormField>
      </SectionCard>

      <SectionCard
        icon={Target}
        eyebrow="Section E"
        title="Goals and readiness"
        description="Tell us what you hope to achieve and how ready you are to start."
      >
        <div className="question-block">
          <FormField label="What is your primary long-term goal after finishing this program?">
            <CheckChips
              options={GOALS}
              values={goals.types}
              onChange={(values) => update("goals.types", values)}
              columns={2}
              ariaLabel="Long-term goals"
            />
          </FormField>
          <FormField label="Others (specify)" htmlFor="goalsOthers" className="form-gap-top">
            <TextInput
              id="goalsOthers"
              value={goals.others}
              onChange={(event) => update("goals.others", event.target.value)}
              placeholder="Other long-term goal"
            />
          </FormField>
        </div>

        <div className="question-block">
          <FormField label="Commitment and readiness">
            <ChoiceGrid
              name="readiness"
              columns={3}
              value={goals.readiness}
              onChange={(value) => update("goals.readiness", value)}
              options={READINESS}
            />
          </FormField>
          <FormField
            label={
              goals.readiness === "ready"
                ? "Anything else you would like to share? (optional)"
                : "Reason / support you need"
            }
            htmlFor="readinessReason"
            className="form-gap-top"
          >
            <TextArea
              id="readinessReason"
              rows={3}
              value={goals.readinessReason}
              onChange={(event) => update("goals.readinessReason", event.target.value)}
              placeholder={
                goals.readiness === "not_ready"
                  ? "Tell us what is preventing you from starting"
                  : "e.g. I need transportation assistance to attend training"
              }
            />
          </FormField>
        </div>
      </SectionCard>

      <div className="soft-note">
        <CircleCheckBig size={17} />
        <p>
          Almost done. On the next step, you will review your answers and provide your consent
          before submitting the form.
        </p>
      </div>
    </>
  );
}
