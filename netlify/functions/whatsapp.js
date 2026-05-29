const twilio = require('twilio');

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Método no permitido' }) };
  }

  let data;
  try { data = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'JSON inválido' }) }; }

  const { nombre, email, telefono, servicio, mensaje } = data;

  const fecha = new Date().toLocaleString('es-CR', {
    timeZone: 'America/Costa_Rica',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const waMessage = [
    '🔔 *NUEVO CONTACTO — favs-dev*',
    '',
    `👤 *Nombre:* ${nombre}`,
    `📧 *Email:* ${email}`,
    telefono ? `📱 *WhatsApp:* ${telefono}` : '',
    `💼 *Servicio:* ${servicio || 'No especificado'}`,
    `📝 *Mensaje:* ${mensaje.length > 200 ? mensaje.slice(0, 200) + '...' : mensaje}`,
    '',
    `🕐 *Recibido:* ${fecha}`,
  ].filter(Boolean).join('\n');

  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to:   process.env.OWNER_WHATSAPP,
      body: waMessage,
    });
    console.log('[whatsapp] Mensaje enviado OK');
  } catch (err) {
    console.error('[whatsapp] Twilio error:', err.message);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }

  return {
    statusCode: 200,
    headers: CORS,
    body: JSON.stringify({ success: true }),
  };
};
