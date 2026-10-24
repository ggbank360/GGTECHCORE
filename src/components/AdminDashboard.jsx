import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Send, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Upload, 
  FileText, 
  Mail, 
  Phone, 
  LogOut, 
  X, 
  Loader2, 
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Database,
  Star,
  AlertTriangle,
  CloudUpload
} from 'lucide-react';
import { 
  getAllProjects, 
  createProject, 
  updateProject, 
  deleteProject, 
  subscribeToProjects,
  seedInitialProjectsToFirestore,
  checkFirestoreAccess,
  syncAllLocalProjectsToFirestore
} from '../services/projectService';
import { 
  getAllBookings, 
  updateBookingStatus,
  subscribeToBookings 
} from '../services/bookingService';
import { getAllInquiries, subscribeToInquiries } from '../services/inquiryService';
import { getAllReviews, deleteReview, subscribeToReviews } from '../services/reviewService';
import { uploadToCloudinary } from '../services/cloudinary';
import { projectCategories } from '../data/seedProjects';
import logoImg from '../assets/logo.png';

export const AdminDashboard = ({ adminUser, onLogout, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Data states
  const [projects, setProjects] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seedingLoading, setSeedingLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [firestoreStatus, setFirestoreStatus] = useState({ checked: false, ok: true, error: null });
  const [syncingCloud, setSyncingCloud] = useState(false);

  // Project Editor Modal State
  const [editingProject, setEditingProject] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectSaving, setProjectSaving] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Booking Review Drawer State
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [adminNotesDraft, setAdminNotesDraft] = useState('');
  const [bookingStatusDraft, setBookingStatusDraft] = useState('');
  const [bookingUpdating, setBookingUpdating] = useState(false);

  // Filters
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilterStatus, setBookingFilterStatus] = useState('ALL');

  const checkCloudHealth = async () => {
    try {
      const res = await checkFirestoreAccess();
      setFirestoreStatus({ checked: true, ok: res.ok, error: res.message });
    } catch (e) {
      setFirestoreStatus({ checked: true, ok: false, error: e.message });
    }
  };

  const handleSyncAllToCloud = async () => {
    try {
      setSyncingCloud(true);
      const count = await syncAllLocalProjectsToFirestore();
      const testRes = await checkFirestoreAccess();
      setFirestoreStatus({ checked: true, ok: testRes.ok, error: testRes.message });
      if (testRes.ok) {
        setActionMessage(`✅ All ${count} projects successfully synced to Google Firebase Cloud for all users!`);
      } else {
        setActionMessage(`⚠️ Firestore Cloud is still blocking access (${testRes.message}). Please publish the rules in Firebase Console first.`);
      }
    } catch (err) {
      alert('Sync error: ' + err.message);
    } finally {
      setSyncingCloud(false);
      loadData();
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      checkCloudHealth();
      const [projList, bookList, inqList, revList] = await Promise.all([
        getAllProjects(false),
        getAllBookings(),
        getAllInquiries(),
        getAllReviews()
      ]);
      setProjects(projList);
      setBookings(bookList);
      setInquiries(inqList);
      setReviews(revList);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setLoading(false);
    }
  };

  const handleDeleteReview = async (id) => {
    if (window.confirm('Delete this client review permanently?')) {
      await deleteReview(id);
      setActionMessage('Client review deleted successfully.');
      loadData();
    }
  };

  useEffect(() => {
    setLoading(true);
    const unsubProjects = subscribeToProjects((list) => {
      setProjects(list);
      setLoading(false);
    });
    const unsubBookings = subscribeToBookings((list) => {
      setBookings(list);
    });
    const unsubInquiries = subscribeToInquiries((list) => {
      setInquiries(list);
    });
    const unsubReviews = subscribeToReviews((list) => {
      setReviews(list);
    });

    return () => {
      unsubProjects();
      unsubBookings();
      unsubInquiries();
      unsubReviews();
    };
  }, []);

  const totalProjects = projects.length;
  const publishedProjects = projects.filter(p => p.published).length;
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
  const confirmedBookings = bookings.filter(b => b.status === 'Confirmed').length;

  const handleClearMockProjects = async () => {
    if (window.confirm('Remove all default sample projects and keep only your own created projects?')) {
      const mockIds = ['proj_esp32_smart_iv', 'proj_lidar_agv_rover', 'proj_bldc_pcb_controller'];
      for (const id of mockIds) {
        await deleteProject(id);
      }
      setActionMessage('All default mock projects cleared. You can now publish and manage your own custom projects!');
      loadData();
    }
  };

  const handleOpenProjectModal = (proj = null) => {
    if (proj) {
      setEditingProject({
        ...proj,
        technologiesStr: (proj.technologies || []).join(', '),
        hardwareStr: (proj.hardwareRequirements || []).map(h => typeof h === 'string' ? h : `${h.item} : ${h.spec}`).join('\n'),
        softwareStr: (proj.softwareRequirements || []).join('\n'),
        objectivesStr: (proj.objectives || []).join('\n'),
        featuresStr: (proj.features || []).join('\n'),
        applicationsStr: (proj.applications || []).join('\n'),
        advantagesStr: (proj.advantages || []).join('\n'),
        limitationsStr: (proj.limitations || []).join('\n'),
        imageUrls: proj.imageUrls || []
      });
    } else {
      setEditingProject({
        title: '',
        category: projectCategories[1],
        shortDescription: '',
        abstract: '',
        overview: '',
        problemStatement: '',
        proposedSolution: '',
        objectivesStr: '',
        methodology: '',
        hardwareStr: '',
        softwareStr: '',
        circuitDiagramUrl: '',
        featuresStr: '',
        applicationsStr: '',
        advantagesStr: '',
        limitationsStr: '',
        technologiesStr: 'ESP32, IoT, C++',
        imageUrls: ['https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'],
        videoUrls: [''],
        published: true
      });
    }
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!editingProject.title || !editingProject.abstract) {
      alert('Title and Abstract are required.');
      return;
    }

    try {
      setProjectSaving(true);
      const parsedPayload = {
        title: editingProject.title.trim(),
        category: editingProject.category,
        shortDescription: editingProject.shortDescription?.trim() || editingProject.abstract.slice(0, 160) + '...',
        abstract: editingProject.abstract.trim(),
        overview: editingProject.overview?.trim() || editingProject.abstract,
        problemStatement: editingProject.problemStatement?.trim() || '',
        proposedSolution: editingProject.proposedSolution?.trim() || '',
        methodology: editingProject.methodology?.trim() || '',
        circuitDiagramUrl: editingProject.circuitDiagramUrl?.trim() || (editingProject.imageUrls?.[0] || ''),
        published: Boolean(editingProject.published),
        technologies: (editingProject.technologiesStr || '').split(',').map(s => s.trim()).filter(Boolean),
        objectives: (editingProject.objectivesStr || '').split('\n').map(s => s.trim()).filter(Boolean),
        hardwareRequirements: (editingProject.hardwareStr || '').split('\n').map(line => {
          const parts = line.split(':');
          return { item: parts[0]?.trim() || line, spec: parts[1]?.trim() || 'Specified Component' };
        }).filter(h => h.item),
        softwareRequirements: (editingProject.softwareStr || '').split('\n').map(s => s.trim()).filter(Boolean),
        features: (editingProject.featuresStr || '').split('\n').map(s => s.trim()).filter(Boolean),
        applications: (editingProject.applicationsStr || '').split('\n').map(s => s.trim()).filter(Boolean),
        advantages: (editingProject.advantagesStr || '').split('\n').map(s => s.trim()).filter(Boolean),
        limitations: (editingProject.limitationsStr || '').split('\n').map(s => s.trim()).filter(Boolean),
        imageUrls: (editingProject.imageUrls && editingProject.imageUrls.length > 0 && editingProject.imageUrls[0]) ? editingProject.imageUrls : ['https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'],
        videoUrls: editingProject.videoUrls || []
      };

      if (editingProject.id) {
        const res = await updateProject(editingProject.id, { ...parsedPayload, id: editingProject.id });
        if (res && res.firestoreError) {
          setActionMessage(`⚠️ Project saved to your browser, but could not sync to cloud: ${res.firestoreError}. Follow the steps at the top of the dashboard to publish rules in Firebase Console.`);
        } else {
          setActionMessage(`Project "${parsedPayload.title}" updated successfully and synced live to Firebase Cloud!`);
        }
      } else {
        const res = await createProject(parsedPayload);
        if (res && res.firestoreError) {
          setActionMessage(`⚠️ Project saved to your browser, but could not sync to cloud: ${res.firestoreError}. Follow the steps at the top of the dashboard to publish rules in Firebase Console.`);
        } else {
          setActionMessage(`New project "${parsedPayload.title}" created and synced live to Firebase Cloud!`);
        }
      }

      setProjectSaving(false);
      setIsProjectModalOpen(false);
      await loadData();
    } catch (err) {
      alert('Error saving project: ' + err.message);
      setProjectSaving(false);
    }
  };

  const handleDeleteProject = async (id, title) => {
    if (window.confirm(`Permanently delete project: "${title}"?`)) {
      await deleteProject(id);
      setActionMessage(`Project "${title}" deleted.`);
      loadData();
    }
  };

  const handleTogglePublish = async (proj) => {
    await updateProject(proj.id, { published: !proj.published });
    setActionMessage(`Project "${proj.title}" status changed to ${!proj.published ? 'Published' : 'Draft'}.`);
    loadData();
  };

  const handleOpenBooking = (booking) => {
    setSelectedBooking(booking);
    setBookingStatusDraft(booking.status || 'Pending');
    setAdminNotesDraft(booking.adminNotes || '');
  };

  const handleUpdateBooking = async () => {
    if (!selectedBooking) return;
    try {
      setBookingUpdating(true);
      await updateBookingStatus(selectedBooking.id, bookingStatusDraft, adminNotesDraft);
      setSelectedBooking(prev => ({
        ...prev,
        status: bookingStatusDraft,
        adminNotes: adminNotesDraft
      }));
      setBookingUpdating(false);
      setActionMessage(`Booking "${selectedBooking.id}" status updated to ${bookingStatusDraft}.`);
      loadData();
    } catch (err) {
      alert('Failed to update booking: ' + err.message);
      setBookingUpdating(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      (b.customerName || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
      (b.projectTitle || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
      (b.email || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
      (b.id || '').toLowerCase().includes(bookingSearch.toLowerCase());

    const matchesStatus = 
      bookingFilterStatus === 'ALL' || b.status === bookingFilterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      paddingBottom: '5rem',
      color: '#0f172a'
    }}>
      {/* Admin Top Header */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0.85rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <img 
              src={logoImg} 
              alt="GG TECHCORE" 
              style={{
                height: '58px',
                maxHeight: '62px',
                width: 'auto',
                objectFit: 'contain',
                display: 'block'
              }} 
            />
            <div style={{ borderLeft: '1px solid #cbd5e1', paddingLeft: '0.85rem' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>
                Admin Command Center
              </div>
              <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: firestoreStatus.ok ? '#22c55e' : '#f59e0b', display: 'inline-block' }}></span>
                <span>{firestoreStatus.ok ? 'Firebase Cloud Live Sync: Connected' : 'Firebase Cloud Sync: Blocked by Rules'}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              onClick={loadData}
              className="btn btn-secondary btn-sm"
              title="Refresh Data"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>

            <button 
              onClick={onClose}
              className="btn btn-outline btn-sm"
            >
              <span>View Website</span>
            </button>

            <button 
              onClick={onLogout}
              className="btn btn-danger btn-sm"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="container" style={{ marginTop: '2rem' }}>
        {/* Firebase Cloud Sync Alert if rules are blocked */}
        {firestoreStatus.checked && !firestoreStatus.ok && (
          <div style={{
            background: '#fff7ed',
            border: '1.5px solid #fdba74',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.08)'
          }}>
            <AlertTriangle size={24} color="#ea580c" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1, fontSize: '0.9rem', color: '#9a3412', lineHeight: 1.5 }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#c2410c', marginBottom: '0.35rem' }}>
                Firebase Cloud Sync is Blocked (Permission Denied)
              </div>
              <div>
                Changes are currently saving <strong>only in this browser's local cache</strong>. To update data for <strong>all users and devices worldwide in real-time</strong>:
              </div>
              <ol style={{ margin: '0.65rem 0 0.85rem 1.25rem', padding: 0, fontWeight: 600 }}>
                <li>Open <a href="https://console.firebase.google.com/project/ggbank-d6735/firestore/rules" target="_blank" rel="noreferrer" style={{ color: '#0284c7', textDecoration: 'underline' }}>Firebase Console &gt; Firestore &gt; Rules</a></li>
                <li>Set rules to allow read/write: <code style={{ background: '#ffedd5', padding: '2px 6px', borderRadius: '4px', color: '#9a3412' }}>allow read, write: if true;</code></li>
                <li>Click <strong>Publish</strong>.</li>
              </ol>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                <button 
                  onClick={handleSyncAllToCloud} 
                  disabled={syncingCloud}
                  className="btn btn-primary btn-sm" 
                  style={{ background: '#ea580c', borderColor: '#c2410c', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {syncingCloud ? <Loader2 size={14} className="animate-spin" /> : <CloudUpload size={14} />}
                  <span>{syncingCloud ? 'Syncing to Cloud...' : 'Push All Local Projects to Cloud Now'}</span>
                </button>
                <button 
                  onClick={checkCloudHealth} 
                  className="btn btn-outline btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <RefreshCw size={14} />
                  <span>Test Cloud Connection Again</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '2px',
          marginBottom: '2rem'
        }}>
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: Layers },
            { id: 'projects', label: `Projects Catalog (${totalProjects})`, icon: Database },
            { id: 'bookings', label: `Customer Ideas (${totalBookings})`, icon: Send },
            { id: 'reviews', label: `Client Reviews (${reviews.length})`, icon: Star },
            { id: 'inquiries', label: `Contact Inquiries (${inquiries.length})`, icon: Mail }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
                  fontFamily: 'var(--font-sub)',
                  fontSize: '0.94rem',
                  fontWeight: 700,
                  background: isActive ? '#e0f2fe' : 'transparent',
                  color: isActive ? '#0284c7' : '#64748b',
                  border: 'none',
                  borderBottom: isActive ? '3px solid #0284c7' : '3px solid transparent',
                  cursor: 'pointer',
                  borderRadius: '6px 6px 0 0'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action message banner */}
        {actionMessage && (
          <div style={{
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            background: '#dcfce7',
            border: '1px solid #86efac',
            color: '#15803d',
            fontSize: '0.92rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage('')} style={{ background: 'none', border: 'none', color: '#15803d', cursor: 'pointer', fontWeight: 'bold' }}>
              ✕
            </button>
          </div>
        )}

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2.5rem'
            }}>
              <div className="tech-card" style={{ padding: '1.5rem', background: '#ffffff' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontFamily: 'var(--font-sub)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Published Projects
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: '#0f172a', margin: '0.4rem 0', fontWeight: 900 }}>
                  {publishedProjects} <span style={{ fontSize: '1rem', color: '#64748b' }}>/ {totalProjects}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#0284c7', fontWeight: 600 }}>
                  Live on Website Showcase
                </div>
              </div>

              <div className="tech-card" style={{ padding: '1.5rem', background: '#ffffff' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontFamily: 'var(--font-sub)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Customer Ideas Received
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: '#2563eb', margin: '0.4rem 0', fontWeight: 900 }}>
                  {totalBookings}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Project Proposals & Abstracts
                </div>
              </div>

              <div className="tech-card" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b', background: '#ffffff' }}>
                <div style={{ fontSize: '0.85rem', color: '#b45309', fontFamily: 'var(--font-sub)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Pending Engineering Review
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: '#b45309', margin: '0.4rem 0', fontWeight: 900 }}>
                  {pendingBookings}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Awaiting Feasibility Check
                </div>
              </div>

              <div className="tech-card" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981', background: '#ffffff' }}>
                <div style={{ fontSize: '0.85rem', color: '#15803d', fontFamily: 'var(--font-sub)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Confirmed Client Builds
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', color: '#15803d', margin: '0.4rem 0', fontWeight: 900 }}>
                  {confirmedBookings}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  In Prototyping Pipeline
                </div>
              </div>
            </div>

            {/* Quick Actions Strip */}
            <div className="tech-card" style={{ padding: '1.5rem', marginBottom: '2.5rem', background: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.25rem' }}>
                    Catalog & Cloud Controls
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Firebase Firestore (ggbank-d6735) • Cloudinary (ggtechcore)
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleOpenProjectModal(null)}
                    className="btn btn-primary btn-sm"
                  >
                    <Plus size={16} />
                    <span>Create New Project</span>
                  </button>

                  <button
                    onClick={handleClearMockProjects}
                    className="btn btn-outline btn-sm"
                    title="Remove sample mock projects"
                  >
                    <Trash2 size={15} color="#dc2626" />
                    <span style={{ color: '#dc2626' }}>Clear Default Projects</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recently Received Submissions Preview */}
            <div className="tech-card" style={{ padding: '1.5rem', background: '#ffffff' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#0f172a' }}>
                Recently Received Customer Project Ideas
              </h3>

              {bookings.length === 0 ? (
                <div style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                  No customer proposals received yet.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#0369a1', fontFamily: 'var(--font-sub)', background: '#f8fafc' }}>
                        <th style={{ padding: '0.85rem' }}>Customer Name</th>
                        <th style={{ padding: '0.85rem' }}>Phone Number</th>
                        <th style={{ padding: '0.85rem' }}>Project Title</th>
                        <th style={{ padding: '0.85rem' }}>Status</th>
                        <th style={{ padding: '0.85rem' }}>Date</th>
                        <th style={{ padding: '0.85rem' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 5).map((b) => (
                        <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                            <div>{b.customerName}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{b.email}</div>
                          </td>
                          <td style={{ padding: '0.85rem' }}>
                            {b.phone ? (
                              <a 
                                href={`tel:${b.phone}`} 
                                style={{ 
                                  color: '#0284c7', 
                                  fontWeight: 700, 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '4px',
                                  textDecoration: 'none'
                                }}
                              >
                                <Phone size={14} />
                                <span>{b.phone}</span>
                              </a>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>None</span>
                            )}
                          </td>
                          <td style={{ padding: '0.85rem', color: '#475569' }}>{b.projectTitle}</td>
                          <td style={{ padding: '0.85rem' }}>
                            <span className={`status-pill ${
                              b.status === 'Confirmed' ? 'status-confirmed' :
                              b.status === 'Under Review' ? 'status-review' :
                              b.status === 'Contacted' ? 'status-contacted' :
                              b.status === 'Rejected' ? 'status-rejected' : 'status-pending'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem', color: '#64748b', fontSize: '0.85rem' }}>
                            {new Date(b.createdAt).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '0.85rem' }}>
                            <button
                              onClick={() => handleOpenBooking(b)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.35rem 0.75rem' }}
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Engineering Leadership Contact Directory */}
            <div className="tech-card" style={{ padding: '1.5rem', marginTop: '2rem', background: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#0f172a', margin: 0 }}>
                    Engineering Leadership Directory
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                    Direct contact credentials for GG TECHCORE leadership and technical leads:
                  </p>
                </div>
                <a 
                  href="mailto:ggbank360@gmail.com" 
                  style={{ 
                    color: '#0284c7', 
                    fontWeight: 700, 
                    fontSize: '0.88rem', 
                    background: '#e0f2fe', 
                    padding: '0.35rem 0.8rem', 
                    borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none'
                  }}
                >
                  ✉️ ggbank360@gmail.com
                </a>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>GOWTHAM N K</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.4rem' }}>
                    <a href="tel:7708949507" style={{ color: '#0284c7', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={14} />
                      <span>7708949507</span>
                    </a>
                    <a href="https://wa.me/917708949507" target="_blank" rel="noreferrer" style={{ color: '#15803d', fontSize: '0.78rem', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px', textDecoration: 'none', fontWeight: 600 }}>
                      WhatsApp
                    </a>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>GOPALA KRISHNAN M</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.4rem' }}>
                    <a href="tel:6374431113" style={{ color: '#0284c7', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={14} />
                      <span>6374431113</span>
                    </a>
                    <a href="https://wa.me/916374431113" target="_blank" rel="noreferrer" style={{ color: '#15803d', fontSize: '0.78rem', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px', textDecoration: 'none', fontWeight: 600 }}>
                      WhatsApp
                    </a>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>SARAVANA PRIYAN K</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.4rem' }}>
                    <a href="tel:7708883927" style={{ color: '#0284c7', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={14} />
                      <span>7708883927</span>
                    </a>
                    <a href="https://wa.me/917708883927" target="_blank" rel="noreferrer" style={{ color: '#15803d', fontSize: '0.78rem', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px', textDecoration: 'none', fontWeight: 600 }}>
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. PROJECTS MANAGEMENT TAB */}
        {activeTab === 'projects' && (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', color: '#0f172a' }}>Project Catalog Management</h2>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Edits made here are updated live immediately on the website.
                </div>
              </div>

              <button
                onClick={() => handleOpenProjectModal(null)}
                className="btn btn-primary"
              >
                <Plus size={18} />
                <span>Add New Project</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {projects.map((proj) => (
                <div key={proj.id} className="tech-card" style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <span className="badge badge-blue">{proj.category}</span>
                    <button
                      onClick={() => handleTogglePublish(proj)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                      title="Click to toggle publish status"
                    >
                      <span className={`status-pill ${proj.published ? 'status-completed' : 'status-pending'}`}>
                        {proj.published ? 'Published' : 'Draft'}
                      </span>
                    </button>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                    {proj.title}
                  </h3>

                  <p style={{
                    fontSize: '0.88rem',
                    color: '#475569',
                    lineHeight: 1.5,
                    marginBottom: '1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    flexGrow: 1
                  }}>
                    {proj.shortDescription || proj.abstract}
                  </p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #f1f5f9',
                    marginTop: 'auto'
                  }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace' }}>
                      {proj.id}
                    </span>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleOpenProjectModal(proj)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.35rem 0.75rem' }}
                      >
                        <Edit3 size={14} />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteProject(proj.id, proj.title)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.35rem 0.6rem' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. BOOKINGS / IDEAS TAB */}
        {activeTab === 'bookings' && (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', color: '#0f172a' }}>Customer Project Ideas & Proposals</h2>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Review submitted project abstracts and update customer proposal statuses.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search customer ideas..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="form-input"
                  style={{ width: '220px', height: '38px', fontSize: '0.85rem' }}
                />

                <select
                  value={bookingFilterStatus}
                  onChange={(e) => setBookingFilterStatus(e.target.value)}
                  className="form-select"
                  style={{ width: '150px', height: '38px', fontSize: '0.85rem' }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="tech-card" style={{ padding: '1rem', overflowX: 'auto', background: '#ffffff' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{
                    borderBottom: '2px solid #e2e8f0',
                    color: '#0369a1',
                    fontFamily: 'var(--font-sub)',
                    background: '#f8fafc'
                  }}>
                    <th style={{ padding: '0.85rem' }}>Reference ID</th>
                    <th style={{ padding: '0.85rem' }}>Customer Name</th>
                    <th style={{ padding: '0.85rem' }}>Phone Number</th>
                    <th style={{ padding: '0.85rem' }}>Project Title</th>
                    <th style={{ padding: '0.85rem' }}>Status</th>
                    <th style={{ padding: '0.85rem' }}>Submitted</th>
                    <th style={{ padding: '0.85rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem', fontFamily: 'monospace', color: '#0284c7', fontSize: '0.82rem' }}>
                        {b.id}
                      </td>
                      <td style={{ padding: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                        <div>{b.customerName}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{b.email}</div>
                      </td>
                      <td style={{ padding: '0.85rem' }}>
                        {b.phone ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <a 
                              href={`tel:${b.phone}`} 
                              style={{ 
                                color: '#0284c7', 
                                fontWeight: 700, 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '4px',
                                textDecoration: 'none'
                              }}
                              title="Click to call"
                            >
                              <Phone size={14} />
                              <span>{b.phone}</span>
                            </a>
                            <a
                              href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color: '#15803d',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                textDecoration: 'none'
                              }}
                            >
                              💬 WhatsApp
                            </a>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>None</span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem', color: '#475569', maxWidth: '240px' }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {b.projectTitle}
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem' }}>
                        <span className={`status-pill ${
                          b.status === 'Confirmed' ? 'status-confirmed' :
                          b.status === 'Under Review' ? 'status-review' :
                          b.status === 'Contacted' ? 'status-contacted' :
                          b.status === 'Rejected' ? 'status-rejected' : 'status-pending'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem', color: '#64748b', fontSize: '0.85rem' }}>
                        {new Date(b.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.85rem' }}>
                        <button
                          onClick={() => handleOpenBooking(b)}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.35rem 0.75rem' }}
                        >
                          Review Dossier
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        No records match the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. INQUIRIES TAB */}
        {activeTab === 'inquiries' && (
          <div className="tech-card" style={{ padding: '2rem', background: '#ffffff' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '1.5rem', color: '#0f172a' }}>
              Direct Contact Inquiries
            </h2>

            {inquiries.length === 0 ? (
              <p style={{ color: '#64748b' }}>No general inquiries received yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {inquiries.map((inq) => (
                  <div key={inq.id} style={{
                    padding: '1.25rem',
                    background: '#f8fafc',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{inq.name}</strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {new Date(inq.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.88rem', color: '#0284c7', marginBottom: '0.65rem', fontWeight: 600 }}>
                      <a href={`mailto:${inq.email}`} style={{ color: '#0284c7', textDecoration: 'underline' }}>{inq.email}</a>
                      {inq.phone && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                          <a 
                            href={`tel:${inq.phone}`} 
                            style={{ 
                              color: '#0369a1', 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              background: '#e0f2fe',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              textDecoration: 'none'
                            }}
                          >
                            <Phone size={13} />
                            <span>{inq.phone}</span>
                          </a>
                          <a
                            href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              color: '#15803d',
                              fontSize: '0.8rem',
                              background: '#dcfce7',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              textDecoration: 'none'
                            }}
                          >
                            💬 WhatsApp
                          </a>
                        </div>
                      )}
                      <span style={{ color: '#475569' }}>• Subject: <strong>{inq.subject || 'General Inquiry'}</strong></span>
                    </div>
                    <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.6, background: '#ffffff', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      {inq.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div className="tech-card" style={{ padding: '2rem', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', color: '#0f172a', margin: 0 }}>
                  Client Reviews & Ratings ({reviews.length})
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  Live customer reviews synced from Firestore and displayed dynamically on the website.
                </p>
              </div>
            </div>

            {reviews.length === 0 ? (
              <p style={{ color: '#64748b' }}>No client reviews received yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {reviews.map((rev) => (
                  <div key={rev.id} style={{
                    padding: '1.25rem',
                    background: '#f8fafc',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{rev.name}</strong>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {rev.role ? `${rev.role}${rev.organization ? ` • ${rev.organization}` : ''}` : rev.organization}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          title="Delete review"
                          style={{
                            background: '#fee2e2',
                            border: 'none',
                            color: '#dc2626',
                            padding: '0.35rem 0.5rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.78rem'
                          }}
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '2px', marginBottom: '0.75rem' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={15}
                            fill={i < (rev.rating || 5) ? '#f59e0b' : 'none'}
                            color={i < (rev.rating || 5) ? '#f59e0b' : '#cbd5e1'}
                          />
                        ))}
                      </div>

                      {rev.projectTitle && (
                        <div style={{ fontSize: '0.82rem', color: '#0284c7', fontWeight: 600, marginBottom: '0.5rem' }}>
                          Project: {rev.projectTitle}
                        </div>
                      )}

                      <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.5, fontStyle: 'italic' }}>
                        "{rev.comment}"
                      </p>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                      Submitted {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recently'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: ADD / EDIT PROJECT DOSSIER */}
      {isProjectModalOpen && editingProject && (
        <div className="modal-overlay" onClick={() => setIsProjectModalOpen(false)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '880px' }}
          >
            <div style={{
              padding: '1.5rem 2rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <h3 style={{ fontSize: '1.3rem', color: '#0f172a' }}>
                {editingProject.id ? 'Edit Project Dossier (Live Sync to Website)' : 'Publish New Project Dossier'}
              </h3>
              <button 
                onClick={() => setIsProjectModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSaveProject} style={{ padding: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }} className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label required">Project Title</label>
                  <input
                    type="text"
                    required
                    value={editingProject.title}
                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">Category</label>
                  <select
                    value={editingProject.category}
                    onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                    className="form-select"
                  >
                    {projectCategories.filter(c => c !== 'All Projects').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required">Project Abstract</label>
                <textarea
                  required
                  rows={4}
                  value={editingProject.abstract}
                  onChange={(e) => setEditingProject({ ...editingProject, abstract: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Project Overview & Working Principle</label>
                <textarea
                  rows={3}
                  value={editingProject.overview}
                  onChange={(e) => setEditingProject({ ...editingProject, overview: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Problem Statement</label>
                  <textarea
                    rows={2}
                    value={editingProject.problemStatement}
                    onChange={(e) => setEditingProject({ ...editingProject, problemStatement: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Proposed Solution</label>
                  <textarea
                    rows={2}
                    value={editingProject.proposedSolution}
                    onChange={(e) => setEditingProject({ ...editingProject, proposedSolution: e.target.value })}
                    className="form-textarea"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Hardware Requirements (Component : Spec)</label>
                  <textarea
                    rows={3}
                    value={editingProject.hardwareStr}
                    onChange={(e) => setEditingProject({ ...editingProject, hardwareStr: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Software Frameworks</label>
                  <textarea
                    rows={3}
                    value={editingProject.softwareStr}
                    onChange={(e) => setEditingProject({ ...editingProject, softwareStr: e.target.value })}
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Technologies (Comma-separated)</label>
                <input
                  type="text"
                  value={editingProject.technologiesStr}
                  onChange={(e) => setEditingProject({ ...editingProject, technologiesStr: e.target.value })}
                  className="form-input"
                />
              </div>

              {/* Cloudinary Image Upload for Project */}
              <div className="form-group">
                <label className="form-label">Primary Image / Circuit Schematic URL</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={editingProject.imageUrls[0] || ''}
                    onChange={(e) => {
                      const updated = [...editingProject.imageUrls];
                      updated[0] = e.target.value;
                      setEditingProject({ ...editingProject, imageUrls: updated });
                    }}
                    placeholder="https://..."
                    className="form-input"
                  />
                  <label className="btn btn-secondary" style={{ cursor: 'pointer', flexShrink: 0 }}>
                    <Upload size={16} />
                    <span>Upload to Cloudinary</span>
                    <input
                      type="file"
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setUploadingMedia(true);
                          const res = await uploadToCloudinary(file, 'gg-techcore/projects');
                          const updated = [...editingProject.imageUrls];
                          updated[0] = res.url;
                          setEditingProject({ ...editingProject, imageUrls: updated });
                          setUploadingMedia(false);
                        } catch (err) {
                          alert('Upload failed: ' + err.message);
                          setUploadingMedia(false);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
                <input
                  type="checkbox"
                  id="publish-toggle"
                  checked={editingProject.published}
                  onChange={(e) => setEditingProject({ ...editingProject, published: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="publish-toggle" style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 600, cursor: 'pointer' }}>
                  Publish Live Immediately on Website
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={projectSaving || uploadingMedia}
                  className="btn btn-primary"
                >
                  {projectSaving ? <Loader2 size={18} className="animate-spin" /> : <Database size={18} />}
                  <span>Save & Update Website</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BOOKING REVIEW DRAWER */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '820px' }}
          >
            <div style={{
              padding: '1.5rem 2rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontFamily: 'monospace' }}>
                  {selectedBooking.id}
                </span>
                <h3 style={{ fontSize: '1.35rem', color: '#0f172a', marginTop: '0.25rem' }}>
                  {selectedBooking.projectTitle}
                </h3>
              </div>

              <button 
                onClick={() => setSelectedBooking(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ padding: '2rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                background: '#f8fafc',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #e2e8f0',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.2rem' }}>
                    {selectedBooking.customerName}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '2px' }}>
                    {selectedBooking.organization || 'Independent Requester'}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginTop: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#0284c7', fontSize: '0.95rem', fontWeight: 700 }}>
                      <Phone size={16} />
                      <span>Phone: <a href={`tel:${selectedBooking.phone}`} style={{ color: '#0284c7', textDecoration: 'underline' }}>{selectedBooking.phone || 'Not provided'}</a></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#475569', fontSize: '0.95rem' }}>
                      <Mail size={16} />
                      <span>Email: <a href={`mailto:${selectedBooking.email}`} style={{ color: '#475569', textDecoration: 'underline' }}>{selectedBooking.email}</a></span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <a 
                    href={`mailto:${selectedBooking.email}?subject=GG%20TECHCORE%20Project%20Review%20-%20${encodeURIComponent(selectedBooking.projectTitle)}`}
                    className="btn btn-secondary btn-sm"
                  >
                    <Mail size={15} />
                    <span>Email</span>
                  </a>

                  {selectedBooking.phone && (
                    <>
                      <a 
                        href={`tel:${selectedBooking.phone}`}
                        className="btn btn-primary btn-sm"
                      >
                        <Phone size={15} />
                        <span>Call {selectedBooking.phone}</span>
                      </a>
                      <a 
                        href={`https://wa.me/${selectedBooking.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(selectedBooking.customerName)},%20we%20reviewed%20your%20project%20idea%20"${encodeURIComponent(selectedBooking.projectTitle)}"%20at%20GG%20TECHCORE.`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-sm"
                        style={{ borderColor: '#22c55e', color: '#15803d', background: '#f0fdf4' }}
                      >
                        <span>💬 WhatsApp</span>
                      </a>
                    </>
                  )}
                </div>
              </div>

              <div style={{
                background: '#ffffff',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #cbd5e1',
                marginBottom: '1.75rem'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }} className="grid-cols-2">
                  <div>
                    <label className="form-label">Update Proposal Status</label>
                    <select
                      value={bookingStatusDraft}
                      onChange={(e) => setBookingStatusDraft(e.target.value)}
                      className="form-select"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Internal Engineering Feasibility Notes</label>
                    <textarea
                      rows={2}
                      value={adminNotesDraft}
                      onChange={(e) => setAdminNotesDraft(e.target.value)}
                      placeholder="Add internal notes..."
                      className="form-textarea"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button
                    onClick={handleUpdateBooking}
                    disabled={bookingUpdating}
                    className="btn btn-primary btn-sm"
                  >
                    {bookingUpdating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    <span>Save Status & Notes</span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h4 style={{ color: '#0284c7', marginBottom: '0.4rem', fontWeight: 700 }}>
                    Submitted Abstract & Concept
                  </h4>
                  <div style={{
                    padding: '1rem',
                    background: '#f8fafc',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    color: '#334155',
                    borderLeft: '4px solid #0284c7'
                  }}>
                    {selectedBooking.projectAbstract}
                  </div>
                </div>

                {selectedBooking.problemStatement && (
                  <div>
                    <h5 style={{ color: '#64748b', marginBottom: '0.25rem' }}>Problem Statement</h5>
                    <p style={{ fontSize: '0.9rem', color: '#334155' }}>{selectedBooking.problemStatement}</p>
                  </div>
                )}

                {selectedBooking.proposedSolution && (
                  <div>
                    <h5 style={{ color: '#64748b', marginBottom: '0.25rem' }}>Proposed Solution</h5>
                    <p style={{ fontSize: '0.9rem', color: '#334155' }}>{selectedBooking.proposedSolution}</p>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-cols-2">
                  <div>
                    <h5 style={{ color: '#64748b', marginBottom: '0.25rem' }}>Hardware Requirements</h5>
                    <p style={{ fontSize: '0.88rem', color: '#334155', whiteSpace: 'pre-line' }}>
                      {selectedBooking.hardwareRequirements || 'None specified'}
                    </p>
                  </div>

                  <div>
                    <h5 style={{ color: '#64748b', marginBottom: '0.25rem' }}>Software Requirements</h5>
                    <p style={{ fontSize: '0.88rem', color: '#334155', whiteSpace: 'pre-line' }}>
                      {selectedBooking.softwareRequirements || 'None specified'}
                    </p>
                  </div>
                </div>

                {/* Cloudinary Attachments */}
                {selectedBooking.attachmentUrls && selectedBooking.attachmentUrls.length > 0 && (
                  <div>
                    <h4 style={{ color: '#0284c7', marginBottom: '0.5rem', fontWeight: 700 }}>
                      Uploaded Documents & Schematics ({selectedBooking.attachmentUrls.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {selectedBooking.attachmentUrls.map((att, i) => (
                        <a 
                          key={i}
                          href={att.url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ justifyContent: 'space-between' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={16} color="#0284c7" />
                            <span>{att.name || `Attachment ${i + 1}`}</span>
                          </div>
                          <ExternalLink size={14} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
