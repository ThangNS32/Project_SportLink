export const SPORT_CONFIG = {                                                                                                                             
    "bong-da": {                              
      label: "Bóng đá",                                                                                                                                     
      sportType: "bong_da",                   
      title: "Bóng đá hôm nay",                                                                                                                             
      desc: "Tìm bạn chơi, đội bóng, kèo đấu gần bạn",
      hasPlayFormat: false,                                                                                                                                 
    },                                        
    "cau-long": {                                                                                                                                           
      label: "Cầu lông",                                                                                                                                    
      sportType: "cau_long",                                                                                                                                
      title: "Cầu lông hôm nay",                                                                                                                            
      desc: "Tìm bạn chơi, đối thủ, nhóm cầu lông gần bạn",                                                                                                 
      hasPlayFormat: true,                    
    },                                    
    pickleball: {
      label: "Pickleball",                                                                                                                                  
      sportType: "pickleball",
      title: "Pickleball hôm nay",                                                                                                                          
      desc: "Tìm bạn chơi, đối thủ, nhóm pickleball gần bạn",
      hasPlayFormat: true,
    },                                                                                                                                                      
    default: {
      label: "Tất cả",                                                                                                                                      
      sportType: null,
      title: "Tìm kèo hôm nay",
      desc: "Kết nối và tìm đối tác chơi thể thao gần bạn",
      hasPlayFormat: false,                   
    },                                    
  };
                                                                                                                                                            
  export const SKILL_LEVELS = [
    { value: "", label: "Tất cả" },                                                                                                                         
    { value: "beginner", label: "Mới bắt đầu" },
    { value: "intermediate", label: "Trung bình" },
    { value: "advanced", label: "Nâng cao" },
  ];                                          
                                                                                                                                                            
  export const PLAY_FORMATS = [
    { value: "", label: "Tất cả" },                                                                                                                         
    { value: "don_nam", label: "Đơn nam" },
    { value: "don_nu", label: "Đơn nữ" },                                                                                                                   
    { value: "doi_nam", label: "Đôi nam" },   
    { value: "doi_nu", label: "Đôi nữ" }, 
    { value: "doi_nam_nu", label: "Đôi nam nữ" },
  ];                                                                                                                                                        
                         