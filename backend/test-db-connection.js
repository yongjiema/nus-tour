const { Client } = require("pg");

// 连接参数
const client = new Client({
  host: "ep-round-cell-a1ty5qy1.ap-southeast-1.aws.neon.tech",
  port: 5432,
  user: "nus-tour_owner",
  password: "V0QKJlUHS6Am",
  database: "nus-tour",
  ssl: {
    rejectUnauthorized: false,
  },
});

async function testConnection() {
  try {
    console.log("正在连接到数据库...");
    await client.connect();
    console.log("连接成功！");

    const result = await client.query("SELECT NOW() as time");
    console.log("当前数据库时间：", result.rows[0].time);

    await client.end();
    console.log("连接已关闭");
  } catch (err) {
    console.error("连接错误:", err);
  }
}

testConnection();
