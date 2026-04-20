import { useEffect, useState } from 'react'
import http from '../../api/http'
import { useToast } from '../../context/ToastContext'
import { friendlyDate, statusBadgeClass, titleCase } from '../../utils/format'
import { getErrorMessage } from '../../utils/errors'
import { usePageTitle } from '../../utils/usePageTitle'

export default function AdminReportsPage() {
  usePageTitle('Reports')
  const { showToast } = useToast()
  const [reports, setReports] = useState([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  const loadReports = async () => {
    try {
      setLoading(true)
      const params = status ? `?status=${status}` : ''
      const { data } = await http.get(`/admin/reports${params}`)
      setReports(data.reports || [])
    } catch (error) {
      showToast(getErrorMessage(error, 'Unable to load reports.'), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const resolveReport = async (reportId, action) => {
    const note = window.prompt('Optional admin note:') || ''

    try {
      await http.patch(`/admin/reports/${reportId}/resolve`, {
        action,
        note,
      })
      showToast(`Report ${action} action completed.`, action === 'dismiss' ? 'default' : 'success')
      await loadReports()
    } catch (error) {
      showToast(getErrorMessage(error, 'Unable to resolve report.'), 'error')
    }
  }

  return (
    <div className="cm-dash-section">
      <div className="cm-dash-section__head">
        <h2 className="cm-dash-section__title">Reported Messages</h2>
      </div>

      <div className="cm-dash-section__body">
        <div className="cm-form__group cm-mb-20">
          <label className="cm-form__label">Filter Status</label>
          <select className="cm-form__select" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>

        {loading ? (
          <p className="cm-text-muted">Loading reports...</p>
        ) : (
          <div className="cm-table-wrap">
            <table className="cm-table">
              <thead>
                <tr>
                  <th>Reporter</th>
                  <th>Against</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 && (
                  <tr><td colSpan={6} className="cm-table__empty">No reports found.</td></tr>
                )}
                {reports.map((report) => (
                  <tr key={report._id}>
                    <td>{report.reporter?.name}</td>
                    <td>{report.againstUser?.name}</td>
                    <td>{report.reason}</td>
                    <td><span className={statusBadgeClass(report.status)}>{titleCase(report.status)}</span></td>
                    <td>{friendlyDate(report.createdAt)}</td>
                    <td>
                      <div className="cm-table__actions">
                        <button className="cm-btn cm-btn--ghost cm-btn--sm" type="button" onClick={() => resolveReport(report._id, 'dismiss')}>
                          Dismiss
                        </button>
                        <button className="cm-btn cm-btn--secondary cm-btn--sm" type="button" onClick={() => resolveReport(report._id, 'warn')}>
                          Warn
                        </button>
                        <button className="cm-btn cm-btn--danger cm-btn--sm" type="button" onClick={() => resolveReport(report._id, 'suspend')}>
                          Suspend
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
