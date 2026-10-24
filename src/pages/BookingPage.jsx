import React, { useState } from 'react';
import { 
  Send, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight
} from 'lucide-react';
import { submitBooking } from '../services/bookingService';
import { uploadToCloudinary } from '../services/cloudinary';
import { projectCategories } from '../data/seedProjects';

export const BookingPage = ({ preselectedProject = null, onNavigateToProjects }) => {
  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');

  const [projectTitle, setProjectTitle] = useState(preselectedProject?.title ? `Custom: ${preselectedProject.title}` : '');
  const [projectCategory, setProjectCategory] = useState(preselectedProject?.category || projectCategories[1]);
  const [projectAbstract, setProjectAbstract] = useState(preselectedProject?.shortDescription || '');
  const [problemStatement, setProblemStatement] = useState(preselectedProject?.problemStatement || '');
  const [proposedSolution, setProposedSolution] = useState(preselectedProject?.proposedSolution || '');
  const [hardwareRequirements, setHardwareRequirements] = useState(
    preselectedProject?.hardwareRequirements ? 
    preselectedProject.hardwareRequirements.map(h => typeof h === 'string' ? h : `${h.item} (${h.spec})`).join('\n') : ''
  );
  const [softwareRequirements, setSoftwareRequirements] = useState(
    preselectedProject?.softwareRequirements ? preselectedProject.softwareRequirements.join('\n') : ''
  );
  const [preferredDate, setPreferredDate] = useState('');

  // Attachments
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Status
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setErrorMessage('');
      const uploaded = await uploadToCloudinary(file, 'gg-techcore/bookings', (p) => setUploadProgress(p));
      setAttachments(prev => [...prev, uploaded]);
      setUploading(false);
    } catch (err) {
      setErrorMessage(err.message || 'File upload failed');
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Full Name is required.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Phone Number is required so our team can reach you regarding feasibility.');
      return;
    }
    if (!projectTitle.trim()) {
      setErrorMessage('Project Title is required.');
      return;
    }
    if (!projectAbstract.trim() || projectAbstract.trim().length < 20) {
      setErrorMessage('Please provide a project abstract or technical requirement summary of at least 20 characters.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        customerName,
        email,
        phone,
        organization,
        bookingType: 'Custom Project Idea',
        projectId: preselectedProject?.id || null,
        projectTitle,
        projectCategory,
        projectAbstract,
        problemStatement,
        proposedSolution,
        hardwareRequirements,
        softwareRequirements,
        preferredDate,
        attachmentUrls: attachments
      };

      const result = await submitBooking(payload);
      setSubmitting(false);
      setConfirmedBooking(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitting(false);
      setErrorMessage(err.message || 'Failed to submit proposal.');
    }
  };

  return (
    <div style={{ padding: '3.5rem 0 6rem 0' }}>
      <div className="container" style={{ maxWidth: '880px' }}>
        {/* Header */}
        <div className="section-header">
          <span className="section-tag">Engineering Intake</span>
          <h1 className="section-title">Submit Your Project Idea</h1>
          <p className="section-subtitle">
            Tell us about your hardware, embedded system, IoT, robotics, or software concept. Our engineering team reviews all technical abstracts to prepare feasibility and timeline evaluations.
          </p>
        </div>

        {confirmedBooking ? (
          /* Confirmation View */
          <div className="tech-card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#dcfce7',
              border: '1px solid #86efac',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <CheckCircle2 size={40} color="#15803d" />
            </div>

            <h2 style={{ fontSize: '1.8rem', color: '#0f172a', marginBottom: '0.75rem' }}>
              Project Proposal Transmitted
            </h2>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              maxWidth: '540px',
              margin: '0 auto 2rem auto',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem', fontFamily: 'var(--font-sub)', textTransform: 'uppercase', fontWeight: 700 }}>
                Unique Tracking Reference
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', color: '#0284c7', fontSize: '1.2rem', marginBottom: '0.75rem' }}>
                {confirmedBooking.id}
              </div>
              <div style={{ fontSize: '0.92rem', color: '#334155' }}>
                <strong>Project Title:</strong> {confirmedBooking.projectTitle}
              </div>
              <div style={{ fontSize: '0.92rem', color: '#334155' }}>
                <strong>Submitter:</strong> {confirmedBooking.customerName} ({confirmedBooking.email})
              </div>
            </div>

            <p style={{
              fontSize: '0.88rem',
              color: '#64748b',
              lineHeight: 1.6,
              maxWidth: '620px',
              margin: '0 auto 2.5rem auto',
              background: '#fef3c7',
              border: '1px solid #fde68a',
              padding: '1.25rem',
              borderRadius: 'var(--radius-sm)'
            }}>
              ℹ️ <strong>Engineering Process Note:</strong> Our engineering team will review your submitted abstract, evaluate component availability and feasibility, and contact you via email or phone within 24–48 hours.
            </p>

            <button
              onClick={() => {
                setConfirmedBooking(null);
                if (onNavigateToProjects) onNavigateToProjects();
              }}
              className="btn btn-primary btn-lg"
            >
              <span>Explore Projects Showcase</span>
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          /* Intake Form */
          <div className="tech-card" style={{ padding: '2.5rem' }}>
            <form onSubmit={handleSubmit}>
              {/* SECTION 1: CUSTOMER DETAILS */}
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.05rem',
                color: '#0284c7',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '0.4rem',
                marginBottom: '1.25rem'
              }}>
                1. Customer & Organization Details
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label required">Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g., Prof. Rajesh Kumar / Alex Rivera"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rajesh@university.edu"
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label required">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g., +91 98450 12345"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Organization / College / Company</label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g., Tech Innovations Lab"
                    className="form-input"
                  />
                </div>
              </div>

              {/* SECTION 2: PROJECT DETAILS */}
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.05rem',
                color: '#0284c7',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '0.4rem',
                margin: '2rem 0 1.25rem 0'
              }}>
                2. Project Proposal & Technical Abstract
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem' }} className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label required">Project Title</label>
                  <input
                    type="text"
                    required
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="e.g., Automated Quadruped Terrain Scout"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">Category</label>
                  <select
                    value={projectCategory}
                    onChange={(e) => setProjectCategory(e.target.value)}
                    className="form-select"
                  >
                    {projectCategories.filter(c => c !== 'All Projects').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required">Project Abstract & Requirements</label>
                <textarea
                  required
                  rows={4}
                  value={projectAbstract}
                  onChange={(e) => setProjectAbstract(e.target.value)}
                  placeholder="Summarize the core technical concept, intended functionality, input signals, processing algorithms, and target outcomes..."
                  className="form-textarea"
                />
                <div className="form-helper">Minimum 20 characters required.</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Problem Statement</label>
                  <textarea
                    rows={2}
                    value={problemStatement}
                    onChange={(e) => setProblemStatement(e.target.value)}
                    placeholder="What specific operational or engineering bottleneck is being addressed?"
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Proposed Solution</label>
                  <textarea
                    rows={2}
                    value={proposedSolution}
                    onChange={(e) => setProposedSolution(e.target.value)}
                    placeholder="What is your envisioned approach or engineering architecture?"
                    className="form-textarea"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Hardware Requirements</label>
                  <textarea
                    rows={2}
                    value={hardwareRequirements}
                    onChange={(e) => setHardwareRequirements(e.target.value)}
                    placeholder="e.g., ESP32-S3, STM32, LiDAR, Optical Sensor, LiFePO4 battery"
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Software / Protocol Requirements</label>
                  <textarea
                    rows={2}
                    value={softwareRequirements}
                    onChange={(e) => setSoftwareRequirements(e.target.value)}
                    placeholder="e.g., FreeRTOS, ROS2, MQTT, BLE, Python, React"
                    className="form-textarea"
                  />
                </div>
              </div>

              {/* SECTION 3: TIMELINE & CLOUDINARY ATTACHMENTS */}
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.05rem',
                color: '#0284c7',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '0.4rem',
                margin: '2rem 0 1.25rem 0'
              }}>
                3. Timeline & Attachments
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Completion Date (Optional)</label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Cloudinary File Upload Dropzone */}
              <div className="form-group">
                <label className="form-label">
                  Project Attachments (Schematics, PDFs, Circuit Diagrams, Block Diagrams)
                </label>
                
                <div style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  textAlign: 'center',
                  background: '#f8fafc',
                  position: 'relative'
                }}>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    accept=".pdf,.png,.jpg,.jpeg,.svg,.zip,.sch,.brd"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0,
                      cursor: 'pointer',
                      zIndex: 2
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    {uploading ? (
                      <>
                        <Loader2 size={28} color="#0284c7" className="animate-spin" />
                        <span style={{ fontSize: '0.9rem', color: '#0284c7', fontWeight: 600 }}>
                          Uploading to Cloudinary ({uploadProgress}%)...
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload size={28} color="#0284c7" />
                        <div style={{ fontSize: '0.92rem', color: '#1e293b', fontWeight: 600 }}>
                          Click or drag files here to attach project schematics or documentation
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          Uploads to Cloudinary (cloud: <code>ggtechcore</code>). Supports PDF, PNG, JPG, ZIP, Schematics (Max 15MB).
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Uploaded File List */}
                {attachments.length > 0 && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {attachments.map((att, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.55rem 0.85rem',
                        background: '#f1f5f9',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FileText size={16} color="#0284c7" />
                          <span style={{ color: '#0f172a', fontWeight: 600 }}>{att.name}</span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            ({(att.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                          style={{ background: 'transparent', border: 'none', color: '#e11d48', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: '#ffe4e6',
                  border: '1px solid #fecdd3',
                  color: '#e11d48',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  marginBottom: '1.5rem'
                }}>
                  <AlertCircle size={18} color="#e11d48" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || uploading}
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Transmitting Project Proposal...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Submit Project Proposal</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
