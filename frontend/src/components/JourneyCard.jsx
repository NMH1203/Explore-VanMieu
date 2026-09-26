import { useEffect, useState } from 'react'
import { paths } from '../routes.js'

function JourneyCard({ userId, unlockedLocations }) {
    console.log('Journey userId:', userId) //test bug and debug :(
    const [journeyLocations, setJourneyLocations] = useState([])
    const [completed, setCompleted] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!userId) {
            setLoading(false)
            return
        }

        const loadJourney = async () => {
            try {
                setLoading(true)
                setError(null)

                const response = await fetch(
                    `http://127.0.0.1:8000/api/journey/${userId}`,
                    {
                        credentials: 'include',
                    }
                )

                if (!response.ok) {
                    throw new Error('Không thể tải hành trình')
                }

                const data = await response.json()

                setJourneyLocations(data.locations || [])
                setCompleted(data.completed || false)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        loadJourney()
    }, [userId])

    const journeyCount = journeyLocations.filter(
        (location) => unlockedLocations.has(location.location_id)
    ).length

    if (loading) {
        return (
            <div className="journey-card">
                <div className="journey-copy">
                    <h2>Đang tải hành trình...</h2>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="journey-card">
                <div className="journey-copy">
                    <h2>Không thể tải hành trình</h2>
                    <p>{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="journey-card">
            <div className="journey-copy">
                <span className="eyebrow">Hành trình của bạn hôm nay</span>

                <h2>Năm điểm chạm, một mạch ký ức</h2>

                <p>
                    Hệ thống đã chọn 5 địa điểm không trùng lặp.
                    Hoàn thành xác minh GPS và camera để mở khóa từng lớp di sản.
                </p>

                <div className="progress-label">
                    <span>Tiến trình khám phá</span>
                    <strong>{journeyCount}/5 địa điểm</strong>
                </div>

                <div className="progress">
                    <i style={{ width: `${journeyCount * 20}%` }}></i>
                </div>

                <br />

                <a
                    className="btn btn-gold"
                    href={paths.map}
                >
                    Tiếp tục hành trình
                </a>
            </div>

            <div className="journey-list">
                {journeyLocations.map((location, index) => (
                    <div
                        className="journey-stop"
                        key={location.location_id}
                    >
                        <span className="stop-no">
                            {unlockedLocations.has(location.location_id)
                                ? '✓'
                                : index + 1}
                        </span>

                        <span>
                            {location.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default JourneyCard
