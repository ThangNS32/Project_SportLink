import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/common/Header";
import PostCard from "../components/post/PostCard";
import ProfileCard from "../components/profile/ProfileCard";
import EditProfileModal from "../components/profile/EditProfileModal";
import EditPostModal from "../components/profile/EditPostModal";
import userApi from "../api/userApi";
import sportApi from "../api/sportApi";
import postApi from "../api/postApi";
import "../styles/home.css";
import "../styles/profile.css";

function ProfilePage() {
  const { userId } = useParams();
  const isMe = !userId || userId === "me";

  const [profile, setProfile] = useState(null);
  const [sports, setSports] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit profile state
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({ fullName: "", age: "" });
  const [editSports, setEditSports] = useState([]);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Edit post state
  const [showEditPost, setShowEditPost] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editPostData, setEditPostData] = useState({});
  const [editPostLoading, setEditPostLoading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const targetId = isMe ? null : userId;
        const [profileRes, sportsRes] = await Promise.all([
          isMe ? userApi.getMyInfo() : userApi.getUserById(targetId),
          isMe
            ? sportApi.getMyFavoriteSports()
            : sportApi.getUserSports(targetId),
        ]);
        const profileData = profileRes.data?.result;
        setProfile(profileData);
        setSports(sportsRes.data?.result || []);
        setEditSports(sportsRes.data?.result || []);
        setEditData({
          fullName: profileData?.fullName || "",
          age: profileData?.age || "",
        });

        const userLat = parseFloat(localStorage.getItem("userLat")) || null;
        const userLng = parseFloat(localStorage.getItem("userLng")) || null;
        const postsRes = isMe
          ? await postApi.getMyPosts()
          : await postApi.getUserPosts(userId, { userLat, userLng });
        setPosts(postsRes.data?.result || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [userId, isMe]);

  // ── Handlers profile ──
  const toggleSport = (sportType) => {
    setEditSports((prev) => {
      const exists = prev.find((s) => s.sportType === sportType);
      if (exists) return prev.filter((s) => s.sportType !== sportType);
      return [...prev, { sportType, skillLevel: "intermediate" }];
    });
  };

  const updateSkillLevel = (sportType, skillLevel) => {
    setEditSports((prev) =>
      prev.map((s) => (s.sportType === sportType ? { ...s, skillLevel } : s)),
    );
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveEdit = async () => {
    setEditLoading(true);
    setEditError("");
    try {
      const profileRes = await userApi.updateProfile({
        fullName: editData.fullName,
        age: editData.age ? parseInt(editData.age) : null,
      });
      setProfile(profileRes.data?.result);
      await sportApi.replaceAllSports(editSports);
      setSports(editSports);
      if (avatarFile) {
        const avatarRes = await userApi.uploadAvatar(avatarFile);
        setProfile((prev) => ({
          ...prev,
          avatarUrl: avatarRes.data?.result?.avatarUrl,
        }));
      }
      setShowEdit(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch {
      setEditError("Cập nhật thất bại, vui lòng thử lại!");
    } finally {
      setEditLoading(false);
    }
  };

  const handleOpenEditPost = (post) => {
    setEditingPost(post);
    setEditPostData({
      teamName: post.teamName || "",
      note: post.note || "",
      locationName: post.locationName || "",
      slotsTotal: post.slotsTotal || "",
      skillLevel: post.skillLevel || "",
    });
    setShowEditPost(true);
  };

  const handleSaveEditPost = async () => {
    setEditPostLoading(true);
    try {
      const res = await postApi.updatePost(editingPost.postId, {
        teamName: editPostData.teamName,
        note: editPostData.note,
        locationName: editPostData.locationName,
        slotsTotal: editPostData.slotsTotal
          ? parseInt(editPostData.slotsTotal)
          : null,
        skillLevel: editPostData.skillLevel || null,
      });
      const updated = res.data?.result;
      setPosts((prev) =>
        prev.map((p) => (p.postId === editingPost.postId ? updated : p)),
      );
      setShowEditPost(false);
      setEditingPost(null);
    } catch {
      alert("Cập nhật thất bại, vui lòng thử lại!");
    } finally {
      setEditPostLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Bạn có chắc muốn xoá bài đăng này?")) return;
    try {
      await postApi.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.postId !== postId));
    } catch {
      alert("Xoá thất bại, vui lòng thử lại!");
    }
  };

  if (loading)
    return (
      <div className="pf-page">
        <Header />
        <div className="pf-loading">Đang tải...</div>
      </div>
    );

  if (!profile)
    return (
      <div className="pf-page">
        <Header />
        <div className="pf-loading">Không tìm thấy người dùng.</div>
      </div>
    );

  return (
    <div className="pf-page">
      <Header />
      <div className="pf-body">
        <ProfileCard
          profile={profile}
          sports={sports}
          isMe={isMe}
          onEditClick={() => setShowEdit(true)}
        />

        <div className="pf-posts-section">
          <div className="pf-section-title">
            {isMe ? "Bài đăng của tôi" : `Bài đăng của ${profile.fullName}`}
            <span className="pf-posts-count">{posts.length}</span>
          </div>
          {posts.length === 0 ? (
            <div className="pf-empty">
              {isMe
                ? "Bạn chưa có bài đăng nào."
                : "Người dùng này chưa có bài đăng nào."}
            </div>
          ) : (
            <div className="pf-post-list">
              {posts.map((post) => (
                <PostCard
                  key={post.postId}
                  post={post}
                  isOwner={isMe}
                  onEdit={isMe ? handleOpenEditPost : undefined}
                  onDelete={isMe ? handleDeletePost : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showEdit && (
        <EditProfileModal
          profile={profile}
          editData={editData}
          setEditData={setEditData}
          editSports={editSports}
          toggleSport={toggleSport}
          updateSkillLevel={updateSkillLevel}
          avatarFile={avatarFile}
          avatarPreview={avatarPreview}
          onAvatarChange={handleAvatarChange}
          editLoading={editLoading}
          editError={editError}
          onSave={handleSaveEdit}
          onClose={() => {
            setShowEdit(false);
            setAvatarFile(null);
            setAvatarPreview(null);
          }}
        />
      )}

      {showEditPost && editingPost && (
        <EditPostModal
          editPostData={editPostData}
          setEditPostData={setEditPostData}
          editPostLoading={editPostLoading}
          onSave={handleSaveEditPost}
          onClose={() => setShowEditPost(false)}
        />
      )}
    </div>
  );
}

export default ProfilePage;
