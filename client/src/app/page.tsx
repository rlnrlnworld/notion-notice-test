"use client"

import { Plus } from "lucide-react";
import Image from "next/image";
import useSWR from "swr";
import { useRouter } from "next/navigation";

const fetcher = (url: string) =>
  fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`).then(res => res.json());
export default function Home() {
  const { data, error } = useSWR("/api/notices", fetcher);
  const router = useRouter();

  if (error) return <div>오류 발생</div>;
  if (!data) return <div>불러오는 중...</div>;

  const latest = data[0];

  return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-gray-400 p-2 rounded-md bg-gray-50">
        <span className="text-semibold">공지사항</span>
        {latest.url ? (
          <a
            href={latest.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:underline"
          >
            {latest.title}
          </a>
        ) : (
          <span className="text-gray-700">{latest.title}</span>
        )}
        <button 
          onClick={() => {
            router.push("/notice");
          }}
          className="p-1 hover:text-gray-500 hover:!cursor-pointer">
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}
