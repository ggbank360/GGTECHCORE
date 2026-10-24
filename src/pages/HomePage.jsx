import React from 'react';
import { Hero } from '../components/Hero';
import { ProjectCard } from '../components/ProjectCard';
import { ReviewsSection } from '../components/ReviewsSection';
import { ContactSection } from '../components/ContactSection';
import { 
  Cpu, 
  Layers, 
  ArrowRight, 
  Code, 
  Activity, 
  Radio, 
  Microchip 
} from 'lucide-react';

export const HomePage = ({ 
  projects, 
  onViewDetails, 
  onBookProject, 
  onNavigateToProjects,
  onNavigateToBooking,
  onNavigateToContact,
  onOpenReviewModal
}) => {
  const featuredProjects = projects.slice(0, 3);

  const engineeringDomains = [
    {
      title: 'Hardware & Electronics',
      desc: 'Precision circuit prototyping, analog signal conditioning, power management, and component sourcing.',
      icon: Microchip,
      color: '#0284c7',
      bg: '#e0f2fe'
    },
    {
      title: 'Embedded Systems & ESP32',
      desc: 'Real-time FreeRTOS firmware, STM32 ARM Cortex, low-power sleep management, and sensor integration.',
      icon: Cpu,
      color: '#2563eb',
      bg: '#dbeafe'
    },
    {
      title: 'IoT & Remote Automation',
      desc: 'Long-range LoRaWAN, cellular 4G/LTE-M, Wi-Fi MQTT, and industrial field telemetry nodes.',
      icon: Radio,
      color: '#0d9488',
      bg: '#ccfbf1'
    },
    {
      title: 'Autonomous Robotics',
      desc: 'LiDAR SLAM navigation, ROS2 motion stacks, BLDC motor controllers, and obstacle evasion.',
      icon: Activity,
      color: '#15803d',
      bg: '#dcfce7'
    },
    {
      title: 'PCB Design & Development',
      desc: 'High-density 2-to-6 layer stackups, controlled impedance, EMI shielding, and thermal optimization.',
      icon: Layers,
      color: '#7c3aed',
      bg: '#ede9fe'
    },
    {
      title: 'AI Edge Engineering & Software',
      desc: 'TensorRT computer vision on Jetson, deep learning defect inspection, and cloud telemetry portals.',
      icon: Code,
      color: '#0369a1',
      bg: '#e0f2fe'
    }
  ];

  return (
    <div style={{ background: '#f8fafc' }}>
      {/* 1. HERO SECTION */}
      <Hero 
        onExploreProjects={onNavigateToProjects}
        onBookProject={onNavigateToBooking}
        onContactUs={onNavigateToContact}
      />

      {/* 2. CORE DOMAINS & SERVICES */}
      <section style={{ padding: '5rem 0', background: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Engineering Domains</span>
            <h2 className="section-title">What We Design & Build</h2>
            <p className="section-subtitle">
              Comprehensive hardware-software integration across embedded systems, industrial IoT, autonomous machines, and PCB development.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {engineeringDomains.map((domain, idx) => {
              const Icon = domain.icon;
              return (
                <div 
                  key={idx}
                  className="tech-card"
                  style={{
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    background: '#ffffff'
                  }}
                >
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: domain.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={26} color={domain.color} />
                  </div>

                  <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
                    {domain.title}
                  </h3>

                  <p style={{ fontSize: '0.94rem', color: '#475569', lineHeight: 1.6 }}>
                    {domain.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. FEATURED PROJECTS SHOWCASE */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '3rem',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}>
            <div>
              <span className="section-tag">Engineering Showcase</span>
              <h2 className="section-title" style={{ margin: 0 }}>Featured Projects</h2>
              <p className="section-subtitle" style={{ margin: '0.5rem 0 0 0' }}>
                Discover our latest engineered prototypes, technical abstracts, and circuit blueprints.
              </p>
            </div>

            <button 
              onClick={onNavigateToProjects}
              className="btn btn-secondary"
            >
              <span>View All Projects</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {featuredProjects.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3.5rem 2rem',
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '2px dashed #cbd5e1',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                <Cpu size={32} color="#0284c7" />
              </div>
              <h3 style={{ fontSize: '1.35rem', color: '#0f172a', fontWeight: 800, marginBottom: '0.5rem' }}>
                Engineering Project Catalog Ready
              </h3>
              <p style={{ color: '#64748b', maxWidth: '540px', margin: '0 auto 1.5rem auto', lineHeight: 1.6 }}>
                All default mock projects have been removed. You can now publish, edit, and manage your genuine engineering project dossiers directly through the Admin Command Center.
              </p>
              <button 
                onClick={onNavigateToBooking}
                className="btn btn-primary"
              >
                <span>Submit Your Custom Project Idea</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '2rem'
            }}>
              {featuredProjects.map((project) => (
                <ProjectCard 
                  key={project.id}
                  project={project}
                  onViewDetails={onViewDetails}
                  onBookProject={onBookProject}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. THE PROTOTYPING LIFECYCLE */}
      <section style={{
        padding: '5rem 0',
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Methodology</span>
            <h2 className="section-title">How We Turn Ideas Into Real Solutions</h2>
            <p className="section-subtitle">
              From customer abstract submission to working physical hardware deployment.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem'
          }}>
            {[
              {
                step: '01',
                title: 'Technical Intake & Feasibility',
                desc: 'You submit your project concept, requirements, and target timeline. Our team verifies component availability and electrical feasibility.'
              },
              {
                step: '02',
                title: 'Schematic & Architecture',
                desc: 'We draft detailed block diagrams, calculate thermal dissipation, and select microcontrollers, sensors, and power regulation circuits.'
              },
              {
                step: '03',
                title: 'PCB Design & Firmware',
                desc: 'Multi-layer PCB layout with matched traces, accompanied by FreeRTOS or bare-metal embedded C++ firmware with protocol stacks.'
              },
              {
                step: '04',
                title: 'Fabrication & Verification',
                desc: 'SMD assembly, benchtop oscilloscope and logic analyzer debugging, stress-testing, and complete technical dossier compilation.'
              }
            ].map((step, idx) => (
              <div 
                key={idx}
                className="tech-card"
                style={{ padding: '1.75rem', position: 'relative', background: '#f8fafc' }}
              >
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  color: '#bae6fd',
                  lineHeight: 1,
                  marginBottom: '1rem'
                }}>
                  {step.step}
                </div>
                <h3 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, marginBottom: '0.75rem' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Call to Action Box */}
          <div style={{
            marginTop: '4rem',
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            border: '1px solid #bae6fd',
            borderRadius: 'var(--radius-xl)',
            padding: '3rem 2rem',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(2, 132, 199, 0.08)'
          }}>
            <h3 style={{ fontSize: '1.85rem', color: '#0f172a', fontWeight: 900, marginBottom: '1rem' }}>
              Have A Custom Engineering Project Or Abstract?
            </h3>
            <p style={{ maxWidth: '650px', margin: '0 auto 2rem auto', color: '#475569', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Submit your project abstract, problem statement, and requirements. We review every submission through our secure admin dashboard and provide technical feasibility assessments.
            </p>
            <button 
              onClick={onNavigateToBooking}
              className="btn btn-primary btn-lg"
            >
              <span>Submit Your Project Idea</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* 5. CLIENT & STUDENT ENGINEERING REVIEWS */}
      <ReviewsSection onOpenReviewModal={onOpenReviewModal} />

      {/* 6. CONTACT & INQUIRY SECTION */}
      <ContactSection />
    </div>
  );
};
