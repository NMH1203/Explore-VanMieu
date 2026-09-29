import { useEffect, useState } from 'react'
import { CheckCircle2, Clock3, MapPin, ScanLine, XCircle } from 'lucide-react'
import { getCheckinHistory } from '../../../services/check-in-service/index.js'

const statusDetails = {
  verified: {
    label: 'Đã xác minh',
    className: 'verified',
    icon: CheckCircle2,
  },
  rejected_gps: {
    label: 'Ngoài phạm vi GPS',
    className: 'rejected',
    icon: XCircle,
  },
  rejected_image: {
    label: 'Ảnh không khớp',
    className: 'rejected',
    icon: XCircle,
  },
  pending: {
    label: 'Đang chờ',
    className: 'pending',
    icon: Clock3,
  },
}

function formatDate(value) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatConfidence(value) {
  return value == null ? '—' : `${Math.round(value * 100)}%`
}

export default function CheckinHistory() {
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignoreResult = false

    getCheckinHistory()
      .then((items) => {
        if (!ignoreResult) setHistory(items)
      })
      .catch((caught) => {
        if (!ignoreResult) setError(caught.message)
      })
      .finally(() => {
        if (!ignoreResult) setIsLoading(false)
      })

    return () => {
      ignoreResult = true
    }
  }, [])

  return (
    <section className="panel section checkin-history">
      <header className="checkin-history-header">
        <div>
          <span className="kicker">Hoạt động gần đây</span>
          <h2>Lịch sử check-in</h2>
        </div>
        <ScanLine size={24} aria-hidden="true" />
      </header>

      {isLoading && <p className="checkin-history-state">Đang tải lịch sử...</p>}
      {error && <p className="checkin-history-error" role="alert">{error}</p>}
      {!isLoading && !error && history.length === 0 && (
        <div className="checkin-history-empty">
          <MapPin size={30} aria-hidden="true" />
          <p>Bạn chưa có lượt check-in nào.</p>
          <a className="btn btn-outline" href="/Explore/Camera">Mở camera</a>
        </div>
      )}

      {history.length > 0 && (
        <ol className="checkin-timeline">
          {history.map((item) => {
            const status = statusDetails[item.verification_status] || statusDetails.pending
            const StatusIcon = status.icon
            return (
              <li className="checkin-entry" key={item.log_id}>
                <div className={`checkin-marker ${status.className}`}>
                  <StatusIcon size={17} aria-hidden="true" />
                </div>
                <article>
                  <div className="checkin-entry-heading">
                    <div>
                      <h3>{item.location_name}</h3>
                      <time dateTime={item.logged_at}>{formatDate(item.logged_at)}</time>
                    </div>
                    <span className={`checkin-status ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                  <dl className="checkin-metrics">
                    <div>
                      <dt>Khoảng cách</dt>
                      <dd>{Math.round(item.distance_meters)} m</dd>
                    </div>
                    <div>
                      <dt>Nhãn AI</dt>
                      <dd>{item.detected_label || '—'}</dd>
                    </div>
                    <div>
                      <dt>Độ tin cậy</dt>
                      <dd>{formatConfidence(item.confidence)}</dd>
                    </div>
                  </dl>
                </article>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
