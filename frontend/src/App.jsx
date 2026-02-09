import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API_URL = 'http://localhost:8000'

function App() {
  const [formData, setFormData] = useState({
    name: '',
    father_name: '',
    email: ''
  })
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/students`)
      setStudents(response.data)
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setMessage({ type: '', text: '' })
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Please enter student name' })
      return false
    }
    if (!formData.father_name.trim()) {
      setMessage({ type: 'error', text: 'Please enter father name' })
      return false
    }
    if (!formData.email.trim()) {
      setMessage({ type: 'error', text: 'Please enter email address' })
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' })
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      await axios.post(`${API_URL}/api/students`, formData)
      setMessage({ type: 'success', text: 'Student data saved successfully!' })
      setShowSuccess(true)
      setFormData({
        name: '',
        father_name: '',
        email: ''
      })
      fetchStudents()
      
      setTimeout(() => {
        setShowSuccess(false)
        setMessage({ type: '', text: '' })
      }, 3000)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Failed to save student data. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>Student Data Entry</h1>
          <p>Enter student information below</p>
        </header>

        <div className="form-container">
          <form onSubmit={handleSubmit} className="student-form">
            <div className="form-group">
              <label htmlFor="name">Student Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter student name"
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="father_name">Father Name *</label>
              <input
                type="text"
                id="father_name"
                name="father_name"
                value={formData.father_name}
                onChange={handleChange}
                placeholder="Enter father name"
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className="form-input"
                disabled={loading}
              />
            </div>

            {message.text && (
              <div className={`message ${message.type} ${showSuccess ? 'show' : ''}`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              <span>{loading ? 'Submitting...' : 'Submit'}</span>
            </button>
          </form>
        </div>

        <div className="students-list">
          <h2>Registered Students</h2>
          {students.length === 0 ? (
            <div className="empty-state">
              <p>No students registered yet. Submit the form above to add students.</p>
            </div>
          ) : (
            <div className="students-grid">
              {students.map((student) => (
                <div key={student.id} className="student-card">
                  <div className="student-info">
                    <h3>{student.name}</h3>
                    <p><strong>Father:</strong> {student.father_name}</p>
                    <p><strong>Email:</strong> {student.email}</p>
                    <p className="student-date">
                      {new Date(student.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
