"use client";

import { useState } from "react";

export default function NewNotice() {
  const [title, setTitle] = useState("");
  const [version, setVersion] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("공지사항");
  const [isPublic, setIsPublic] = useState(true);
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("http://localhost:4000/api/notices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        version,
        url,
        category,
        isPublic,
        createdAt: new Date().toISOString().split(" ")[0],
        content: content.split("\n").filter(line => line.trim() !== ""),
      }),
    });
    if (res.ok) {
      alert("공지 등록 완료!");
    } else {
      alert("공지 등록 실패!");
    }
  };

  return (
    <div className="h-screen w-full bg-gray-50 p-6 flex flex-col">
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="제목" className="border p-2 w-full" required />
        <input value={version} onChange={e => setVersion(e.target.value)} placeholder="버전" className="border p-2 w-full" />
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Notion URL (선택)" className="border p-2 w-full" />
        <select value={category} onChange={e => setCategory(e.target.value)} className="border p-2 w-full">
          <option value="공지사항">공지사항</option>
          <option value="오류 수정">오류 수정</option>
        </select>
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
          <span>공개</span>
        </label>
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="내용을 입력하세요" className="border p-2 w-full h-40" />
        <button type="submit" className="bg-black text-white px-4 py-2 rounded">공지 작성</button>
      </form>
    </div>
  );
}