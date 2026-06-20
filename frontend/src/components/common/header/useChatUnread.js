import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../chat/firebase";
import { getMyConversations } from "../../chat/joinRequestApi";

export function useChatUnread(isLoggedIn) {
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) return;

    let cancelled = false;
    let unsubscribers = [];
    const msgCounts = {};
    const currentUserId = JSON.parse(localStorage.getItem("user") || "{}").userId;

    const setup = async () => {
      // Đọc hidden list từ Firestore để đồng bộ với ChatPage                                                                                                                    
      let hidden = [];
      try {
        const settingsSnap = await getDoc(doc(db, "userSettings", String(currentUserId)));
        hidden = settingsSnap.data()?.hiddenConvs || [];
      } catch (_) { }

      const res = await getMyConversations();
      if (cancelled) return;

      const convs = (res.data.result || []).filter(
        (c) => !hidden.includes(`req_${c.requestId}`)
      );

      unsubscribers = convs.map((conv) => {
        const convId = `req_${conv.requestId}`;
        const msgsRef = collection(db, "conversations", convId, "messages");
        const q = query(msgsRef, orderBy("createdAt", "desc"), limit(50));

        return onSnapshot(q, (snap) => {
          if (cancelled) return;
          const msgs = snap.docs.map((d) => d.data());
          const lastRead = parseInt(
            localStorage.getItem(`lastRead_${currentUserId}_${convId}`) || "0"
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
    };

    setup().catch(() => { });

    return () => {
      cancelled = true;
      unsubscribers.forEach((u) => u());
    };
  }, [isLoggedIn]);

  return chatUnreadCount;
}
