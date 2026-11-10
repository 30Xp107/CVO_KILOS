import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Eye,
  FileDown,
  FilterX,
  Inbox,
  RefreshCw,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { api, downloadPdf } from "../../lib/api.js";
import { useToast } from "../../components/Toast.jsx";
import {
  Button,
  EmptyState,
  Pagination,
  SearchInput,
  Spinner,
  StatusBadge,
  TextInput,
} from "../../components/ui.jsx";
import { formatDate, joinLabels, LABELS } from "../../lib/helpers.js";

const STATUS_TABS = [
  { value: "all", label: "All" },
  ...Object.entries(LABELS.status).map(([value, label]) => ({ value, label })),
];

export default function StaffSubmissions() {
  const navigate = useNavigate();
  const { push } = useToast();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [data, setData] = useState({ items: [], pagination: { page: 1, pages: 1, total: 0, limit: 10 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [pdfId, setPdfId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get(
          "/staff/submissions",
          {
            page,
            limit: 10,
            search: debouncedSearch,
            status,
            from,
            to,
          },
          { signal: controller.signal }
        );
        setData(response);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message || "Unable to load your responses.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, [page, debouncedSearch, status, from, to, reloadKey]);

  const activeFilters =
    (debouncedSearch ? 1 : 0) + (status !== "all" ? 1 : 0) + (from ? 1 : 0) + (to ? 1 : 0);

  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatus("all");
    setFrom("");
    setTo("");
    setPage(1);
  };

  const handlePdf = async (event, item) => {
    event.stopPropagation();
    setPdfId(item._id);
    try {
      await downloadPdf(item._id, item.referenceNo);
      push("PDF form downloaded.", "success");
    } catch (err) {
      push(err.message || "Could not generate PDF.", "error");
    } finally {
      setPdfId(null);
    }
  };

  const items = data.items || [];
  const pagination = data.pagination || { page: 1, pages: 1, total: 0, limit: 10 };

  return (
    <div className="responses-page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">My profiling responses</p>
          <h2>Responses I handled</h2>
          <p>Review the beneficiary profiles you interviewed and profiled.</p>
        </div>
        <div className="page-heading-actions">
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={() => setReloadKey((current) => current + 1)}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </section>

      <section className="filter-panel">
        <div className="filter-row">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search name, reference no., or address…"
          />
          <Button
            variant="outline"
            icon={SlidersHorizontal}
            onClick={() => setShowFilters((current) => !current)}
            className={activeFilters ? "has-active-filter" : ""}
          >
            Filters {activeFilters ? <span className="filter-count">{activeFilters}</span> : null}
          </Button>
        </div>

        <div className="status-tabs" role="tablist" aria-label="Filter by status">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={status === tab.value}
              className={`status-tab ${status === tab.value ? "is-active" : ""}`}
              onClick={() => {
                setStatus(tab.value);
                setPage(1);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {showFilters ? (
          <div className="filter-drawer">
            <div className="field-grid">
              <div className="form-field">
                <label className="field-label" htmlFor="filter-from">
                  <CalendarDays size={13} /> From date
                </label>
                <TextInput
                  id="filter-from"
                  type="date"
                  value={from}
                  onChange={(event) => {
                    setFrom(event.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="form-field">
                <label className="field-label" htmlFor="filter-to">
                  <CalendarDays size={13} /> To date
                </label>
                <TextInput
                  id="filter-to"
                  type="date"
                  value={to}
                  onChange={(event) => {
                    setTo(event.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>
            {activeFilters ? (
              <button type="button" className="reset-filters" onClick={resetFilters}>
                <FilterX size={14} /> Clear all filters
              </button>
            ) : null}
          </div>
        ) : null}
      </section>

      {error ? (
        <div className="form-alert">
          {error}
          <button type="button" onClick={() => setReloadKey((current) => current + 1)}>
            Retry
          </button>
        </div>
      ) : null}

      <section className="table-panel">
        <div className="table-panel-head">
          <div>
            <h3>My responses</h3>
            <p>{pagination.total} {pagination.total === 1 ? "record" : "records"} found</p>
          </div>
          {loading ? <Spinner size={18} /> : null}
        </div>

        {items.length === 0 && !loading ? (
          <EmptyState
            icon={activeFilters ? FilterX : Inbox}
            title={activeFilters ? "No matching responses" : "No responses yet"}
            action={
              activeFilters ? (
                <Button variant="outline" onClick={resetFilters}>
                  Clear filters
                </Button>
              ) : null
            }
          >
            {activeFilters
              ? "Try adjusting your search or filters to find the record you are looking for."
              : "Responses you have profiled will appear here."}
          </EmptyState>
        ) : (
          <>
            <div className={`table-wrap ${loading ? "is-loading" : ""}`}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Beneficiary</th>
                    <th>Reference</th>
                    <th>Assistance needed</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th className="align-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id} onClick={() => navigate(`/admin/submissions/${item._id}`)}>
                      <td>
                        <div className="table-person">
                          <span className="table-avatar">
                            {(item.personal?.cardHolderName || "?").charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <strong>{item.personal?.cardHolderName || "Unnamed beneficiary"}</strong>
                            <span>
                              {item.personal?.memberName
                                ? `Member: ${item.personal.memberName}`
                                : item.personal?.address || "No address provided"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="mono">{item.referenceNo}</span>
                      </td>
                      <td>
                        <div className="tag-list tag-compact">
                          {(item.opportunities?.assistanceInterests || []).slice(0, 2).map((code) => (
                            <span className="tag" key={code}>
                              {LABELS.assistance[code] || code}
                            </span>
                          ))}
                          {(item.opportunities?.assistanceInterests || []).length > 2 ? (
                            <span className="tag tag-more">
                              +{(item.opportunities?.assistanceInterests || []).length - 2}
                            </span>
                          ) : null}
                          {!item.opportunities?.assistanceInterests?.length ? (
                            <span className="muted">Not specified</span>
                          ) : null}
                        </div>
                      </td>
                      <td>
                        <span className="table-date">{formatDate(item.submittedAt)}</span>
                      </td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="align-right">
                        <div className="table-actions">
                          <Link
                            to={`/admin/submissions/${item._id}`}
                            className="icon-btn"
                            aria-label="View response"
                            title="View response"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <Eye size={17} />
                          </Link>
                          <button
                            type="button"
                            className="icon-btn"
                            aria-label="Download PDF"
                            title="Download PDF"
                            onClick={(event) => handlePdf(event, item)}
                            disabled={pdfId === item._id}
                          >
                            {pdfId === item._id ? <Spinner size={16} /> : <FileDown size={17} />}
                          </button>
                          <Link
                            to={`/admin/submissions/${item._id}`}
                            className="icon-btn subtle"
                            aria-label="Open details"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <ArrowRight size={17} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="response-cards">
              {items.map((item) => (
                <article className="response-card" key={item._id}>
                  <header>
                    <span className="table-avatar">
                      {(item.personal?.cardHolderName || "?").charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <strong>{item.personal?.cardHolderName || "Unnamed beneficiary"}</strong>
                      <span className="mono">{item.referenceNo}</span>
                    </div>
                    <StatusBadge status={item.status} />
                  </header>
                  <div className="response-card-body">
                    <span>
                      <CalendarDays size={14} /> {formatDate(item.submittedAt)}
                    </span>
                    <span>
                      <Users size={14} /> {joinLabels("sectors", item.personal?.sectors, "No sector")}
                    </span>
                    <div className="tag-list tag-compact">
                      {(item.opportunities?.assistanceInterests || []).map((code) => (
                        <span className="tag" key={code}>
                          {LABELS.assistance[code] || code}
                        </span>
                      ))}
                    </div>
                  </div>
                  <footer>
                    <Link to={`/admin/submissions/${item._id}`} className="btn btn-outline btn-sm">
                      <Eye size={15} /> View
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={FileDown}
                      loading={pdfId === item._id}
                      onClick={(event) => handlePdf(event, item)}
                    >
                      PDF
                    </Button>
                  </footer>
                </article>
              ))}
            </div>

            <Pagination
              page={pagination.page}
              pages={pagination.pages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={setPage}
            />
          </>
        )}
      </section>
    </div>
  );
}
