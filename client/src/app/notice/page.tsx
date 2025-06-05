"use client"

import { ChevronUp, ExternalLink, X, Loader2, CircleChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`).then(res => res.json());

export default function Notices() {
  const { data, error } = useSWR("/api/notices", fetcher);
  const [show, setShow] = useState(false)
  const [filter, setFilter] = useState(false)
  const [category, setCategory] = useState("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const router = useRouter()

  const { data: blocks } = useSWR(selectedId ? `/api/notices/${selectedId}/blocks` : null, fetcher);

  const currentIndex =
    data && selectedId ? data.findIndex((row: any) => row.id === selectedId) : -1;

  const prevPost = currentIndex > 0 ? data[currentIndex - 1] : null;
  const nextPost = currentIndex >= 0 && currentIndex < data.length - 1 ? data[currentIndex + 1] : null;

  const selectedRow = data?.find((row: any) => row.id === selectedId);

  // 웹 게시 링크 속성 대신 아래 코드로
  useEffect(() => {
    if (selectedRow?.id) {
      const testUrl = `https://plum-dragon-26e.notion.site/${selectedRow.id.replace(/-/g, "")}`
      console.log("웹 게시 링크:", testUrl)
    }
  }, [selectedRow])

  if (error) return <div>불러오기 실패</div>;
  if (!data || data.length === 0) return <div>게시글 없음</div>;


  return (
    <div className="h-screen w-full bg-gray-50 p-6 flex flex-col">
      <div className="text-5xl font-bold text-[#32302c] p-4">
        <h1>공지사항</h1>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 px-3 py-2 mb-2">
          <CircleChevronDown size={20} fill="#c2c2c2" stroke="#f9fafb" />
          <span className="text-base text-gray-400">카테고리</span>
          <div className="relative">
            <div onClick={() => setFilter(prev => !prev)} className={`text-sm px-2 py-1 flex items-center gap-2 rounded-md ${category === "all" ? "bg-gray-200" : category === "normal" ? "bg-blue-100 text-blue-500" : "bg-red-100 text-red-500"} hover:!cursor-pointer`}>
              {category === "all" ? "카테고리 선택" : category === "normal" ? "공지사항" : "오류 수정"}
              {category != "all" && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setCategory("all")
                  }} 
                  className="w-4 h-4 flex items-center justify-center hover:!cursor-pointer">
                  <X size={15}/>
                </button>
              )}
            </div>
            { filter && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 bg-white rounded-md border border-gray-200 z-50 text-nowrap">
                <ul className="text-sm">
                  <li 
                    className="px-2 py-1 hover:bg-gray-50 hover:!cursor-pointer" 
                    value="all" 
                    onClick={() => {
                      setFilter(false)
                      setCategory("all")
                    }}
                  >
                    카테고리 선택
                  </li>
                  <li 
                    className="px-2 py-1 hover:bg-gray-50 hover:!cursor-pointer" 
                    value="normal" 
                    onClick={() => {
                      setFilter(false)
                      setCategory("normal")
                    }}
                  >
                    공지사항
                  </li>
                  <li 
                    className="px-2 py-1 hover:bg-gray-50 hover:!cursor-pointer" 
                    value="bug" 
                    onClick={() => {
                      setFilter(false)
                      setCategory("bug")
                    }}
                  >
                    오류 수정
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={() => router.push("/new-notice")}
          className="text-sm text-white bg-[#32302c] hover:bg-[#242320] hover:!cursor-pointer px-2 py-1 rounded-md mr-6">
            공지사항 추가
        </button>
      </div>
      <div className="flex-1 flex gap-2">
        <section className={`h-full max-h-[calc(100vh-150px)] overflow-y-auto ${show ? "w-1/2" : "w-full"}`}>
          <ul className="flex flex-col gap-2 rounded-md bg-white">
            {data
              .filter((row: any) => {
                if (category === "all") return true;
                return row.type === "main" && row.category === (category === "normal" ? "공지사항" : "오류 수정");
              })
              .map((row: any, index: any) => (
              row.type === "main"
              ? (
                <li key={row.id} className={`py-4 px-6 flex items-center gap-3 ${index+1 == data.length ? "" : "border-b border-gray-200"}`}>
                  <div className="flex gap-2">
                    <div className="w-18 flex items-center justify-center">
                      {row.category === "공지사항" ? (
                        <span className="py-1 px-2 text-sm w-fit rounded-md text-blue-500 bg-blue-100">공지사항</span>
                      ) : (
                        <span className="py-1 px-2 text-sm w-fit rounded-md text-red-500 bg-red-100">오류 수정</span>
                      )}
                    </div>
                    {row.createdAt && (
                      <span className="text-gray-400 text-sm py-1">
                        {(() => {
                          const [yy, mm, dd] = row.createdAt.split("-");
                          return `${yy}년 ${mm}월 ${dd}일`;
                        })()}
                      </span>
                    )}
                    <span className="text-gray-400 text-sm py-1">버전 {row.version}</span>
                  </div>
                  {row.title && (
                    <span
                      onClick={() => {
                        setSelectedId(row.id)
                        setShow(true)
                      }}
                      className="flex-1 appearance-none hover:underline hover:cursor-pointer"
                    >
                      {row.title}
                    </span>
                  )}
                </li>
              )
              : (
                <li key={row.id} className={`flex items-center gap-3 py-4 ps-26 ${row.category === "긴급" ? "bg-red-50" : ""} ${index+1 == data.length ? "" : "border-b border-gray-200"}`}>
                  <p className="text-gray-800">📢</p>
                  {/* {row.createdAt && (
                      <span className="text-gray-400 text-sm py-1">
                        {(() => {
                          const [yy, mm, dd] = row.createdAt.split("-");
                          return `${yy}년 ${mm}월 ${dd}일`;
                        })()}
                      </span>
                  )} */}
                  <p className="text-gray-800">{row.title}</p>
                </li>
              )
            ))}
          </ul>
        </section>
        {selectedId && show && (
          <section className="w-1/2 h-[calc(100%-20px)] rounded-md bg-white p-4 flex-col">
            <div className="w-full flex items-center p-2 justify-between text-gray-500 hover:text-gray-600">
              <div className="flex-1">
                {prevPost && (
                  <button
                    onClick={() => setSelectedId(prevPost.id)}
                    className="text-gray-500 hover:text-gray-700 rounded-md hover:!cursor-pointer hover:bg-gray-50 flex items-center gap-1 py-1 px-2"
                  >
                    <ChevronUp strokeWidth={1.3} size={16} />
                    {prevPost.title}
                  </button>
                )}
              </div>
              <div className="flex items-center px-2 gap-2">
                <button
                  onClick={() => {
                    if (selectedRow?.url) {
                      window.open(selectedRow.url, "_blank");
                    }
                  }}
                  className="text-gray-400 hover:text-gray-500">
                  <ExternalLink size={17} strokeWidth={1.3} />
                </button>
                <button 
                  onClick={() => {
                    setShow(false)
                    setSelectedId("")
                  }}
                  className="text-gray-400 hover:text-gray-500">
                  <X size={19} strokeWidth={1.3} />
                </button>
              </div>
            </div>
            {selectedRow && (
              <div className="border-b-2 border-gray-200 pb-3 mb-3 mt-2 px-2">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className={`px-2 py-1 rounded-md ${selectedRow.category === "공지사항" ? "bg-blue-100 text-blue-500" : "bg-red-100 text-red-500"}`}>
                    {selectedRow.category}
                  </span>
                  <div className="border-r w-1 h-3 border-gray-200"></div>
                  {selectedRow.createdAt && (
                    <span>
                      {(() => {
                        const [yy, mm, dd] = selectedRow.createdAt.split("-");
                        return `${yy}년 ${mm}월 ${dd}일`;
                      })()}
                    </span>
                  )}
                  <div className="border-r w-1 h-3 border-gray-200"></div>
                  <span>버전 {selectedRow.version}</span>
                </div>
                <h2 className="text-2xl font-semibold mt-2">{selectedRow.title}</h2>
              </div>
            )}
            {blocks ? (
              <div className="flex-1 flex flex-col h-[calc(100vh-400px)] overflow-auto p-2">
                
                {(() => {
                  const rendered: React.ReactNode[] = [];
                  let listItems: any[] = [];
                  blocks.forEach((block: any, idx: number) => {
                    const text = (block[block.type]?.rich_text || []).map((t: any, i: number) => (
                      <span key={i} className={
                        `${t.annotations.bold ? "font-bold" : ""} ` +
                        `${t.annotations.italic ? "italic" : ""} ` +
                        `${t.annotations.underline ? "underline" : ""}`
                      }>
                        {t.text.content}
                      </span>
                    ));
                    if (block.type === "bulleted_list_item") {
                      listItems.push(
                        <li key={block.id} className="list-disc ml-5 text-sm text-gray-700">{text}</li>
                      );
                      if (
                        idx === blocks.length - 1 ||
                        blocks[idx + 1].type !== "bulleted_list_item"
                      ) {
                        rendered.push(
                          <ul key={`ul-${block.id}`} className="mb-2">{listItems}</ul>
                        );
                        listItems = [];
                      }
                    } else {
                      if (listItems.length > 0) {
                        rendered.push(
                          <ul key={`ul-pre-${block.id}`} className="mb-2">{listItems}</ul>
                        );
                        listItems = [];
                      }
                      switch (block.type) {
                        case "heading_1":
                          rendered.push(<h1 key={block.id} className="text-3xl font-bold my-2">{text}</h1>);
                          break;
                        case "heading_2":
                          rendered.push(<h2 key={block.id} className="text-2xl font-bold my-2">{text}</h2>);
                          break;
                        case "heading_3":
                          rendered.push(<h3 key={block.id} className="text-xl font-bold my-2">{text}</h3>);
                          break;
                        case "paragraph":
                          rendered.push(<p key={block.id} className="text-sm text-gray-700">{text}</p>);
                          break;
                        case "divider":
                          rendered.push(<hr key={block.id} className="my-4 border-t border-gray-200" />);
                          break;
                        case "image":
                          const imageUrl = block.image.type === "external"
                            ? block.image.external.url
                            : block.image.file.url;
                          rendered.push(
                            <img
                              key={block.id}
                              src={imageUrl}
                              alt="notion image"
                              className="my-4 max-w-150 rounded-md shadow-md"
                            />
                          );
                          break;
                        default:
                          break;
                      }
                    }
                  });
                  return rendered;
                })()}
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-4 h-[calc(100vh-350px)] overflow-auto p-2 items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
                불러오는 중...
              </div>
            )}
            <div className="w-full flex items-center p-2 justify-between text-gray-500 hover:text-gray-600">
              {nextPost && (
                <button
                  onClick={() => setSelectedId(nextPost.id)}
                  className=" text-gray-500 hover:text-gray-700 rounded-md hover:!cursor-pointer hover:bg-gray-50 flex items-center gap-1 py-1 px-2"
                >
                  <ChevronUp strokeWidth={1.3} size={16} className="rotate-180" />
                  {nextPost.title}
                </button>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}