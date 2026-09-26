import { useEffect, useState } from 'react'
import { Send } from 'lucide-react'
import { askHeritageGuide, getChatHistory } from '../../../services/chat.js'

const suggestions = [
  'What is the significance of this building?',
  'Explain this briefly for a student.',
  'What are the architectural highlights?',
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
    <section className="ai-guide" aria-label={`Ask AI about ${locationName}`}>
      <header className="ai-guide-header">
        <div className="ai-avatar">AI</div>
        <div>
          <span>AI Heritage Guide</span>
          <h2>Learn more about {locationName}</h2>
        </div>
        <span className="ai-status">● Heritage guide</span>
      </header>

      <div className="ai-chat-body" aria-live="polite">
        <div className="ai-message">
          <div className="mini-avatar">AI</div>
          <div>
            <span className="message-label">Heritage assistant</span>
            <div className="bubble ai">
              Would you like to explore the history, architecture, or meaning of {locationName}?
            </div>
          </div>
        </div>

        {isLoadingHistory && (
          <p className="ai-chat-state">Loading chat history...</p>
        )}

        {messages.map((message) => (
          <div className="chat-exchange" key={message.message_id}>
            <div className="ai-message user-message">
              <div>
                <span className="message-label">You</span>
                <div className="bubble user">{message.question}</div>
              </div>
            </div>
            <div className="ai-message">
              <div className="mini-avatar">AI</div>
              <div>
                <span className="message-label">Heritage assistant</span>
                <div className="bubble ai">
                  {message.answer || 'Thinking...'}
                </div>
              </div>
            </div>
          </div>
        ))}

        {messages.length === 0 && !isLoadingHistory && (
          <>
            <p className="suggestion-label">Suggested questions</p>
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
          <span className="sr-only">Question</span>
          <input
            value={question}
            maxLength={500}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={`Ask AI about ${locationName}...`}
            disabled={isSending}
          />
        </label>
        <button
          type="submit"
          className="send-button"
          aria-label="Send"
          disabled={isSending || !question.trim()}
        >
          <Send size={18} />
        </button>
      </form>
      {error && <p className="ai-chat-error" role="alert">{error}</p>}
      <p className="ai-note">Answers are generated from the site information in the database.</p>
    </section>
  )
}
