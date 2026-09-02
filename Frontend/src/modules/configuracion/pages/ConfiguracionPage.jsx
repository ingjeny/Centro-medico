import { useState, useRef, useEffect } from 'react';
import api from '../../../api/axios';
import useAuthStore from '../../../store/authStore';
import styles from './ConfiguracionPage.module.css';

const BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : '';

export default function ConfiguracionPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.rol === 'admin';
  const isDoctor = user?.rol === 'doctor' || user?.rol === 'admin';

  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoStatus, setLogoStatus] = useState('');

  const [firmaPreview, setFirmaPreview] = useState(null);
  const [firmaFile, setFirmaFile] = useState(null);
  const [firmaStatus, setFirmaStatus] = useState('');

  const logoRef = useRef();
  const firmaRef = useRef();

  useEffect(() => {
    // Cargar logo actual
    api.get('/config/logo').then(r => {
      if (r.data.logo_path) setLogoPreview(`${BASE ? BASE + '/' : '/'}${r.data.logo_path.replace(/^\/+/, '')}`);
    }).catch(() => {});

    // Cargar firma actual del usuario
    if (isDoctor) {
      api.get('/usuarios/me').then(r => {
        if (r.data.firma_path) setFirmaPreview(`${BASE ? BASE + '/' : '/'}${r.data.firma_path.replace(/^\/+/, '')}`);
      }).catch(() => {});
    }
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleFirmaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFirmaFile(file);
    setFirmaPreview(URL.createObjectURL(file));
  };

  const uploadLogo = async () => {
    if (!logoFile) return;
    const fd = new FormData();
    fd.append('logo', logoFile);
    try {
      setLogoStatus('Subiendo...');
      await api.post('/config/logo', fd);
      setLogoStatus('Logo actualizado correctamente');
      setLogoFile(null);
    } catch (err) {
      setLogoStatus(err.response?.data?.message || 'Error al subir el logo');
    }
  };

  const uploadFirma = async () => {
    if (!firmaFile) return;
    const fd = new FormData();
    fd.append('firma', firmaFile);
    try {
      setFirmaStatus('Subiendo...');
      await api.post('/usuarios/me/firma', fd);
      setFirmaStatus('Firma actualizada correctamente');
      setFirmaFile(null);
    } catch (err) {
      setFirmaStatus(err.response?.data?.message || 'Error al subir la firma');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Configuración</h1>
        <p className={styles.sub}>Personaliza los documentos generados por el sistema</p>
      </div>

      <div className={styles.grid}>

        {/* Logo del consultorio */}
        {isAdmin && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="3"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
              </div>
              <div>
                <h2 className={styles.cardTitle}>Logo del consultorio</h2>
                <p className={styles.cardDesc}>Aparecerá en el encabezado de todos los PDF generados</p>
              </div>
            </div>

            <div className={styles.previewArea} onClick={() => logoRef.current.click()}>
              {logoPreview
                ? <img src={logoPreview} alt="Logo" className={styles.preview} />
                : (
                  <div className={styles.placeholder}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17,8 12,3 7,8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span>Haz clic para seleccionar una imagen</span>
                    <small>JPG o PNG · Máx. 3 MB</small>
                  </div>
                )
              }
            </div>
            <input ref={logoRef} type="file" accept=".jpg,.jpeg,.png" onChange={handleLogoChange} hidden />

            {logoFile && (
              <div className={styles.actions}>
                <button className={styles.btnPrimary} onClick={uploadLogo}>Guardar logo</button>
                <button className={styles.btnGhost} onClick={() => { setLogoFile(null); logoRef.current.value=''; }}>Cancelar</button>
              </div>
            )}
            {logoStatus && <p className={`${styles.status} ${logoStatus.includes('Error') ? styles.error : styles.success}`}>{logoStatus}</p>}
          </div>
        )}

        {/* Firma electrónica */}
        {isDoctor && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
              <div>
                <h2 className={styles.cardTitle}>Firma electrónica</h2>
                <p className={styles.cardDesc}>Tu firma aparecerá en las historias clínicas e incapacidades</p>
              </div>
            </div>

            <div className={styles.previewArea} onClick={() => firmaRef.current.click()}>
              {firmaPreview
                ? <img src={firmaPreview} alt="Firma" className={styles.previewFirma} />
                : (
                  <div className={styles.placeholder}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17,8 12,3 7,8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span>Haz clic para seleccionar tu firma</span>
                    <small>JPG o PNG con fondo transparente o blanco · Máx. 2 MB</small>
                  </div>
                )
              }
            </div>
            <input ref={firmaRef} type="file" accept=".jpg,.jpeg,.png" onChange={handleFirmaChange} hidden />

            {firmaFile && (
              <div className={styles.actions}>
                <button className={styles.btnPrimary} onClick={uploadFirma}>Guardar firma</button>
                <button className={styles.btnGhost} onClick={() => { setFirmaFile(null); firmaRef.current.value=''; }}>Cancelar</button>
              </div>
            )}
            {firmaStatus && <p className={`${styles.status} ${firmaStatus.includes('Error') ? styles.error : styles.success}`}>{firmaStatus}</p>}
          </div>
        )}

      </div>

      <div className={styles.infoBox}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <div>
          <strong>¿Cómo se usan estas imágenes?</strong>
          <p>El logo aparece en el encabezado de todos los documentos PDF. La firma electrónica aparece en el área de firma de las historias clínicas y certificados de incapacidad generados por el doctor.</p>
        </div>
      </div>
    </div>
  );
}
