const express = require("express");
const { Client } = require("pg");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const app = express();
const PORT = 3000;

// 数据库连接参数
const dbConfig = {
  host: process.env.DB_HOST || "ep-round-cell-a1ty5qy1.ap-southeast-1.aws.neon.tech",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "nus-tour_owner",
  password: process.env.DB_PASSWORD || "V0QKJlUHS6Am",
  database: process.env.DB_NAME || "nus-tour",
  ssl: {
    rejectUnauthorized: false,
  },
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
    const response = await axios.get("https://www.nus.edu.sg/news");
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
    const response = await axios.get("https://www.nus.edu.sg/events");
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
      await client.query("INSERT INTO news (title, link, date, image) VALUES ($1, $2, $3, $4)", [
        item.title,
        item.link,
        item.date,
        item.image,
      ]);
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
      await client.query("INSERT INTO events (title, link, date, location) VALUES ($1, $2, $3, $4)", [
        item.title,
        item.link,
        item.date,
        item.location,
      ]);
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
app.get("/news", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM news ORDER BY date DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("获取新闻失败:", error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

app.get("/events", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM events ORDER BY date DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("获取活动失败:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// 根路径
app.get("/", (req, res) => {
  res.send("NUS Tour Backend Server");
});

// 测试数据库连接的API
app.get("/api/db-test", async (req, res) => {
  const client = new Client(dbConfig);

  try {
    await client.connect();
    const result = await client.query("SELECT NOW() as time");
    await client.end();

    res.json({
      success: true,
      message: "数据库连接成功",
      time: result.rows[0].time,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "数据库连接失败",
      error: err.message,
    });
  }
});

// Information API
app.get("/information", async (req, res) => {
  const client = new Client(dbConfig);

  try {
    await client.connect();
    const result = await client.query('SELECT * FROM information ORDER BY "order" ASC');
    await client.end();

    res.json(result.rows);
  } catch (err) {
    console.error("获取信息失败:", err);
    res.status(500).json({
      success: false,
      message: "获取信息失败",
      error: err.message,
    });
  }
});

// Information API - 支持分页
app.get("/information", async (req, res) => {
  const client = new Client(dbConfig);
  const page = parseInt(req.query.page) || 1;
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 10;

  try {
    await client.connect();

    // 获取总记录数
    const countResult = await client.query("SELECT COUNT(*) FROM information");
    const total = parseInt(countResult.rows[0].count);

    // 获取分页数据
    const result = await client.query('SELECT * FROM information ORDER BY "order" ASC LIMIT $1 OFFSET $2', [
      limit,
      offset,
    ]);

    await client.end();

    // 修改为 NestJS 风格的响应
    res.json({
      data: result.rows,
      total,
      // 兼容 NestJS 的分页信息
      pageCount: Math.ceil(total / limit),
      page,
      perPage: limit,
    });
  } catch (err) {
    console.error("获取信息失败:", err);
    res.status(500).json({
      success: false,
      message: "获取信息失败",
      error: err.message,
    });
  }
});

// TourInformation API - 获取旅游信息
app.get("/tourInformation", async (req, res) => {
  const client = new Client(dbConfig);

  try {
    await client.connect();

    // 获取旅游信息数据
    const result = await client.query("SELECT * FROM tour_information");
    await client.end();

    // 返回 NestJS 风格的响应
    res.json({
      data: result.rows,
      total: result.rows.length,
      pageCount: 1,
      page: 1,
      perPage: result.rows.length,
    });
  } catch (err) {
    console.error("获取旅游信息失败:", err);
    res.status(500).json({
      success: false,
      message: "获取旅游信息失败",
      error: err.message,
    });
  }
});

// 获取旅游信息数据
app.get("/tourinformation", async (req, res) => {
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
    console.error("Error fetching tour information:", error);
    res.status(500).json({ error: "Failed to fetch tour information" });
  }
});

// 新增API端点：测试服务器是否正常运行
app.get("/api/test", (req, res) => {
  res.json({ message: "服务器正常运行", time: new Date().toISOString() });
});

// 新增API端点：获取最新新闻
app.get("/api/news-events/news", async (req, res) => {
  const client = new Client(dbConfig);

  try {
    await client.connect();
    console.log("连接到数据库成功，开始获取新闻数据");

    // 获取最新的5条新闻
    const query = `
      SELECT * FROM news_event 
      WHERE type = 'news' 
      ORDER BY date DESC 
      LIMIT 5
    `;
    const { rows } = await client.query(query);

    console.log("查询到新闻数据:", rows.length, "条");

    await client.end();

    res.json(rows);
  } catch (error) {
    console.error("获取最新新闻失败:", error);
    res.status(500).json({ error: "获取最新新闻失败" });
  }
});

// 新增API端点：获取最新活动
app.get("/api/news-events/events", async (req, res) => {
  const client = new Client(dbConfig);

  try {
    await client.connect();
    console.log("连接到数据库成功，开始获取活动数据");

    // 获取最新的5个活动
    const query = `
      SELECT * FROM news_event 
      WHERE type = 'event' 
      ORDER BY date DESC 
      LIMIT 5
    `;
    const { rows } = await client.query(query);

    console.log("查询到活动数据:", rows.length, "条");

    await client.end();

    res.json(rows);
  } catch (error) {
    console.error("获取最新活动失败:", error);
    res.status(500).json({ error: "获取最新活动失败" });
  }
});

// 更新旅游信息数据
app.put("/tourinformation/:id", async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const client = new Client(dbConfig);

  // 生成SET子句，排除不应该更新的字段
  const excludedFields = ["id", "createdAt"];
  const setClause = Object.keys(updateData)
    .filter((key) => !excludedFields.includes(key))
    .map((key) => `"${key}" = $${Object.keys(updateData).indexOf(key) + 2}`)
    .join(", ");

  if (!setClause) {
    return res.status(400).json({ error: "No valid fields to update" });
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

    const values = [
      id,
      ...Object.keys(updateData)
        .filter((key) => !excludedFields.includes(key))
        .map((key) => updateData[key]),
    ];

    const { rows } = await client.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Tour information not found" });
    }

    res.json({
      data: rows[0],
    });
  } catch (error) {
    console.error("Error updating tour information:", error);
    res.status(500).json({ error: "Failed to update tour information" });
  } finally {
    await client.end();
  }
});

// 临时路由: 手动触发抓取新闻和活动
app.get("/api/fetch-news-events", async (req, res) => {
  try {
    const axios = require("axios");
    const cheerio = require("cheerio");
    const client = new Client(dbConfig);
    await client.connect();

    console.log("开始抓取新闻和活动");

    // 抓取最新的5条新闻
    const newsResponse = await axios.get("https://news.nus.edu.sg/");
    const newsHtml = cheerio.load(newsResponse.data);
    const newsItems = [];

    // 解析新闻数据
    newsHtml("article.post")
      .slice(0, 5)
      .each((index, element) => {
        const headline = newsHtml(element).find("h2.entry-title a").text().trim();
        const link = newsHtml(element).find("h2.entry-title a").attr("href");

        // 获取日期
        let dateText = newsHtml(element).find(".entry-meta .posted-on time").attr("datetime");
        if (!dateText) {
          dateText = newsHtml(element).find(".entry-meta .posted-on").text().trim();
        }
        const date = dateText ? new Date(dateText) : new Date();

        if (headline && link) {
          newsItems.push({
            type: "news",
            date,
            headline,
            link,
          });
        }
      });

    // 抓取最新的5个活动
    const eventsResponse = await axios.get("https://osa.nus.edu.sg/events/");
    const eventsHtml = cheerio.load(eventsResponse.data);
    const eventItems = [];

    // 解析活动数据
    eventsHtml(".event-item, .events-listing .event")
      .slice(0, 5)
      .each((index, element) => {
        const headline = eventsHtml(element).find("h3, .event-title").text().trim();
        let link = eventsHtml(element).find("a").attr("href");

        // 获取日期
        let dateText = eventsHtml(element).find(".event-date, .date").text().trim();
        let date = new Date();
        if (dateText) {
          try {
            date = new Date(dateText);
          } catch (e) {
            console.warn(`无法解析日期: ${dateText}`);
          }
        }

        if (headline && link) {
          if (!link.startsWith("http")) {
            link = `https://osa.nus.edu.sg${link.startsWith("/") ? "" : "/"}${link}`;
          }
          eventItems.push({
            type: "event",
            date,
            headline,
            link,
          });
        }
      });

    // 保存到 news_event 表
    try {
      // 清除旧数据
      await client.query("DELETE FROM news_event");

      // 保存新闻
      for (const item of newsItems) {
        await client.query(
          'INSERT INTO news_event (type, date, headline, link, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW())',
          [item.type, item.date, item.headline, item.link],
        );
      }

      // 保存活动
      for (const item of eventItems) {
        await client.query(
          'INSERT INTO news_event (type, date, headline, link, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW())',
          [item.type, item.date, item.headline, item.link],
        );
      }

      console.log("新闻和活动保存到 news_event 表成功");
    } catch (dbError) {
      console.error("保存到 news_event 表时出错:", dbError);
    }

    await client.end();

    // 返回结果
    res.json({
      success: true,
      message: "成功抓取新闻和活动",
      data: {
        news: newsItems,
        events: eventItems,
      },
    });
  } catch (error) {
    console.error("抓取新闻和活动出错:", error);
    res.status(500).json({
      success: false,
      message: "抓取新闻和活动时出错",
      error: error.message,
    });
  }
});

// 认证相关路由
app.post("/auth/register", async (req, res) => {
  console.log("收到注册请求:", { ...req.body, password: "[REDACTED]" });

  const { username, email, password } = req.body;

  // 验证必需字段
  if (!username || !email || !password) {
    const error = {
      message: "Missing required fields",
      details: {
        username: !username ? "Username is required" : null,
        email: !email ? "Email is required" : null,
        password: !password ? "Password is required" : null,
      },
    };
    console.log("注册验证失败:", error);
    return res.status(400).json(error);
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    const error = { message: "Invalid email format" };
    console.log("邮箱格式验证失败:", error);
    return res.status(400).json(error);
  }

  const client = await pool.connect();

  try {
    // 检查邮箱是否已存在
    const existingUser = await client.query('SELECT * FROM "user" WHERE email = $1', [email]);

    if (existingUser.rows.length > 0) {
      const error = { message: "Email is already in use" };
      console.log("邮箱已存在:", error);
      return res.status(409).json(error);
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const result = await client.query(
      'INSERT INTO "user" (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
      [username, email, hashedPassword, "USER"],
    );

    const user = result.rows[0];
    const response = {
      success: true,
      message: "Registration successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
    console.log("注册成功:", { userId: user.id, username: user.username });
    res.status(201).json(response);
  } catch (error) {
    console.error("注册错误:", error);
    if (error.constraint === "CHK_email_format") {
      res.status(400).json({ message: "Invalid email format" });
    } else if (error.constraint === "UQ_user_email") {
      res.status(409).json({ message: "Email is already in use" });
    } else {
      res.status(500).json({ message: "Registration failed", error: error.message });
    }
  } finally {
    client.release();
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("收到登录请求:", { email, password: "[REDACTED]" });

  const client = await pool.connect();

  try {
    // 首先检查用户是否存在
    const userCheck = await client.query('SELECT * FROM "user" WHERE email = $1', [email]);

    if (userCheck.rows.length === 0) {
      console.log("登录失败: 用户不存在", { email });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = userCheck.rows[0];

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log("登录失败: 密码不正确", { email });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 生成JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" },
    );

    console.log("登录成功:", { userId: user.id, username: user.username });
    res.json({
      access_token: token,
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("登录错误:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  } finally {
    client.release();
  }
});

// 获取预订信息
app.get("/bookings", async (req, res) => {
  const client = await pool.connect();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    // 获取总记录数
    const countResult = await client.query("SELECT COUNT(*) FROM booking");
    const total = parseInt(countResult.rows[0].count);

    // 获取分页数据
    const result = await client.query(
      `SELECT b.*, u.username, u.email 
       FROM booking b 
       LEFT JOIN "user" u ON b.email = u.email 
       ORDER BY b."createdAt" DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    // 返回符合refine格式的响应
    res.json({
      data: result.rows,
      total,
      pageCount: Math.ceil(total / limit),
      page,
      perPage: limit,
    });
  } catch (error) {
    console.error("获取预订信息失败:", error);
    res.status(500).json({
      message: "Failed to fetch bookings",
      error: error.message,
    });
  } finally {
    client.release();
  }
});

// 创建新预订
app.post("/bookings", async (req, res) => {
  const client = await pool.connect();
  const { date, time_slot, group_size, user_id } = req.body;

  try {
    const result = await client.query(
      `INSERT INTO booking (date, time_slot, group_size, user_id, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'pending', NOW(), NOW())
       RETURNING *`,
      [date, time_slot, group_size, user_id],
    );

    res.status(201).json({
      data: result.rows[0],
    });
  } catch (error) {
    console.error("创建预订失败:", error);
    res.status(500).json({
      message: "Failed to create booking",
      error: error.message,
    });
  } finally {
    client.release();
  }
});

// 更新预订状态
app.put("/bookings/:id", async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await client.query(
      `UPDATE booking 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({
      data: result.rows[0],
    });
  } catch (error) {
    console.error("更新预订失败:", error);
    res.status(500).json({
      message: "Failed to update booking",
      error: error.message,
    });
  } finally {
    client.release();
  }
});

// 获取支付信息
app.get("/payments", async (req, res) => {
  const client = await pool.connect();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    // 获取总记录数
    const countResult = await client.query("SELECT COUNT(*) FROM payment");
    const total = parseInt(countResult.rows[0].count);

    // 获取分页数据
    const result = await client.query(
      `SELECT p.*, b.date as booking_date, b.email 
       FROM payment p 
       LEFT JOIN booking b ON p."bookingId" = b.id 
       ORDER BY p."createdAt" DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    // 返回符合refine格式的响应
    res.json({
      data: result.rows,
      total,
      pageCount: Math.ceil(total / limit),
      page,
      perPage: limit,
    });
  } catch (error) {
    console.error("获取支付信息失败:", error);
    res.status(500).json({
      message: "Failed to fetch payments",
      error: error.message,
    });
  } finally {
    client.release();
  }
});

// 创建新支付
app.post("/payments", async (req, res) => {
  const client = await pool.connect();
  const { bookingId, amount, status, paymentMethod } = req.body;

  try {
    const result = await client.query(
      `INSERT INTO payment ("bookingId", amount, status, "paymentMethod", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [bookingId, amount, status, paymentMethod],
    );

    res.status(201).json({
      data: result.rows[0],
    });
  } catch (error) {
    console.error("创建支付失败:", error);
    res.status(500).json({
      message: "Failed to create payment",
      error: error.message,
    });
  } finally {
    client.release();
  }
});

// 更新支付状态
app.put("/payments/:id", async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await client.query(
      `UPDATE payment 
       SET status = $1, "updatedAt" = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({
      data: result.rows[0],
    });
  } catch (error) {
    console.error("更新支付失败:", error);
    res.status(500).json({
      message: "Failed to update payment",
      error: error.message,
    });
  } finally {
    client.release();
  }
});

// 获取反馈信息
app.get("/feedbacks", async (req, res) => {
  const client = await pool.connect();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    // 获取总记录数
    const countResult = await client.query("SELECT COUNT(*) FROM feedback");
    const total = parseInt(countResult.rows[0].count);

    // 获取分页数据
    const result = await client.query(
      `SELECT f.*, u.username, u.email 
       FROM feedback f 
       LEFT JOIN "user" u ON f."userId" = u.id 
       ORDER BY f."createdAt" DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    // 返回符合refine格式的响应
    res.json({
      data: result.rows,
      total,
      pageCount: Math.ceil(total / limit),
      page,
      perPage: limit,
    });
  } catch (error) {
    console.error("获取反馈信息失败:", error);
    res.status(500).json({
      message: "Failed to fetch feedbacks",
      error: error.message,
    });
  } finally {
    client.release();
  }
});

// 创建新反馈
app.post("/feedbacks", async (req, res) => {
  const client = await pool.connect();
  const { userId, rating, comment } = req.body;

  try {
    const result = await client.query(
      `INSERT INTO feedback ("userId", rating, comment, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`,
      [userId, rating, comment],
    );

    res.status(201).json({
      data: result.rows[0],
    });
  } catch (error) {
    console.error("创建反馈失败:", error);
    res.status(500).json({
      message: "Failed to create feedback",
      error: error.message,
    });
  } finally {
    client.release();
  }
});

// 更新反馈
app.put("/feedbacks/:id", async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;
  const { rating, comment } = req.body;

  try {
    const result = await client.query(
      `UPDATE feedback 
       SET rating = $1, comment = $2, "updatedAt" = NOW()
       WHERE id = $3
       RETURNING *`,
      [rating, comment, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json({
      data: result.rows[0],
    });
  } catch (error) {
    console.error("更新反馈失败:", error);
    res.status(500).json({
      message: "Failed to update feedback",
      error: error.message,
    });
  } finally {
    client.release();
  }
});

// 获取用户的反馈信息
app.get("/feedbacks/user", async (req, res) => {
  const client = await pool.connect();
  const userId = req.query.userId; // 从查询参数获取用户ID
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    let query, countQuery, queryParams;

    if (userId) {
      // 如果提供了用户ID，只获取该用户的反馈
      countQuery = 'SELECT COUNT(*) FROM feedback WHERE "userId" = $1';
      query = `
        SELECT f.*, u.username, u.email 
        FROM feedback f 
        LEFT JOIN "user" u ON f."userId" = u.id 
        WHERE f."userId" = $1
        ORDER BY f."createdAt" DESC 
        LIMIT $2 OFFSET $3
      `;
      queryParams = [userId, limit, offset];
    } else {
      // 否则获取所有反馈
      countQuery = "SELECT COUNT(*) FROM feedback";
      query = `
        SELECT f.*, u.username, u.email 
        FROM feedback f 
        LEFT JOIN "user" u ON f."userId" = u.id 
        ORDER BY f."createdAt" DESC 
        LIMIT $1 OFFSET $2
      `;
      queryParams = [limit, offset];
    }

    // 获取总记录数
    const countResult = await client.query(countQuery, userId ? [userId] : []);
    const total = parseInt(countResult.rows[0].count);

    // 获取分页数据
    const result = await client.query(query, queryParams);

    // 返回符合refine格式的响应
    res.json({
      data: result.rows,
      total,
      pageCount: Math.ceil(total / limit),
      page,
      perPage: limit,
    });
  } catch (error) {
    console.error("获取用户反馈信息失败:", error);
    res.status(500).json({
      message: "Failed to fetch user feedbacks",
      error: error.message,
    });
  } finally {
    client.release();
  }
});

// 启动服务器
app.listen(PORT, "0.0.0.0", () => {
  console.log(`临时服务器运行在 http://localhost:${PORT}`);
});
