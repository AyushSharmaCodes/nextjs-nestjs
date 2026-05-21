const { Pool } = require('pg');
const { Logger } = require('@nestjs/common');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const logger = new Logger('QueryRoles');

async function main() {
  logger.log('Querying database user roles...');
  const res = await pool.query(`
    SELECT u.id, u.email, r.name as role 
    FROM "user" u 
    LEFT JOIN user_roles ur ON u.id = ur."userId" 
    LEFT JOIN roles r ON ur.role_id = r.id;
  `);
  logger.log('Users: ' + JSON.stringify(res.rows, null, 2));
}

main()
  .catch((e) => {
    logger.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
