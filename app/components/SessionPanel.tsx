'use client';

import { useEffect, useRef, useState } from 'react';
import { useSessionStore } from '../store/sessionStore';
import styles from './SessionPanel.module.css';

export default function SessionPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [joinSessionId, setJoinSessionId] = useState('');
  const [userName, setUserName] = useState('');
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  
  const {
    sessionId,
    isHost,
    users,
    currentUser,
    isConnected,
    createSession,
    joinSession,
    leaveSession,
  } = useSessionStore();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateSession = () => {
    const newSessionId = createSession();
    console.log('Session created:', newSessionId);
  };

  const handleJoinSession = () => {
    if (joinSessionId.trim()) {
      joinSession(joinSessionId.trim().toUpperCase(), userName || 'Guest');
      setJoinSessionId('');
      setUserName('');
    }
  };

  const handleCopyLink = () => {
    if (sessionId) {
      const link = `${window.location.origin}?session=${sessionId}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyCode = () => {
    if (sessionId) {
      navigator.clipboard.writeText(sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={styles.container} ref={panelRef}>
      <button
        className={`${styles.trigger} ${isConnected ? styles.connected : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Session"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        {isConnected && (
          <span className={styles.userCount}>{users.length}</span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {!isConnected ? (
            <>
              <div className={styles.header}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>Birlikte Çizim Yap</span>
              </div>
              
              <p className={styles.description}>
                Arkadaşlarınla aynı canvas üzerinde gerçek zamanlı çizim yap!
              </p>
              
              <button className={styles.createButton} onClick={handleCreateSession}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Yeni Session Oluştur
              </button>

              <div className={styles.divider}>
                <span>veya</span>
              </div>

              <div className={styles.joinSection}>
                <input
                  type="text"
                  placeholder="İsminiz (opsiyonel)"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className={styles.input}
                />
                <input
                  type="text"
                  placeholder="Session kodu"
                  value={joinSessionId}
                  onChange={(e) => setJoinSessionId(e.target.value.toUpperCase())}
                  className={styles.input}
                  maxLength={8}
                />
                <button 
                  className={styles.joinButton}
                  onClick={handleJoinSession}
                  disabled={!joinSessionId.trim()}
                >
                  Katıl
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.header}>
                <div className={styles.sessionBadge}>
                  <span className={styles.liveIndicator} />
                  Aktif Session
                </div>
              </div>

              <div className={styles.sessionInfo}>
                <div className={styles.sessionCode}>
                  <span className={styles.codeLabel}>Session Kodu</span>
                  <div className={styles.codeValue}>
                    <span>{sessionId}</span>
                    <button 
                      className={styles.copyButton}
                      onClick={handleCopyCode}
                      title="Kodu Kopyala"
                    >
                      {copied ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button className={styles.shareButton} onClick={handleCopyLink}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  {copied ? 'Kopyalandı!' : 'Davet Linki Kopyala'}
                </button>
              </div>

              <div className={styles.usersSection}>
                <span className={styles.usersLabel}>
                  Katılımcılar ({users.length})
                </span>
                <div className={styles.usersList}>
                  {users.map((user) => (
                    <div key={user.id} className={styles.userItem}>
                      <div 
                        className={styles.userAvatar}
                        style={{ backgroundColor: user.color }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className={styles.userName}>
                        {user.name}
                        {user.id === currentUser?.id && ' (Sen)'}
                      </span>
                      {isHost && user.id === currentUser?.id && (
                        <span className={styles.hostBadge}>Host</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button className={styles.leaveButton} onClick={leaveSession}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Session&apos;dan Ayrıl
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
