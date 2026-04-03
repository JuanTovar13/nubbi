import type { Message } from '../../types';
import { EmptyState } from '../EmptyState/EmptyState';
import { MessageBubble } from '../MessageBubble/MessageBubble';
import { Icon } from '../Icon/Icon';

interface MessageListProps {
  messages: Message[];
  isOwnMessage: (msg: Message) => boolean;
  messagesEndRef: preact.RefObject<HTMLDivElement>;
}

export const MessageList = ({ messages, isOwnMessage, messagesEndRef }: Readonly<MessageListProps>) => {
  if (messages.length === 0) {
    return (
      <EmptyState
        icon={<Icon name="chat" />}
        title="Sin mensajes"
        subtitle="Envia el primer mensaje"
      />
    );
  }

  return (
    <div class="flex flex-col gap-3 py-4">
      {messages.map((msg, i) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isOwn={isOwnMessage(msg)}
          delay={i * 20}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
