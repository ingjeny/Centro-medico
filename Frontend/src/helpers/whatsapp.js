/**
 * Limpia y normaliza el número de teléfono para WhatsApp.
 * Por defecto añade código de país 57 (Colombia) si el número empieza por 3 (10 dígitos).
 */
export function formatWhatsAppPhone(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return null;

  // Si ya tiene código de país (11 o más dígitos)
  if (digits.length >= 11) return digits;

  // Si es celular colombiano estándar de 10 dígitos (300..., 310..., etc.)
  if (digits.length === 10 && digits.startsWith('3')) {
    return `57${digits}`;
  }

  // Otros casos de 7 a 10 dígitos
  return digits.length === 10 ? `57${digits}` : digits;
}

/**
 * Genera el enlace de WhatsApp Web con un mensaje de recordatorio personalizado.
 */
export function buildWhatsAppReminderUrl(cita) {
  const phone = cita.paciente_telefono || cita.telefono;
  const cleanPhone = formatWhatsAppPhone(phone);
  if (!cleanPhone) return null;

  const pacienteNombre = cita.paciente_nombre || 'Estimado(a) paciente';
  const doctorNombre = cita.doctor_nombre ? `Dr(a). ${cita.doctor_nombre}` : 'el especialista';
  const fecha = cita.fecha || '';
  const hora = cita.hora ? cita.hora.slice(0, 5) : '';

  const mensaje = 
    `Hola ${pacienteNombre}, le recordamos su cita médica programada con ${doctorNombre} el día *${fecha}* a las *${hora}*.\n\n` +
    `Por favor responda a este mensaje confirmando su asistencia.\n` +
    `¡Le esperamos!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(mensaje)}`;
}
