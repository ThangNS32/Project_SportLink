import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  deleteDoc, 
  getDocs,
} from "firebase/firestore";
import { arrayUnion, doc as firestoreDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import "./chat.css";
                                                                                                                                                                       
  const getAvatarSrc = (url) => {                                                                                                                                    
    if (!url) return null;
    if (url.startsWith("http")) return url;                                                                                                                            
    return `http://localhost:8080/sportlink${url}`;
  };                                                                                                                                                                   
                                                                                                                                                                     
  export default function ConversationList({ conversations, loading, activeId, onDelete }) {                                                                                     
    const navigate = useNavigate();                                                                                                                                  
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");     
    
    const handleDelete = async (e, convId) => {                                                                                                                                          
      e.stopPropagation();                                                                                                                                                             
      if (!window.confirm("Xóa cuộc trò chuyện này?")) return;                                                                                                                       
                                                                                                                                                                                       
      // Ẩn khỏi UI ngay, không chờ Firestore                                                                                                                                          
      onDelete?.(convId);                                                                                                                                                              
      if (convId === activeId) navigate("/chat");                                                                                                                                      
                                                                                                                                                                                       
      try {                                                                                                                  
          const settingsRef = firestoreDoc(db, "userSettings", String(currentUser.userId));                                                                                            
          await setDoc(settingsRef, { hiddenConvs: arrayUnion(convId) }, { merge: true });                                                                                                                                                                             
          // Xóa nội dung tin nhắn trên Firestore                                                                                                                                      
          const msgsRef = collection(db, "conversations", convId, "messages");                                                                                                         
          const msgsSnap = await getDocs(msgsRef);                                                                                                                                     
          await Promise.all(msgsSnap.docs.map((d) => deleteDoc(d.ref)));                                                                                                               
          await deleteDoc(firestoreDoc(db, "conversations", convId));                                                                                                                  
      } catch (err) {                                                                                                                                                                  
          console.error("Xóa thất bại:", err);                                                                                                                                         
      }                                                                                                                                                                                
  };             
   
    // convMessages: { "req_1": [msg, msg, ...], "req_2": [...] }                                                                                                      
    // Khác với lastMessages cũ (chỉ lưu 1 tin) — giờ lưu 50 tin gần nhất để đếm                                                                                     
    const [convMessages, setConvMessages] = useState({});                                                                                                              
                                                                                                                                                                     
    useEffect(() => {                                                                                                                                                  
      if (!conversations.length) return;                                                                                                                             
                                                                                                                                                                       
      const unsubscribers = conversations.map((conv) => {
        const convId = `req_${conv.requestId}`;                                                                                                                        
        const msgsRef = collection(db, "conversations", convId, "messages");                                                                                         
                                                                                                                                                                       
        // limit(50) thay vì limit(1) — cần đủ tin để đếm unread                                                                                                       
        // orderBy desc = tin mới nhất trước, đủ để lấy 50 tin gần đây nhất                                                                                            
        const q = query(msgsRef, orderBy("createdAt", "desc"), limit(50));                                                                                             
                                                                                                                                                                       
        return onSnapshot(q, (snap) => {                                                                                                                               
          const msgs = snap.docs.map((d) => d.data());                                                                                                                 
          setConvMessages((prev) => ({ ...prev, [convId]: msgs }));                                                                                                  
        });                                                                                                                                                            
      });
                                                                                                                                                                       
      return () => unsubscribers.forEach((unsub) => unsub());                                                                                                        
    }, [conversations]);

    // Đếm số tin nhắn chưa đọc của 1 conversation                                                                                                                     
    const getUnreadCount = (convId) => {
      // Đang mở conversation này → đang nhìn vào → coi như đã đọc hết                                                                                                 
      if (convId === activeId) return 0;                                                                                                                               
   
      const msgs = convMessages[convId] || [];                                                                                                                         
      const lastRead = parseInt(localStorage.getItem(`lastRead_${currentUser.userId}_${convId}`) || "0");                                                                                  
                                                                                                                                                                       
      return msgs.filter((msg) => {                                                                                                                                    
        // Tin của chính mình → không tính là chưa đọc
        if (msg.senderId === currentUser.userId) return false;                                                                                                         
                                                                                                                                                                     
        // lastRead = 0 nghĩa là chưa bao giờ mở conversation này                                                                                                      
        // → tất cả tin của người kia đều là chưa đọc                                                                                                                
        if (lastRead === 0) return true;                                                                                                                               
                                                                                                                                                                     
        // Đã mở trước đây → chỉ đếm tin gửi SAU lần cuối đọc                                                                                                          
        const msgTime = msg.createdAt?.toMillis?.() ?? 0;                                                                                                            
        return msgTime > lastRead;                                                                                                                                     
      }).length;                                                                                                                                                     
    };                                                                                                                                                                 
                                                                                                                                                                       
    if (loading) return <div className="chat-list-empty">Đang tải...</div>;                                                                                            
    if (!conversations.length)                                                                                                                                         
      return <div className="chat-list-empty">Chưa có tin nhắn nào</div>;                                                                                              
                                                                                                                                                                     
    return (                                                                                                                                                           
      <div className="chat-list">
        {conversations.map((conv) => {                                                                                                                                 
          const convId = `req_${conv.requestId}`;                                                                                                                    
          const isActive = activeId === convId;
          const unreadCount = getUnreadCount(convId);
                                                                                                                                                                       
          const isRequester = conv.requesterId === currentUser.userId;
          const otherName = isRequester ? conv.ownerName : conv.requesterName;                                                                                         
          const otherAvatar = isRequester ? conv.ownerAvatar : conv.requesterAvatar;                                                                                   
                                                                                                                                                                       
          return (                                                                                                                                                     
            <div                                                                                                                                                       
              key={conv.requestId}                                                                                                                                   
              className={`chat-list__item ${isActive ? "chat-list__item--active" : ""}`}
              onClick={() => {                                                                                                                                         
                // Ghi thời điểm đọc → lần sau tính unread sẽ bắt đầu từ đây
                localStorage.setItem(`lastRead_${currentUser.userId}_${convId}`, Date.now().toString());                                                                                     
                navigate(`/chat/${convId}`);                                                                                                                         
              }}                                                                                                                                                       
            >                                                                                                                                                        
              {/* Avatar */}
              <div className="chat-list__avatar">                                                                                                                      
                {getAvatarSrc(otherAvatar) ? (
                  <img src={getAvatarSrc(otherAvatar)} alt="" />                                                                                                       
                ) : (                                                                                                                                                  
                  <div className="chat-list__avatar-placeholder">
                    {otherName?.[0]}                                                                                                                                   
                  </div>                                                                                                                                             
                )}
              </div>
                                                                                                                                                                       
              {/* Tên + tên bài — in đậm nếu có tin chưa đọc */}                                                                                                       
              <div className="chat-list__info">                                                                                                                        
                <div className={`chat-list__name ${unreadCount > 0 ? "chat-list__name--unread" : ""}`}>                                                                
                  {otherName}                                                                                                                                          
                </div>
                <div className={`chat-list__post ${unreadCount > 0 ? "chat-list__post--unread" : ""}`}>                                                                
                  {conv.postTitle}                                                                                                                                     
                </div>
              </div>                                                                                                                                                   
                                                                                                                                                                     
              {/* Bên phải: status + badge số */}                                                                                                                      
              <div className="chat-list__right">
                <div className={`chat-list__status chat-list__status--${conv.status}`}>                                                                                
                  {conv.status === "pending" && "Đang chờ"}                                                                                                            
                  {conv.status === "accepted" && "Đã chấp nhận"}
                  {conv.status === "rejected" && "Đã từ chối"}                                                                                                         
                </div>                                                                                                                                               
                {/* Badge số — hiện số tin chưa đọc, tối đa hiện "99+" */}                                                                                             
                {unreadCount > 0 && (                                                                                                                                  
                  <div className="chat-list__unread-badge">
                    {unreadCount > 99 ? "99+" : unreadCount}                                                                                                           
                  </div>                                                                                                                                             
                )}      
                <button                                                                                                                                                          
                  className="chat-list__delete-btn"
                  onClick={(e) => handleDelete(e, convId)}
                  title="Xóa cuộc trò chuyện"                                                                                                                                      
                >
                  ✕                                                                                                                                                                
                </button>                                                                                                                                               
              </div>                                                                                                                                                 
            </div>
          );
        })}
      </div>
    );                                                                                                                                                                 
  }