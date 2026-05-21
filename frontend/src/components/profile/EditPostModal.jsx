import "../../styles/profile.css";

function EditPostModal({
  editPostData,
  setEditPostData,
  editPostLoading,
  onSave,
  onClose,
}) {
  return (
    <div
      className="pf-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="pf-modal">
        <div className="pf-modal-title">Chỉnh sửa bài đăng</div>

        <div className="pf-modal-field">
          <label>Tên bài đăng</label>
          <input
            type="text"
            value={editPostData.teamName}
            onChange={(e) =>
              setEditPostData({ ...editPostData, teamName: e.target.value })
            }
            placeholder="Tên bài đăng"
          />
        </div>

        <div className="pf-modal-field">
          <label>Địa điểm</label>
          <input
            type="text"
            value={editPostData.locationName}
            onChange={(e) =>
              setEditPostData({ ...editPostData, locationName: e.target.value })
            }
            placeholder="Tên sân / địa điểm"
          />
        </div>

        <div className="pf-modal-field">
          <label>Số slots</label>
          <input
            type="number"
            value={editPostData.slotsTotal}
            onChange={(e) =>
              setEditPostData({ ...editPostData, slotsTotal: e.target.value })
            }
            min={1}
          />
        </div>

        <div className="pf-modal-field">
          <label>Trình độ</label>
          <select
            value={editPostData.skillLevel}
            onChange={(e) =>
              setEditPostData({ ...editPostData, skillLevel: e.target.value })
            }
            style={{
              background: "#0f172a",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              padding: "10px 14px",
              color: "#fff",
              fontSize: 14,
            }}
          >
            <option value="">-- Chọn trình độ --</option>
            <option value="beginner">Mới bắt đầu</option>
            <option value="intermediate">Trung bình</option>
            <option value="advanced">Nâng cao</option>
          </select>
        </div>

        <div className="pf-modal-field">
          <label>Ghi chú</label>
          <textarea
            value={editPostData.note}
            onChange={(e) =>
              setEditPostData({ ...editPostData, note: e.target.value })
            }
            placeholder="Ghi chú thêm..."
            rows={3}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              padding: "10px 14px",
              color: "#fff",
              fontSize: 14,
              resize: "vertical",
              outline: "none",
            }}
          />
        </div>

        <div className="pf-modal-actions">
          <button className="pf-btn-cancel" onClick={onClose}>
            Huỷ
          </button>
          <button
            className="pf-btn-save"
            onClick={onSave}
            disabled={editPostLoading}
          >
            {editPostLoading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditPostModal;
