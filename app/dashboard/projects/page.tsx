"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Github, ExternalLink, Star, Upload, X } from "lucide-react";
import Link from "next/link";
import { uploadProjectImage, deleteProjectImage } from "@/lib/uploadImage";

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  technologies: string[];
  github_url?: string;
  live_url?: string;
  image_path?: string;
  icon_name?: string;
  is_featured: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProjects(projects.filter(p => p.id !== id));
      } else {
        alert('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project');
    }
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-gray-900 to-black">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-white transition"
            >
              ← Back
            </Link>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-cyan">
              Manage Projects
            </h1>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent-cyan text-white rounded-lg hover:opacity-90 transition"
          >
            <Plus className="w-5 h-5" />
            Add Project
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="text-gray-400 mt-4">Loading projects...</p>
          </div>
        )}

        {!loading && projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">No projects yet</p>
            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-gradient-to-r from-primary to-accent-cyan text-white rounded-lg hover:opacity-90 transition"
            >
              Create Your First Project
            </button>
          </div>
        )}

        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
              >
                {/* Featured Badge */}
                {project.is_featured && (
                  <div className="flex items-center gap-1 text-yellow-400 text-sm mb-3">
                    <Star className="w-4 h-4 fill-current" />
                    <span>Featured</span>
                  </div>
                )}

                {/* Project Info */}
                <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{project.description}</p>

                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300">
                    {project.category}
                  </span>
                </div>

                {/* Technologies */}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-primary/20 text-primary text-xs rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* Links */}
                <div className="flex items-center gap-3 mb-4">
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                  <button
                    onClick={() => openEditModal(project)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 text-sm transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <ProjectModal
          project={editingProject}
          onClose={() => {
            setShowModal(false);
            setEditingProject(null);
          }}
          onSave={() => {
            setShowModal(false);
            setEditingProject(null);
            fetchProjects();
          }}
        />
      )}
    </div>
  );
}

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
  onSave: () => void;
}

function ProjectModal({ project, onClose, onSave }: ProjectModalProps) {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    category: project?.category || 'Mobile',
    technologies: project?.technologies?.join(', ') || '',
    github_url: project?.github_url || '',
    live_url: project?.live_url || '',
    image_path: project?.image_path || '',
    icon_name: project?.icon_name || '',
    is_featured: project?.is_featured || false,
    order_index: project?.order_index || 0,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(project?.image_path || null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);

      // Upload to Supabase Storage
      const imageUrl = await uploadProjectImage(file);

      // Update form data and preview
      setFormData({ ...formData, image_path: imageUrl });
      setImagePreview(imageUrl);

      // If there was a previous image (and it's a Supabase URL), optionally delete it
      if (project?.image_path && project.image_path.includes('supabase.co')) {
        await deleteProjectImage(project.image_path);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image_path: '' });
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        technologies: formData.technologies
          .split(',')
          .map(t => t.trim())
          .filter(t => t.length > 0),
      };

      const url = project ? `/api/projects/${project.id}` : '/api/projects';
      const method = project ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSave();
      } else {
        const data = await response.json();
        alert(`Error: ${data.error || 'Failed to save project'}`);
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">
          {project ? 'Edit Project' : 'Add New Project'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none"
              >
                <option value="Mobile">Mobile</option>
                <option value="Web">Web</option>
                <option value="Package">Package</option>
                <option value="Desktop">Desktop</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Order Index
              </label>
              <input
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Technologies (comma-separated)
            </label>
            <input
              type="text"
              placeholder="Flutter, Dart, Firebase"
              value={formData.technologies}
              onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              GitHub URL
            </label>
            <input
              type="url"
              placeholder="https://github.com/username/repo"
              value={formData.github_url}
              onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Live URL
            </label>
            <input
              type="url"
              placeholder="https://example.com"
              value={formData.live_url}
              onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none"
            />
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Image
            </label>

            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-white/10"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="mt-2 text-xs text-gray-400 break-all">
                  {formData.image_path}
                </div>
              </div>
            ) : (
              <div>
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-primary transition bg-white/5">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG or WEBP (MAX. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
                {uploading && (
                  <div className="mt-2 text-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                    <p className="text-sm text-gray-400 mt-2">Uploading...</p>
                  </div>
                )}
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Upload an image or use an icon name below (lock, flutter, code, etc.)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Icon Name (alternative to image)
            </label>
            <input
              type="text"
              placeholder="lock, flutter, code, security"
              value={formData.icon_name}
              onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-primary focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              Only used if no image is uploaded
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
              />
              Featured Project
            </label>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-accent-cyan text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
