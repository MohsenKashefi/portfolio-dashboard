"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Award, ChevronUp, ChevronDown, X, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/app/context/ThemeContext";

interface Skill {
  id: number;
  name: string;
  percentage: number;
  category?: string;
  icon?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export default function SkillsPage() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/skills');
      if (response.ok) {
        const data = await response.json();
        setSkills(data.skills || []);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    try {
      const response = await fetch(`/api/skills/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSkills(skills.filter(s => s.id !== id));
      } else {
        alert('Failed to delete skill');
      }
    } catch (error) {
      console.error('Error deleting skill:', error);
      alert('Error deleting skill');
    }
  };

  const handleMoveUp = async (skill: Skill, index: number) => {
    if (index === 0) return;

    const newSkills = [...skills];
    [newSkills[index], newSkills[index - 1]] = [newSkills[index - 1], newSkills[index]];

    // Update order_index for both skills
    try {
      await Promise.all([
        fetch(`/api/skills/${newSkills[index].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newSkills[index], order_index: index }),
        }),
        fetch(`/api/skills/${newSkills[index - 1].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newSkills[index - 1], order_index: index - 1 }),
        }),
      ]);

      setSkills(newSkills);
    } catch (error) {
      console.error('Error reordering skills:', error);
    }
  };

  const handleMoveDown = async (skill: Skill, index: number) => {
    if (index === skills.length - 1) return;

    const newSkills = [...skills];
    [newSkills[index], newSkills[index + 1]] = [newSkills[index + 1], newSkills[index]];

    // Update order_index for both skills
    try {
      await Promise.all([
        fetch(`/api/skills/${newSkills[index].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newSkills[index], order_index: index }),
        }),
        fetch(`/api/skills/${newSkills[index + 1].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newSkills[index + 1], order_index: index + 1 }),
        }),
      ]);

      setSkills(newSkills);
    } catch (error) {
      console.error('Error reordering skills:', error);
    }
  };

  const openEditModal = (skill: Skill) => {
    setEditingSkill(skill);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingSkill(null);
    setShowModal(true);
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDarkMode
        ? 'bg-gradient-to-br from-primary-dark via-gray-900 to-black'
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'
    }`}>
      {/* Header */}
      <header className={`backdrop-blur-sm border-b sticky top-0 z-50 transition-colors duration-500 ${
        isDarkMode
          ? 'bg-white/5 border-white/10'
          : 'bg-white/70 border-white/20'
      }`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className={`transition ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              ← Back
            </Link>
            <h1 className={`text-2xl font-black transition-colors ${
              isDarkMode
                ? 'text-white'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
            }`}>
              Manage Skills
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-lg transition-all ${
                isDarkMode
                  ? 'bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white'
                  : 'bg-gray-800/10 hover:bg-gray-800/20 text-gray-700'
              }`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent-cyan text-white rounded-lg hover:opacity-90 transition"
            >
              <Plus className="w-5 h-5" />
              Add Skill
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {loading && (
          <div className="text-center py-12">
            <div className={`inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${isDarkMode ? 'border-primary' : 'border-blue-600'}`}></div>
            <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading skills...</p>
          </div>
        )}

        {!loading && skills.length === 0 && (
          <div className="text-center py-12">
            <p className={`text-lg mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No skills yet</p>
            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-gradient-to-r from-primary to-accent-cyan text-white rounded-lg hover:opacity-90 transition"
            >
              Add Your First Skill
            </button>
          </div>
        )}

        {!loading && skills.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill, index) => (
              <div
                key={skill.id}
                className={`backdrop-blur-sm border rounded-2xl p-6 hover:border-white/20 transition-all ${
                  isDarkMode
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white/60 border-white/40 hover:bg-white/70'
                }`}
              >
                {/* Skill Info */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {skill.icon && (
                      <div className="p-2 bg-gradient-to-r from-primary to-accent-cyan rounded-lg">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{skill.name}</h3>
                      {skill.category && (
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{skill.category}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Proficiency</span>
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{skill.percentage}%</span>
                  </div>
                  <div className={`w-full h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent-cyan rounded-full transition-all duration-500"
                      style={{ width: `${skill.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className={`flex items-center gap-2 pt-4 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                  <button
                    onClick={() => handleMoveUp(skill, index)}
                    disabled={index === 0}
                    className={`p-2 rounded-lg transition ${
                      isDarkMode
                        ? 'bg-white/10 hover:bg-white/20 text-white disabled:opacity-30'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900 disabled:opacity-30'
                    }`}
                    title="Move up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(skill, index)}
                    disabled={index === skills.length - 1}
                    className={`p-2 rounded-lg transition ${
                      isDarkMode
                        ? 'bg-white/10 hover:bg-white/20 text-white disabled:opacity-30'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900 disabled:opacity-30'
                    }`}
                    title="Move down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(skill)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                      isDarkMode
                        ? 'bg-white/10 hover:bg-white/20 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(skill.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                      isDarkMode
                        ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                        : 'bg-red-50 hover:bg-red-100 text-red-600'
                    }`}
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
        <SkillModal
          skill={editingSkill}
          onClose={() => {
            setShowModal(false);
            setEditingSkill(null);
          }}
          onSave={() => {
            setShowModal(false);
            setEditingSkill(null);
            fetchSkills();
          }}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}

interface SkillModalProps {
  skill: Skill | null;
  onClose: () => void;
  onSave: () => void;
  isDarkMode: boolean;
}

function SkillModal({ skill, onClose, onSave, isDarkMode }: SkillModalProps) {
  const [formData, setFormData] = useState({
    name: skill?.name || '',
    percentage: skill?.percentage || 50,
    category: skill?.category || '',
    icon: skill?.icon || '',
    order_index: skill?.order_index || 0,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = { ...formData };

      const url = skill ? `/api/skills/${skill.id}` : '/api/skills';
      const method = skill ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSave();
      } else {
        const data = await response.json();
        alert(`Error: ${data.error || 'Failed to save skill'}`);
      }
    } catch (error) {
      console.error('Error saving skill:', error);
      alert('Error saving skill');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`border rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto ${
        isDarkMode
          ? 'bg-gray-900 border-white/10'
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {skill ? 'Edit Skill' : 'Add New Skill'}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition ${
              isDarkMode
                ? 'hover:bg-white/10 text-gray-400'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Skill Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:border-primary focus:outline-none ${
                isDarkMode
                  ? 'bg-white/5 border-white/10 text-white'
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              }`}
              placeholder="e.g., Flutter, React, Python"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Proficiency Level: {formData.percentage}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.percentage}
              onChange={(e) => setFormData({ ...formData, percentage: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className={`w-full h-3 rounded-full overflow-hidden mt-2 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
              <div
                className="h-full bg-gradient-to-r from-primary to-accent-cyan rounded-full transition-all duration-300"
                style={{ width: `${formData.percentage}%` }}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:border-primary focus:outline-none ${
                isDarkMode
                  ? 'bg-white/5 border-white/10 text-white'
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              }`}
              placeholder="e.g., Frontend, Backend, Language"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Icon Name (optional)
            </label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:border-primary focus:outline-none ${
                isDarkMode
                  ? 'bg-white/5 border-white/10 text-white'
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              }`}
              placeholder="e.g., flutter, react, python"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-lg transition ${
                isDarkMode
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-accent-cyan text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Skill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
