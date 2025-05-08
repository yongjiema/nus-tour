import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as axios from "axios";
import * as cheerio from "cheerio";
import * as cron from "node-cron";
import { NewsEvent } from "../database/entities/news-event.entity";

@Injectable()
export class NewsEventService {
  private readonly logger = new Logger(NewsEventService.name);

  constructor(
    @InjectRepository(NewsEvent)
    private newsEventRepository: Repository<NewsEvent>,
  ) {
    // 每天凌晨3点执行一次抓取任务
    cron.schedule("0 3 * * *", async () => {
      this.logger.log("开始执行定时抓取任务");
      await this.fetchAndSaveLatestNewsAndEvents();
    });
  }

  async getLatestNews(): Promise<NewsEvent[]> {
    return this.newsEventRepository.find({
      where: { type: "news" },
      order: { date: "DESC" },
      take: 5,
    });
  }

  async getLatestEvents(): Promise<NewsEvent[]> {
    return this.newsEventRepository.find({
      where: { type: "event" },
      order: { date: "DESC" },
      take: 5,
    });
  }

  async fetchAndSaveLatestNewsAndEvents(): Promise<void> {
    try {
      this.logger.log("开始抓取新闻和活动");

      // 抓取新闻
      const news = await this.fetchLatestNews();
      this.logger.log(`成功抓取 ${news.length} 条新闻`);

      // 抓取活动
      const events = await this.fetchLatestEvents();
      this.logger.log(`成功抓取 ${events.length} 条活动`);

      // 保存到数据库之前先清除旧数据
      await this.newsEventRepository.delete({});

      // 保存新闻
      for (const item of news) {
        const newsEvent = new NewsEvent();
        newsEvent.type = "news";
        newsEvent.date = item.date;
        newsEvent.headline = item.headline;
        newsEvent.link = item.link;
        await this.newsEventRepository.save(newsEvent);
      }

      // 保存活动
      for (const item of events) {
        const newsEvent = new NewsEvent();
        newsEvent.type = "event";
        newsEvent.date = item.date;
        newsEvent.headline = item.headline;
        newsEvent.link = item.link;
        await this.newsEventRepository.save(newsEvent);
      }

      this.logger.log("新闻和活动保存完成");
    } catch (error) {
      this.logger.error(`抓取新闻和活动时出错: ${error.message}`, error.stack);
    }
  }

  private async fetchLatestNews(): Promise<{ date: Date; headline: string; link: string }[]> {
    try {
      const response = await axios.default.get("https://news.nus.edu.sg/");
      const $ = cheerio.load(response.data);
      const newsItems = [];

      // 根据网站的HTML结构来抓取
      $("article.post")
        .slice(0, 5)
        .each((_index, element) => {
          const headline = $(element).find("h2.entry-title a").text().trim();
          const link = $(element).find("h2.entry-title a").attr("href");

          // 获取日期
          let dateText = $(element).find(".entry-meta .posted-on time").attr("datetime");
          if (!dateText) {
            dateText = $(element).find(".entry-meta .posted-on").text().trim();
          }
          const date = dateText ? new Date(dateText) : new Date();

          if (headline && link) {
            newsItems.push({
              date,
              headline,
              link,
            });
          }
        });

      return newsItems;
    } catch (error) {
      this.logger.error(`抓取新闻时出错: ${error.message}`, error.stack);
      return [];
    }
  }

  private async fetchLatestEvents(): Promise<{ date: Date; headline: string; link: string }[]> {
    try {
      const response = await axios.default.get("https://osa.nus.edu.sg/events/");
      const $ = cheerio.load(response.data);
      const eventItems = [];

      // 根据网站的HTML结构来抓取
      $(".event-item, .events-listing .event")
        .slice(0, 5)
        .each((_index, element) => {
          const headline = $(element).find("h3, .event-title").text().trim();
          let link = $(element).find("a").attr("href");

          // 获取日期
          let dateText = $(element).find(".event-date, .date").text().trim();
          // 解析日期文本（格式可能会有不同）
          let date = new Date();
          if (dateText) {
            try {
              date = new Date(dateText);
            } catch (e) {
              this.logger.warn(`无法解析日期: ${dateText}`);
            }
          }

          if (headline && link) {
            if (!link.startsWith("http")) {
              link = `https://osa.nus.edu.sg${link.startsWith("/") ? "" : "/"}${link}`;
            }
            eventItems.push({
              date,
              headline,
              link,
            });
          }
        });

      return eventItems;
    } catch (error) {
      this.logger.error(`抓取活动时出错: ${error.message}`, error.stack);
      return [];
    }
  }
}
