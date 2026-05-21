import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUnreadNotifications,
  markNotificationRead,
} from "../../chat/notificationApi";

export function useNotifications(isLoggedIn) {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [banMessage, setBanMessage] = useState(null);  

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchNotifs = () => {
      getUnreadNotifications()
        .then((res) => {
          const list = res.data.result || [];
          const banNotif = list.find((n) => n.type === "banned");
            if (banNotif) {                                                                                                                                            
              setBanMessage(banNotif.content);                                                                                                                       
              markNotificationRead(banNotif.notifId).catch(() => {});
            }                                                                                                                                                          
   
            const regular = list.filter((n) => n.type !== "banned");                                                                                                   
            setNotifications(regular);                                                                                                                               
            setUnreadCount(regular.length);
        })
        .catch(() => {});
    };

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const handleClickNotif = async (notif) => {
    await markNotificationRead(notif.notifId).catch(() => {});
    setNotifications((prev) => prev.filter((n) => n.notifId !== notif.notifId));
    setUnreadCount((c) => Math.max(0, c - 1));
    setShowNotifs(false);
    if (notif.refId) navigate(`/chat/req_${notif.refId}`);
  };

  return { unreadCount, notifications, showNotifs, setShowNotifs, handleClickNotif, banMessage, setBanMessage };
}
