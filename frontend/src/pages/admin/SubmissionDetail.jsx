import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  FileDown,
  Mail,
  MapPin,
  Phone,
  Save,
  Trash2,
  UserRound,
} from "lucide-react";
import { api, downloadPdf } from "../../lib/api.js";
import { useToast } from "../../components/Toast.jsx";
import ProfileDetails from "../../components/ProfileDetails.jsx";
import {
  Button,
  CheckChips,
  ConfirmDialog,
  FormField,
  SectionCard,
  Select,
  Spinner,
  StatusBadge,
  TextArea,
  TextInput,
} from "../../components/ui.jsx";
import {
  PARTNERS,
  REFERRAL_PATHWAYS,
  REFERRAL_STATUS,
} from "../../lib/formConfig.js";
import { LABELS, formatDate, initials, label } from "../../lib/helpers.js";

const STATUS_OPTIONS = Object.entries(LABELS.status);

export default function SubmissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("new");
  const [staff, setStaff] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const fetchRecord = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await api.get(`/admin/submissions/${id}`, undefined, {
          signal: controller.signal,
        });
        setRecord(data.submission);
        setStatus(data.submission.status || "new");
        setStaff(data.submission.staff || {});
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message || "Unable to load this response.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchRecord();
    return () => controller.abort();
  }, [id]);

  const updateStaff = (field, value) => {
    setStaff((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await api.patch(`/admin/submissions/${id}`, { status, staff });
      setRecord(data.submission);
      setStaff(data.submission.staff || {});
      setStatus(data.submission.status);
      push("Response updated successfully.", "success");
    } catch (err) {
      push(err.message || "Could not update this response.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePdf = async () => {
    setPdfLoading(true);
    try {
      await downloadPdf(record._id, record.referenceNo);
      push("PDF form downloaded.", "success");
    } catch (err) {
      push(err.message || "Could not generate the PDF.", "error");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/admin/submissions/${id}`);
      push("Response deleted.", "success");
      navigate("/admin/submissions", { replace: true });
    } catch (err) {
      push(err.message || "Could not delete this response.", "error");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Spinner size={26} />
        <span>Loading response…</span>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="detail-error">
        <h2>Response unavailable</h2>
        <p>{error || "This response may have been deleted."}</p>
        <Link to="/admin/submissions" className="btn btn-primary">
          <ArrowLeft size={16} /> Back to responses
        </Link>
      </div>
    );
  }

  const p = record.personal || {};
  const assistance = record.opportunities?.assistanceInterests || [];

  return (
    <div className="detail-page">
      <Link to="/admin/submissions" className="back-link">
        <ArrowLeft size={16} /> Back to responses
      </Link>

      <section className="record-hero">
        <div className="record-identity">
          <span className="record-avatar">{initials(p.cardHolderName)}</span>
          <div>
            <p className="eyebrow">{record.referenceNo}</p>
            <h2>{p.cardHolderName || "Unnamed beneficiary"}</h2>
            <div className="record-meta">
              <span>
                <CalendarDays size={14} /> {formatDate(record.submittedAt, true)}
              </span>
              {p.contactNo ? (
                <span>
                  <Phone size={14} /> {p.contactNo}
                </span>
              ) : null}
              {p.address ? (
                <span>
                  <MapPin size={14} /> {p.address}
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <div className="record-actions">
          <StatusBadge status={record.status} />
          <Button variant="outline" icon={FileDown} loading={pdfLoading} onClick={handlePdf}>
            Download PDF
          </Button>
          <Button variant="danger-ghost" icon={Trash2} onClick={() => setConfirmDelete(true)}>
            Delete
          </Button>
        </div>
        {assistance.length ? (
          <div className="record-needs">
            <span>Assistance requested:</span>
            <div className="tag-list">
              {assistance.map((item) => (
                <span className="tag" key={item}>
                  {label("assistance", item)}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <div className="detail-layout">
        <div className="detail-main">
          <ProfileDetails record={record} showConsent showStatus />
        </div>

        <aside className="staff-panel" id="staff-panel">
          <SectionCard
            icon={UserRound}
            eyebrow="Case management"
            title="Staff use only"
            description="Update the referral and case status for this beneficiary."
          >
            <FormField label="Record status" htmlFor="record-status">
              <Select
                id="record-status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                {STATUS_OPTIONS.map(([value, text]) => (
                  <option value={value} key={value}>
                    {text}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Referral status" htmlFor="referral-status" className="form-gap-top">
              <Select
                id="referral-status"
                value={staff.referralStatus || "pending"}
                onChange={(event) => updateStaff("referralStatus", event.target.value)}
              >
                {REFERRAL_STATUS.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <div className="question-block">
              <p className="field-label">Possible referral pathway(s)</p>
              <CheckChips
                options={REFERRAL_PATHWAYS}
                values={staff.referralPathways || []}
                onChange={(values) => updateStaff("referralPathways", values)}
                columns={1}
                ariaLabel="Referral pathways"
              />
            </div>

            <div className="question-block">
              <p className="field-label">Potential referral partner(s)</p>
              <CheckChips
                options={PARTNERS}
                values={staff.partners || []}
                onChange={(values) => updateStaff("partners", values)}
                columns={2}
                ariaLabel="Referral partners"
              />
            </div>

            <div className="field-grid">
              <FormField label="Partner others" htmlFor="partnerOthers">
                <TextInput
                  id="partnerOthers"
                  value={staff.partnerOthers || ""}
                  onChange={(event) => updateStaff("partnerOthers", event.target.value)}
                  placeholder="Other partner agency"
                />
              </FormField>
              <FormField label="Interviewed / profiled by" htmlFor="interviewedBy">
                <TextInput
                  id="interviewedBy"
                  value={staff.interviewedBy || ""}
                  onChange={(event) => updateStaff("interviewedBy", event.target.value)}
                  placeholder="Full name"
                />
              </FormField>
              <FormField label="Position" htmlFor="staffPosition">
                <TextInput
                  id="staffPosition"
                  value={staff.position || ""}
                  onChange={(event) => updateStaff("position", event.target.value)}
                  placeholder="e.g. Project Development Officer"
                />
              </FormField>
              <FormField label="RPMO / Office" htmlFor="staffOffice">
                <TextInput
                  id="staffOffice"
                  value={staff.office || ""}
                  onChange={(event) => updateStaff("office", event.target.value)}
                  placeholder="e.g. RPMO IV-A"
                />
              </FormField>
              <FormField label="Date profiled" htmlFor="dateProfiled">
                <TextInput
                  id="dateProfiled"
                  type="date"
                  value={staff.dateProfiled || ""}
                  onChange={(event) => updateStaff("dateProfiled", event.target.value)}
                />
              </FormField>
              <FormField label="Date referred" htmlFor="dateReferred">
                <TextInput
                  id="dateReferred"
                  type="date"
                  value={staff.dateReferred || ""}
                  onChange={(event) => updateStaff("dateReferred", event.target.value)}
                />
              </FormField>
              <FormField label="Agency referred to" htmlFor="agencyReferredTo" className="span-2">
                <TextInput
                  id="agencyReferredTo"
                  value={staff.agencyReferredTo || ""}
                  onChange={(event) => updateStaff("agencyReferredTo", event.target.value)}
                  placeholder="e.g. TESDA IV-A"
                />
              </FormField>
              <FormField label="Remarks" htmlFor="staffRemarks" className="span-2">
                <TextArea
                  id="staffRemarks"
                  rows={3}
                  value={staff.remarks || ""}
                  onChange={(event) => updateStaff("remarks", event.target.value)}
                  placeholder="Notes, follow-up actions, or referral details"
                />
              </FormField>
            </div>

            <Button className="save-staff-btn" icon={Save} loading={saving} onClick={handleSave}>
              Save changes
            </Button>
            <p className="staff-footnote">
              Last updated {formatDate(record.updatedAt, true)}. Changes are saved to the central
              database.
            </p>
          </SectionCard>

          <div className="contact-card">
            <h3>Beneficiary contact</h3>
            <p>
              <Phone size={15} /> {p.contactNo || "No contact number provided"}
            </p>
            <p>
              <MapPin size={15} /> {p.address || "No address provided"}
            </p>
            <p>
              <Mail size={15} /> Household ID: {p.householdId || "Not provided"}
            </p>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this response?"
        description={`${record.referenceNo} will be permanently removed. This action cannot be undone.`}
        confirmLabel="Delete permanently"
      />
    </div>
  );
}
