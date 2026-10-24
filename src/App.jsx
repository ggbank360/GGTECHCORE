import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { BookingPage } from './pages/BookingPage';
import { ContactPage } from './pages/ContactPage';
import { BookingModal } from './components/BookingModal';
import { ReviewModal } from './components/ReviewModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { getAllProjects, subscribeToProjects } from './services/projectService';
import { auth, onAuthStateChanged, signOut, isFirebaseConfigured } from './services/firebase';

export function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'projects' | 'detail' | 'booking' | 'contact' | 'admin'
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [preselectedBookingProject, setPreselectedBookingProject] = useState(null);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  // Auth state with session persistence for Master Admin
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('gg_master_admin');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved admin session:', e);
    }
    return null;
  });

  // Load published projects
  const fetchPublishedProjects = async () => {
    try {
      setLoading(true);
      const list = await getAllProjects(true);
      setProjects(list);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load published projects:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Real-time engineering projects subscription
    const unsubProjects = subscribeToProjects((list) => {
      setProjects(list.filter(p => p.published));
      setLoading(false);
    });

    // 2. Listen to Firebase Auth state if configured
    let unsubAuth = null;
    if (isFirebaseConfigured() && auth) {
      unsubAuth = onAuthStateChanged(auth, (user) => {
        if (user) {
          setAdminUser(user);
        } else {
          // If logged in via master passcode session, maintain login
          const savedMaster = sessionStorage.getItem('gg_master_admin');
          if (!savedMaster) {
            setAdminUser(null);
          }
        }
      });
    }

    return () => {
      unsubProjects();
      if (unsubAuth) unsubAuth();
    };
  }, []);

  // Handlers for Project View & Booking
  const handleViewProjectDetails = (project) => {
    setSelectedProject(project);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookProject = (project) => {
    setPreselectedBookingProject(project);
    setIsBookingModalOpen(true);
  };

  // Admin Portal Handlers
  const handleOpenAdmin = () => {
    if (adminUser) {
      setCurrentView('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsAdminLoginModalOpen(true);
    }
  };

  const handleAdminLoginSuccess = (user) => {
    try {
      sessionStorage.setItem('gg_master_admin', JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to save admin session:', e);
    }
    setAdminUser(user);
    setIsAdminLoginModalOpen(false);
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogout = async () => {
    try {
      sessionStorage.removeItem('gg_master_admin');
    } catch (e) {}
    if (isFirebaseConfigured() && auth) {
      try {
        await signOut(auth);
      } catch (e) {}
    }
    setAdminUser(null);
    setCurrentView('home');
    fetchPublishedProjects();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>
      {/* If in admin view and authenticated, render Admin Dashboard */}
      {currentView === 'admin' && adminUser ? (
        <AdminDashboard 
          adminUser={adminUser}
          onLogout={handleAdminLogout}
          onClose={() => {
            setCurrentView('home');
            fetchPublishedProjects();
          }}
        />
      ) : (
        <>
          {/* Main Public Navigation Bar */}
          <Navbar 
            currentView={currentView}
            setCurrentView={(view) => {
              setCurrentView(view);
              if (view === 'projects') fetchPublishedProjects();
            }}
            onOpenAdmin={handleOpenAdmin}
            onOpenBookingModal={() => handleBookProject(null)}
            onOpenReviewModal={() => setIsReviewModalOpen(true)}
          />

          {/* Main View Switcher */}
          <main style={{ flexGrow: 1 }}>
            {currentView === 'home' && (
              <HomePage 
                projects={projects}
                onViewDetails={handleViewProjectDetails}
                onBookProject={handleBookProject}
                onNavigateToProjects={() => {
                  setCurrentView('projects');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToBooking={() => {
                  setCurrentView('booking');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToContact={() => {
                  setCurrentView('contact');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenReviewModal={() => setIsReviewModalOpen(true)}
              />
            )}

            {currentView === 'projects' && (
              <ProjectsPage 
                projects={projects}
                onViewDetails={handleViewProjectDetails}
                onBookProject={handleBookProject}
              />
            )}

            {currentView === 'detail' && (
              <ProjectDetailPage 
                project={selectedProject}
                onBack={() => {
                  setCurrentView('projects');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onBookThisProject={(proj) => handleBookProject(proj)}
              />
            )}

            {currentView === 'booking' && (
              <BookingPage 
                preselectedProject={preselectedBookingProject}
                onNavigateToProjects={() => {
                  setCurrentView('projects');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {currentView === 'contact' && (
              <ContactPage />
            )}
          </main>

          {/* Public Footer */}
          <Footer 
            onNavigate={(view) => {
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAdmin={handleOpenAdmin}
          />

          {/* Customer Project Proposal Modal */}
          <BookingModal 
            isOpen={isBookingModalOpen}
            onClose={() => setIsBookingModalOpen(false)}
            preselectedProject={preselectedBookingProject}
          />

          {/* Customer Engineering Review Submission Modal */}
          <ReviewModal 
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
          />

          {/* Admin Authentication Modal */}
          <AdminLoginModal 
            isOpen={isAdminLoginModalOpen}
            onClose={() => setIsAdminLoginModalOpen(false)}
            onLoginSuccess={handleAdminLoginSuccess}
          />
        </>
      )}
    </div>
  );
}

export default App;
