import axios from "axios";                                                                                                                                
                                                                                                                                                            
  const api = axios.create({
    baseURL: "http://localhost:8080/sportlink",
    headers: {                                                                                                                                              
      "Content-Type": "application/json",
    },                                                                                                                                                      
  });             

  // Tự động thêm token vào mỗi request
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");                                                                                                          
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;                                                                                                   
      }           
      return config;
    },
    (error) => Promise.reject(error)
  );                                                                                                                                                        
   
  // Xử lý token hết hạn                                                                                                                                    
  function showSessionExpiredPopup() {
    // Tránh hiện popup 2 lần
    if (document.getElementById("session-expired-overlay")) return;                                                                                         
   
    const overlay = document.createElement("div");                                                                                                          
    overlay.id = "session-expired-overlay";
    overlay.style.cssText = `                                                                                                                               
      position: fixed; inset: 0;
      background: rgba(0, 0, 0, 0.75);
      display: flex; align-items: center; justify-content: center;                                                                                          
      z-index: 99999;
      backdrop-filter: blur(4px);                                                                                                                           
    `;                                                                                                                                                      
   
    const box = document.createElement("div");                                                                                                              
    box.style.cssText = `
      background: #1e293b;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;                                                                                                                                  
      padding: 40px 32px;
      text-align: center;                                                                                                                                   
      color: white;                                                                                                                                         
      max-width: 380px;
      width: 90%;                                                                                                                                           
      box-shadow: 0 24px 64px rgba(0,0,0,0.5);
    `;                                                                                                                                                      
   
    box.innerHTML = `                                                                                                                                       
      <div style="font-size: 52px; margin-bottom: 16px;">⏰</div>
      <h3 style="font-size: 20px; font-weight: 700; margin: 0 0 10px;">                                                                                     
        Phiên đăng nhập hết hạn
      </h3>                                                                                                                                                 
      <p style="color: rgba(255,255,255,0.55); font-size: 14px; margin: 0 0 28px; line-height: 1.6;">                                                       
        Đăng nhập lại để tiếp tục sử dụng SportLink                                                                                                         
      </p>                                                                                                                                                  
      <button id="sl-relogin-btn" style="                                                                                                                   
        background: #3b82f6; color: white; border: none;                                                                                                    
        padding: 11px 32px; border-radius: 10px;
        font-size: 15px; font-weight: 600; cursor: pointer;                                                                                                 
        transition: background 0.2s;                                                                                                                        
      ">
        Đăng nhập lại                                                                                                                                       
      </button>   
      <p id="sl-countdown" style="                                                                                                                          
        margin: 14px 0 0;
        font-size: 12px;                                                                                                                                    
        color: rgba(255,255,255,0.35);
      ">                                                                                                                                                    
        Tự động chuyển sau 3 giây...
      </p>                                                                                                                                                  
    `;            

    overlay.appendChild(box);                                                                                                                               
    document.body.appendChild(overlay);
                                                                                                                                                            
    // Đếm ngược 3 giây rồi tự redirect                                                                                                                     
    let seconds = 3;
    const countdownEl = document.getElementById("sl-countdown");                                                                                            
    const timer = setInterval(() => {
      seconds -= 1;                                                                                                                                         
      if (countdownEl) countdownEl.textContent = `Tự động chuyển sau ${seconds} giây...`;
      if (seconds <= 0) {                                                                                                                                   
        clearInterval(timer);
        redirect();                                                                                                                                         
      }           
    }, 1000);

    // Ấn nút thì redirect ngay                                                                                                                             
    document.getElementById("sl-relogin-btn").onclick = () => {
      clearInterval(timer);                                                                                                                                 
      redirect(); 
    };                                                                                                                                                      
   
    function redirect() {                                                                                                                                   
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userLat");
      localStorage.removeItem("userLng");
      localStorage.removeItem("userLocation");                                                                                                              
      localStorage.removeItem("geoAsked");
      window.location.href = "/";                                                                                                                           
    }             
  }

  api.interceptors.response.use(
    (response) => response,
    (error) => {                                                                                                                                            
      if (error.response?.status === 401) {
        showSessionExpiredPopup();                                                                                                                          
      }           
      return Promise.reject(error);
    }
  );

  export default api;