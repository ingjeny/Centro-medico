/**
 * Retorna el consultorio_id del usuario si NO es admin.
 * Admin (consultorio_id === null) puede ver todo.
 */
const getScope = (user) => (user.rol === 'admin' ? null : user.consultorio_id);

/**
 * Devuelve un fragmento SQL y valores para filtrar por consultorio cuando aplica.
 * @param {object} user  - req.user del JWT
 * @param {string} alias - alias de tabla, ej: 'c' → 'c.consultorio_id'
 * @param {Array}  vals  - array de valores al que se le hace push si aplica
 * @returns {string} fragmento SQL " AND alias.consultorio_id = ?" o ""
 */
const scopeWhere = (user, alias, vals) => {
  const cid = getScope(user);
  if (cid === null) return '';
  vals.push(cid);
  return ` AND ${alias}.consultorio_id = ?`;
};

const scopeWhereFirst = (user, alias, vals) => {
  const cid = getScope(user);
  if (cid === null) return 'WHERE 1=1';
  vals.push(cid);
  return `WHERE ${alias}.consultorio_id = ?`;
};

module.exports = { getScope, scopeWhere, scopeWhereFirst };
