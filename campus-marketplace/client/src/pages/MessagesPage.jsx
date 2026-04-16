import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import http from '../api/http'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { friendlyDate } from '../utils/format'
import { getErrorMessage } from '../utils/errors'

export default function MessagesPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [searchParams] = useSearchParams()

  const [conversations, setConversations] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [activeConversation, setActiveConversation] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)

  const queryConversationId = searchParams.get('conversation')

  const loadConversations = async () => {
    try {
      const { data } = await http.get('/messages/conversations')
      setConversations(data.conversations || [])

      const preferred = queryConversationId
        || selectedId
        || data.conversations?.[0]?._id
        || ''

      if (preferred) {
        setSelectedId(preferred)
      }
    } catch (error) {
      showToast(getErrorMessage(error, 'Unable to load conversations.'), 'error')
    }
  }

  const loadConversationDetail = async (id) => {
    if (!id) {
      setActiveConversation(null)
      return
    }

    try {
      const { data } = await http.get(`/messages/conversations/${id}`)
      setActiveConversation(data.conversation)
    } catch (error) {
      showToast(getErrorMessage(error, 'Unable to load conversation.'), 'error')
    }
  }

  useEffect(() => {
    async function bootstrap() {
      if (!user) {
        setLoading(false)
        return
      }

      setLoading(true)
      await loadConversations()
      setLoading(false)
    }

    bootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, queryConversationId])

  useEffect(() => {
    loadConversationDetail(selectedId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  const sendMessage = async () => {
    if (!selectedId || !messageText.trim()) {
      return
    }

    try {
      const { data } = await http.post(`/messages/conversations/${selectedId}/messages`, {
        body: messageText,
      })
      setActiveConversation(data.conversation)
      setMessageText('')
      await loadConversations()
    } catch (error) {
      showToast(getErrorMessage(error, 'Unable to send message.'), 'error')
    }
  }

  const reportConversation = async () => {
    if (!selectedId) return

    const reason = window.prompt('Provide a reason for reporting this conversation:')
    if (!reason) return

    try {
      await http.post(`/messages/conversations/${selectedId}/report`, { reason })
      showToast('Conversation reported to admin.', 'success')
    } catch (error) {
      showToast(getErrorMessage(error, 'Unable to submit report.'), 'error')
    }
  }

  if (!user) {
    return <div className="cm-container"><p className="cm-text-muted">Sign in to use messaging.</p></div>
  }

  if (loading) {
    return <div className="cm-container"><p className="cm-text-muted">Loading messages...</p></div>
  }

  return (
    <div className="cm-container">
      <div className="cm-page-header">
        <h1 className="cm-page-header__title">Messages</h1>
        <p className="cm-page-header__sub">Chat with buyers and sellers.</p>
      </div>

      <div className="cm-messages-layout">
        <aside className="cm-conv-list">
          <div className="cm-conv-list__header">Conversations</div>
          {conversations.map((conversation) => {
            const other = conversation.otherUser
              || conversation.participants?.find((p) => String(p._id) !== String(user.id))
            const last = conversation.messages?.at(-1)

            return (
              <button
                key={conversation._id}
                type="button"
                className={`cm-conv-item ${conversation._id === selectedId ? 'cm-conv-item--active' : ''}`}
                onClick={() => setSelectedId(conversation._id)}
              >
                <div className="cm-conv-item__avatar">{other?.name?.slice(0, 1) || '?'}</div>
                <div className="cm-conv-item__body">
                  <div className="cm-conv-item__name">{other?.name || 'Unknown User'}</div>
                  <div className="cm-conv-item__preview">{last?.body || 'No messages yet.'}</div>
                  <div className="cm-conv-item__time">{friendlyDate(conversation.lastMessageAt)}</div>
                </div>
                {conversation.unread && <span className="cm-conv-item__unread" />}
              </button>
            )
          })}
        </aside>

        <section className="cm-chat">
          {activeConversation ? (
            <>
              <div className="cm-chat__header">
                <p className="cm-chat__subject">{activeConversation.listing?.title}</p>
                <button type="button" className="cm-btn cm-btn--danger cm-btn--sm" onClick={reportConversation}>
                  Report Conversation
                </button>
              </div>

              <div className="cm-chat__messages" id="chat-messages">
                {activeConversation.messages?.map((message) => (
                  <div
                    key={message._id}
                    className={`cm-msg ${String(message.sender?._id || message.sender) === String(user.id) ? 'cm-msg--out' : 'cm-msg--in'}`}
                  >
                    <div className="cm-msg__bubble">{message.body}</div>
                    <span className="cm-msg__time">{friendlyDate(message.createdAt)}</span>
                  </div>
                ))}
              </div>

              <div className="cm-chat__footer">
                <textarea
                  className="cm-chat__textarea"
                  rows={2}
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                />
                <button className="cm-btn cm-btn--primary" type="button" onClick={sendMessage}>
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="cm-empty">
              <h3 className="cm-empty__title">Select a conversation</h3>
              <p className="cm-empty__msg">Start by contacting a seller from a listing.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
