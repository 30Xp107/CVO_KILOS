import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Copy,
  FileText,
  Info,
  ListChecks,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { api } from "../lib/api.js";
import { createInitialForm, PRIORITY_KEYS, STEPS } from "../lib/formConfig.js";
import { setNestedValue } from "../lib/helpers.js";
import { useToast } from "../components/Toast.jsx";
import { BrandMark, Button, ConfirmDialog, Spinner } from "../components/ui.jsx";
import PersonalStep from "../components/form/PersonalStep.jsx";
import SkillsStep from "../components/form/SkillsStep.jsx";
import OpportunitiesStep from "../components/form/OpportunitiesStep.jsx";
import NeedsStep from "../components/form/NeedsStep.jsx";
import ReviewStep from "../components/form/ReviewStep.jsx";

const DRAFT_KEY = "kilos_form_draft_v1";

function mergeDeep(base, patch) {
  if (Array.isArray(base)) return Array.isArray(patch) ? patch : base;
  if (base && typeof base === "object") {
    const result = { ...base };
    if (patch && typeof patch === "object") {
      Object.keys(patch).forEach((key) => {
        result[key] = key in base ? mergeDeep(base[key], patch[key]) : patch[key];
      });
    }
    return result;
  }
  return patch === undefined ? base : patch;
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.form) return null;
    return mergeDeep(createInitialForm(), parsed.form);
  } catch {
    return null;
  }
}

function validateStep(index, form) {
  const errors = {};
  const p = form.personal;

  if (index === 0) {
    if (!p.cardHolderName.trim()) {
      errors["personal.cardHolderName"] = "Please enter the card holder / household head name.";
    }
    if (!p.beneficiaryType) {
      errors["personal.beneficiaryType"] = "Select who is being profiled.";
    }
    if (p.beneficiaryType === "member") {
      if (!p.relationshipToHH.trim()) {
        errors["personal.relationshipToHH"] = "Please enter the relationship to the household head.";
      }
      if (!p.memberName.trim()) {
        errors["personal.memberName"] = "Please enter the household member's name.";
      }
    }
    if (!p.age) {
      errors["personal.age"] = "Age is required.";
    } else {
      const age = Number(p.age);
      if (!Number.isFinite(age) || age < 1 || age > 120) {
        errors["personal.age"] = "Enter a valid age between 1 and 120.";
      }
    }
    if (!p.sex) errors["personal.sex"] = "Select sex.";
    if (!p.address.trim()) errors["personal.address"] = "Please enter your complete address.";
  }

  if (index === 1) {
    if (!form.skills.previouslyParticipated) {
      errors["skills.previouslyParticipated"] =
        "Please indicate whether you have joined a program before.";
    }
    if (!form.skills.involvement) {
      errors["skills.involvement"] = "Select your current level of involvement.";
    }
  }

  if (index === 2) {
    const interests = form.opportunities.assistanceInterests;
    if (interests.length === 0) {
      errors["opportunities.assistanceInterests"] =
        "Select at least one assistance or support service.";
    } else {
      const priorities = form.opportunities.priorities;
      const missing = interests.filter((code) => !priorities[PRIORITY_KEYS[code]]);
      const ranks = [];
      Object.entries(priorities).forEach(([key, value]) => {
        if (value) ranks.push(value);
      });
      const duplicates = ranks.length !== new Set(ranks).size;
      if (missing.length > 0) {
        errors["opportunities.priorities"] =
          "Assign a priority to every selected assistance. 1 is your highest priority.";
      } else if (duplicates) {
        errors["opportunities.priorities"] = "Each priority number must be unique.";
      }
    }
  }

  if (index === 4) {
    if (!form.consent.agreed) {
      errors["consent.agreed"] = "You must give your consent before submitting.";
    }
    if (form.consent.signedName.trim().length < 2) {
      errors["consent.signedName"] = "Please type your full name as your signature.";
    }
  }

  return errors;
}

function stepForErrorPath(path) {
  if (path.startsWith("personal.") || path.startsWith("householdMembers")) return 0;
  if (path.startsWith("skills.")) return 1;
  if (path.startsWith("opportunities.") || path.startsWith("specialized.")) return 2;
  if (path.startsWith("constraints.") || path.startsWith("goals.")) return 3;
  if (path.startsWith("consent.")) return 4;
  return 0;
}

function buildPayload(form) {
  const selected = form.opportunities.assistanceInterests || [];
  const opp = form.opportunities;
  const cleanedOpportunities = {
    ...opp,
    skillsTraining: selected.includes("skills_training")
      ? opp.skillsTraining
      : { duration: "", weekdays: [], weekends: [], activities: [], others: "" },
    employment: selected.includes("employment")
      ? opp.employment
      : {
          status: [],
          statusOthers: "",
          availability: "",
          jobFair: "",
          documents: [],
          sectors: [],
          others: "",
        },
    livelihood: selected.includes("livelihood")
      ? opp.livelihood
      : {
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
    education: selected.includes("education")
      ? opp.education
      : {
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
  };

  return {
    ...form,
    householdMembers: form.householdMembers.filter(
      (member) => member.name.trim() || member.relationship.trim()
    ),
    opportunities: cleanedOpportunities,
  };
}

export default function FormPage() {
  const [form, setForm] = useState(() => loadDraft() || createInitialForm());
  const [stepIndex, setStepIndex] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [draftStatus, setDraftStatus] = useState("saved");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [restored] = useState(() => Boolean(loadDraft()));
  const saveTimer = useRef(null);
  const topRef = useRef(null);
  const { push } = useToast();

  useEffect(() => {
    if (restored) {
      push("Your saved draft was restored on this device.", "info");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (success) return undefined;
    setDraftStatus("saving");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ form, savedAt: new Date().toISOString() })
        );
        setDraftStatus("saved");
      } catch {
        setDraftStatus("error");
      }
    }, 600);
    return () => clearTimeout(saveTimer.current);
  }, [form, success]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [stepIndex, success]);

  const update = useCallback((path, value) => {
    setForm((current) => setNestedValue(current, path, value));
    setErrors((current) => {
      const affected = Object.keys(current).filter(
        (key) => key === path || key.startsWith(`${path}.`)
      );
      if (affected.length === 0) return current;
      const next = { ...current };
      affected.forEach((key) => delete next[key]);
      return next;
    });
  }, []);

  const goToStep = (index) => {
    if (index > maxStep) return;
    setStepIndex(index);
  };

  const focusFirstError = () => {
    setTimeout(() => {
      const node = document.querySelector(".has-error input, .has-error select, .has-error textarea, .step-error");
      node?.scrollIntoView({ behavior: "smooth", block: "center" });
      node?.focus?.({ preventScroll: true });
    }, 120);
  };

  const handleNext = () => {
    const stepErrors = validateStep(stepIndex, form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors((current) => ({ ...current, ...stepErrors }));
      push("Please complete the highlighted fields before continuing.", "warning");
      focusFirstError();
      return;
    }

    const next = Math.min(STEPS.length - 1, stepIndex + 1);
    setMaxStep((current) => Math.max(current, next + 1));
    setStepIndex(next);
  };

  const handlePrevious = () => {
    setStepIndex((current) => Math.max(0, current - 1));
  };

  const handleSubmit = async () => {
    const allErrors = {};
    for (let i = 0; i < STEPS.length; i += 1) {
      Object.assign(allErrors, validateStep(i, form));
    }

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      const firstPath = Object.keys(allErrors)[0];
      const target = stepForErrorPath(firstPath);
      setMaxStep(STEPS.length - 1);
      setStepIndex(target);
      push("Some required information is missing. Please review the highlighted fields.", "warning");
      focusFirstError();
      return;
    }

    setSubmitting(true);
    try {
      const data = await api.post("/submissions", buildPayload(form));
      setSuccess(data);
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
    } catch (error) {
      push(error.message || "We could not submit your profile. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm(createInitialForm());
    setErrors({});
    setStepIndex(0);
    setMaxStep(0);
    setConfirmReset(false);
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    push("A new blank form is ready.", "success");
  };

  const progress = useMemo(() => Math.round(((stepIndex + 1) / STEPS.length) * 100), [stepIndex]);

  const stepProps = { form, update, errors };

  const renderStep = () => {
    switch (STEPS[stepIndex].id) {
      case "personal":
        return <PersonalStep {...stepProps} />;
      case "skills":
        return <SkillsStep {...stepProps} />;
      case "opportunities":
        return <OpportunitiesStep {...stepProps} />;
      case "needs":
        return <NeedsStep {...stepProps} />;
      case "review":
        return (
          <ReviewStep
            {...stepProps}
            onEdit={(index) => goToStep(index)}
            goToStep={(index) => goToStep(index)}
          />
        );
      default:
        return null;
    }
  };

  if (success) {
    return (
      <div className="public-shell">
        <PublicHeader />
        <main className="success-wrap">
          <div className="success-card">
            <span className="success-icon">
              <CheckCircle2 size={38} />
            </span>
            <p className="eyebrow">DSWD Walang Gutom Program</p>
            <h1>Profile submitted successfully</h1>
            <p className="success-lead">
              Thank you, <strong>{form.personal.cardHolderName || "beneficiary"}</strong>. Your
              KILOS profiling form has been received. Please keep your reference number for follow-up.
            </p>

            <div className="reference-box">
              <span>Reference Number</span>
              <strong>{success.referenceNo}</strong>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  navigator.clipboard?.writeText(success.referenceNo);
                  push("Reference number copied.", "success");
                }}
              >
                <Copy size={15} /> Copy
              </button>
            </div>

            <div className="success-details">
              <div>
                <Clock3 size={18} />
                <span>Submitted on</span>
                <strong>
                  {new Date(success.submittedAt).toLocaleString("en-PH", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </strong>
              </div>
              <div>
                <ShieldCheck size={18} />
                <span>Data privacy</span>
                <strong>Your information is kept confidential.</strong>
              </div>
            </div>

            <div className="next-steps">
              <h2>What happens next?</h2>
              <ol>
                <li>DSWD staff will review your profile and identify suitable programs.</li>
                <li>
                  Your information may be referred to partner agencies such as TESDA, DOLE, PESO,
                  or your LGU, based on your selected needs.
                </li>
                <li>Please wait for communication from your local DSWD office or barangay.</li>
              </ol>
            </div>

            <div className="success-actions">
              <Button
                onClick={() => {
                  setSuccess(null);
                  resetForm();
                }}
                icon={RotateCcw}
              >
                Submit another response
              </Button>
              <Link to="/" className="btn btn-ghost">
                Back to start
              </Link>
            </div>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="public-shell" ref={topRef}>
      <PublicHeader />

      <main className="form-page">
        <section className="form-hero">
          <div className="form-hero-copy">
            <p className="eyebrow">Republic of the Philippines · DSWD</p>
            <h1>KILOS Profiling Form</h1>
            <p className="form-hero-subtitle">
              Key Information for Linking Opportunities and Support Services
            </p>
            <p className="form-hero-description">
              Share your background and the support you need. Your responses help the Walang Gutom
              Program connect you with training, employment, livelihood, education, and other
              services.
            </p>
            <div className="hero-meta">
              <span>
                <Clock3 size={15} /> 10–15 minutes
              </span>
              <span>
                <ListChecks size={15} /> {STEPS.length} sections
              </span>
              <span>
                <Smartphone size={15} /> Mobile friendly
              </span>
            </div>
          </div>
          <div className="privacy-panel">
            <ShieldCheck size={28} />
            <div>
              <strong>Your privacy matters</strong>
              <p>
                Information is collected and processed under the Data Privacy Act of 2012 (RA
                10173) and used only for beneficiary profiling and referral.
              </p>
            </div>
          </div>
        </section>

        <div className="mobile-progress">
          <div className="mobile-progress-copy">
            <span>
              Step {stepIndex + 1} of {STEPS.length}
            </span>
            <strong>{STEPS[stepIndex].title}</strong>
          </div>
          <div className="progress-track" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="form-layout">
          <aside className="form-sidebar">
            <div className="step-card">
              <div className="step-card-head">
                <div>
                  <p className="eyebrow">Your progress</p>
                  <h2>{progress}% complete</h2>
                </div>
                <div className="progress-ring" style={{ "--progress": `${progress}%` }}>
                  <span>{stepIndex + 1}</span>
                </div>
              </div>

              <nav className="step-nav" aria-label="Form sections">
                {STEPS.map((step, index) => {
                  const complete = index < stepIndex;
                  const active = index === stepIndex;
                  const accessible = index <= maxStep;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      className={`step-nav-item ${active ? "is-active" : ""} ${complete ? "is-complete" : ""}`}
                      onClick={() => goToStep(index)}
                      disabled={!accessible}
                      aria-current={active ? "step" : undefined}
                    >
                      <span className="step-bullet">
                        {complete ? <Check size={14} strokeWidth={3} /> : step.number}
                      </span>
                      <span className="step-nav-copy">
                        <strong>{step.title}</strong>
                        <small>{step.description}</small>
                      </span>
                    </button>
                  );
                })}
              </nav>

              <div className={`draft-status draft-${draftStatus}`}>
                {draftStatus === "saving" ? <Spinner size={14} /> : <Check size={14} />}
                <span>
                  {draftStatus === "saving"
                    ? "Saving draft…"
                    : draftStatus === "error"
                      ? "Could not save draft"
                      : "Draft saved on this device"}
                </span>
              </div>

              <button type="button" className="start-over" onClick={() => setConfirmReset(true)}>
                <RotateCcw size={14} /> Start over
              </button>
            </div>

            <div className="sidebar-help">
              <Info size={18} />
              <div>
                <strong>Need help?</strong>
                <p>
                  Ask your barangay or DSWD staff for assistance in completing this form. You may
                  also answer using your preferred dialect.
                </p>
              </div>
            </div>
          </aside>

          <div className="form-main">
            <header className="step-header">
              <div>
                <span className="step-eyebrow">
                  Step {stepIndex + 1} of {STEPS.length}
                </span>
                <h2>{STEPS[stepIndex].title}</h2>
                <p>{STEPS[stepIndex].description}</p>
              </div>
              <span className="step-number-badge">{String(stepIndex + 1).padStart(2, "0")}</span>
            </header>

            {renderStep()}

            <input
              type="text"
              name="website"
              className="hp-field"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={form.website}
              onChange={(event) => update("website", event.target.value)}
            />

            <nav className="form-actions" aria-label="Form navigation">
              <Button
                variant="outline"
                icon={ArrowLeft}
                onClick={handlePrevious}
                disabled={stepIndex === 0 || submitting}
              >
                Previous
              </Button>
              <div className="form-actions-meta">
                {stepIndex === STEPS.length - 1 ? (
                  <span>
                    <LockKeyhole size={13} /> Your data is submitted securely
                  </span>
                ) : (
                  <span>
                    <ClipboardCheck size={13} /> Step {stepIndex + 1} of {STEPS.length}
                  </span>
                )}
              </div>
              {stepIndex === STEPS.length - 1 ? (
                <Button onClick={handleSubmit} loading={submitting} icon={CheckCircle2}>
                  Submit profile
                </Button>
              ) : (
                <Button onClick={handleNext} iconRight={ArrowRight}>
                  Continue
                </Button>
              )}
            </nav>
          </div>
        </div>
      </main>

      <PublicFooter />

      <ConfirmDialog
        open={confirmReset}
        onCancel={() => setConfirmReset(false)}
        onConfirm={resetForm}
        title="Start over with a blank form?"
        description="All unsaved answers on this device will be cleared. This cannot be undone."
        confirmLabel="Yes, start over"
      />
    </div>
  );
}

function PublicHeader() {
  return (
    <header className="public-header">
      <Link to="/" className="public-brand" aria-label="KILOS Profiling home">
        <BrandMark />
      </Link>
      <div className="public-header-actions">
        <span className="header-tag">
          <FileText size={14} /> KILOS Form
        </span>
        <Link to="/admin/login" className="staff-link">
          <LockKeyhole size={15} /> Staff access
        </Link>
      </div>
    </header>
  );
}

function PublicFooter() {
  return (
    <footer className="public-footer">
      <div>
        <strong>Department of Social Welfare and Development</strong>
        <span>Walang Gutom Program · KILOS Profiling</span>
      </div>
      <p>
        This form collects personal information for beneficiary profiling. Handled under RA 10173
        (Data Privacy Act of 2012).
      </p>
    </footer>
  );
}
