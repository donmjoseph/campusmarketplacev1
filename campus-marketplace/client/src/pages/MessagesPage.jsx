import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import http from '../api/http'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { usePageTitle } from '../utils/usePageTitle'
import { friendlyDate } from '../utils/format'
import { getErrorMessage } from '../utils/errors'

export default function MessagesPage() {
  usePageTitle('Messages')
  const { user, refreshUnreadCount } = useAuth()
  const { showToast } = useToast()
  const [searchParams] = useSearchParams()

  const [conversations, setConversations] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [activeConversation, setActiveConversation] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const chatBottomRef = useRef(null)
  const queryConversationId = searchParams.get('conversation')

  // ── scroll to bottom whenever messages change ────────────────────────────
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConversation?.messages?.length])

  // ── load sidebar list ────────────────────────────────────────────────────
  const loadConversations = async () => {
    try {
      const { data } = await http.get('/messages/conversations')
      setConversations(data.conversations || [])
      return data.conversations || []
    } catch (error) {
      showToast(getErrorMessage(error, 'Unable to load conversations.'), 'error')
      return []
    }
  }

  // ── open a conversation: fetch full thread, mark read ────────────────────
  const openConversation = async (id) => {
    if (!id) {
      setActiveConversation(null)
      return
    }

    try {
      const { data } = await http.get(`/messages/conversations/${id}`)
      setActiveConversation(data.conversation)
      // clear unread dot locally so it disappears immediately
      setConversations((prev) =>
        prev.map((c) => (c._id === id ? { ...c, unread: false } : c))
      )
      // update navbar badge
      refreshUnreadCount()
    } catch (error) {
      showToast(getErrorMessage(error, 'Unable to load conversation.'), 'error')
    }
  }

  // ── bootstrap ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function bootstrap() {
      if (!user) { setLoading(false); return }

      setLoading(true)
      const list = await loadConversations()

      const preferred = queryConversationId || list[0]?._id || ''
      if (preferred) setSelectedId(preferred)

      setLoading(false)
    }
    bootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, queryConversationId])

  // ── open conversation whenever selected ID changes ───────────────────────
  useEffect(() => {
    openConversation(selectedId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  // ── select a conversation from the sidebar ───────────────────────────────
  const selectConversation = (id) => {
    if (id === selectedId) return
    setSelectedId(id)
  }

  // ── send a message ───────────────────────────────────────────────────────
  const sendMessage = async () => {
    const text = messageText.trim()
    if (!selectedId || !text) return

    setSending(true)
    try {
      const { data } = await http.post(`/messages/conversations/${selectedId}/messages`, {
        body: text,
      })
      setActiveConversation(data.conversation)
      setMessageText('')
      // refresh sidebar to update last-message preview and ordering
      await loadConversations()
    } catch (error) {
      showToast(getErrorMessage(error, 'Unable to send message.'), 'error')
    } finally {
      setSending(false)
    }
  }

  // ── Enter sends, Shift+Enter inserts newline ─────────────────────────────
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  // ── report conversation ──────────────────────────────────────────────────
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
        {/* ── Conversation sidebar ─────────────────────────────────── */}
        <aside className="cm-conv-list">
          <div className="cm-conv-list__header">Conversations</div>

          {conversations.length === 0 && (
            <p style={{ padding: '20px 18px', fontSize: '.85rem', color: '#888' }}>
              No conversations yet.
            </p>
          )}

          {conversations.map((conversation) => {
            const other = conversation.otherUser
              || conversation.participants?.find((p) => String(p._id) !== String(user.id))
            const last = conversation.messages?.at(-1)

            return (
              <button
                key={conversation._id}
                type="button"
                className={`cm-conv-item ${conversation._id === selectedId ? 'cm-conv-item--active' : ''}`}
                onClick={() => selectConversation(conversation._id)}
              >
                <div className="cm-conv-item__avatar">{other?.name?.slice(0, 1) || '?'}</div>
                <div className="cm-conv-item__body">
                  <div className="cm-conv-item__name">{other?.name || 'Unknown'}</div>
                  <div className="cm-conv-item__preview">{last?.body || 'No messages yet.'}</div>
                  <div className="cm-conv-item__time">{friendlyDate(conversation.lastMessageAt)}</div>
                </div>
                {conversation.unread && <span className="cm-conv-item__unread" />}
              </button>
            )
          })}
        </aside>

        {/* ── Active thread ────────────────────────────────────────── */}
        <section className="cm-chat">
          {activeConversation ? (
            <>
              <div className="cm-chat__header">
                <div>
                  <p className="cm-chat__subject">{activeConversation.listing?.title || 'Conversation'}</p>
                  <p className="cm-chat__listing-ref">
                    {activeConversation.participants
                      ?.filter((p) => String(p._id) !== String(user.id))
                      .map((p) => p.name)
                      .join(', ')}
                  </p>
                </div>
                <button
                  type="button"
                  className="cm-btn cm-btn--danger cm-btn--sm"
                  onClick={reportConversation}
                >
                  Report
                </button>
              </div>

              <div className="cm-chat__messages">
                {activeConversation.messages?.length === 0 && (
                  <p style={{ textAlign: 'center', color: '#bbb', fontSize: '.85rem', marginTop: '30px' }}>
                    No messages yet. Say hello!
                  </p>
                )}
                {activeConversation.messages?.map((message) => (
                  <div
                    key={message._id}
                    className={`cm-msg ${
                      String(message.sender?._id || message.sender) === String(user.id)
                        ? 'cm-msg--out'
                        : 'cm-msg--in'
                    }`}
                  >
                    <div className="cm-msg__bubble">{message.body}</div>
                    <span className="cm-msg__time">{friendlyDate(message.createdAt)}</span>
                  </div>
                ))}
                {/* anchor for auto-scroll */}
                <div ref={chatBottomRef} />
              </div>

              <div className="cm-chat__footer">
                <textarea
                  className="cm-chat__textarea"
                  rows={2}
                  placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                />
                <button
                  className="cm-btn cm-btn--primary"
                  type="button"
                  onClick={sendMessage}
                  disabled={sending || !messageText.trim()}
                >
                  {sending ? '…' : 'Send'}
                </button>
              </div>
            </>
          ) : (
            <div className="cm-empty">
              <h3 className="cm-empty__title">Select a conversation</h3>
              <p className="cm-empty__msg">
                {conversations.length === 0
                  ? 'Start by clicking "Contact Seller" on any listing.'
                  : 'Choose a conversation from the list on the left.'}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
