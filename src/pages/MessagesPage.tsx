import { Ban, Flag, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { PageShell } from '../components/PageShell';
import { mockUsers } from '../data/mockUsers';
import { useAppState } from '../hooks/useAppState';

export function MessagesPage() {
  const { matchId } = useParams();
  const user = mockUsers.find((mockUser) => mockUser.id === matchId);
  const { blockUser, ensureMatchMessages, isMatched, messagesByMatchId, reportUser, sendMessage } = useAppState();
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (matchId) ensureMatchMessages(matchId);
  }, [ensureMatchMessages, matchId]);

  if (!user || !matchId) {
    return <Navigate replace to="/matches" />;
  }

  if (!isMatched(matchId)) {
    return <Navigate replace to="/matches" />;
  }

  const activeMatchId = matchId;
  const messages = messagesByMatchId[activeMatchId] ?? [];

  function handleSendMessage() {
    sendMessage(activeMatchId, draft);
    setDraft('');
  }

  return (
    <PageShell description="送信内容はlocalStorageに保存され、リロード後も残るデモです。" eyebrow="Message" title={`${user.name}さんとのDM`}>
      {notice ? <div className="rounded-[1.15rem] bg-theme-accent-soft/70 p-3 text-center text-sm font-bold text-theme-text">{notice}</div> : null}
      <Card className="flex min-h-[56vh] flex-col gap-2.5">
        <div className="flex-1 space-y-2.5">
          {messages.map((message) => (
            <div className={`flex ${message.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`} key={message.id}>
              <p className={`max-w-[78%] rounded-[1.15rem] px-3.5 py-2.5 text-[13px] leading-5 ${message.senderId === 'current-user' ? 'bg-theme-main text-white' : 'bg-theme-accent-soft text-theme-text'}`}>{message.body}</p>
            </div>
          ))}
        </div>
        <div className="flex items-end gap-2 border-t border-theme-main/10 pt-3">
          <Input className="min-h-10" name="message" onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') handleSendMessage(); }} placeholder="メッセージを書く" value={draft} />
          <Button className="min-h-10 px-4" onClick={handleSendMessage}><Send size={17} /></Button>
        </div>
      </Card>
      <Card className="grid grid-cols-2 gap-2 bg-theme-background/65 p-3.5 shadow-none">
        <Button onClick={() => { blockUser(activeMatchId); setNotice('ブロックしました。一覧や今日のご縁から非表示になります。'); }} variant="ghost"><Ban size={15} />ブロック</Button>
        <Button onClick={() => { reportUser(activeMatchId); setNotice('通報を受け付けました。'); }} variant="danger"><Flag size={15} />通報</Button>
      </Card>
    </PageShell>
  );
}
