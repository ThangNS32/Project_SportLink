import postApi from "../api/postApi";
import "../styles/home.css";
import "../styles/sport-page.css";
import Header from "../components/common/Header";
import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import FilterSidebar from "../components/post/FilterSidebar";
import { SPORT_CONFIG } from "../components/constants/filterConfig";
import PostList from "../components/post/PostList";
import CreatePostModal from "../components/post/CreatePostModal";

function SportPage() {
  const { sport } = useParams();
  const { pathname } = useLocation();
  const config = SPORT_CONFIG[sport] || SPORT_CONFIG["default"];

  // Sport được chọn trong sidebar (không navigate, chỉ filter)
  const [selectedSportSlug, setSelectedSportSlug] = useState(sport || "");

  // hasPlayFormat dựa theo sport đang chọn trong sidebar
  const selectedSportConfig = SPORT_CONFIG[selectedSportSlug];
  const hasPlayFormat = selectedSportConfig?.hasPlayFormat ?? false;
  const isBanned = () => { const b = localStorage.getItem("banUntil"); return b && new Date(b) > new Date(); };

  // Filter states
  const [postType, setPostType] = useState(() => {
    if (pathname === "/tim-doi-thu") return "find_rival";
    if (pathname === "/tim-dong-doi") return "find_team";
    return "";
  });
  const [playDate, setPlayDate] = useState("");
  const [timeFrom, setTimeFrom] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [playFormat, setPlayFormat] = useState("");
  const [distanceRange, setDistanceRange] = useState("");
  const [slotsRange, setSlotsRange] = useState("");
  const [selectedVenues, setSelectedVenues] = useState([]);

  // Result states
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const userLat = parseFloat(localStorage.getItem("userLat")) || null;
  const userLng = parseFloat(localStorage.getItem("userLng")) || null;

  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      setPosts([]);
      try {
        let res;
        if (pathname === "/tim-doi-thu") {
          res = await postApi.getRivalPosts({ userLat, userLng });
        } else if (pathname === "/tim-dong-doi") {
          res = await postApi.getTeamPosts({ userLat, userLng });
        } else {
          res = await postApi.getHomeFeed(userLat, userLng);
        }
        const data = res.data?.result;
        if (Array.isArray(data)) {
          setPosts(data);
          setTotal(data.length);
        }
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, [pathname]);

  // Khi nhấn "Tìm kiếm": dùng /search
  const handleSearch = async () => {
    setLoading(true);
    const searchLat =
      selectedVenues.length > 0 ? selectedVenues[0].lat : userLat;
    const searchLng =
      selectedVenues.length > 0 ? selectedVenues[0].lng : userLng;
    try {
      const params = {
        ...(selectedSportConfig?.sportType && {
          sportType: selectedSportConfig.sportType,
        }),
        ...(postType && { postType }),
        ...(skillLevel && { skillLevel }),
        ...(playDate && { playDate }),
        ...(timeFrom && { timeFrom }),
        ...(playFormat && hasPlayFormat && { playFormat }),
        ...(slotsRange && { slotsRange }),
        ...(distanceRange && { distanceRange }),
        ...(searchLat && { userLat: searchLat }),
        ...(searchLng && { userLng: searchLng }),
      };
      const res = await postApi.searchPosts(params);
      const data = res.data?.result;
      if (Array.isArray(data)) {
        setPosts(data);
        setTotal(data.length);
      }
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Reset: quay về /home
  const resetFilters = () => {
    setSelectedSportSlug(sport || "");
    setPostType(
      pathname === "/tim-doi-thu" ? "find_rival": 
      pathname === "/tim-dong-doi"? "find_team" : "",
    );
    setPlayDate("");
    setTimeFrom("");
    setSkillLevel("");
    setPlayFormat("");
    setSlotsRange("");
    setDistanceRange("");
    setSelectedVenues([]);

    const fetchInitial = async () => {
      setLoading(true);
      try {
        let res;
        if (pathname === "/tim-doi-thu") {
          res = await postApi.getRivalPosts({ userLat, userLng });
        } else if (pathname === "/tim-dong-doi") {
          res = await postApi.getTeamPosts({ userLat, userLng });
        } else {
          res = await postApi.getHomeFeed(userLat, userLng);
        }
        const data = res.data?.result;
        if (Array.isArray(data)) {
          setPosts(data);
          setTotal(data.length);
        }
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  };

  const displayPosts = posts;

  return (
    <div className="sp-page">
      {/*  HEADER  */}
      <Header />

      {/*  BODY  */}
      <div className="sp-body">
        {/* ---- Sidebar bộ lọc ---- */}
        <FilterSidebar
          sport={sport}
          selectedSportSlug={selectedSportSlug}
          setSelectedSportSlug={setSelectedSportSlug}
          playDate={playDate}
          setPlayDate={setPlayDate}
          timeFrom={timeFrom}
          setTimeFrom={setTimeFrom}
          skillLevel={skillLevel}
          setSkillLevel={setSkillLevel}
          slotsRange={slotsRange}
          setSlotsRange={setSlotsRange}
          playFormat={playFormat}
          setPlayFormat={setPlayFormat}
          distanceRange={distanceRange}
          setDistanceRange={setDistanceRange}
          hasPlayFormat={hasPlayFormat}
          onSearch={handleSearch}
          onReset={resetFilters}
          selectedVenues={selectedVenues}
          setSelectedVenues={setSelectedVenues}
        />

        {/*  Main content  */}
        <main className="sp-main">
          {/* Banner */}
          <div className="sp-banner">
            <div>
              <div className="sp-banner-title">{config.title}</div>
              <div className="sp-banner-desc">{config.desc}</div>
            </div>
            <button
              className="sp-create-btn"
              onClick={() => { if (isBanned()) { alert("Tài khoản bị tạm khóa, bạn không thể đăng bài."); return; } setShowCreate(true); }}
            >
              + Tạo bài đăng
            </button>
          </div>

          {/* Số kết quả */}
          <div className="sp-meta"> 
            <span className="sp-count">
              <span className="sp-count-dot" />
              {displayPosts.length} / {total} kết quả
            </span>
          </div>

          {/* Danh sách bài đăng */}
          <PostList posts={displayPosts} loading={loading} />
        </main>
      </div>
      {showCreate && (
        <CreatePostModal
          onClose={() => setShowCreate(false)}
          onCreated={(newPost) => {
            setPosts((prev) => [newPost, ...prev]);
            setTotal((t) => t + 1);
          }}
        />
      )}
    </div>
  );
}

export default SportPage;
