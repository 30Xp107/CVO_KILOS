import { Check, FileCheck2, ShieldCheck } from "lucide-react";
import ProfileDetails from "../ProfileDetails.jsx";
import { FormField, SectionCard, TextInput } from "../ui.jsx";

export default function ReviewStep({ form, update, errors, onEdit, goToStep }) {
  const consent = form.consent;
  const setConsent = (field, value) => update(`consent.${field}`, value);

  return (
    <>
      <div className="review-intro">
        <div className="review-intro-icon">
          <FileCheck2 size={24} />
        </div>
        <div>
          <p className="eyebrow">Almost done</p>
          <h2>Review your answers</h2>
          <p>
            Please check the information below. You can go back and edit any section before
            submitting. Your progress is saved automatically on this device.
          </p>
        </div>
      </div>

      <ProfileDetails
        record={form}
        onEdit={(index) => {
          goToStep(index);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      <SectionCard
        icon={ShieldCheck}
        eyebrow="Consent"
        title="Data privacy and declaration"
        description="Please read carefully before submitting your profile."
        className="consent-card"
      >
        <div className="consent-text">
          <p>
            I voluntarily consent to participate in this interview and to the collection and
            processing of my personal information for beneficiary profiling, in accordance with the
            <strong> Data Privacy Act of 2012 (Republic Act No. 10173)</strong>. I understand that my
            information will be treated confidentially and used only for its intended purposes.
          </p>
          <p className="consent-pilipino">
            Bilang benepisyaryo ng Walang Gutong Program, pinatutunayan ko na ang lahat ng
            impormasyong ibinigay ko ay totoo at tama. Sumasang-ayon din ako na makibahagi at
            makipagtulungan sa mga oportunidad, programa, at serbisyong maaaring maiugnay sa akin
            batay sa aking mga pangangailangan at interes.
          </p>
        </div>

        <label className={`consent-check ${errors["consent.agreed"] ? "has-error" : ""}`}>
          <input
            type="checkbox"
            checked={consent.agreed}
            onChange={(event) => setConsent("agreed", event.target.checked)}
          />
          <span className="check-box" aria-hidden="true">
            {consent.agreed ? <Check size={13} strokeWidth={3.2} /> : null}
          </span>
          <span>
            I have read and understood the declaration above, and I voluntarily give my consent to
            the collection and processing of my personal information.
          </span>
        </label>
        {errors["consent.agreed"] ? <p className="field-error">{errors["consent.agreed"]}</p> : null}

        <div className="field-grid form-gap-top">
          <FormField
            label="Type your full name as signature"
            htmlFor="signedName"
            required
            error={errors["consent.signedName"]}
            className="span-2"
            hint="Typing your name serves as your electronic signature for this form."
          >
            <TextInput
              id="signedName"
              className="signature-input"
              value={consent.signedName}
              onChange={(event) => setConsent("signedName", event.target.value)}
              placeholder="Full name of beneficiary"
              autoComplete="name"
            />
          </FormField>
          <FormField label="Interview End Time" htmlFor="interviewEndTime">
            <TextInput
              id="interviewEndTime"
              type="time"
              value={consent.interviewEndTime}
              onChange={(event) => setConsent("interviewEndTime", event.target.value)}
            />
          </FormField>
          <FormField label="Interview Start Time" htmlFor="reviewStartTime">
            <TextInput
              id="reviewStartTime"
              type="time"
              value={form.personal.interviewStartTime}
              onChange={(event) => update("personal.interviewStartTime", event.target.value)}
            />
          </FormField>
        </div>

        <p className="consent-footnote">
          After submitting, you will receive a reference number. Please keep it for your records or
          mention it when following up with DSWD staff.
        </p>
      </SectionCard>
    </>
  );
}
