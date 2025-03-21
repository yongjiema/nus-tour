const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const { Pool } = require('pg');
require('dotenv').config();
const app = express();
const PORT = 3456;

// 数据库连接参数
const dbConfig = {
  host: process.env.DB_HOST || 'ep-round-cell-a1ty5qy1.ap-southeast-1.aws.neon.tech',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'nus-tour_owner',
  password: process.env.DB_PASSWORD || 'V0QKJlUHS6Am',
  database: process.env.DB_NAME || 'nus-tour',
  ssl: {
    rejectUnauthorized: false
  }
};

// 启用CORS
app.use(cors());
app.use(express.json());

// 创建数据库连接池
const pool = new Pool(dbConfig);

// 测试数据库连接
pool.connect((err, client, release) => {
  if (err) {
    return console.error("Error acquiring client", err.stack);
  }
  console.log("数据库连接成功");
  release();
});

// 获取新闻数据
async function fetchNews() {
  try {
    console.log("开始获取新闻数据...");
    const response = await axios.get('https://www.nus.edu.sg/news');
    const $ = cheerio.load(response.data);
    const news = [];

    $(".news-item").each((i, element) => {
      const title = $(element).find(".news-title").text().trim();
      const link = $(element).find("a").attr("href");
      const date = $(element).find(".news-date").text().trim();
      const image = $(element).find("img").attr("src");

      if (title && link) {
        news.push({
          title,
          link: link.startsWith("http") ? link : `https://www.nus.edu.sg${link}`,
          date,
          image: image || null,
        });
      }
    });

    console.log(`获取到 ${news.length} 条新闻`);
    return news;
  } catch (error) {
    console.error("获取新闻失败:", error);
    return [];
  }
}

// 获取活动数据
async function fetchEvents() {
  try {
    console.log("开始获取活动数据...");
    const response = await axios.get('https://www.nus.edu.sg/events');
    const $ = cheerio.load(response.data);
    const events = [];

    $(".event-item").each((i, element) => {
      const title = $(element).find(".event-title").text().trim();
      const link = $(element).find("a").attr("href");
      const date = $(element).find(".event-date").text().trim();
      const location = $(element).find(".event-location").text().trim();

      if (title && link) {
        events.push({
          title,
          link: link.startsWith("http") ? link : `https://www.nus.edu.sg${link}`,
          date,
          location,
        });
      }
    });

    console.log(`获取到 ${events.length} 条活动`);
    return events;
  } catch (error) {
    console.error("获取活动失败:", error);
    return [];
  }
}

// 更新数据库中的新闻数据
async function updateNewsInDB(news) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 清空现有新闻数据
    await client.query("DELETE FROM news");

    // 插入新的新闻数据
    for (const item of news) {
      await client.query(
        "INSERT INTO news (title, link, date, image) VALUES ($1, $2, $3, $4)",
        [item.title, item.link, item.date, item.image]
      );
    }

    await client.query("COMMIT");
    console.log("新闻数据更新成功");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("更新新闻数据失败:", error);
  } finally {
    client.release();
  }
}

// 更新数据库中的活动数据
async function updateEventsInDB(events) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 清空现有活动数据
    await client.query("DELETE FROM events");

    // 插入新的活动数据
    for (const item of events) {
      await client.query(
        "INSERT INTO events (title, link, date, location) VALUES ($1, $2, $3, $4)",
        [item.title, item.link, item.date, item.location]
      );
    }

    await client.query("COMMIT");
    console.log("活动数据更新成功");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("更新活动数据失败:", error);
  } finally {
    client.release();
  }
}

// 定时更新函数
async function scheduledUpdate() {
  console.log("开始定时更新数据...");
  const news = await fetchNews();
  const events = await fetchEvents();
  
  await updateNewsInDB(news);
  await updateEventsInDB(events);
  
  console.log("定时更新完成");
}

// 设置定时任务，每30分钟执行一次
setInterval(scheduledUpdate, 30 * 60 * 1000);

// 启动时立即执行一次更新
scheduledUpdate();

// API路由
app.get('/news', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM news ORDER BY date DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("获取新闻失败:", error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

app.get('/events', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM events ORDER BY date DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("获取活动失败:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
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

// 获取旅游信息数据
app.get('/tourinformation', async (req, res) => {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    
    // 查询数据库获取所有旅游信息
    const query = `
      SELECT * FROM tour_information ORDER BY id
    `;
    const { rows } = await client.query(query);
    
    // 格式化响应以符合refine格式
    res.json({
      data: rows,
      total: rows.length,
      pageCount: 1,
      page: 1,
      perPage: 10,
    });
  } catch (error) {
    console.error('Error fetching tour information:', error);
    res.status(500).json({ error: 'Failed to fetch tour information' });
  }
});

// 新增API端点：测试服务器是否正常运行
app.get('/api/test', (req, res) => {
  res.json({ message: '服务器正常运行', time: new Date().toISOString() });
});

// 新增API端点：获取最新新闻
app.get('/api/news-events/news', async (req, res) => {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('连接到数据库成功，开始获取新闻数据');
    
    // 获取最新的5条新闻
    const query = `
      SELECT * FROM news_event 
      WHERE type = 'news' 
      ORDER BY date DESC 
      LIMIT 5
    `;
    const { rows } = await client.query(query);
    
    console.log('查询到新闻数据:', rows.length, '条');
    
    await client.end();
    
    res.json(rows);
  } catch (error) {
    console.error('获取最新新闻失败:', error);
    res.status(500).json({ error: '获取最新新闻失败' });
  }
});

// 新增API端点：获取最新活动
app.get('/api/news-events/events', async (req, res) => {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('连接到数据库成功，开始获取活动数据');
    
    // 获取最新的5个活动
    const query = `
      SELECT * FROM news_event 
      WHERE type = 'event' 
      ORDER BY date DESC 
      LIMIT 5
    `;
    const { rows } = await client.query(query);
    
    console.log('查询到活动数据:', rows.length, '条');
    
    await client.end();
    
    res.json(rows);
  } catch (error) {
    console.error('获取最新活动失败:', error);
    res.status(500).json({ error: '获取最新活动失败' });
  }
});

// 更新旅游信息数据
app.put('/tourinformation/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const client = new Client(dbConfig);
  
  // 生成SET子句，排除不应该更新的字段
  const excludedFields = ['id', 'createdAt'];
  const setClause = Object.keys(updateData)
    .filter(key => !excludedFields.includes(key))
    .map(key => `"${key}" = $${Object.keys(updateData).indexOf(key) + 2}`)
    .join(', ');
  
  if (!setClause) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }
  
  try {
    await client.connect();
    
    // 更新数据并添加更新时间戳
    const query = `
      UPDATE tour_information 
      SET ${setClause}, "updatedAt" = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const values = [id, ...Object.keys(updateData)
      .filter(key => !excludedFields.includes(key))
      .map(key => updateData[key])];
    
    const { rows } = await client.query(query, values);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tour information not found' });
    }
    
    res.json({
      data: rows[0]
    });
  } catch (error) {
    console.error('Error updating tour information:', error);
    res.status(500).json({ error: 'Failed to update tour information' });
  } finally {
    await client.end();
  }
});

// 临时路由: 手动触发抓取新闻和活动
app.get('/api/fetch-news-events', async (req, res) => {
  try {
    const axios = require('axios');
    const cheerio = require('cheerio');
    const client = new Client(dbConfig);
    await client.connect();
    
    console.log('开始抓取新闻和活动');
    
    // 抓取最新的5条新闻
    const newsResponse = await axios.get('https://news.nus.edu.sg/');
    const newsHtml = cheerio.load(newsResponse.data);
    const newsItems = [];
    
    // 解析新闻数据
    newsHtml('article.post').slice(0, 5).each((index, element) => {
      const headline = newsHtml(element).find('h2.entry-title a').text().trim();
      const link = newsHtml(element).find('h2.entry-title a').attr('href');
      
      // 获取日期
      let dateText = newsHtml(element).find('.entry-meta .posted-on time').attr('datetime');
      if (!dateText) {
        dateText = newsHtml(element).find('.entry-meta .posted-on').text().trim();
      }
      const date = dateText ? new Date(dateText) : new Date();
      
      if (headline && link) {
        newsItems.push({
          type: 'news',
          date,
          headline,
          link
        });
      }
    });
    
    // 抓取最新的5个活动
    const eventsResponse = await axios.get('https://osa.nus.edu.sg/events/');
    const eventsHtml = cheerio.load(eventsResponse.data);
    const eventItems = [];
    
    // 解析活动数据
    eventsHtml('.event-item, .events-listing .event').slice(0, 5).each((index, element) => {
      const headline = eventsHtml(element).find('h3, .event-title').text().trim();
      let link = eventsHtml(element).find('a').attr('href');
      
      // 获取日期
      let dateText = eventsHtml(element).find('.event-date, .date').text().trim();
      let date = new Date();
      if (dateText) {
        try {
          date = new Date(dateText);
        } catch (e) {
          console.warn(`无法解析日期: ${dateText}`);
        }
      }
      
      if (headline && link) {
        if (!link.startsWith('http')) {
          link = `https://osa.nus.edu.sg${link.startsWith('/') ? '' : '/'}${link}`;
        }
        eventItems.push({
          type: 'event',
          date,
          headline,
          link
        });
      }
    });
    
    // 保存到 news_event 表
    try {
      // 清除旧数据
      await client.query('DELETE FROM news_event');
      
      // 保存新闻
      for (const item of newsItems) {
        await client.query(
          'INSERT INTO news_event (type, date, headline, link, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW())',
          [item.type, item.date, item.headline, item.link]
        );
      }
      
      // 保存活动
      for (const item of eventItems) {
        await client.query(
          'INSERT INTO news_event (type, date, headline, link, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW())',
          [item.type, item.date, item.headline, item.link]
        );
      }
      
      console.log('新闻和活动保存到 news_event 表成功');
    } catch (dbError) {
      console.error('保存到 news_event 表时出错:', dbError);
    }
    
    await client.end();
    
    // 返回结果
    res.json({
      success: true,
      message: '成功抓取新闻和活动',
      data: {
        news: newsItems,
        events: eventItems
      }
    });
  } catch (error) {
    console.error('抓取新闻和活动出错:', error);
    res.status(500).json({
      success: false,
      message: '抓取新闻和活动时出错',
      error: error.message
    });
  }
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`临时服务器运行在 http://localhost:${PORT}`);
}); 