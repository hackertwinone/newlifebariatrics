import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const res = await axios.post(`${BASE_URL}/token/refresh/`, { refresh })
          const newAccess = res.data.access
          localStorage.setItem('access_token', newAccess)
          original.headers.Authorization = `Bearer ${newAccess}`
          return api(original)
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      } else {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const pacientesApi = {
  listar: (params) => api.get('/pacientes/', { params }),
  obtener: (id) => api.get(`/pacientes/${id}/`),
  crear: (data) => api.post('/pacientes/', data),
  actualizar: (id, data) => api.put(`/pacientes/${id}/`, data),
  eliminar: (id) => api.delete(`/pacientes/${id}/`),
}

export const segurosApi = {
  listar: (pacienteId) => api.get('/seguros/', { params: { paciente: pacienteId } }),
  crear: (data) => api.post('/seguros/', data),
  actualizar: (id, data) => api.put(`/seguros/${id}/`, data),
  eliminar: (id) => api.delete(`/seguros/${id}/`),
}

export const hospitalizacionesApi = {
  listar: (pacienteId) => api.get('/hospitalizaciones/', { params: { paciente: pacienteId } }),
  crear: (data) => api.post('/hospitalizaciones/', data),
  actualizar: (id, data) => api.put(`/hospitalizaciones/${id}/`, data),
  eliminar: (id) => api.delete(`/hospitalizaciones/${id}/`),
}

export const recetasApi = {
  listar: (pacienteId) => api.get('/recetas/', { params: { paciente: pacienteId } }),
  crear: (data) => api.post('/recetas/', data),
  eliminar: (id) => api.delete(`/recetas/${id}/`),
  pdf: (id) => api.get(`/recetas/${id}/pdf/`, { responseType: 'blob' }),
}

export default api
