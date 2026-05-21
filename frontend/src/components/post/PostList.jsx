import PostCard from "./PostCard";

function PostList({ posts, loading }) {
  if (loading) return <div className="sp-loading">Đang tải...</div>;
  if (!posts?.length)
    return <div className="sp-empty">Không có bài đăng nào phù hợp.</div>;

  return (
    <div className="sp-post-list">
      {posts.map((post) => (
        <PostCard key={post.postId} post={post} />
      ))}
    </div>
  );
}

export default PostList;
