import { Client } from 'pg';

async function main() {
  const client = new Client({
    host: 'ep-round-cell-a1ty5qy1.ap-southeast-1.aws.neon.tech',
    port: 5432,
    user: 'nus-tour_owner',
    password: 'V0QKJlUHS6Am',
    database: 'nus-tour',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('已连接到数据库');

    // 先检查news_event表中是否有数据
    const checkDataQuery = 'SELECT COUNT(*) as count FROM news_event';
    const checkResult = await client.query(checkDataQuery);
    const dataCount = parseInt(checkResult.rows[0].count);
    
    console.log(`news_event表中现有${dataCount}条数据`);

    // 如果没有数据，则插入示例数据
    if (dataCount === 0) {
      console.log('开始插入示例数据');
      
      // 确保news_event表存在
      await client.query(`
        CREATE TABLE IF NOT EXISTS news_event (
          id SERIAL PRIMARY KEY,
          type VARCHAR(50),
          date TIMESTAMP, 
          headline VARCHAR(500),
          link VARCHAR(1000),
          "createdAt" TIMESTAMP DEFAULT NOW(),
          "updatedAt" TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('news_event表已创建或已存在');

      // 模拟新闻数据
      const newsItems = [
        {
          type: 'news',
          date: new Date('2025-03-13T22:17:00+08:00'),
          headline: 'NUS120 Open House brings enthusiastic crowds to NUS campuses',
          link: 'https://news.nus.edu.sg/nus120-open-house-brings-enthusiastic-crowds-to-nus-campuses/'
        },
        {
          type: 'news',
          date: new Date('2025-03-12T18:06:00+08:00'),
          headline: '22 NUS programmes in global top 10 in QS World University Rankings by Subject 2025',
          link: 'https://news.nus.edu.sg/22-nus-programmes-in-global-top-10-in-qs-world-university-rankings-by-subject-2025/'
        },
        {
          type: 'news',
          date: new Date('2025-03-11T14:46:00+08:00'),
          headline: 'Blazing a trail: NUSOne debuts with meaningfully diverse activities',
          link: 'https://news.nus.edu.sg/blazing-a-trail-nusone-debuts-with-meaningfully-diverse-activities/'
        },
        {
          type: 'news',
          date: new Date('2025-03-11T16:54:00+08:00'),
          headline: 'Certainties and uncertainties in Western strategic restructuring',
          link: 'https://news.nus.edu.sg/certainties-and-uncertainties-in-western-strategic-restructuring/'
        },
        {
          type: 'news',
          date: new Date('2025-03-10T18:16:00+08:00'),
          headline: 'S\'pore device to strengthen muscles gets approval here and in US',
          link: 'https://news.nus.edu.sg/spore-device-to-strengthen-muscles-gets-approval-here-and-in-us/'
        }
      ];

      console.log(`已准备 ${newsItems.length} 条新闻样本数据`);

      // 模拟活动数据
      const eventItems = [
        {
          type: 'event',
          date: new Date('2025-03-20T14:00:00+08:00'),
          headline: 'NUS Arts Festival 2025: Reimagining Traditions',
          link: 'https://osa.nus.edu.sg/events/nus-arts-festival-2025'
        },
        {
          type: 'event',
          date: new Date('2025-03-25T09:30:00+08:00'),
          headline: 'International Conference on Sustainable Development',
          link: 'https://osa.nus.edu.sg/events/icsd-2025'
        },
        {
          type: 'event',
          date: new Date('2025-04-02T13:00:00+08:00'),
          headline: 'NUS Career Fair 2025',
          link: 'https://osa.nus.edu.sg/events/career-fair-2025'
        },
        {
          type: 'event',
          date: new Date('2025-04-10T10:00:00+08:00'),
          headline: 'Research Innovation Showcase',
          link: 'https://osa.nus.edu.sg/events/research-innovation-2025'
        },
        {
          type: 'event',
          date: new Date('2025-04-15T15:30:00+08:00'),
          headline: 'Global Entrepreneurship Summit',
          link: 'https://osa.nus.edu.sg/events/entrepreneur-summit-2025'
        }
      ];

      console.log(`已准备 ${eventItems.length} 条活动样本数据`);

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

      console.log('所有示例数据已保存到news_event表');
    } else {
      console.log('news_event表中已有数据，无需插入示例数据');
    }

    // 获取保存的数据
    const result = await client.query('SELECT * FROM news_event');
    console.log(`news_event表中共有 ${result.rows.length} 条记录`);
    console.log('前两条数据示例:');
    console.log(result.rows.slice(0, 2));

  } catch (error) {
    console.error('发生错误:', error);
  } finally {
    await client.end();
    console.log('数据库连接已关闭');
  }
}

main(); 