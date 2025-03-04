const express = require('express');
const { Client } = require('pg');
const app = express();
const PORT = 3000;

// 数据库连接参数
const dbConfig = {
  host: 'ep-round-cell-a1ty5qy1.ap-southeast-1.aws.neon.tech',
  port: 5432,
  user: 'nus-tour_owner',
  password: 'V0QKJlUHS6Am',
  database: 'nus-tour',
  ssl: {
    rejectUnauthorized: false
  }
};

app.use(express.json());

// 启用CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// 根路径
app.get('/', (req, res) => {
  res.send('NUS Tour Backend 临时服务器');
});

// 测试数据库连接的API
app.get('/api/db-test', async (req, res) => {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    const result = await client.query('SELECT NOW() as time');
    await client.end();
    
    res.json({
      success: true,
      message: '数据库连接成功',
      time: result.rows[0].time
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: '数据库连接失败',
      error: err.message
    });
  }
});

// Information API
app.get('/information', async (req, res) => {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    const result = await client.query('SELECT * FROM information ORDER BY "order" ASC');
    await client.end();
    
    res.json(result.rows);
  } catch (err) {
    console.error('获取信息失败:', err);
    res.status(500).json({
      success: false,
      message: '获取信息失败',
      error: err.message
    });
  }
});

// Information API - 支持分页
app.get('/information', async (req, res) => {
  const client = new Client(dbConfig);
  const page = parseInt(req.query.page) || 1;
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 10;
  
  try {
    await client.connect();
    
    // 获取总记录数
    const countResult = await client.query('SELECT COUNT(*) FROM information');
    const total = parseInt(countResult.rows[0].count);
    
    // 获取分页数据
    const result = await client.query(
      'SELECT * FROM information ORDER BY "order" ASC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    
    await client.end();
    
    // 修改为 NestJS 风格的响应
    res.json({
      data: result.rows,
      total,
      // 兼容 NestJS 的分页信息
      pageCount: Math.ceil(total / limit),
      page,
      perPage: limit
    });
  } catch (err) {
    console.error('获取信息失败:', err);
    res.status(500).json({
      success: false,
      message: '获取信息失败',
      error: err.message
    });
  }
});

// TourInformation API - 获取旅游信息
app.get('/tourInformation', async (req, res) => {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    
    // 获取旅游信息数据
    const result = await client.query('SELECT * FROM tour_information');
    await client.end();
    
    // 返回 NestJS 风格的响应
    res.json({
      data: result.rows,
      total: result.rows.length,
      pageCount: 1,
      page: 1,
      perPage: result.rows.length
    });
  } catch (err) {
    console.error('获取旅游信息失败:', err);
    res.status(500).json({
      success: false,
      message: '获取旅游信息失败',
      error: err.message
    });
  }
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`临时服务器运行在 http://localhost:${PORT}`);
}); 