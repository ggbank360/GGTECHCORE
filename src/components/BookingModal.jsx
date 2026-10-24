import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Layers
} from 'lucide-react';
import { submitBooking } from '../services/bookingService';
import { uploadToCloudinary } from '../services/cloudinary';
import { projectCategories } from '../data/seedProjects';

export const BookingModal = ({ isOpen, onClose, preselectedProject = null }) => {
  // Form Fields State
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');

  const [projectTitle, setProjectTitle] = useState('');
  const [projectCategory, setProjectCategory] = useState(projectCategories[1] || 'Hardware and electronics');
  const [projectAbstract, setProjectAbstract] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [proposedSolution, setProposedSolution] = useState('');
  const [hardwareRequirements, setHardwareRequirements] = useState('');
  const [softwareRequirements, setSoftwareRequirements] = useState('');
  const [preferredDate, setPreferredDate] = useState('');

  // Uploaded Attachments
  const [attachments, setAttachments] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Submission UI States
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  // Sync state when preselectedProject changes
  useEffect(() => {
    if (preselectedProject) {
      setProjectTitle(`Custom Adaptation of: ${preselectedProject.title}`);
      setProjectCategory(preselectedProject.category);
      setProjectAbstract(`We would like to request an engineering proposal or custom adaptation based on: ${preselectedProject.title}.\n\nRequirements:\n`);
      setHardwareRequirements(
        (preselectedProject.hardwareRequirements || [])
          .map(h => typeof h === 'string' ? h : `${h.item} (${h.spec})`)
          .join('\n')
      );
      setSoftwareRequirements((preselectedProject.softwareRequirements || []).join('\n'));
    } else {
      setProjectTitle('');
      setProjectAbstract('');
      setHardwareRequirements('');
      setSoftwareRequirements('');
    }
  }, [preselectedProject, isOpen]);

  if (!isOpen) return null;

  // File Upload Handler (Cloudinary)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFile(true);
      setErrorMessage('');
      const uploaded = await uploadToCloudinary(file, 'gg-techcore/bookings', (p) => setUploadProgress(p));
      setAttachments(prev => [...prev, uploaded]);
      setUploadingFile(false);
    } catch (err) {
      setErrorMessage(err.message || 'File upload failed');
      setUploadingFile(false);
    }
  };

  const handleRemoveAttachment = (idx) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  // Form Submit Handler
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
      setErrorMessage('Phone Number is required so our engineering team can contact you.');
      return;
    }
    if (!projectTitle.trim()) {
      setErrorMessage('Project Title is required.');
      return;
    }
    if (!projectAbstract.trim() || projectAbstract.trim().length < 20) {
      setErrorMessage('Please provide a project abstract or requirement summary of at least 20 characters.');
      return;
    }

    try {
      setSubmitting(true);
      const bookingPayload = {
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

      const result = await submitBooking(bookingPayload);
      setSubmitting(false);
      setSubmissionSuccess(result);
    } catch (err) {
      setSubmitting(false);
      setErrorMessage(err.message || 'Failed to submit proposal. Please try again.');
    }
  };

  const handleResetAndClose = () => {
    setSubmissionSuccess(null);
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleResetAndClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '820px' }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc'
        }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', color: '#0f172a' }}>
              Submit Your Project Idea & Requirements
            </h2>
            <div style={{ fontSize: '0.82rem', color: '#0284c7', fontFamily: 'var(--font-sub)', textTransform: 'uppercase', fontWeight: 700 }}>
              GG TECHCORE Engineering Feasibility & Proposal Intake
            </div>
          </div>

          <button 
            onClick={handleResetAndClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '0.4rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '2rem' }}>
          {submissionSuccess ? (
            /* Submission Confirmation Card */
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: '#dcfce7',
                border: '1px solid #86efac',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto'
              }}>
                <CheckCircle2 size={36} color="#15803d" />
              </div>

              <h3 style={{ fontSize: '1.6rem', marginBottom: '0.75rem', color: '#0f172a' }}>
                Project Idea Received Successfully
              </h3>

              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                maxWidth: '520px',
                margin: '0 auto 1.75rem auto',
                textAlign: 'left'
              }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem', fontWeight: 600 }}>
                  REFERENCE SUBMISSION ID
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', color: '#0284c7', fontSize: '1.15rem', marginBottom: '0.75rem' }}>
                  {submissionSuccess.id}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#334155' }}>
                  <strong>Project Title:</strong> {submissionSuccess.projectTitle}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#334155' }}>
                  <strong>Applicant:</strong> {submissionSuccess.customerName} ({submissionSuccess.email})
                </div>
              </div>

              {/* Business Disclaimer */}
              <p style={{
                fontSize: '0.88rem',
                color: '#64748b',
                lineHeight: 1.6,
                maxWidth: '580px',
                margin: '0 auto 2rem auto',
                background: '#fef3c7',
                border: '1px solid #fde68a',
                padding: '1rem',
                borderRadius: 'var(--radius-sm)'
              }}>
                ℹ️ <strong>Engineering Process Note:</strong> Our technical team will review your submitted abstract, evaluate component availability and feasibility, and contact you via email or phone within 24–48 hours.
              </p>

              <button onClick={handleResetAndClose} className="btn btn-primary btn-lg">
                <span>Done & Return to Projects</span>
              </button>
            </div>
          ) : (
            /* Project Idea Intake Form */
            <form onSubmit={handleSubmit}>
              {/* SECTION 1: CUSTOMER DETAILS */}
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1rem',
                color: '#0284c7',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '0.4rem',
                marginBottom: '1rem'
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
                    placeholder="e.g., Alex Johnson"
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
                    placeholder="alex@example.com"
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
                    placeholder="+91 / +1 ..."
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Organization / College / Company</label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g., MIT Robotics Lab / Aero Corp"
                    className="form-input"
                  />
                </div>
              </div>

              {/* SECTION 2: PROJECT DETAILS & ABSTRACT */}
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1rem',
                color: '#0284c7',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '0.4rem',
                margin: '1.5rem 0 1rem 0'
              }}>
                2. Technical Proposal & Engineering Abstract
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem' }} className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label required">Project Title</label>
                  <input
                    type="text"
                    required
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="e.g., Smart ESP32 IV Infusion Monitor / Solar AGV"
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
                    {projectCategories.filter(c => c !== 'All Projects').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Project Abstract */}
              <div className="form-group">
                <label className="form-label required">Project Abstract</label>
                <textarea
                  required
                  rows={4}
                  value={projectAbstract}
                  onChange={(e) => setProjectAbstract(e.target.value)}
                  placeholder="Provide a comprehensive technical summary explaining the concept, working principle, and engineering objectives..."
                  className="form-textarea"
                />
                <div className="form-helper">
                  Include core goals, sensors, microcontrollers (ESP32, STM32), and desired physical outputs.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Problem Statement</label>
                  <textarea
                    rows={2}
                    value={problemStatement}
                    onChange={(e) => setProblemStatement(e.target.value)}
                    placeholder="What specific engineering challenge does this project solve?"
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Proposed Solution</label>
                  <textarea
                    rows={2}
                    value={proposedSolution}
                    onChange={(e) => setProposedSolution(e.target.value)}
                    placeholder="How will the hardware/software resolve the challenge?"
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
                    placeholder="e.g., ESP32, STM32, LiDAR, BLDC Motor, 4-Layer PCB, Load Cell"
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Software / Protocol Requirements</label>
                  <textarea
                    rows={2}
                    value={softwareRequirements}
                    onChange={(e) => setSoftwareRequirements(e.target.value)}
                    placeholder="e.g., FreeRTOS, MQTT, ROS2, React, C++, Python, LoRaWAN"
                    className="form-textarea"
                  />
                </div>
              </div>

              {/* SECTION 3: TIMELINE & CLOUDINARY ATTACHMENTS */}
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1rem',
                color: '#0284c7',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '0.4rem',
                margin: '1.5rem 0 1rem 0'
              }}>
                3. Timeline & Attachments (Cloudinary)
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Completion Date (Optional)</label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="form-input"
                  style={{ maxWidth: '380px' }}
                />
                <div className="form-helper">
                  Target timeline for engineering prototype delivery or review.
                </div>
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
                    disabled={uploadingFile}
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
                    {uploadingFile ? (
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
                          onClick={() => handleRemoveAttachment(idx)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#e11d48',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Error Message Display */}
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
                  marginBottom: '1.25rem'
                }}>
                  <AlertCircle size={18} color="#e11d48" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="btn btn-outline"
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={submitting || uploadingFile}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Transmitting Idea...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Submit Project Idea</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
