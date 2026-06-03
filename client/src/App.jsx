import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Briefcase, GraduationCap, Award, Wrench,
  Users, ChevronRight, ChevronLeft, Upload,
  Download, FileText, Plus, Trash2
} from 'lucide-react';
import './index.css';

const STEPS = [
  { id: 'template', title: 'Template', icon: <Upload size={20} /> },
  { id: 'personal', title: 'Personal', icon: <User size={20} /> },
  { id: 'education', title: 'Education', icon: <GraduationCap size={20} /> },
  { id: 'experience', title: 'Experience', icon: <Briefcase size={20} /> },
  { id: 'skills', title: 'Skills', icon: <Wrench size={20} /> },
  { id: 'certificates', title: 'Certificates', icon: <Award size={20} /> },
  { id: 'referees', title: 'Referees', icon: <Users size={20} /> },
  { id: 'review', title: 'Review', icon: <FileText size={20} /> },
];

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [template, setTemplate] = useState(null);
  const [format, setFormat] = useState('docx');
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: '',
      jobTitle: '',
      email: '',
      phone: '',
      address: '',
      linkedin: ''
    },
    summary: '',
    education: [{ school: '', degree: '', year: '', location: '' }],
    experience: [{ company: '', position: '', duration: '', tasks: '' }],
    skills: '',
    certificates: [{ name: '', institution: '', date: '' }],
    referees: [{ name: '', role: '', phone: '', email: '' }],
    attributes: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Load from localStorage on mount
  React.useEffect(() => {
    const savedData = localStorage.getItem('cvFormData');
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (e) {
        console.error('Failed to load saved data', e);
      }
    }
  }, []);

  // Save to localStorage on change
  React.useEffect(() => {
    localStorage.setItem('cvFormData', JSON.stringify(formData));
  }, [formData]);

  const resetData = () => {
    if (window.confirm('Are you sure you want to clear all data?')) {
      setFormData({
        personalInfo: {
          fullName: '',
          jobTitle: '',
          email: '',
          phone: '',
          address: '',
          linkedin: ''
        },
        summary: '',
        education: [{ school: '', degree: '', year: '', location: '' }],
        experience: [{ company: '', position: '', duration: '', tasks: '' }],
        skills: '',
        certificates: [{ name: '', institution: '', date: '' }],
        referees: [{ name: '', role: '', phone: '', email: '' }],
        attributes: ''
      });
      localStorage.removeItem('cvFormData');
    }
  };

  const handleInputChange = (section, field, value, index = null) => {
    if (index !== null) {
      const newList = [...formData[section]];
      newList[index][field] = value;
      setFormData({ ...formData, [section]: newList });
    } else if (section === 'personalInfo') {
      setFormData({
        ...formData,
        personalInfo: { ...formData.personalInfo, [field]: value }
      });
    } else {
      setFormData({ ...formData, [section]: value });
    }
  };

  const addItem = (section) => {
    let newItem = {};
    if (section === 'education') newItem = { school: '', degree: '', year: '', location: '' };
    else if (section === 'experience') newItem = { company: '', position: '', duration: '', tasks: '' };
    else if (section === 'certificates') newItem = { name: '', institution: '', date: '' };
    else if (section === 'referees') newItem = { name: '', role: '', phone: '', email: '' };
    setFormData({ ...formData, [section]: [...formData[section], newItem] });
  };

  const removeItem = (section, index) => {
    const newList = [...formData[section]];
    newList.splice(index, 1);
    setFormData({ ...formData, [section]: newList });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.docx')) {
      setTemplate(file);
      setCurrentStep(1);
    } else {
      alert('Please upload a .docx file');
    }
  };

  const handleSubmit = async () => {
    if (!template) {
      alert('Please upload a template first');
      setCurrentStep(0);
      return;
    }

    setIsGenerating(true);
    const data = new FormData();
    data.append('template', template);
    data.append('format', format);
    data.append('data', JSON.stringify(formData));

    try {
      const response = await fetch('http://localhost:5001/api/generate', {
        method: 'POST',
        body: data,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cv.${format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert('Error generating CV');
      }
    } catch (error) {
      console.error(error);
      alert('Error connecting to server');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="form-section"
          >
            <div className="section-title"><Upload /> Step 1: Upload Template</div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Upload a .docx file with tags like {'{fullName}'}, {'{summary}'}, etc.
              <button
                className="btn btn-secondary"
                style={{ marginLeft: '1rem', padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                onClick={() => setShowHelp(!showHelp)}
              >
                View Tag Guide
              </button>
            </p>

            {showHelp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="glass-card"
                style={{ marginBottom: '2rem', fontSize: '0.9rem', padding: '1.5rem' }}
              >
                <h4 style={{ marginBottom: '1rem' }}>Template Tag Guide</h4>
                <ul style={{ textAlign: 'left', listStyle: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <li><code>{'{fullName}'}</code>: Your name</li>
                  <li><code>{'{jobTitle}'}</code>: Target role</li>
                  <li><code>{'{email}'}</code>, <code>{'{phone}'}</code></li>
                  <li><code>{'{summary}'}</code>: Executive summary</li>
                  <li><code>{'{skills}'}</code>, <code>{'{attributes}'}</code></li>
                  <li><code>{'{#experience}'}...{'{/experience}'}</code></li>
                  <li><code>{'  {company}'}</code>, <code>{'{position}'}</code></li>
                  <li><code>{'{#education}'}...{'{/education}'}</code></li>
                  <li><code>{'  {school}'}</code>, <code>{'{degree}'}</code></li>
                </ul>
              </motion.div>
            )}

            <label className="file-upload">
              <Upload size={48} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
              <h3>{template ? template.name : 'Click or Drag to Upload Template'}</h3>
              <p>Only .docx files are supported</p>
              <input type="file" hidden onChange={handleFileUpload} accept=".docx" />
            </label>
          </motion.div>
        );
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="form-section"
          >
            <div className="section-title"><User /> Personal Information</div>
            <div className="input-row">
              <div className="input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.personalInfo.fullName}
                  onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="input-group">
                <label>Target Job Title</label>
                <input
                  type="text"
                  value={formData.personalInfo.jobTitle}
                  onChange={(e) => handleInputChange('personalInfo', 'jobTitle', e.target.value)}
                  placeholder="Software Engineer"
                />
              </div>
            </div>
            <div className="input-row">
              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.personalInfo.email}
                  onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              <div className="input-group">
                <label>Phone</label>
                <input
                  type="text"
                  value={formData.personalInfo.phone}
                  onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                  placeholder="+1 234 567 890"
                />
              </div>
            </div>
            <div className="input-group">
              <label>Executive Summary</label>
              <textarea
                rows="4"
                value={formData.summary}
                onChange={(e) => handleInputChange('summary', null, e.target.value)}
                placeholder="Briefly describe your professional background and goals..."
              />
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="form-section"
          >
            <div className="section-title"><GraduationCap /> Education</div>
            {formData.education.map((edu, index) => (
              <div key={index} className="repeater-item">
                {formData.education.length > 1 && (
                  <Trash2 className="remove-btn" size={20} onClick={() => removeItem('education', index)} />
                )}
                <div className="input-row">
                  <div className="input-group">
                    <label>School/University</label>
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) => handleInputChange('education', 'school', e.target.value, index)}
                    />
                  </div>
                  <div className="input-group">
                    <label>Degree</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleInputChange('education', 'degree', e.target.value, index)}
                    />
                  </div>
                </div>
                <div className="input-row" style={{ marginTop: '1rem' }}>
                  <div className="input-group">
                    <label>Year</label>
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => handleInputChange('education', 'year', e.target.value, index)}
                    />
                  </div>
                  <div className="input-group">
                    <label>Location</label>
                    <input
                      type="text"
                      value={edu.location}
                      onChange={(e) => handleInputChange('education', 'location', e.target.value, index)}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button className="btn btn-secondary" onClick={() => addItem('education')}>
              <Plus size={18} /> Add Education
            </button>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="form-section"
          >
            <div className="section-title"><Briefcase /> Work Experience</div>
            {formData.experience.map((exp, index) => (
              <div key={index} className="repeater-item">
                {formData.experience.length > 1 && (
                  <Trash2 className="remove-btn" size={20} onClick={() => removeItem('experience', index)} />
                )}
                <div className="input-row">
                  <div className="input-group">
                    <label>Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleInputChange('experience', 'company', e.target.value, index)}
                    />
                  </div>
                  <div className="input-group">
                    <label>Position</label>
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => handleInputChange('experience', 'position', e.target.value, index)}
                    />
                  </div>
                </div>
                <div className="input-group" style={{ marginTop: '1rem' }}>
                  <label>Duration & Responsibilities</label>
                  <textarea
                    rows="3"
                    value={exp.tasks}
                    onChange={(e) => handleInputChange('experience', 'tasks', e.target.value, index)}
                    placeholder="Describe your achievements..."
                  />
                </div>
              </div>
            ))}
            <button className="btn btn-secondary" onClick={() => addItem('experience')}>
              <Plus size={18} /> Add Experience
            </button>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="form-section"
          >
            <div className="section-title"><Wrench /> Skills & Attributes</div>
            <div className="input-group">
              <label>Technical Skills</label>
              <textarea
                rows="4"
                value={formData.skills}
                onChange={(e) => handleInputChange('skills', null, e.target.value)}
                placeholder="React, Node.js, Python, AWS..."
              />
            </div>
            <div className="input-group">
              <label>Personal Attributes</label>
              <textarea
                rows="4"
                value={formData.attributes}
                onChange={(e) => handleInputChange('attributes', null, e.target.value)}
                placeholder="Team player, resilient, problem solver..."
              />
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="form-section"
          >
            <div className="section-title"><Award /> Certificates</div>
            <div className="input-group">
              <label>Professional Certifications</label>
              <textarea
                rows="10"
                value={formData.certificates}
                onChange={(e) => handleInputChange('certificates', null, e.target.value)}
                placeholder="List your certifications, one per line..."
              />
            </div>
          </motion.div>
        );
      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="form-section"
          >
            <div className="section-title"><Users /> Referees</div>
            <div className="input-group">
              <label>Professional Referees</label>
              <textarea
                rows="10"
                value={formData.referees}
                onChange={(e) => handleInputChange('referees', null, e.target.value)}
                placeholder="Name, Position, Company, Contact Info..."
              />
            </div>
          </motion.div>
        );
      case 7:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="form-section"
          >
            <div className="section-title" style={{ justifyContent: 'center' }}>
              <FileText /> Review Your CV
            </div>

            <div className="preview-summary" style={{ textAlign: 'left', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', maxHeight: '400px', overflowY: 'auto' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: 'var(--primary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Personal Details</h4>
                <p><strong>Name:</strong> {formData.personalInfo?.fullName || 'Not provided'}</p>
                <p><strong>Job Title:</strong> {formData.personalInfo?.jobTitle || 'Not provided'}</p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: 'var(--primary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Professional Summary</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  {formData.summary ? (formData.summary.length > 200 ? formData.summary.substring(0, 200) + '...' : formData.summary) : 'No summary provided.'}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <h4 style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>Education</h4>
                  <p style={{ fontSize: '0.85rem' }}>{formData.education?.length || 0} items</p>
                </div>
                <div>
                  <h4 style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>Experience</h4>
                  <p style={{ fontSize: '0.85rem' }}>{formData.experience?.length || 0} items</p>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ color: 'var(--primary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Additional Info</h4>
                <p style={{ fontSize: '0.85rem' }}>Certificates: {formData.certificates ? '✅ Provided' : 'None'}</p>
                <p style={{ fontSize: '0.85rem' }}>Referees: {formData.referees ? '✅ Provided' : 'None'}</p>
              </div>

              <hr style={{ margin: '1.5rem 0', opacity: 0.1 }} />

              <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Template Selection</h4>
              <p style={{ fontSize: '0.9rem' }}>
                {template ? `✅ ${template.name}` : '⚠️ Please upload a template in Step 1'}
              </p>
            </div>

            <div className="input-row" style={{ justifyContent: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
              <button
                className={`btn ${format === 'docx' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => setFormat('docx')}
              >
                Word (.docx)
              </button>
              <button
                className={`btn ${format === 'pdf' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => setFormat('pdf')}
              >
                PDF (.pdf)
              </button>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '1.5rem', fontSize: '1.2rem' }}
              onClick={handleSubmit}
              disabled={isGenerating || !template}
            >
              {isGenerating ? 'Generating...' : <><Download /> Download CV Now</>}
            </button>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>CV Artisan</h1>
        <p>Craft your professional story with elegance and precision.</p>
      </header>

      <div className="step-indicator">
        {STEPS.map((step, index) => (
          <div
            key={step.id}
            className={`step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
            title={step.title}
            onClick={() => {
              if (index === 0 || template) {
                setCurrentStep(index);
              } else {
                alert('Please upload a template first!');
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            {step.icon}
          </div>
        ))}
      </div>

      <div className="glass-card">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        <div className="input-row" style={{ marginTop: '3rem', borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
          {currentStep > 0 ? (
            <button className="btn btn-secondary" onClick={() => setCurrentStep(prev => prev - 1)}>
              <ChevronLeft /> Previous
            </button>
          ) : (
            <button className="btn btn-secondary" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }} onClick={resetData}>
              <Trash2 size={18} /> Clear All Data
            </button>
          )}
          <div style={{ flex: 1 }}></div>
          {currentStep < 7 && (
            <button
              className="btn btn-primary"
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={currentStep === 0 && !template}
            >
              Next Step <ChevronRight />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
