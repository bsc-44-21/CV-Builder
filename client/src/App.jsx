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
    certificates: '',
    referees: '',
    attributes: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);

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
    const newItem = section === 'education'
      ? { school: '', degree: '', year: '', location: '' }
      : { company: '', position: '', duration: '', tasks: '' };
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
              Upload a .docx file with tags like {'{fullName}'}, {'{summary}'}, {'{#experience}'}{'{company}'}{'{/experience}'}, etc.
            </p>
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
            <div className="section-title"><Tool /> Skills & Others</div>
            <div className="input-group">
              <label>Technical Skills</label>
              <textarea
                rows="3"
                value={formData.skills}
                onChange={(e) => handleInputChange('skills', null, e.target.value)}
                placeholder="React, Node.js, Python, AWS..."
              />
            </div>
            <div className="input-group">
              <label>Personal Attributes</label>
              <textarea
                rows="2"
                value={formData.attributes}
                onChange={(e) => handleInputChange('attributes', null, e.target.value)}
                placeholder="Team player, resilient, problem solver..."
              />
            </div>
            <div className="input-row">
              <div className="input-group">
                <label>Certificates</label>
                <textarea
                  rows="3"
                  value={formData.certificates}
                  onChange={(e) => handleInputChange('certificates', null, e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Referees</label>
                <textarea
                  rows="3"
                  value={formData.referees}
                  onChange={(e) => handleInputChange('referees', null, e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="form-section"
            style={{ textAlign: 'center' }}
          >
            <div className="section-title" style={{ justifyContent: 'center' }}>
              <FileText /> Review & Download
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Everything looks good! Choose your preferred format and generate your professional CV.
            </p>
            <div className="input-row" style={{ justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
              <button
                className={`btn ${format === 'docx' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFormat('docx')}
              >
                Word Document (.docx)
              </button>
              <button
                className={`btn ${format === 'pdf' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFormat('pdf')}
              >
                PDF Document (.pdf)
              </button>
            </div>
            <button
              className="btn btn-primary"
              style={{ padding: '1.5rem 4rem', fontSize: '1.2rem', margin: '0 auto' }}
              onClick={handleSubmit}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : <><Download /> Generate My CV</>}
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
          {currentStep > 0 && (
            <button className="btn btn-secondary" onClick={() => setCurrentStep(prev => prev - 1)}>
              <ChevronLeft /> Previous
            </button>
          )}
          <div style={{ flex: 1 }}></div>
          {currentStep < 5 && currentStep > 0 && (
            <button className="btn btn-primary" onClick={() => setCurrentStep(prev => prev + 1)}>
              Next Step <ChevronRight />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
