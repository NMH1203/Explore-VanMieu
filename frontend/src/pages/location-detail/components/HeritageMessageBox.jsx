import { useEffect, useState } from 'react'
import { Send } from 'lucide-react'
import { askHeritageGuide, getChatHistory } from '../../../services/chat.js'

const suggestions = [
  'Công trình này có ý nghĩa gì?',
  'Hãy giải thích ngắn gọn cho học sinh.',
  'Điểm kiến trúc nổi bật là gì?',
]

export default function HeritageMessageBox({ locationId, locationName }) {
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState('')
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignoreResult = false
    setIsLoadingHistory(true)
    setError('')

    getChatHistory(locationId)
      .then((history) => {
        if (!ignoreResult) setMessages(history)
      })
      .catch((caught) => {
        if (!ignoreResult) setError(caught.message)
      })
      .finally(() => {
        if (!ignoreResult) setIsLoadingHistory(false)
      })

    return () => {
      ignoreResult = true
    }
  }, [locationId])

  async function handleSubmit(event) {
    event.preventDefault()
    const normalizedQuestion = question.trim()
    if (!normalizedQuestion || isSending) return

    setError('')
    setIsSending(true)
    setQuestion('')
    const pendingId = `pending-${Date.now()}`
    setMessages((current) => [
      ...current,
      {
        message_id: pendingId,
        question: normalizedQuestion,
        answer: null,
      },
    ])

    try {
      const savedMessage = await askHeritageGuide(
        locationId,
        normalizedQuestion,
      )
      setMessages((current) => current.map((message) => (
        message.message_id === pendingId ? savedMessage : message
      )))
    } catch (caught) {
      setMessages((current) => current.filter(
        (message) => message.message_id !== pendingId,
      ))
      setQuestion(normalizedQuestion)
      setError(caught.message)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <section className="ai-guide" aria-label={`Hỏi AI về ${locationName}`}>
      <header className="ai-guide-header">
        <div className="ai-avatar">AI</div>
        <div>
          <span>AI Heritage Guide</span>
          <h2>Hỏi thêm về {locationName}</h2>
        </div>
        <span className="ai-status">● Đang trực tuyến</span>
      </header>

      <div className="ai-chat-body" aria-live="polite">
        <div className="ai-message">
          <div className="mini-avatar">AI</div>
          <div>
            <span className="message-label">Trợ lý di sản</span>
            <div className="bubble ai">
              Bạn muốn tìm hiểu lịch sử, kiến trúc hay ý nghĩa của {locationName}?
            </div>
          </div>
        </div>

        {isLoadingHistory && (
          <p className="ai-chat-state">Đang tải lịch sử trò chuyện...</p>
        )}

        {messages.map((message) => (
          <div className="chat-exchange" key={message.message_id}>
            <div className="ai-message user-message">
              <div>
                <span className="message-label">Bạn</span>
                <div className="bubble user">{message.question}</div>
              </div>
            </div>
            <div className="ai-message">
              <div className="mini-avatar">AI</div>
              <div>
                <span className="message-label">Trợ lý di sản</span>
                <div className="bubble ai">
                  {message.answer || 'Đang suy nghĩ...'}
                </div>
              </div>
            </div>
          </div>
        ))}

        {messages.length === 0 && !isLoadingHistory && (
          <>
            <p className="suggestion-label">Gợi ý câu hỏi</p>
            <div className="question-row">
              {suggestions.map((suggestion) => (
                <button
                  type="button"
                  className="chip"
                  key={suggestion}
                  onClick={() => setQuestion(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <form className="ai-composer" onSubmit={handleSubmit}>
        <label>
          <span className="sr-only">Câu hỏi</span>
          <input
            value={question}
            maxLength={500}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={`Hỏi AI về ${locationName}...`}
            disabled={isSending}
          />
        </label>
        <button
          type="submit"
          className="send-button"
          aria-label="Gửi"
          disabled={isSending || !question.trim()}
        >
          <Send size={18} />
        </button>
      </form>
      {error && <p className="ai-chat-error" role="alert">{error}</p>}
      <p className="ai-note">Câu trả lời được tạo từ tư liệu địa điểm trong database.</p>
    </section>
  )
}
