import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Resume, ResumeTemplate, JobRole, Skill, RoleSkill, AdminActivityLog } from '../types';
import {
  ShieldCheck,
  Users,
  Files,
  Layers,
  Briefcase,
  Cpu,
  Activity,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  Loader2,
  X,
  Sliders,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  BarChart3
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const { user, token, adminTab, setAdminTab, setActiveView } = useAuth();

  // State
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [resumesList, setResumesList] = useState<Resume[]>([]);
  const [templatesList, setTemplatesList] = useState<ResumeTemplate[]>([]);
  const [jobRolesList, setJobRolesList] = useState<JobRole[]>([]);
  const [skillsList, setSkillsList] = useState<Skill[]>([]);
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Job Role Modal state
  const [jobRoleModalOpen, setJobRoleModalOpen] = useState(false);
  const [editingJobRole, setEditingJobRole] = useState<JobRole | null>(null);
  const [jobRoleForm, setJobRoleForm] = useState({
    title: '',
    category: 'Software Engineering',
    description: '',
    education_requirements: 'B.Tech / B.E. / B.Sc in Computer Science or IT',
    experience_level: 'Mid-Level' as 'Fresher' | 'Junior' | 'Mid-Level' | 'Senior' | 'Lead',
    minimum_experience: 1,
    maximum_experience: 4,
    recommended_certifications: '',
    recommended_projects: '',
    additional_requirements: '',
    status: 'active' as 'active' | 'inactive'
  });

  // Role Skills Management Modal
  const [roleSkillsModalOpen, setRoleSkillsModalOpen] = useState(false);
  const [activeRoleForSkills, setActiveRoleForSkills] = useState<JobRole | null>(null);
  const [currentRoleSkills, setCurrentRoleSkills] = useState<RoleSkill[]>([]);
  const [newSkillForm, setNewSkillForm] = useState({
    skill_name: '',
    category: 'Programming Languages',
    requirement_type: 'mandatory' as 'mandatory' | 'preferred' | 'optional',
    required_proficiency: 'Intermediate' as 'Beginner' | 'Intermediate' | 'Advanced',
    importance_weight: 8
  });

  // Skill Add Modal
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [skillForm, setSkillForm] = useState({
    name: '',
    category: 'Programming Languages',
    description: ''
  });

  // Template Modal
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    id: '',
    name: '',
    category: 'Corporate',
    description: '',
    preview_image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&q=80',
    is_active: true
  });

  // API caller with auth headers
  const apiCall = async (url: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };
    return fetch(url, { ...options, headers, credentials: 'include' });
  };

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Fetch Dashboard Stats
  const fetchDashboardStats = async () => {
    try {
      const res = await apiCall('/api/admin/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await apiCall(`/api/admin/users?search=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Resumes
  const fetchResumes = async () => {
    setIsLoading(true);
    try {
      const res = await apiCall(`/api/admin/resumes?search=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setResumesList(data.resumes || []);
      }
    } catch (err) {
      console.error('Failed to load resumes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Templates
  const fetchTemplates = async () => {
    try {
      const res = await apiCall('/api/admin/templates');
      if (res.ok) {
        const data = await res.json();
        setTemplatesList(data.templates || []);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  // Fetch Job Roles
  const fetchJobRoles = async () => {
    setIsLoading(true);
    try {
      const res = await apiCall(`/api/admin/job-roles?search=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setJobRolesList(data.roles || []);
      }
    } catch (err) {
      console.error('Failed to load job roles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Skills
  const fetchSkills = async () => {
    try {
      const res = await apiCall(`/api/admin/skills?search=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSkillsList(data.skills || []);
      }
    } catch (err) {
      console.error('Failed to load skills:', err);
    }
  };

  // Fetch Activity Logs
  const fetchActivityLogs = async () => {
    try {
      const res = await apiCall('/api/admin/activity-logs');
      if (res.ok) {
        const data = await res.json();
        setActivityLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    }
  };

  useEffect(() => {
    if (adminTab === 'dashboard') fetchDashboardStats();
    else if (adminTab === 'users') fetchUsers();
    else if (adminTab === 'resumes') fetchResumes();
    else if (adminTab === 'templates') fetchTemplates();
    else if (adminTab === 'job-roles') fetchJobRoles();
    else if (adminTab === 'skills') fetchSkills();
    else if (adminTab === 'activity') fetchActivityLogs();
  }, [adminTab, searchQuery]);

  // Handle Save / Edit Job Role
  const handleSaveJobRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: jobRoleForm.title,
        category: jobRoleForm.category,
        description: jobRoleForm.description,
        education_requirements: jobRoleForm.education_requirements,
        experience_level: jobRoleForm.experience_level,
        minimum_experience: Number(jobRoleForm.minimum_experience),
        maximum_experience: jobRoleForm.maximum_experience ? Number(jobRoleForm.maximum_experience) : null,
        recommended_certifications: jobRoleForm.recommended_certifications ? jobRoleForm.recommended_certifications.split('\n').filter(Boolean) : [],
        recommended_projects: jobRoleForm.recommended_projects ? jobRoleForm.recommended_projects.split('\n').filter(Boolean) : [],
        additional_requirements: jobRoleForm.additional_requirements,
        status: jobRoleForm.status
      };

      let res;
      if (editingJobRole) {
        res = await apiCall(`/api/admin/job-roles/${editingJobRole.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        res = await apiCall('/api/admin/job-roles', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        showNotification(editingJobRole ? 'Job role updated in MySQL.' : 'New job role created in MySQL.');
        setJobRoleModalOpen(false);
        setEditingJobRole(null);
        fetchJobRoles();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save job role.');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred.');
    }
  };

  // Open Manage Skills for Job Role
  const openRoleSkillsModal = async (role: JobRole) => {
    setActiveRoleForSkills(role);
    try {
      const res = await apiCall(`/api/admin/job-roles/${role.id}/skills`);
      if (res.ok) {
        const data = await res.json();
        setCurrentRoleSkills(data.skills || []);
        setRoleSkillsModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to get role skills:', err);
    }
  };

  // Add Skill to Role
  const handleAddSkillToRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoleForSkills || !newSkillForm.skill_name.trim()) return;

    try {
      const res = await apiCall(`/api/admin/job-roles/${activeRoleForSkills.id}/skills`, {
        method: 'POST',
        body: JSON.stringify(newSkillForm)
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentRoleSkills([...currentRoleSkills, data.roleSkill]);
        setNewSkillForm({ ...newSkillForm, skill_name: '' });
        showNotification(`Assigned ${newSkillForm.skill_name} to role requirements.`);
        fetchJobRoles();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to assign skill.');
      }
    } catch (err: any) {
      alert(err.message || 'Error adding skill.');
    }
  };

  // Remove Skill from Role
  const handleRemoveSkillFromRole = async (skillId: number) => {
    if (!activeRoleForSkills) return;
    try {
      const res = await apiCall(`/api/admin/job-roles/${activeRoleForSkills.id}/skills/${skillId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setCurrentRoleSkills(currentRoleSkills.filter(s => s.skill_id !== skillId));
        showNotification('Skill removed from job role requirements.');
        fetchJobRoles();
      }
    } catch (err) {
      console.error('Failed to delete skill assignment:', err);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-slate-100">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-950 text-slate-300 border-r border-slate-800 shrink-0 hidden md:flex flex-col justify-between p-4">
        <div className="space-y-6">
          <div className="p-3 bg-purple-950/40 border border-purple-800/60 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
              <ShieldCheck className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Administrator</div>
              <div className="text-[10px] text-purple-300 font-mono">Role: SUPER_ADMIN</div>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-semibold">
            <button
              onClick={() => setAdminTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                adminTab === 'dashboard' ? 'bg-purple-600 text-white shadow-sm' : 'hover:bg-slate-900 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </button>

            <button
              onClick={() => setAdminTab('job-roles')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                adminTab === 'job-roles' ? 'bg-purple-600 text-white shadow-sm' : 'hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <span>Job Role Management</span>
            </button>

            <button
              onClick={() => setAdminTab('skills')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                adminTab === 'skills' ? 'bg-purple-600 text-white shadow-sm' : 'hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>Skills Management</span>
            </button>

            <button
              onClick={() => setAdminTab('users')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                adminTab === 'users' ? 'bg-purple-600 text-white shadow-sm' : 'hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Users Management</span>
            </button>

            <button
              onClick={() => setAdminTab('resumes')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                adminTab === 'resumes' ? 'bg-purple-600 text-white shadow-sm' : 'hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Files className="w-4 h-4" />
              <span>Resume Management</span>
            </button>

            <button
              onClick={() => setAdminTab('templates')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                adminTab === 'templates' ? 'bg-purple-600 text-white shadow-sm' : 'hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Template Management</span>
            </button>

            <button
              onClick={() => setAdminTab('activity')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                adminTab === 'activity' ? 'bg-purple-600 text-white shadow-sm' : 'hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Audit Activity Logs</span>
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveView('landing')}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
          >
            <span>Exit to Website</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {actionMessage && (
          <div className="mb-4 p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* ADMIN DASHBOARD */}
        {adminTab === 'dashboard' && stats && (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">System & Platform Analytics</h1>
              <p className="text-xs text-slate-500">Real-time statistics stored directly in MySQL relational tables</p>
            </div>

            {/* KPI Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Users</div>
                <div className="text-3xl font-black text-slate-900 mt-1">{stats.totalUsers}</div>
                <div className="text-xs text-emerald-600 font-semibold mt-1">{stats.activeUsers} active accounts</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resumes Stored</div>
                <div className="text-3xl font-black text-slate-900 mt-1">{stats.totalResumes}</div>
                <div className="text-xs text-purple-600 font-semibold mt-1">Multi-section profiles</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Job Roles in DB</div>
                <div className="text-3xl font-black text-slate-900 mt-1">{stats.totalJobRoles}</div>
                <div className="text-xs text-blue-600 font-semibold mt-1">{stats.activeJobRoles} active in recommendations</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Skills Cataloged</div>
                <div className="text-3xl font-black text-slate-900 mt-1">{stats.totalSkills}</div>
                <div className="text-xs text-amber-600 font-semibold mt-1">Across 8 tech categories</div>
              </div>
            </div>

            {/* Template Popularity & Category Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-base text-slate-900">Template Utilization Breakdown</h3>
                <div className="space-y-3">
                  {stats.popularTemplates?.map((t: any) => (
                    <div key={t.template_id} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{t.template_name}</span>
                        <span className="font-mono text-purple-700">{t.usage_count} uses</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-600 h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.max(10, t.usage_count * 25))}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-base text-slate-900">Job Role Categories Distribution</h3>
                <div className="space-y-2.5">
                  {Object.entries(stats.jobRoleCategories || {}).map(([cat, count]: any) => (
                    <div key={cat} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl text-xs">
                      <span className="font-semibold text-slate-800">{cat}</span>
                      <span className="font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">{count} roles</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Audit Log */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-base text-slate-900">Recent Platform Audit Events</h3>
              <div className="divide-y divide-slate-100 text-xs">
                {stats.recentActivity?.slice(0, 5).map((log: any) => (
                  <div key={log.id} className="py-2.5 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 mr-2">[{log.action}]</span>
                      <span className="text-slate-600">{log.details}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* JOB ROLE MANAGEMENT (CRITICAL FEATURE) */}
        {adminTab === 'job-roles' && (
          <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Job Role & Requirements Management</h1>
                <p className="text-xs text-slate-500">
                  Add, update, and manage job role specifications and required skills stored dynamically in MySQL.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingJobRole(null);
                    setJobRoleForm({
                      title: '',
                      category: 'Software Engineering',
                      description: '',
                      education_requirements: 'Bachelor in Computer Science or related degree',
                      experience_level: 'Junior',
                      minimum_experience: 1,
                      maximum_experience: 3,
                      recommended_certifications: '',
                      recommended_projects: '',
                      additional_requirements: '',
                      status: 'active'
                    });
                    setJobRoleModalOpen(true);
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Job Role</span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search job roles by title or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-4">ID</th>
                      <th className="p-4">Job Title</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Experience</th>
                      <th className="p-4">Required Skills</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {jobRolesList.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-400">#{r.id}</td>
                        <td className="p-4 font-bold text-slate-900">{r.title}</td>
                        <td className="p-4">{r.category}</td>
                        <td className="p-4">{r.minimum_experience}+ yrs ({r.experience_level})</td>
                        <td className="p-4">
                          <button
                            onClick={() => openRoleSkillsModal(r)}
                            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-md font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Sliders className="w-3 h-3" />
                            <span>{r.required_skills_count || 0} skills</span>
                          </button>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={async () => {
                              const newStatus = r.status === 'active' ? 'inactive' : 'active';
                              await apiCall(`/api/admin/job-roles/${r.id}/status`, {
                                method: 'PUT',
                                body: JSON.stringify({ status: newStatus })
                              });
                              showNotification(`Role status updated to ${newStatus}.`);
                              fetchJobRoles();
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                              r.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {r.status}
                          </button>
                        </td>
                        <td className="p-4 text-right space-x-1">
                          <button
                            onClick={() => {
                              setEditingJobRole(r);
                              setJobRoleForm({
                                title: r.title,
                                category: r.category,
                                description: r.description,
                                education_requirements: r.education_requirements,
                                experience_level: r.experience_level,
                                minimum_experience: r.minimum_experience,
                                maximum_experience: r.maximum_experience || 0,
                                recommended_certifications: (r.recommended_certifications || []).join('\n'),
                                recommended_projects: (r.recommended_projects || []).join('\n'),
                                additional_requirements: r.additional_requirements || '',
                                status: r.status
                              });
                              setJobRoleModalOpen(true);
                            }}
                            title="Edit Job Role"
                            className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-purple-600 rounded-lg cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm(`Are you sure you want to delete "${r.title}"?`)) return;
                              await apiCall(`/api/admin/job-roles/${r.id}`, { method: 'DELETE' });
                              showNotification('Job role deleted successfully.');
                              fetchJobRoles();
                            }}
                            title="Delete Job Role"
                            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SKILLS MANAGEMENT */}
        {adminTab === 'skills' && (
          <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Technical Skills Catalog</h1>
                <p className="text-xs text-slate-500">Centralized skills repository mapped across job roles</p>
              </div>

              <button
                onClick={() => {
                  setSkillForm({ name: '', category: 'Programming Languages', description: '' });
                  setSkillModalOpen(true);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Skill</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {skillsList.map(s => (
                <div key={s.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                      {s.category}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">{s.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{s.description || 'Core engineering proficiency.'}</p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!confirm(`Delete skill ${s.name}?`)) return;
                      const res = await apiCall(`/api/admin/skills/${s.id}`, { method: 'DELETE' });
                      if (res.ok) {
                        showNotification('Skill deleted successfully.');
                        fetchSkills();
                      } else {
                        const err = await res.json();
                        alert(err.error || 'Failed to delete skill.');
                      }
                    }}
                    className="text-slate-300 hover:text-red-500 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USERS MANAGEMENT */}
        {adminTab === 'users' && (
          <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Registered Users Management</h1>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Resumes</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Registered</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-slate-500">{u.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 font-semibold">{u.resume_count || 0}</td>
                      <td className="p-4">
                        <button
                          onClick={async () => {
                            const newStatus = u.status === 'active' ? 'inactive' : 'active';
                            const res = await apiCall(`/api/admin/users/${u.id}/status`, {
                              method: 'PUT',
                              body: JSON.stringify({ status: newStatus })
                            });
                            if (res.ok) {
                              showNotification(`User marked ${newStatus}.`);
                              fetchUsers();
                            } else {
                              const err = await res.json();
                              alert(err.error);
                            }
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}
                        >
                          {u.status}
                        </button>
                      </td>
                      <td className="p-4 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={async () => {
                            if (!confirm(`Delete user ${u.name}?`)) return;
                            const res = await apiCall(`/api/admin/users/${u.id}`, { method: 'DELETE' });
                            if (res.ok) {
                              showNotification('User deleted.');
                              fetchUsers();
                            } else {
                              const err = await res.json();
                              alert(err.error);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* RESUMES MANAGEMENT */}
        {adminTab === 'resumes' && (
          <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Resume Records</h1>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                  <tr>
                    <th className="p-4">Resume Title</th>
                    <th className="p-4">Owner</th>
                    <th className="p-4">Template</th>
                    <th className="p-4">Completion</th>
                    <th className="p-4">Created Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {resumesList.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{r.title}</div>
                        <div className="text-slate-500">{r.target_job_role}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold">{r.user_name || 'User'}</div>
                        <div className="text-slate-400 text-[11px]">{r.user_email}</div>
                      </td>
                      <td className="p-4 font-mono uppercase text-purple-700">{r.template_id}</td>
                      <td className="p-4 font-semibold text-emerald-600">{r.completion_percentage}%</td>
                      <td className="p-4 text-slate-400">{new Date(r.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={async () => {
                            if (!confirm('Delete this resume record?')) return;
                            await apiCall(`/api/admin/resumes/${r.id}`, { method: 'DELETE' });
                            showNotification('Resume deleted.');
                            fetchResumes();
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TEMPLATES MANAGEMENT */}
        {adminTab === 'templates' && (
          <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Resume Templates Configuration</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {templatesList.map(t => (
                <div key={t.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 rounded">
                      {t.category}
                    </span>
                    <button
                      onClick={async () => {
                        await apiCall(`/api/admin/templates/${t.id}`, {
                          method: 'PUT',
                          body: JSON.stringify({ is_active: !t.is_active })
                        });
                        fetchTemplates();
                      }}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                        t.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {t.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{t.name}</h3>
                  <p className="text-xs text-slate-500">{t.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTIVITY LOGS */}
        {adminTab === 'activity' && (
          <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Administrator Audit Trail</h1>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                  <tr>
                    <th className="p-4">Action</th>
                    <th className="p-4">Entity</th>
                    <th className="p-4">Details</th>
                    <th className="p-4">Admin</th>
                    <th className="p-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activityLogs.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="p-4 font-bold text-purple-700">{l.action}</td>
                      <td className="p-4 font-mono text-slate-500">{l.entity_type} #{l.entity_id}</td>
                      <td className="p-4 text-slate-800">{l.details}</td>
                      <td className="p-4 font-semibold">{l.admin_name || 'Admin'}</td>
                      <td className="p-4 text-slate-400 font-mono">{new Date(l.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: ADD / EDIT JOB ROLE */}
      {jobRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <h2 className="font-bold text-base">
                {editingJobRole ? `Edit Job Role: ${editingJobRole.title}` : 'Add New Job Role to MySQL'}
              </h2>
              <button onClick={() => setJobRoleModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJobRole} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Job Role Title *</label>
                  <input
                    type="text"
                    required
                    value={jobRoleForm.title}
                    onChange={(e) => setJobRoleForm({ ...jobRoleForm, title: e.target.value })}
                    placeholder="e.g. AI Application Developer"
                    className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={jobRoleForm.category}
                    onChange={(e) => setJobRoleForm({ ...jobRoleForm, category: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Data & Analytics">Data & Analytics</option>
                    <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
                    <option value="Security & Compliance">Security & Compliance</option>
                    <option value="Mobile Development">Mobile Development</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Description *</label>
                <textarea
                  rows={3}
                  required
                  value={jobRoleForm.description}
                  onChange={(e) => setJobRoleForm({ ...jobRoleForm, description: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Experience Level</label>
                  <select
                    value={jobRoleForm.experience_level}
                    onChange={(e) => setJobRoleForm({ ...jobRoleForm, experience_level: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-hidden"
                  >
                    <option value="Fresher">Fresher</option>
                    <option value="Junior">Junior</option>
                    <option value="Mid-Level">Mid-Level</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Experience (Years)</label>
                  <input
                    type="number"
                    min={0}
                    value={jobRoleForm.minimum_experience}
                    onChange={(e) => setJobRoleForm({ ...jobRoleForm, minimum_experience: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={jobRoleForm.status}
                    onChange={(e) => setJobRoleForm({ ...jobRoleForm, status: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-hidden"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Education Requirements</label>
                <input
                  type="text"
                  value={jobRoleForm.education_requirements}
                  onChange={(e) => setJobRoleForm({ ...jobRoleForm, education_requirements: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Recommended Projects (one per line)</label>
                <textarea
                  rows={2}
                  value={jobRoleForm.recommended_projects}
                  onChange={(e) => setJobRoleForm({ ...jobRoleForm, recommended_projects: e.target.value })}
                  placeholder="E-Commerce API with Stripe&#10;Real-Time WebSocket Chat"
                  className="w-full p-2 border border-slate-300 rounded-lg outline-hidden"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setJobRoleModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg cursor-pointer"
                >
                  Save Job Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DYNAMIC REQUIREMENTS MANAGEMENT (ROLE SKILLS) - CRITICAL FEATURE */}
      {roleSkillsModalOpen && activeRoleForSkills && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-purple-900 text-white flex justify-between items-center">
              <div>
                <h2 className="font-bold text-base">
                  Manage Required Skills: {activeRoleForSkills.title}
                </h2>
                <p className="text-xs text-purple-200">
                  CRITICAL: Updates here immediately affect future candidate career recommendations and skill gap scores.
                </p>
              </div>
              <button onClick={() => setRoleSkillsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              {/* Add Skill to Role Form */}
              <form onSubmit={handleAddSkillToRole} className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-3">
                <div className="font-bold text-slate-900">Add Skill Requirement to this Job Role</div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Skill Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Spring Boot, Docker, Redis"
                      value={newSkillForm.skill_name}
                      onChange={(e) => setNewSkillForm({ ...newSkillForm, skill_name: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Requirement Type</label>
                    <select
                      value={newSkillForm.requirement_type}
                      onChange={(e) => setNewSkillForm({ ...newSkillForm, requirement_type: e.target.value as any })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg outline-hidden"
                    >
                      <option value="mandatory">Mandatory</option>
                      <option value="preferred">Preferred</option>
                      <option value="optional">Optional</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Proficiency</label>
                    <select
                      value={newSkillForm.required_proficiency}
                      onChange={(e) => setNewSkillForm({ ...newSkillForm, required_proficiency: e.target.value as any })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg outline-hidden"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Assign Skill to Role</span>
                </button>
              </form>

              {/* Current Role Skills List */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900">
                  Assigned Skills ({currentRoleSkills.length})
                </h3>

                {currentRoleSkills.length === 0 ? (
                  <p className="text-slate-400 italic">No skills assigned to this role yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {currentRoleSkills.map(rs => (
                      <div key={rs.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-900">{rs.skill_name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            rs.requirement_type === 'mandatory'
                              ? 'bg-red-100 text-red-800'
                              : rs.requirement_type === 'preferred'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {rs.requirement_type}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Required: {rs.required_proficiency}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveSkillFromRole(rs.skill_id)}
                          className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                          title="Remove skill from role"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setRoleSkillsModalOpen(false)}
                className="px-5 py-2 bg-slate-900 text-white font-bold rounded-lg cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD NEW SKILL */}
      {skillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <h2 className="font-bold text-sm">Add New Technical Skill</h2>
              <button onClick={() => setSkillModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const res = await apiCall('/api/admin/skills', {
                  method: 'POST',
                  body: JSON.stringify(skillForm)
                });
                if (res.ok) {
                  showNotification('Skill created successfully.');
                  setSkillModalOpen(false);
                  fetchSkills();
                } else {
                  const err = await res.json();
                  alert(err.error);
                }
              }}
              className="p-5 space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Skill Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GraphQL, Tailwind CSS"
                  value={skillForm.name}
                  onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                <select
                  value={skillForm.category}
                  onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-hidden"
                >
                  <option value="Programming Languages">Programming Languages</option>
                  <option value="Frameworks">Frameworks</option>
                  <option value="Databases">Databases</option>
                  <option value="Cloud Platforms">Cloud Platforms</option>
                  <option value="Developer Tools">Developer Tools</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Soft Skills">Soft Skills</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={skillForm.description}
                  onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSkillModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg cursor-pointer"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
