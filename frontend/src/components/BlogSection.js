import React, { useState, useEffect } from 'react';

const BlogSection = () => {
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/blogs');
      const data = await response.json();
      setBlogs(data.filter(blog => blog.status === 'published'));
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (blogs.length === 0) return null;

  return (
    <div className="blog-section">
      <div className="section-header">
        <h2>Latest from Our Blog</h2>
        <p>Tips, trends, and insights from our experts</p>
      </div>
      <div className="blog-grid">
        {blogs.slice(0, 3).map(blog => (
          <div key={blog._id} className="blog-card" onClick={() => setSelectedBlog(blog)}>
            {blog.featuredImage && <img src={blog.featuredImage} alt={blog.title} />}
            <div className="blog-content">
              <h3>{blog.title}</h3>
              <p className="blog-excerpt">{blog.excerpt || blog.content.substring(0, 120)}...</p>
              <div className="blog-meta">
                <span>📅 {new Date(blog.publishedAt).toLocaleDateString()}</span>
                <span>👁️ {blog.views} views</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedBlog && (
        <div className="modal-overlay" onClick={() => setSelectedBlog(null)}>
          <div className="modal blog-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedBlog(null)}>✕</button>
            <h2>{selectedBlog.title}</h2>
            <div className="blog-meta">
              <span>By {selectedBlog.author?.name || 'Admin'}</span>
              <span>{new Date(selectedBlog.publishedAt).toLocaleDateString()}</span>
            </div>
            <div className="blog-content-full">
              {selectedBlog.content.split('\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogSection;