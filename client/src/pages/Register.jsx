import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { registerUser } from '../services/api'

// registracijos komponentas
export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // formos lauku keitimo valdymas
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    // istrinu klaidos pranesima kai vartotojas pradeda rasyti
    if (error) setError('')
  }

  // formos pateikimo valdymas
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // validacija
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('visi laukai yra privalomi')
      setLoading(false)
      return
    }

    if (form.password.length < 6) {
      setError('slaptažodis turi būti bent 6 simboliu')
      setLoading(false)
      return
    }

    try {
      await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password
      })
      
      alert('registracija sėkminga! dabar galite prisijungti')
      navigate('/login')
    } catch (err) {
      console.error('registracijos klaida:', err)
      setError(err.response?.data?.error || 'registracija nepavyko')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Registracija</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <input 
          type="text" 
          name="name" 
          value={form.name} 
          onChange={handleChange} 
          placeholder="vardas ir pavardė" 
          required 
          disabled={loading}
        />
        
        <input 
          type="email" 
          name="email" 
          value={form.email} 
          onChange={handleChange} 
          placeholder="el. paštas" 
          required 
          disabled={loading}
        />
        
        <input 
          type="password" 
          name="password" 
          value={form.password} 
          onChange={handleChange} 
          placeholder="slaptažodis (min. 6 simboliai)" 
          required 
          disabled={loading}
          minLength={6}
        />
        
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'registruojama...' : 'registruotis'}
        </button>
        
        <p className="auth-switch">
          Jau Turite Paskyrą? <a href="/login">Prisijungti</a>
        </p>
      </form>
    </div>
  )
}
