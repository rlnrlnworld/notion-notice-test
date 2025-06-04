import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Client } from "@notionhq/client";
import { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";

dotenv.config();

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DB_ID!;

app.get("/api/notices", async (req, res) => {
  try {
    const mainResponse = await notion.databases.query({
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


    const mainResults = mainResponse.results.map((page: any) => ({
      id: page.id,
      title: page.properties["제목"]?.title?.[0]?.plain_text ?? "",
      version: page.properties["버전"]?.rich_text?.[0]?.plain_text ?? "",
      createdAt: page.properties["작성일"]?.date?.start ?? "",
      isPublic: page.properties["공개여부"]?.checkbox ?? false,
      url: page.properties["URL"]?.url ?? "",
      category: page.properties["선택"]?.select?.name ?? "",
      type: "main",
    }));


    const results = [ ...mainResults];
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("공지 조회 실패");
  }
});


async function getBlocksWithChildren(blockId: string): Promise<any[]> {
  const blocks = await notion.blocks.children.list({ block_id: blockId });
  const allBlocks = await Promise.all(blocks.results.map(async block => {
    if ((block as BlockObjectResponse).has_children) {
      const children = await getBlocksWithChildren(block.id);
      return { ...block, children };
    } else {
      return block;
    }
  }));
  return allBlocks;
}

app.get("/api/notices/:id/blocks", async (req, res) => {
  const pageId = req.params.id;
  try {
    const blocks = await getBlocksWithChildren(pageId);
    res.json(blocks);
  } catch (err) {
    console.error(err);
    res.status(500).send("블록 조회 실패");
  }
});

app.listen(port, () => {
  console.log(`🚀 Express 서버 실행 중: http://localhost:${port}`);
});