const { Pool } = require("pg");

const pool = new Pool({
  host: "ep-round-cell-a1ty5qy1.ap-southeast-1.aws.neon.tech",
  user: "nus-tour_owner",
  password: "V0QKJlUHS6Am",
  database: "nus-tour",
  ssl: {
    rejectUnauthorized: false,
  },
});

async function checkTables() {
  try {
    // 查询所有表
    const tablesResult = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
    console.log("数据库表:");
    tablesResult.rows.forEach((row) => {
      console.log(`- ${row.tablename}`);
    });

    // 查看表结构
    for (const row of tablesResult.rows) {
      const tableName = row.tablename;
      try {
        const columnsResult = await pool.query(
          `
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = $1 
          ORDER BY ordinal_position
        `,
          [tableName],
        );

        console.log(`\n表 "${tableName}" 的结构:`);
        columnsResult.rows.forEach((col) => {
          console.log(`  - ${col.column_name} (${col.data_type})`);
        });
      } catch (err) {
        console.error(`获取表 "${tableName}" 结构时出错:`, err);
      }
    }
  } catch (err) {
    console.error("查询数据库出错:", err);
  } finally {
    pool.end();
  }
}

checkTables();
