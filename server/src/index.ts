import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Client } from "@notionhq/client";

dotenv.config();

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DB_ID!;

app.get("/api/notices", async (req, res) => {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "공개여부",
        checkbox: { equals: true },
      },
      sorts: [
        {
          property: "작성일",
          direction: "descending",
        },
      ],
    });

    const results = response.results.map((page: any) => ({
      id: page.id,
      title: page.properties["제목"].title[0]?.plain_text,
      createdAt: page.properties["작성일"].date?.start,
      url: page.properties["URL"]?.url,
    }));

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("공지 조회 실패");
  }
});

app.listen(port, () => {
  console.log(`🚀 Express 서버 실행 중: http://localhost:${port}`);
});