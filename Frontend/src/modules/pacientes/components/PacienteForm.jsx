import { useState } from 'react';
import styles from './PacienteForm.module.css';

const empty = {
  cedula: '', nombre: '', apellido: '', fecha_nacimiento: '', sexo: '',
  telefono: '', email: '', direccion: '', tipo_sangre: '', alergias: '', antecedentes: '',
};

export default function PacienteForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({ ...empty, ...initial });

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.grid2}>
        <div className={styles.field}>
          <label>Cédula *</label>
          <input name="cedula" value={form.cedula} onChange={set} required />
        </div>
        <div className={styles.field}>
          <label>Sexo</label>
          <select name="sexo" value={form.sexo} onChange={set}>
            <option value="">Seleccionar</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
      </div>

      <div className={styles.grid2}>
        <div className={styles.field}>
          <label>Nombre *</label>
          <input name="nombre" value={form.nombre} onChange={set} required />
        </div>
        <div className={styles.field}>
          <label>Apellido *</label>
          <input name="apellido" value={form.apellido} onChange={set} required />
        </div>
      </div>

      <div className={styles.grid2}>
        <div className={styles.field}>
          <label>Fecha de nacimiento</label>
          <input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento?.slice(0,10) || ''} onChange={set} />
        </div>
        <div className={styles.field}>
          <label>Tipo de sangre</label>
          <select name="tipo_sangre" value={form.tipo_sangre} onChange={set}>
            <option value="">Seleccionar</option>
            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className={styles.grid2}>
        <div className={styles.field}>
          <label>Teléfono</label>
          <input name="telefono" value={form.telefono} onChange={set} />
        </div>
        <div className={styles.field}>
          <label>Correo electrónico</label>
          <input type="email" name="email" value={form.email} onChange={set} />
        </div>
      </div>

      <div className={styles.field}>
        <label>Dirección</label>
        <input name="direccion" value={form.direccion} onChange={set} />
      </div>

      <div className={styles.field}>
        <label>Alergias</label>
        <textarea name="alergias" value={form.alergias} onChange={set} rows={2} />
      </div>

      <div className={styles.field}>
        <label>Antecedentes médicos</label>
        <textarea name="antecedentes" value={form.antecedentes} onChange={set} rows={3} />
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.btnCancel} onClick={onCancel}>Cancelar</button>
        <button type="submit" className={styles.btnSave} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
