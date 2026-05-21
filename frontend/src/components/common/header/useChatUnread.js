import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../chat/firebase";
import { getMyConversations } from "../../chat/joinRequestApi";

export function useChatUnread(isLoggedIn) {
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) return;

    let cancelled = false;
    let unsubscribers = [];
    const msgCounts = {};
    const currentUserId = JSON.parse(
      localStorage.getItem("user") || "{}",
    ).userId;

    getMyConversations()
      .then((res) => {
        if (cancelled) return;
        const convs = res.data.result || [];

        unsubscribers = convs.map((conv) => {
          const convId = `req_${conv.requestId}`;
          const msgsRef = collection(db, "conversations", convId, "messages");
          const q = query(msgsRef, orderBy("createdAt", "desc"), limit(50));

          return onSnapshot(q, (snap) => {
            if (cancelled) return;
            const msgs = snap.docs.map((d) => d.data());

            const lastRead = parseInt(
              localStorage.getItem(`lastRead_${currentUserId}_${convId}`) || "0",
            );

            const count = msgs.filter((msg) => {
              if (msg.senderId === currentUserId) return false;
              if (lastRead === 0) return true;
              const msgTime = msg.createdAt?.toMillis?.() ?? 0;
              return msgTime > lastRead;
            }).length;

            msgCounts[convId] = count;
            const total = Object.values(msgCounts).filter((c) => c > 0).length;
            setChatUnreadCount(total);
          });
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      unsubscribers.forEach((u) => u());
    };
  }, [isLoggedIn]);

  return chatUnreadCount;
}
